'use client'

/**
 * components/providers/PreferencesProvider.tsx
 *
 * Phase 6 — UX + Growth Layer.
 *
 * Single source of truth for two user preferences:
 *   - currency  (MNT | USD)
 *   - language  (mn  | en)
 *
 * RESOLUTION ORDER (authoritative, matches the Phase 6 spec):
 *   1. Logged-in user profile      (User.preferredCurrency / preferredLanguage)
 *   2. Client storage              (localStorage keys: "wm.displayCurrency", "wm_dashboard_lang")
 *   3. Geo hint from backend       (GET /geo/hint — CF/Vercel country header)
 *   4. Browser language            (navigator.language — only for language)
 *   5. Fallback default            ("en" + "USD")
 *
 * User override ALWAYS wins once selected. We never silently re-apply a
 * geo default over a user's explicit choice.
 *
 * This provider DELIBERATELY uses the same localStorage keys as the
 * pre-existing `DisplayCurrencyProvider` and `wm_dashboard_lang` so that
 * other parts of the app that already read those keys continue to work
 * unchanged. `DisplayCurrencyProvider` remains mounted (for back-compat
 * with traveler dashboard code that reads `useDisplayCurrency()`), but
 * this provider is the one wired into the public site navbar.
 */

import * as React from 'react'
import { useSession } from 'next-auth/react'
import { SUPPORTED_CURRENCIES, type Currency } from '@/lib/money'
import { writeDisplayCurrency } from '@/lib/pricing'
import {
  DASHBOARD_LANG_KEY,
  getStoredLang,
  setStoredLang,
  type DashboardLang,
} from '@/lib/i18n/config'

export type Language = DashboardLang  // 'mn' | 'en'

type Source = 'user' | 'storage' | 'geo' | 'browser' | 'default'

export interface PreferencesContextValue {
  currency:           Currency
  language:           Language
  setCurrency:        (c: Currency) => void
  setLanguage:        (l: Language) => void
  /** For analytics / debugging — where did each value come from? */
  currencySource:     Source
  languageSource:     Source
  /** Did the user ever explicitly pick a value, or are these just defaults? */
  isUserSelected:     boolean
}

const DEFAULT_CURRENCY: Currency = 'USD'
const DEFAULT_LANGUAGE: Language = 'en'

const Ctx = React.createContext<PreferencesContextValue | null>(null)

// ── Storage helpers ────────────────────────────────────────────────────

const CURRENCY_STORAGE_KEY = 'wm.displayCurrency'

function readStoredCurrency(): Currency | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(CURRENCY_STORAGE_KEY)
    return raw === 'MNT' || raw === 'USD' ? raw : null
  } catch { return null }
}

function readBrowserLang(): Language | null {
  if (typeof window === 'undefined') return null
  const primary = (navigator.language || '').toLowerCase()
  if (primary.startsWith('mn')) return 'mn'
  if (primary.startsWith('en')) return 'en'
  return null
}

// ── Provider ───────────────────────────────────────────────────────────

export function PreferencesProvider({ children }: { children: React.ReactNode }) {
  const { data: session } = useSession()
  const userPrefCurrency = (session?.user as any)?.preferredCurrency as Currency | undefined
  const userPrefLanguage = (session?.user as any)?.preferredLanguage as Language | undefined

  // SSR-safe: start from defaults so server markup matches the first client
  // render; hydrate from storage + geo in a useEffect.
  const [state, setState] = React.useState<{
    currency: Currency;  currencySource: Source
    language: Language;  languageSource: Source
  }>({
    currency: DEFAULT_CURRENCY, currencySource: 'default',
    language: DEFAULT_LANGUAGE, languageSource: 'default',
  })

  // 1. Fold user profile → local state. Fires whenever the session changes.
  React.useEffect(() => {
    if (userPrefCurrency && SUPPORTED_CURRENCIES.includes(userPrefCurrency)) {
      setState((s) => ({ ...s, currency: userPrefCurrency, currencySource: 'user' }))
    }
    if (userPrefLanguage === 'mn' || userPrefLanguage === 'en') {
      setState((s) => ({ ...s, language: userPrefLanguage, languageSource: 'user' }))
    }
  }, [userPrefCurrency, userPrefLanguage])

  // 2. Hydrate from storage + geo on first client mount (only if user profile
  //    didn't already provide a value).
  React.useEffect(() => {
    let cancelled = false

    const storedCur = readStoredCurrency()
    const storedLang = getStoredLang()

    setState((s) => {
      const next = { ...s }
      if (s.currencySource !== 'user' && storedCur) {
        next.currency = storedCur
        next.currencySource = 'storage'
      }
      if (s.languageSource !== 'user' && storedLang) {
        next.language = storedLang
        next.languageSource = 'storage'
      }
      return next
    })

    // Still need to resolve defaults? Try geo then browser.
    const needGeo = !userPrefCurrency && !storedCur
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
        // geo endpoint failure must never break the site
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
    // Run once per mount — user pref changes are handled by effect 1 above.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // 3. Cross-tab sync for both keys.
  React.useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (e.key === CURRENCY_STORAGE_KEY) {
        if (e.newValue === 'MNT' || e.newValue === 'USD') {
          setState((s) => ({ ...s, currency: e.newValue as Currency, currencySource: 'storage' }))
        }
      } else if (e.key === DASHBOARD_LANG_KEY) {
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
    writeDisplayCurrency(c)
    setState((s) => ({ ...s, currency: c, currencySource: 'user' }))
    // Fire a lightweight analytics ping (no-op if the hook isn't wired up).
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wm:preference-changed', {
        detail: { field: 'currency', value: c },
      }))
    }
  }, [])

  const setLanguage = React.useCallback((l: Language) => {
    if (l !== 'mn' && l !== 'en') return
    setStoredLang(l)
    setState((s) => ({ ...s, language: l, languageSource: 'user' }))
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('wm:preference-changed', {
        detail: { field: 'language', value: l },
      }))
    }
  }, [])

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
    // Graceful fallback outside provider — components rendered in storybook
    // or tests still work with defaults.
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
