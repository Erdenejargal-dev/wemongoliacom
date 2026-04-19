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
 * RESOLUTION ORDER (MVP, Phase 6.2):
 *   1. Logged-in user profile      (session.user.preferredCurrency / preferredLanguage)
 *   2. Cookie                      (wm_currency / wm_lang — also readable by server)
 *   3. localStorage                (wm.displayCurrency / wm_dashboard_lang — Phase 3 keys)
 *   4. Browser language            (navigator.language — 'mn*' → {mn, MNT})
 *   5. Geo hint / CDN country      (GET /geo/hint — 'MN' → {mn, MNT})
 *   6. Default                     ('USD' + 'en')
 *
 * MVP RULE (live behavior fix):
 *   A visitor with a Mongolian browser locale OR a CDN country header of
 *   'MN' should land in Mongolian + MNT automatically. Previous phases
 *   ran geo BEFORE browser, and the geo endpoint falls back to EN+USD
 *   when no CDN header is present — so Mongolia visitors on hosts
 *   without CF/Vercel country headers never got MN+MNT. We now consult
 *   the browser first so the OS/browser locale is authoritative when
 *   the CDN can't help.
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
  // `navigator.languages` reflects the full ordered list the user configured
  // (e.g. ['mn-MN', 'en-US']). We want to pick up Mongolian even if it's not
  // the single `navigator.language` value.
  const candidates: string[] = []
  const langs = (navigator as Navigator).languages
  if (Array.isArray(langs)) candidates.push(...langs)
  if (navigator.language) candidates.push(navigator.language)
  for (const raw of candidates) {
    const v = (raw || '').toLowerCase()
    if (v.startsWith('mn')) return 'mn'
  }
  for (const raw of candidates) {
    const v = (raw || '').toLowerCase()
    if (v.startsWith('en')) return 'en'
  }
  return null
}

/**
 * MVP default pairing: if the browser/OS locale is Mongolian, the user is
 * almost certainly in Mongolia → default BOTH language AND currency so
 * they don't land on a confusing EN+USD first screen. Any explicit
 * preference (cookie / storage / user profile) still wins.
 */
function defaultsForBrowserLang(lang: Language | null): {
  currency: Currency | null
  language: Language | null
} {
  if (lang === 'mn') return { currency: 'MNT', language: 'mn' }
  if (lang === 'en') return { currency: 'USD', language: 'en' }
  return { currency: null, language: null }
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

    const needCurrency = !userPrefCurrency && !storedCur
    const needLanguage = !userPrefLanguage && !storedLang

    if (!needCurrency && !needLanguage) return

    // Step 4 — browser language first (MVP-friendly, works on localhost and
    // anywhere without CDN country headers).
    const browserLang = readBrowserLang()
    const browserDefaults = defaultsForBrowserLang(browserLang)

    setState((s) => {
      const next = { ...s }
      if (needCurrency && s.currencySource === 'default' && browserDefaults.currency) {
        next.currency = browserDefaults.currency
        next.currencySource = 'browser'
      }
      if (needLanguage && s.languageSource === 'default' && browserDefaults.language) {
        next.language = browserDefaults.language
        next.languageSource = 'browser'
      }
      return next
    })

    async function resolveGeoFallback() {
      let geoCurrency: Currency | null = null
      let geoLanguage: Language | null = null
      let geoCountry: string | null = null
      try {
        const base = (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1').replace(/\/$/, '')
        const r = await fetch(`${base}/geo/hint`, { cache: 'no-store' })
        const j = await r.json().catch(() => null) as any
        const d = j?.data
        if (d?.suggestedCurrency === 'MNT' || d?.suggestedCurrency === 'USD') geoCurrency = d.suggestedCurrency
        if (d?.suggestedLanguage === 'mn'  || d?.suggestedLanguage === 'en')  geoLanguage = d.suggestedLanguage
        if (typeof d?.country === 'string') geoCountry = d.country.toUpperCase()
      } catch {
        // geo failure must never break the site
      }

      if (cancelled) return

      // Geo is only trusted when the backend saw a real CDN country header.
      // Without one, the endpoint's 'fallback' default is EN+USD, which
      // would overwrite a correct browser-derived MN+MNT. Skip in that case.
      const trustedGeo = geoCountry !== null
      if (!trustedGeo) return

      const isMongolia = geoCountry === 'MN'
      setState((s) => {
        const next = { ...s }
        // Only upgrade fields the user has NOT explicitly set (via cookie,
        // storage, or session). 'browser' is allowed to be refined by geo
        // for the Mongolia case, but otherwise browser wins.
        if (needCurrency) {
          const upgradable = s.currencySource === 'default' || s.currencySource === 'browser'
          if (upgradable && isMongolia) {
            next.currency = 'MNT'
            next.currencySource = 'geo'
          } else if (s.currencySource === 'default' && geoCurrency) {
            next.currency = geoCurrency
            next.currencySource = 'geo'
          }
        }
        if (needLanguage) {
          const upgradable = s.languageSource === 'default' || s.languageSource === 'browser'
          if (upgradable && isMongolia) {
            next.language = 'mn'
            next.languageSource = 'geo'
          } else if (s.languageSource === 'default' && geoLanguage) {
            next.language = geoLanguage
            next.languageSource = 'geo'
          }
        }
        return next
      })
    }
    resolveGeoFallback()
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
