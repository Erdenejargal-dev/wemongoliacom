/**
 * lib/locale-currency-resolver.ts
 *
 * Single source of truth for how we resolve the visitor's public-site
 * language and display currency. Pure functions only — no `next/headers`
 * or React — so the same rules run in:
 *   - `middleware.ts` (Edge)
 *   - `app/layout.tsx` (RSC) via the `.server` helper
 *   - unit tests
 *
 * Priority (strict):
 *   1. Authenticated user profile fields (when passed in as `userLanguage` / `userCurrency`)
 *   2. Saved cookies (wm_lang / wm_currency) — manual selection persists here
 *   3. Cloudflare `CF-IPCountry` (MN → mn + MNT; all other real countries → en + USD)
 *   4. Fallback: en + USD
 *
 * Cloudflare sends `XX` (unknown) and `T1` (Tor) — we treat them like “no
 * country”, same as a missing header → step 4 for any field not already
 * decided by 1–2.
 */

import { SUPPORTED_CURRENCIES, type Currency } from '@/lib/money'
import type { DashboardLang } from '@/lib/i18n/config'

export type LocaleSource = 'user' | 'cookie' | 'geo' | 'default'

export interface ResolvedLocaleCurrency {
  language:         DashboardLang
  currency:         Currency
  languageSource:   LocaleSource
  currencySource:   LocaleSource
}

function isValidLang(v: string | null | undefined): v is DashboardLang {
  return v === 'mn' || v === 'en'
}

function isValidCurrency(v: string | null | undefined): v is Currency {
  return SUPPORTED_CURRENCIES.includes(v as Currency)
}

/**
 * Read `CF-IPCountry` from a Web `Headers` or similar (case-insensitive).
 */
export function readCfIpCountryFromHeaders(
  h: { get(name: string): string | null } | null | undefined,
): string | null {
  if (!h) return null
  const v =
    h.get('cf-ipcountry') ||
    h.get('CF-IPCountry') ||
    h.get('Cf-Ipcountry')
  if (!v) return null
  const t = v.trim()
  return t ? t : null
}

/**
 * `XX` = reserved/unknown, `T1` = Tor — treat as “no country” for geo defaults.
 * Empty / invalid → unknown.
 */
export function isUnknownOrReservedCountry(code: string | null | undefined): boolean {
  if (code == null) return true
  const c = String(code).trim().toUpperCase()
  if (!c) return true
  if (c === 'XX' || c === 'T1') return true
  if (!/^[A-Z]{2}$/.test(c)) return true
  return false
}

/**
 * Map a two-letter country code to the default (language, currency) pair
 * for public listing / UI purposes.
 *
 * Rules: MN → mn + MNT. Every other **known** (non-reserved) country → en + USD.
 * Unknown / reserved / missing → en + USD.
 */
export function defaultsFromCloudflareCountry(
  code: string | null | undefined,
): { language: DashboardLang; currency: Currency } {
  if (isUnknownOrReservedCountry(code)) {
    return { language: 'en', currency: 'USD' }
  }
  const c = String(code).trim().toUpperCase()
  if (c === 'MN') {
    return { language: 'mn', currency: 'MNT' }
  }
  return { language: 'en', currency: 'USD' }
}

export type ResolveLocaleCurrencyInput = {
  /** From JWT / session (account preferences). */
  userLanguage?:  string | null
  userCurrency?:  string | null
  /** Raw cookie string values, if any. */
  cookieLanguage?:  string | null
  cookieCurrency?: string | null
  /**
   * Raw `CF-IPCountry` value (e.g. from `headers()` or middleware `request.headers`).
   * If omitted, geo step is skipped for fields that need it.
   */
  cfIpCountry?: string | null
}

/**
 * Apply the priority stack independently for language and for currency.
 * Geo uses `cfIpCountry` only when a field is not satisfied by user or
 * cookies; MN maps to both mn and MNT, other non-reserved countries to en+USD.
 */
export function resolveLocaleCurrency(input: ResolveLocaleCurrencyInput): ResolvedLocaleCurrency {
  const { userLanguage, userCurrency, cookieLanguage, cookieCurrency, cfIpCountry } = input

  // ── language
  let language:        DashboardLang
  let languageSource:  LocaleSource
  if (isValidLang(userLanguage ?? undefined)) {
    language = userLanguage as DashboardLang
    languageSource = 'user'
  } else if (isValidLang(cookieLanguage ?? undefined)) {
    language = cookieLanguage as DashboardLang
    languageSource = 'cookie'
  } else if (isUnknownOrReservedCountry(cfIpCountry)) {
    language = 'en'
    languageSource = 'default'
  } else {
    language = defaultsFromCloudflareCountry(cfIpCountry).language
    languageSource = 'geo'
  }

  // ── currency
  let currency:         Currency
  let currencySource:  LocaleSource
  if (isValidCurrency(userCurrency ?? undefined)) {
    currency = userCurrency as Currency
    currencySource = 'user'
  } else if (isValidCurrency(cookieCurrency ?? undefined)) {
    currency = cookieCurrency as Currency
    currencySource = 'cookie'
  } else if (isUnknownOrReservedCountry(cfIpCountry)) {
    currency = 'USD'
    currencySource = 'default'
  } else {
    currency = defaultsFromCloudflareCountry(cfIpCountry).currency
    currencySource = 'geo'
  }

  return { language, currency, languageSource, currencySource }
}
