/**
 * User-facing date formatting using the app language (en | mn).
 * Do not pass server-only timezones; keep options explicit per call site.
 */

import type { AppLang } from './messages/registry'

const BCP47: Record<AppLang, string> = {
  en: 'en-US',
  mn: 'mn-MN',
}

/**
 * BCP-47 string used in Preferences / traveler locale (same values as BCP47).
 * Useful when you only have a `dateLocale` string (e.g. "mn-MN") from i18n config.
 */
export function formatDateForLocaleString(
  input: string | number | Date,
  locale: string,
  options: Intl.DateTimeFormatOptions,
): string {
  const d = toDate(input)
  if (!d) return '—'
  try {
    return d.toLocaleDateString(locale, options)
  } catch {
    return d.toLocaleDateString('en-US', options)
  }
}

/**
 * Formats a date for the resolved app language (traveler, public, checkout, etc.).
 */
export function formatDateForApp(
  input: string | number | Date,
  lang: AppLang,
  options: Intl.DateTimeFormatOptions,
): string {
  return formatDateForLocaleString(input, BCP47[lang] ?? BCP47.en, options)
}

/** e.g. Jan 5 */
export function formatDateMonthDay(
  input: string | number | Date,
  lang: AppLang,
): string {
  return formatDateForApp(input, lang, { month: 'short', day: 'numeric' })
}

/** e.g. Mon, Jan 5, 2025 */
export function formatDateLong(
  input: string | number | Date,
  lang: AppLang,
): string {
  return formatDateForApp(input, lang, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })
}

/** e.g. Mon, Jan 5, 2025 (no weekday) — used where previously `short` weekday */
export function formatDateWithWeekdayShort(
  input: string | number | Date,
  lang: AppLang,
): string {
  return formatDateForApp(input, lang, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/** e.g. Jan 5, 2025 */
export function formatDateMonthYear(
  input: string | number | Date,
  lang: AppLang,
): string {
  return formatDateForApp(input, lang, { month: 'short', day: 'numeric', year: 'numeric' })
}

/** e.g. January 2025 */
export function formatMonthYearLong(
  input: string | number | Date,
  lang: AppLang,
): string {
  return formatDateForApp(input, lang, { month: 'long', year: 'numeric' })
}

function toDate(input: string | number | Date): Date | null {
  if (input instanceof Date) {
    return Number.isNaN(input.getTime()) ? null : input
  }
  const d = new Date(input)
  return Number.isNaN(d.getTime()) ? null : d
}
