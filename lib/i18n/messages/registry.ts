/**
 * Central registry — composes all domain dictionaries into one `AppMessages`
 * tree per language. Server and client both use `getAppMessages(lang)`.
 */

import { publicLocales, type PublicTranslations } from '../public/locales'
import { travelerLocales, type TravelerTranslations } from '../traveler/locales'
import { locales as adminLocales, type AdminTranslations } from '../admin/locales'
import { providerLocales, type ProviderTranslations } from '../provider/locales'
import { commonEn, commonMn, type CommonMessages } from './common'
import { authEn, authMn, type AuthMessages } from './auth'
import { onboardingEn, onboardingMn, type OnboardingMessages } from './onboarding'
import { footerEn, footerMn, type FooterMessages } from './footer'
import { forgotPasswordEn, forgotPasswordMn, type ForgotPasswordMessages } from './forgotPassword'
import { registerAccountEn, registerAccountMn, type RegisterAccountMessages } from './registerAccount'
import { resetPasswordEn, resetPasswordMn, type ResetPasswordMessages } from './resetPassword'
import { toursSearchEn, toursSearchMn, type ToursSearchMessages } from './toursSearch'
import { browseEn, browseMn, type BrowseMessages } from './browse'
import { tourDetailEn, tourDetailMn, type TourDetailMessages } from './tourDetail'
import { stayDetailEn, stayDetailMn, type StayDetailMessages } from './stayDetail'
import { hostDetailEn, hostDetailMn, type HostDetailMessages } from './hostDetail'
import { hostsBrowseEn, hostsBrowseMn, type HostsBrowseMessages } from './hostsBrowse'
import { assertMessageParity } from './parity'
import { mergeLocaleWithEnglish } from './merge-fallback'
import { withDevI18nGuard } from '../dev-guard'

export type AppLang = 'en' | 'mn'

/** One object per request / render — namespaced by area. */
export type AppMessages = {
  public:       PublicTranslations
  traveler:     TravelerTranslations
  admin:        AdminTranslations
  provider:     ProviderTranslations
  common:       CommonMessages
  auth:         AuthMessages
  onboarding:   OnboardingMessages
  /** Same strings as `public.nav` — convenient for `useTranslations().nav` in any client */
  nav:            PublicTranslations['nav']
  footer:         FooterMessages
  forgotPassword: ForgotPasswordMessages
  register:       RegisterAccountMessages
  resetPassword:  ResetPasswordMessages
  toursSearch:     ToursSearchMessages
  browse:          BrowseMessages
  tourDetail:      TourDetailMessages
  stayDetail:      StayDetailMessages
  hostDetail:      HostDetailMessages
  /** Public /hosts directory listing */
  hostsBrowse:     HostsBrowseMessages
}

const en: AppMessages = {
  public:     publicLocales.en,
  traveler:   travelerLocales.en,
  admin:      adminLocales.en,
  provider:   providerLocales.en,
  common:     commonEn,
  auth:       authEn,
  onboarding: onboardingEn,
  nav:        publicLocales.en.nav,
  footer:     footerEn,
  forgotPassword: forgotPasswordEn,
  register:   registerAccountEn,
  resetPassword: resetPasswordEn,
  toursSearch:   toursSearchEn,
  browse:        browseEn,
  tourDetail:    tourDetailEn,
  stayDetail:    stayDetailEn,
  hostDetail:    hostDetailEn,
  hostsBrowse:   hostsBrowseEn,
}

const mn: AppMessages = {
  public:     publicLocales.mn,
  traveler:   travelerLocales.mn,
  admin:      adminLocales.mn,
  provider:   providerLocales.mn,
  common:     commonMn,
  auth:       authMn,
  onboarding: onboardingMn,
  nav:        publicLocales.mn.nav,
  footer:     footerMn,
  forgotPassword: forgotPasswordMn,
  register:   registerAccountMn,
  resetPassword: resetPasswordMn,
  toursSearch:   toursSearchMn,
  browse:        browseMn,
  tourDetail:    tourDetailMn,
  stayDetail:    stayDetailMn,
  hostDetail:    hostDetailMn,
  hostsBrowse:   hostsBrowseMn,
}

const byLang: Record<AppLang, AppMessages> = { en, mn }

if (process.env.NODE_ENV === 'development') {
  try {
    assertMessageParity(en.common, mn.common, 'common')
    assertMessageParity(en.auth, mn.auth, 'auth')
    assertMessageParity(en.onboarding, mn.onboarding, 'onboarding')
    assertMessageParity(en.nav, mn.nav, 'nav')
    assertMessageParity(en.footer, mn.footer, 'footer')
    assertMessageParity(en.forgotPassword, mn.forgotPassword, 'forgotPassword')
    assertMessageParity(en.register, mn.register, 'register')
    assertMessageParity(en.resetPassword, mn.resetPassword, 'resetPassword')
    assertMessageParity(en.toursSearch, mn.toursSearch, 'toursSearch')
    assertMessageParity(en.browse, mn.browse, 'browse')
    assertMessageParity(en.tourDetail, mn.tourDetail, 'tourDetail')
    assertMessageParity(en.stayDetail, mn.stayDetail, 'stayDetail')
    assertMessageParity(en.hostDetail, mn.hostDetail, 'hostDetail')
    assertMessageParity(en.hostsBrowse, mn.hostsBrowse, 'hostsBrowse')
  } catch (e) {
    console.error('[i18n]', e)
  }
}

export function getAppMessages(lang: AppLang): AppMessages {
  const base = byLang[lang] ?? byLang.en
  const resolved =
    lang === 'en' ? base : mergeLocaleWithEnglish(byLang.en, base)
  return withDevI18nGuard(resolved) as AppMessages
}

export function toAppLang(language: string | undefined | null): AppLang {
  return language === 'mn' ? 'mn' : 'en'
}
