'use client'

/**
 * Client Components — same message tree as `getTranslations()` on the server,
 * driven by `usePreferences().language` (session + cookies + geo already applied).
 */

import { useMemo } from 'react'
import { usePreferences } from '@/components/providers/PreferencesProvider'
import { getAppMessages, toAppLang, type AppMessages, type AppLang } from './messages/registry'

export function useTranslations(): { t: AppMessages; lang: AppLang } {
  const { language } = usePreferences()
  const lang = toAppLang(language)
  return useMemo(() => ({ t: getAppMessages(lang), lang }), [lang])
}
