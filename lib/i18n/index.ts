/**
 * WeMongolia i18n — unified entry (client-safe + shared).
 *
 * - Server: import `getTranslations` from `@/lib/i18n/server` (uses `next/headers` — do not
 *   re-export it here, or client bundles that import `@/lib/i18n` will fail under Turbopack).
 * - `useTranslations()` — client components (uses PreferencesProvider language)
 * - `getAppMessages(lang)` — direct access when you already have `en` | `mn`
 *
 * Registry includes: `public`, `traveler`, `admin`, `provider`, `common`, `auth`,
 * `onboarding`, `nav` (alias of `public.nav`), `footer`, `forgotPassword`, `register`,
 * `resetPassword`, `toursSearch`.
 */

export { useTranslations } from './hooks'
export { getAppMessages, toAppLang, type AppMessages, type AppLang } from './messages/registry'
export {
  formatDateForApp,
  formatDateForLocaleString,
  formatDateMonthDay,
  formatDateLong,
  formatDateWithWeekdayShort,
  formatDateMonthYear,
  formatMonthYearLong,
} from './format-date'
export { getCountryFormDisplayLabel, COUNTRY_FORM_ENGLISH_NAMES } from './country-labels'
