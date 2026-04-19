'use client'

/**
 * components/providers/PreferencesProvider.tsx
 *
 * Phase 6 (with Phase 6.1 live-update fixes).
 *
 * Single source of truth for two user preferences:
 *   - currency  (MNT | USD)
 *   - language  (mn  | en)
 *
 * RESOLUTION ORDER:
 *   1. Logged-in user profile      (session.user.preferredCurrency / preferredLanguage)
 *   2. Cookie                      (wm_currency / wm_lang — also readable by server)
 *   3. localStorage                (wm.displayCurrency / wm_dashboard_lang — Phase 3 keys)
 *   4. Geo hint from backend       (GET /geo/hint)
 *   5. Browser language            (navigator.language — language only)
 *   6. Default                     ('USD' + 'en')
 *
 * PHASE 6.1 — WHAT CHANGED FROM PHASE 6:
 *   - Cookies are now written in addition to localStorage so server
 *     components can attach `X-Display-Currency` at fetch time. The
 *     cookie is also the fastest SSR-consistent hydration source.
 *   - A same-tab `wm:preference-changed` custom event is dispatched on
 *     every change. `DisplayCurrencyProvider` and any other legacy
 *     listener subscribe to it so their state stays in sync without
 *     relying on cross-tab `storage` events (which don't fire in the
 *     originating tab).
 *   - `router.refresh()` is called after every change so App Router
 *     server components re-run their data fetches with the new header.
 */

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { SUPPORTED_CURRENCIES, type Currency } from '@/lib/money'
import {
  CURRENCY_COOKIE, LANGUAGE_COOKIE,
  CURRENCY_STORAGE_KEY, LANGUAGE_STORAGE_KEY,
  PREFERENCE_EVENT,
  readPreferredCurrencyClient,
  readPreferredLanguageClient,
  writePreferredCurrency,
  writePreferredLanguage,
  type PreferenceChangedDetail,
} from '@/lib/preferences-storage'
import { type DashboardLang } from '@/lib/i18n/config'

export type Language = DashboardLang  // 'mn' | 'en'

type Source = 'user' | 'cookie' | 'storage' | 'geo' | 'browser' | 'default'

export interface PreferencesContextValue {
  currency:           Currency
  language:           Language
  setCurrency:        (c: Currency) => void
  setLanguage:        (l: Language) => void
  currencySource:     Source
  languageSource:     Source
  isUserSelected:     boolean
}

const DEFAULT_CURRENCY: Currency = 'USD'
const DEFAULT_LANGUAGE: Language = 'en'

const Ctx = React.createContext<PreferencesContextValue | null>(null)

// ── Helpers ────────────────────────────────────────────────────────────

function readBrowserLang(): Language | null {
  if (typeof window === 'undefined') return null
  const primary = (navigator.language || '').toLowerCase()
  if (primary.startsWith('mn')) return 'mn'
  if (primary.startsWith('en')) return 'en'
  return null
}

