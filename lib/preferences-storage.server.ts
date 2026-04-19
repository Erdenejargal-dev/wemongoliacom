/**
 * lib/preferences-storage.server.ts
 *
 * Phase 6.2 — server-side reader for the display-currency / language
 * preference cookies.
 *
 * WHY A SEPARATE FILE?
 *   `lib/preferences-storage.ts` is imported by both server and client
 *   code. It must NOT import `next/headers` at the top level or the
 *   browser bundle will crash. This file is explicitly server-only:
 *   it imports `next/headers` and is safe to use from server components
 *   or route handlers.
 *
 * Cookies are the source of truth on the server because localStorage
 * is browser-only. The client mirror lives in `preferences-storage.ts`.
 */

import { cookies } from 'next/headers'
import { CURRENCY_COOKIE, LANGUAGE_COOKIE } from './preferences-storage'
import type { Currency } from './money'
import type { DashboardLang } from './i18n/config'

/**
 * Read the user's preferred display currency from the request cookie.
 *
 * Returns `null` when no cookie is set — the caller should apply its
 * own default (typically USD, or MNT when the browser locale is
 * Mongolian — that logic lives in `PreferencesProvider` on the
 * client).
 *
 * Next 15 exposes `cookies()` as an async API while Next 14 is sync;
 * we handle both shapes so the same helper works across versions.
 */
export async function readPreferredCurrencyServer(): Promise<Currency | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jar: any = cookies()
    const resolved = jar && typeof jar.then === 'function' ? await jar : jar
    const v = resolved?.get?.(CURRENCY_COOKIE)?.value as string | undefined
    if (v === 'MNT' || v === 'USD') return v
  } catch {
    // Not called inside a server context — silent no-op.
  }
  return null
}

export async function readPreferredLanguageServer(): Promise<DashboardLang | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const jar: any = cookies()
    const resolved = jar && typeof jar.then === 'function' ? await jar : jar
    const v = resolved?.get?.(LANGUAGE_COOKIE)?.value as string | undefined
    if (v === 'mn' || v === 'en') return v
  } catch {
    // Not called inside a server context — silent no-op.
  }
  return null
}
