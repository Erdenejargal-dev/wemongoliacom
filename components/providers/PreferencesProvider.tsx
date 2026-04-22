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
 * RESOLUTION ORDER (Phase 6.4 — Cloudflare):
 *   1. Logged-in user profile      (session.user.preferredCurrency / preferredLanguage)
 *   2. Cookie                      (wm_currency / wm_lang — also readable by server)
 *   3. Geo headers (CF-IPCountry, x-vercel-ip-country, …) (MN → mn + MNT; …)
 *   4. Fallback                    (en + USD)
 *
 * The **same** rules are implemented in `lib/locale-currency-resolver.ts` and
 * run in Edge `proxy.ts` (cookie seed) + `getResolvedLocaleCurrencyForRequest`
 * (RSC). The server passes `initialResolved` into this provider so the first
 * client render matches SSR and `lang` on `<html>` — no hydration mismatch.
 *
 * localStorage mirrors are still written on change for cross-tab sync; the
 * canonical cross-request source for SSR is the cookie pair.
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
import { updateMyProfile } from '@/lib/api/account'
import { getFreshAccessToken } from '@/lib/auth-utils'
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
import type { ResolvedLocaleCurrency } from '@/lib/locale-currency-resolver'

export type Language = DashboardLang  // 'mn' | 'en'

type Source = 'user' | 'cookie' | 'storage' | 'geo' | 'browser' | 'default'

function resolverSourceToUi(s: ResolvedLocaleCurrency['languageSource']): Source {
  return s
}

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

// ── Provider ───────────────────────────────────────────────────────────

export function PreferencesProvider({
  children,
  /**
   * Output of `getResolvedLocaleCurrencyForRequest()` — must be the same
   * object the root layout used for `<html lang>` so hydration matches.
   */
  initialResolved,
}: {
  children:         React.ReactNode
  initialResolved:  ResolvedLocaleCurrency
}) {
  const router = useRouter()
  const { data: session, status, update: updateSession } = useSession()
  const userPrefCurrency = session?.user?.preferredCurrency
  const userPrefLanguage = session?.user?.preferredLanguage

  const [state, setState] = React.useState<{
    currency: Currency;  currencySource: Source
    language: Language;  languageSource: Source
  }>({
    currency:         initialResolved.currency,
    currencySource:   resolverSourceToUi(initialResolved.currencySource),
    language:         initialResolved.language,
    languageSource:   resolverSourceToUi(initialResolved.languageSource),
  })

  /** Latest pair for cross-field writes (language change needs current currency, and vice versa). */
  const latest = React.useRef({ language: state.language, currency: state.currency })
  React.useLayoutEffect(() => {
    latest.current = { language: state.language, currency: state.currency }
  }, [state.language, state.currency])

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

  // 2. After middleware may have set cookies, mirror them into state if
  //    they differ (e.g. first navigation). User/session still wins.
  React.useEffect(() => {
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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- one-time read of cookies set by middleware
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

  // ── Setters — persist to DB for logged-in users, then sync NextAuth JWT. ─

  const setCurrency = React.useCallback(
    (c: Currency) => {
      if (!SUPPORTED_CURRENCIES.includes(c)) return
      const lang = latest.current.language
      const pair  = { language: lang, currency: c }

      void (async () => {
        if (status === 'authenticated') {
          const token = await getFreshAccessToken()
          if (!token) return
          try {
            await updateMyProfile(token, {
              preferredLanguage: pair.language,
              preferredCurrency:  pair.currency,
            })
          } catch {
            return
          }
        }

        writePreferredCurrency(c)
        setState((s) => ({ ...s, currency: c, currencySource: 'user' }))
        latest.current = pair

        if (status === 'authenticated') {
          await updateSession({
            preferredLanguage: pair.language,
            preferredCurrency:  pair.currency,
          })
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent<PreferenceChangedDetail>(PREFERENCE_EVENT, {
              detail: { field: 'currency', value: c },
            }),
          )
        }
        router.refresh()
      })()
    },
    [router, status, updateSession],
  )

  const setLanguage = React.useCallback(
    (l: Language) => {
      if (l !== 'mn' && l !== 'en') return
      const cur = latest.current.currency
      const pair = { language: l, currency: cur }

      void (async () => {
        if (status === 'authenticated') {
          const token = await getFreshAccessToken()
          if (!token) return
          try {
            await updateMyProfile(token, {
              preferredLanguage: pair.language,
              preferredCurrency:  pair.currency,
            })
          } catch {
            return
          }
        }

        writePreferredLanguage(l)
        setState((s) => ({ ...s, language: l, languageSource: 'user' }))
        latest.current = pair

        if (status === 'authenticated') {
          await updateSession({
            preferredLanguage: pair.language,
            preferredCurrency:  pair.currency,
          })
        }

        if (typeof window !== 'undefined') {
          window.dispatchEvent(
            new CustomEvent<PreferenceChangedDetail>(PREFERENCE_EVENT, {
              detail: { field: 'language', value: l },
            }),
          )
        }
        router.refresh()
      })()
    },
    [router, status, updateSession],
  )

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
