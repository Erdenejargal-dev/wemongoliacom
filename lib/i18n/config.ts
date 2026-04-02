/**
 * lib/i18n/config.ts
 *
 * Shared localization configuration used by all dashboard domains
 * (admin, provider, traveler).
 *
 * Role → default language rules:
 *   traveler      → English   (most customers are foreign)
 *   provider_owner → Mongolian (local Mongolian operators)
 *   admin          → Mongolian (internal management team)
 *   unauthenticated / unknown → Mongolian (safe default)
 */

export type DashboardLang = 'mn' | 'en'

/**
 * Single localStorage key shared across ALL dashboard areas.
 * If the user switches language in admin, it also switches in the
 * provider portal and traveler account — and vice versa.
 */
export const DASHBOARD_LANG_KEY = 'wm_dashboard_lang'

/**
 * Returns the correct default language for a given role.
 * Called on client mount when no stored preference exists.
 */
export function defaultLangForRole(role?: string | null): DashboardLang {
  return role === 'traveler' ? 'en' : 'mn'
}

/**
 * Read the stored language preference from localStorage.
 * Returns null if not set or unavailable (SSR).
 */
export function getStoredLang(): DashboardLang | null {
  if (typeof window === 'undefined') return null
  try {
    const stored = localStorage.getItem(DASHBOARD_LANG_KEY)
    return stored === 'en' || stored === 'mn' ? stored : null
  } catch {
    return null
  }
}

/**
 * Persist the language choice to localStorage.
 */
export function setStoredLang(lang: DashboardLang): void {
  try {
    localStorage.setItem(DASHBOARD_LANG_KEY, lang)
  } catch {
    // may be blocked in some environments
  }
}
