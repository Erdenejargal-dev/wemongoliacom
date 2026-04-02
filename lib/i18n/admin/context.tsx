'use client'

/**
 * lib/i18n/admin/context.tsx
 *
 * AdminLocaleProvider — wraps the entire /admin area.
 * useAdminLocale()    — returns { t, lang, setLang } in any admin client component.
 *
 * Default language: Mongolian ('mn') — admin/internal management team.
 * Persisted in the shared localStorage key 'wm_dashboard_lang'.
 * Language changes here are shared across all dashboard areas.
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
import { type AdminTranslations, locales } from './locales'

// Re-export for backward compatibility
export type { DashboardLang as AdminLang }

// ── Context shape ─────────────────────────────────────────────────────────────

interface AdminLocaleContextValue {
  t:       AdminTranslations
  lang:    DashboardLang
  setLang: (lang: DashboardLang) => void
}

const AdminLocaleContext = createContext<AdminLocaleContextValue | null>(null)

// ── Provider ──────────────────────────────────────────────────────────────────

export function AdminLocaleProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession()

  // SSR-safe: always 'mn' on first render to avoid hydration mismatch.
  // useEffect adjusts to stored preference or role-based default on client mount.
  const [lang, setLangState] = useState<DashboardLang>('mn')

  useEffect(() => {
    const stored = getStoredLang()
    if (stored) {
      setLangState(stored)
    } else {
      // Admin always defaults to Mongolian, but respect stored override
      setLangState(defaultLangForRole(session?.user?.role))
    }
  }, [session?.user?.role])

  const setLang = (next: DashboardLang) => {
    setLangState(next)
    setStoredLang(next)
  }

  const value: AdminLocaleContextValue = {
    t:    locales[lang],
    lang,
    setLang,
  }

  return (
    <AdminLocaleContext.Provider value={value}>
      {children}
    </AdminLocaleContext.Provider>
  )
}

// ── Hook ──────────────────────────────────────────────────────────────────────

/**
 * Use inside any admin client component to access translations.
 *
 * @example
 * const { t, lang, setLang } = useAdminLocale()
 * <h1>{t.overview.title}</h1>
 */
export function useAdminLocale(): AdminLocaleContextValue {
  const ctx = useContext(AdminLocaleContext)
  if (!ctx) {
    throw new Error('useAdminLocale must be used inside <AdminLocaleProvider>')
  }
  return ctx
}
