'use client'

/**
 * TravelerLocaleProvider — /dashboard (traveler) and /account/* areas.
 * Language is the single global preference from `PreferencesProvider`
 * (no separate wm_dashboard_lang state).
 *
 * useTravelerLocale() → { t, lang, setLang } — setLang calls `setLanguage` on
 * PreferencesProvider (persists DB + JWT + cookies when logged in).
 */

import React, {
  createContext,
  useContext,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react'
import { usePreferences } from '@/components/providers/PreferencesProvider'
import { getAppMessages, toAppLang } from '@/lib/i18n/messages/registry'
import type { DashboardLang } from '../config'
import { type TravelerTranslations } from './locales'

interface TravelerLocaleContextValue {
  t:       TravelerTranslations
  lang:    DashboardLang
  setLang: (lang: DashboardLang) => void
}

const TravelerLocaleContext = createContext<TravelerLocaleContextValue | null>(null)

export function TravelerLocaleProvider({ children }: { children: ReactNode }) {
  const { language, setLanguage } = usePreferences()

  const lang: DashboardLang = toAppLang(language) as DashboardLang

  const setLang = useCallback((next: DashboardLang) => {
    if (next !== 'mn' && next !== 'en') return
    setLanguage(next)
  }, [setLanguage])

  const value = useMemo<TravelerLocaleContextValue>(
    () => ({
      t: getAppMessages(lang).traveler,
      lang,
      setLang,
    }),
    [lang, setLang],
  )

  return (
    <TravelerLocaleContext.Provider value={value}>
      {children}
    </TravelerLocaleContext.Provider>
  )
}

export function useTravelerLocale(): TravelerLocaleContextValue {
  const ctx = useContext(TravelerLocaleContext)
  if (!ctx) {
    throw new Error('useTravelerLocale must be used inside <TravelerLocaleProvider>')
  }
  return ctx
}
