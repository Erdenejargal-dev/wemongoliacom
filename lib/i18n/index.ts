/**
 * WeMongolia i18n — unified entry.
 *
 * - `getTranslations()` — async, Server Components
 * - `useTranslations()` — client components (uses PreferencesProvider language)
 * - `getAppMessages(lang)` — direct access when you already have `en` | `mn`
 *
 * Registry includes: `public`, `traveler`, `admin`, `provider`, `common`, `auth`,
 * `onboarding`, `nav` (alias of `public.nav`), `footer`, `forgotPassword`, `register`,
 * `resetPassword`, `toursSearch`.
 */

export { getTranslations } from './server'
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
