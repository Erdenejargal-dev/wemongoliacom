'use client'

/**
 * lib/i18n/public/context.tsx
 *
 * Phase 6.1 — public-site locale provider. Mounted once at the app
 * root; reads the language from `usePreferences()` so there is ONE
 * source of truth for the language preference (the preferences
 * provider), and exposes a pre-resolved translation dictionary `t`.
 *
 * Hook: `usePublicLocale()` → `{ t, lang }`.
 */

import * as React from 'react'
import { usePreferences } from '@/components/providers/PreferencesProvider'
import { publicLocales, type PublicLang, type PublicTranslations } from './locales'

interface PublicLocaleContextValue {
  t:    PublicTranslations
  lang: PublicLang
}

const Ctx = React.createContext<PublicLocaleContextValue | null>(null)

export function PublicLocaleProvider({ children }: { children: React.ReactNode }) {
  const { language } = usePreferences()
  const lang: PublicLang = language === 'mn' ? 'mn' : 'en'
  const value = React.useMemo<PublicLocaleContextValue>(() => ({
    t:    publicLocales[lang],
    lang,
  }), [lang])
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePublicLocale(): PublicLocaleContextValue {
  const v = React.useContext(Ctx)
  if (v) return v
  // Graceful fallback — components rendered in isolation / storybook
  // still get a working dictionary.
  return { t: publicLocales.en, lang: 'en' }
}
