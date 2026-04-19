/**
 * lib/preferences-storage.ts
 *
 * Phase 6.1 — shared constants + helpers for persisting the user's
 * currency and language preferences in BOTH a cookie (server-readable)
 * and localStorage (client-readable, cross-tab sync).
 *
 * WHY BOTH?
 *   - localStorage already exists from Phase 3; we keep writing it so
 *     existing `readDisplayCurrency()` / `getStoredLang()` helpers and
 *     cross-tab `storage` events keep working.
 *   - Server components have no access to localStorage. The cookie is
 *     the only mechanism that lets `app/.../page.tsx` rendered on the
 *     server send the correct `X-Display-Currency` header when it
 *     fetches data through `lib/api/client.ts`.
 *
 * Cookies are intentionally NOT httpOnly — they're display preferences,
 * not secrets, and the frontend must be able to mirror them into the
 * outgoing fetch header.
 */

import type { Currency } from './money'
import type { DashboardLang } from './i18n/config'

export const CURRENCY_COOKIE = 'wm_currency'
export const LANGUAGE_COOKIE = 'wm_lang'

/** localStorage keys — kept stable for back-compat with Phase 3 code. */
export const CURRENCY_STORAGE_KEY = 'wm.displayCurrency'
export const LANGUAGE_STORAGE_KEY = 'wm_dashboard_lang'

const ONE_YEAR_S = 60 * 60 * 24 * 365

function writeCookie(name: string, value: string): void {
  if (typeof document === 'undefined') return
  // SameSite=Lax is required so the cookie is sent on top-level
  // navigations (server fetches rely on this).
  const secure = typeof window !== 'undefined' && window.location.protocol === 'https:' ? '; Secure' : ''
  document.cookie = `${name}=${encodeURIComponent(value)}; Max-Age=${ONE_YEAR_S}; Path=/; SameSite=Lax${secure}`
}

function readCookieClient(name: string): string | null {
  if (typeof document === 'undefined') return null
  const m = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return m ? decodeURIComponent(m[1]) : null
}

// ── Currency ───────────────────────────────────────────────────────────

export function writePreferredCurrency(c: Currency): void {
  writeCookie(CURRENCY_COOKIE, c)
  if (typeof window !== 'undefined') {
    try { window.localStorage.setItem(CURRENCY_STORAGE_KEY, c) } catch { /* ignore */ }
  }
}

export function readPreferredCurrencyClient(): Currency | null {
  const c = readCookieClient(CURRENCY_COOKIE)
  if (c === 'MNT' || c === 'USD') return c
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(CURRENCY_STORAGE_KEY)
      if (raw === 'MNT' || raw === 'USD') return raw
    } catch { /* ignore */ }
  }
  return null
}

// ── Language ───────────────────────────────────────────────────────────

export function writePreferredLanguage(l: DashboardLang): void {
  writeCookie(LANGUAGE_COOKIE, l)
  if (typeof window !== 'undefined') {
    try { window.localStorage.setItem(LANGUAGE_STORAGE_KEY, l) } catch { /* ignore */ }
  }
}

export function readPreferredLanguageClient(): DashboardLang | null {
  const l = readCookieClient(LANGUAGE_COOKIE)
  if (l === 'mn' || l === 'en') return l
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem(LANGUAGE_STORAGE_KEY)
      if (raw === 'mn' || raw === 'en') return raw
    } catch { /* ignore */ }
  }
  return null
}

/**
 * Custom event dispatched whenever either preference is updated in the
 * same tab. `DisplayCurrencyProvider` and any other legacy listener
 * subscribe to it so they re-render without relying on cross-tab
 * `storage` events.
 */
export const PREFERENCE_EVENT = 'wm:preference-changed'
export interface PreferenceChangedDetail {
  field: 'currency' | 'language'
  value: string
}
