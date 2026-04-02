'use client'

/**
 * lib/i18n/provider/context.tsx
 *
 * ProviderLocaleProvider — wraps the entire /dashboard/business/(portal) area.
 * useProviderLocale()    — returns { t, lang, setLang } in any provider client component.
 *
 * Default language: Mongolian ('mn') for provider_owner and admin roles.
 * Persisted in localStorage under the shared key 'wm_dashboard_lang'.
 * Language changes here are reflected in all other dashboard areas (and vice versa).
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
import { type ProviderTranslations, providerLocales } from './locales'

// ── Context shape ─────────────────────────────────────────────────────────────

interface ProviderLocaleContextValue {
  t:       ProviderTranslations
  lang:    DashboardLang
  setLang: (lang: DashboardLang) => void
}

const ProviderLocaleContext = createContext<ProviderLocaleContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function ProviderLocaleProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()

  // SSR-safe default: always 'mn' during server render (no hydration mismatch).
  // useEffect corrects to stored preference or role-based default on client mount.
  const [lang, setLangState] = useState<DashboardLang>('mn')

  useEffect(() => {
    const stored = getStoredLang()
    if (stored) {
      setLangState(stored)
    } else {
      // No stored preference: derive from role.
      // Provider_owner and admin both default to Mongolian.
      setLangState(defaultLangForRole(session?.user?.role))
    }
  }, [session?.user?.role])

  const setLang = (next: DashboardLang) => {
    setLangState(next)
    setStoredLang(next)
  }

  const value: ProviderLocaleContextValue = {
    t:    providerLocales[lang],
    lang,
    setLang,
  }

  return (
    <ProviderLocaleContext.Provider value={value}>
      {children}
    </ProviderLocaleContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Use inside any provider dashboard client component to access translations.
 *
 * @example
 * const { t, lang, setLang } = useProviderLocale()
 * <h1>{t.overview.recentBookings}</h1>
 */
export function useProviderLocale(): ProviderLocaleContextValue {
  const ctx = useContext(ProviderLocaleContext)
  if (!ctx) {
    throw new Error('useProviderLocale must be used inside <ProviderLocaleProvider>')
  }
  return ctx
}
