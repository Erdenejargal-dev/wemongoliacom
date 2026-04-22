'use client'

/**
 * AdminLocaleProvider — /admin area.
 * Language follows `PreferencesProvider` globally (no isolated admin default).
 */

import React, {
  createContext,
  useContext,
  useMemo,
  type ReactNode,
} from 'react'
import { usePreferences } from '@/components/providers/PreferencesProvider'
import { getAppMessages, toAppLang } from '@/lib/i18n/messages/registry'
import type { DashboardLang } from '../config'
import { type AdminTranslations } from './locales'

export type { DashboardLang as AdminLang }

interface AdminLocaleContextValue {
  t:       AdminTranslations
  lang:    DashboardLang
  setLang: (lang: DashboardLang) => void
}

const AdminLocaleContext = createContext<AdminLocaleContextValue | null>(null)

export function AdminLocaleProvider({ children }: { children: ReactNode }) {
  const { language, setLanguage } = usePreferences()

  const lang: DashboardLang = toAppLang(language) as DashboardLang

  const setLang = (next: DashboardLang) => {
    if (next !== 'mn' && next !== 'en') return
    setLanguage(next)
  }

  const value = useMemo<AdminLocaleContextValue>(
    () => ({
      t: getAppMessages(lang).admin,
      lang,
      setLang,
    }),
    [lang, setLanguage],
  )

  return (
    <AdminLocaleContext.Provider value={value}>
      {children}
    </AdminLocaleContext.Provider>
  )
}

export function useAdminLocale(): AdminLocaleContextValue {
  const ctx = useContext(AdminLocaleContext)
  if (!ctx) {
    throw new Error('useAdminLocale must be used inside <AdminLocaleProvider>')
  }
  return ctx
}
