'use client'

/**
 * lib/i18n/traveler/context.tsx
 *
 * TravelerLocaleProvider — wraps /dashboard (traveler) and /account/* areas.
 * useTravelerLocale()    — returns { t, lang, setLang } in any traveler client component.
 *
 * Default language: English ('en') for traveler role — most customers are foreign visitors.
 * Provider_owner / admin who land on account pages still get Mongolian by default.
 * Persisted in localStorage under the shared key 'wm_dashboard_lang'.
 */

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'
import { useSession } from 'next-auth/react'
import {
  type DashboardLang,
  defaultLangForRole,
  getStoredLang,
  setStoredLang,
} from '../config'
import { type TravelerTranslations, travelerLocales } from './locales'

// ── Context shape ─────────────────────────────────────────────────────────────

interface TravelerLocaleContextValue {
  t:       TravelerTranslations
  lang:    DashboardLang
  setLang: (lang: DashboardLang) => void
}

const TravelerLocaleContext = createContext<TravelerLocaleContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function TravelerLocaleProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()

  // SSR-safe default: 'en' during server render (traveler portal is English-first).
  // useEffect corrects to stored preference or role-based default on client mount.
  const [lang, setLangState] = useState<DashboardLang>('en')

  useEffect(() => {
    const stored = getStoredLang()
    if (stored) {
      setLangState(stored)
    } else {
      setLangState(defaultLangForRole(session?.user?.role))
    }
  }, [session?.user?.role])

  const setLang = (next: DashboardLang) => {
    setLangState(next)
    setStoredLang(next)
  }

  const value: TravelerLocaleContextValue = {
    t:    travelerLocales[lang],
    lang,
    setLang,
  }

  return (
    <TravelerLocaleContext.Provider value={value}>
      {children}
    </TravelerLocaleContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Use inside any traveler dashboard client component to access translations.
 *
 * @example
 * const { t, lang, setLang } = useTravelerLocale()
 * <h1>{t.dashboard.title}</h1>
 */
export function useTravelerLocale(): TravelerLocaleContextValue {
  const ctx = useContext(TravelerLocaleContext)
  if (!ctx) {
    throw new Error('useTravelerLocale must be used inside <TravelerLocaleProvider>')
  }
  return ctx
}
