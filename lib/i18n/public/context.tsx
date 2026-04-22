'use client'

/**
 * lib/i18n/public/context.tsx
 *
 * Public-site locale provider. Uses the same language as
 * `PreferencesProvider` (session + cookies + Cloudflare + fallback) and
 * the unified `getAppMessages(lang).public` dictionary.
 *
 * Hook: `usePublicLocale()` → `{ t, lang }` — `t` is the `public` namespace only.
 */

import * as React from 'react'
import { usePreferences } from '@/components/providers/PreferencesProvider'
import { getAppMessages, toAppLang, type AppLang } from '@/lib/i18n/messages/registry'
import type { PublicLang, PublicTranslations } from './locales'

interface PublicLocaleContextValue {
  t:    PublicTranslations
  lang: PublicLang
}

const Ctx = React.createContext<PublicLocaleContextValue | null>(null)

export function PublicLocaleProvider({ children }: { children: React.ReactNode }) {
  const { language } = usePreferences()
  const lang: AppLang = toAppLang(language)

  const value = React.useMemo<PublicLocaleContextValue>(() => ({
    t:    getAppMessages(lang).public,
    lang: lang === 'mn' ? 'mn' : 'en',
  }), [lang])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function usePublicLocale(): PublicLocaleContextValue {
  const v = React.useContext(Ctx)
  if (v) return v
  return { t: getAppMessages('en').public, lang: 'en' }
}
