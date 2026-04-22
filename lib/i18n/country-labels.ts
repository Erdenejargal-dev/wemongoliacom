/**
 * Localized display labels for the checkout/traveler country select.
 * Option `value` stays the canonical English name string (unchanged for APIs/storage).
 */

import type { AppLang } from './messages/registry'

const BCP47: Record<AppLang, string> = { en: 'en-US', mn: 'mn-MN' }

/** Canonical list — must match `components/checkout/TravelerForm` `value`s */
export const COUNTRY_FORM_ENGLISH_NAMES = [
  'Mongolia', 'United States', 'United Kingdom', 'Germany', 'France', 'Japan',
  'South Korea', 'Australia', 'Canada', 'China', 'Russia', 'Italy', 'Spain',
  'Netherlands', 'Sweden', 'Norway', 'Switzerland', 'Austria', 'Brazil',
  'Mexico', 'India', 'Singapore', 'New Zealand', 'Other',
] as const

export type CountryFormValue = (typeof COUNTRY_FORM_ENGLISH_NAMES)[number]

/** ISO 3166-1 alpha-2 for Intl.DisplayNames (not used for "Other") */
const ENGLISH_NAME_TO_REGION: Record<string, string> = {
  'Mongolia': 'MN',
  'United States': 'US',
  'United Kingdom': 'GB',
  'Germany': 'DE',
  'France': 'FR',
  'Japan': 'JP',
  'South Korea': 'KR',
  'Australia': 'AU',
  'Canada': 'CA',
  'China': 'CN',
  'Russia': 'RU',
  'Italy': 'IT',
  'Spain': 'ES',
  'Netherlands': 'NL',
  'Sweden': 'SE',
  'Norway': 'NO',
  'Switzerland': 'CH',
  'Austria': 'AT',
  'Brazil': 'BR',
  'Mexico': 'MX',
  'India': 'IN',
  'Singapore': 'SG',
  'New Zealand': 'NZ',
}

const OTHER = 'Other'

/**
 * @param otherLabel - localized word for "Other" (e.g. `t.common.countryOther`)
 */
export function getCountryFormDisplayLabel(
  englishValue: string,
  lang: AppLang,
  otherLabel: string,
): string {
  if (englishValue === OTHER) return otherLabel
  const code = ENGLISH_NAME_TO_REGION[englishValue]
  if (!code) return englishValue
  const loc = BCP47[lang] ?? BCP47.en
  if (typeof Intl === 'undefined' || typeof (Intl as unknown as { DisplayNames?: unknown }).DisplayNames !== 'function') {
    return englishValue
  }
  try {
    const dn = new Intl.DisplayNames([loc], { type: 'region' })
    const l = dn.of(code)
    return l ?? englishValue
  } catch {
    return englishValue
  }
}
