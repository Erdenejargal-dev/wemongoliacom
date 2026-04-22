/**
 * Shared UI strings used across domains (buttons, loading, pagination, toasts).
 * Namespaced as `common` in the app message registry.
 */

export type CommonMessages = {
  loading:        string
  saving:         string
  save:           string
  cancel:         string
  continue:       string
  back:           string
  next:           string
  search:         string
  error:          string
  success:        string
  tryAgain:       string
  showPassword:   string
  hidePassword:   string
  /** Language toggle button `title` when current UI is not English */
  switchToEnglish:  string
  /** Language toggle button `title` when current UI is not Mongolian */
  switchToMongolian: string
  page:           string
  of:             string
  /** e.g. "Showing 1–10 of 42" */
  paginationInfo: (from: number, to: number, total: number) => string
  /** When account/profile data fails to load and no specific API message is shown */
  accountLoadFailed: string
  close:    string
  home:     string
  /** Breadcrumb navigation landmark label */
  breadcrumb: string
  /** Country select "Other" option; stored value can remain the English key */
  countryOther: string
  /** When a booking date is not yet fixed */
  dateToBeConfirmed: string
  yesterday: string
}

export const commonEn: CommonMessages = {
  loading:       'Loading…',
  saving:        'Saving…',
  save:          'Save',
  cancel:        'Cancel',
  continue:      'Continue',
  back:          'Back',
  next:          'Next',
  search:        'Search',
  error:         'Something went wrong.',
  success:       'Success',
  tryAgain:      'Please try again.',
  showPassword:  'Show password',
  hidePassword:  'Hide password',
  switchToEnglish:  'Switch to English',
  switchToMongolian: 'Switch to Mongolian',
  page:          'Page',
  of:            'of',
  paginationInfo: (from, to, total) => `Showing ${from}–${to} of ${total}`,
  accountLoadFailed: 'Could not load your account. Please try again.',
  close:    'Close',
  home:     'Home',
  breadcrumb: 'Breadcrumb',
  countryOther: 'Other',
  dateToBeConfirmed: 'To be confirmed',
  yesterday: 'Yesterday',
}

export const commonMn: CommonMessages = {
  loading:       'Ачаалж байна…',
  saving:        'Хадгалж байна…',
  save:          'Хадгалах',
  cancel:        'Цуцлах',
  continue:      'Үргэлжлүүлэх',
  back:          'Буцах',
  next:          'Дараах',
  search:        'Хайх',
  error:         'Алдаа гарлаа.',
  success:       'Амжилттай',
  tryAgain:      'Дахин оролдоно уу.',
  showPassword:  'Нууц үг харуулах',
  hidePassword:  'Нууц үг нуух',
  switchToEnglish:  'Англи хэл рүү шилжих',
  switchToMongolian: 'Монгол хэл рүү шилжих',
  page:          'Хуудас',
  of:            '/',
  paginationInfo: (from, to, total) => `${total}-аас ${from}–${to} харуулж байна`,
  accountLoadFailed: 'Дансны мэдээлэл ачаалагдсангүй. Дахин оролдоно уу.',
  close:    'Хаах',
  home:     'Нүүр',
  breadcrumb: 'Навигацийн зам',
  countryOther: 'Бусад',
  dateToBeConfirmed: 'Огноо тодорхойгүй',
  yesterday: 'Өчигдөр',
}