// ── Provider ───────────────────────────────────────────────────────────

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { data: session } = useSession()
  const userPrefCurrency = (session?.user as any)?.preferredCurrency as Currency | undefined
  const userPrefLanguage = (session?.user as any)?.preferredLanguage as Language | undefined

  // SSR-safe: start from defaults so server markup matches the first
  // client render; hydrate from cookie/storage/geo in a useEffect.
  const [state, setState] = React.useState<{
    currency: Currency;  currencySource: Source
    language: Language;  languageSource: Source
  }>({
    currency: DEFAULT_CURRENCY, currencySource: 'default',
    language: DEFAULT_LANGUAGE, languageSource: 'default',
  })

  // 1. Fold user profile preference → state. Fires whenever the session
  //    changes. User preference beats everything else.
  React.useEffect(() => {
    if (userPrefCurrency && SUPPORTED_CURRENCIES.includes(userPrefCurrency)) {
      setState((s) => ({ ...s, currency: userPrefCurrency, currencySource: 'user' }))
    }
    if (userPrefLanguage === 'mn' || userPrefLanguage === 'en') {
      setState((s) => ({ ...s, language: userPrefLanguage, languageSource: 'user' }))
    }
  }, [userPrefCurrency, userPrefLanguage])

  // 2. Hydrate from cookie / localStorage / geo on first client mount.
  React.useEffect(() => {
    let cancelled = false

    const storedCur  = readPreferredCurrencyClient()
    const storedLang = readPreferredLanguageClient()

    setState((s) => {
      const next = { ...s }
      if (s.currencySource !== 'user' && storedCur) {
        next.currency = storedCur
        next.currencySource = 'cookie'
      }
      if (s.languageSource !== 'user' && storedLang) {
        next.language = storedLang
        next.languageSource = 'cookie'
      }
      return next
    })

    const needGeo  = !userPrefCurrency && !storedCur
    const needLang = !userPrefLanguage && !storedLang

    if (!needGeo && !needLang) return

    async function resolveDefaults() {
      let geoCurrency: Currency | null = null
      let geoLanguage: Language | null = null
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '')
        const r = await fetch(`${base}/geo/hint`, { cache: 'no-store' })
        const j = await r.json().catch(() => null) as any
        const d = j?.data
        if (d?.suggestedCurrency === 'MNT' || d?.suggestedCurrency === 'USD') geoCurrency = d.suggestedCurrency
        if (d?.suggestedLanguage === 'mn'  || d?.suggestedLanguage === 'en')  geoLanguage = d.suggestedLanguage
      } catch {
        // geo failure must never break the site
      }

      if (cancelled) return
      const browserLang = readBrowserLang()
      setState((s) => {
        const next = { ...s }
        if (needGeo && s.currencySource === 'default' && geoCurrency) {
          next.currency = geoCurrency
          next.currencySource = 'geo'
        }
        if (needLang && s.languageSource === 'default') {
          if (geoLanguage) { next.language = geoLanguage; next.languageSource = 'geo' }
          else if (browserLang) { next.language = browserLang; next.languageSource = 'browser' }
        }
        return next
      })
    }
    resolveDefaults()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 3. Cross-tab sync for both keys (storage event).
  React.useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === CURRENCY_STORAGE_KEY) {
        if (e.newValue === 'MNT' || e.newValue === 'USD') {
          setState((s) => ({ ...s, currency: e.newValue as Currency, currencySource: 'storage' }))
        }
      } else if (e.key === LANGUAGE_STORAGE_KEY) {
        if (e.newValue === 'mn' || e.newValue === 'en') {
          setState((s) => ({ ...s, language: e.newValue as Language, languageSource: 'storage' }))
        }
      }
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // ── Setters ──────────────────────────────────────────────────────────

  const setCurrency = React.useCallback((c: Currency) => {
    if (!SUPPORTED_CURRENCIES.includes(c)) return
    writePreferredCurrency(c)  // cookie + localStorage
    setState((s) => ({ ...s, currency: c, currencySource: 'user' }))

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent<PreferenceChangedDetail>(PREFERENCE_EVENT, {
        detail: { field: 'currency', value: c },
      }))
    }

    // Force App Router server components to re-run with the new cookie /
    // header so server-rendered pricing reflects the change.
    router.refresh()
  }, [router])

  const setLanguage = React.useCallback((l: Language) => {
    if (l !== 'mn' && l !== 'en') return
    writePreferredLanguage(l)  // cookie + localStorage
    setState((s) => ({ ...s, language: l, languageSource: 'user' }))

    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent<PreferenceChangedDetail>(PREFERENCE_EVENT, {
        detail: { field: 'language', value: l },
      }))
    }

    router.refresh()
  }, [router])

  const value = React.useMemo<PreferencesContextValue>(() => ({
    currency:       state.currency,
    language:       state.language,
    setCurrency,
    setLanguage,
    currencySource: state.currencySource,
    languageSource: state.languageSource,
    isUserSelected: state.currencySource === 'user' || state.languageSource === 'user',
  }), [state, setCurrency, setLanguage])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePreferences(): PreferencesContextValue {
  const v = React.useContext(Ctx)
  if (!v) {
    return {
      currency:       DEFAULT_CURRENCY,
      language:       DEFAULT_LANGUAGE,
      setCurrency:    () => {},
      setLanguage:    () => {},
      currencySource: 'default',
      languageSource: 'default',
      isUserSelected: false,
    }
  }
  return v
}

// Re-export cookie names for consumers that want to read them on the
// server via next/headers (see lib/api/server-headers.ts).
export { CURRENCY_COOKIE, LANGUAGE_COOKIE }
