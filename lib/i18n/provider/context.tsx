'use client'

/**
 * ProviderLocaleProvider — /dashboard/business (portal) area.
 * Language follows `PreferencesProvider` globally (no separate localStorage).
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
import { type ProviderTranslations } from './locales'

interface ProviderLocaleContextValue {
  t:       ProviderTranslations
  lang:    DashboardLang
  setLang: (lang: DashboardLang) => void
}

const ProviderLocaleContext = createContext<ProviderLocaleContextValue | null>(null)

export function ProviderLocaleProvider({ children }: { children: ReactNode }) {
  const { language, setLanguage } = usePreferences()

  const lang: DashboardLang = toAppLang(language) as DashboardLang

  const setLang = useCallback((next: DashboardLang) => {
    if (next !== 'mn' && next !== 'en') return
    setLanguage(next)
  }, [setLanguage])

  const value = useMemo<ProviderLocaleContextValue>(
    () => ({
      t: getAppMessages(lang).provider,
      lang,
      setLang,
    }),
    [lang, setLang],
  )

  return (
    <ProviderLocaleContext.Provider value={value}>
      {children}
    </ProviderLocaleContext.Provider>
  )
}

export function useProviderLocale(): ProviderLocaleContextValue {
  const ctx = useContext(ProviderLocaleContext)
  if (!ctx) {
    throw new Error('useProviderLocale must be used inside <ProviderLocaleProvider>')
  }
  return ctx
}
