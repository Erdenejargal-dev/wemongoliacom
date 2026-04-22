/**
 * lib/i18n/public/locales.ts
 *
 * Phase 6.1 — public-site translation dictionary.
 *
 * Covers the surfaces touched by Phase 6 (navbar preference switcher,
 * tour/stay booking cards, booking-request modal, payment-capability
 * notice). Intentionally small — adding new sections is additive and
 * requires entries in BOTH locales to keep typing honest.
 */

import type { MegaNavBundle } from './megaNav'
import { megaNavEn, megaNavMn } from './megaNav'
import type { PublicMobileNavCopy } from './mobileNav'
import { mobileNavEn, mobileNavMn } from './mobileNav'

export type PublicLang = 'en' | 'mn'

export interface PublicTranslations {
  nav: {
    signIn:      string
    getStarted:  string
    becomeHost:  string
    search:      string
    closeMenu:   string
    openMenu:    string
    languageAndCurrency: string
  }
  switcher: {
    openLabel:   string
    languageHeader: string
    currencyHeader: string
    footnote:    string
  }
  tourCard: {
    perPerson:           string
    selectDeparture:     string
    noDepartures:        string
    guests:              string
    guestsOne:           string
    guestsMany:          string
    seatsRemaining:      (n: number) => string
    sellingFast:         string
    sellingOut:          string
    maxGuests:           (n: number) => string
    reserveCta:          string
    noDepartureSelected: string
    notAvailableCta:     string
    requestCta:          string
    visaComingSoon:      string
    freeCancellation:    string
    confirmationNotice:  string
    notChargedYet:       string
    serviceFeeAtCheckout:string
    pricePerPerson:      (money: string, guests: number) => string
  }
  stayCard: {
    perNight:            string
    roomType:            string
    checkIn:             string
    checkOut:            string
    nights:              (n: number) => string
    guests:              string
    maxGuestsForRoom:    (n: number) => string
    noRoomsYet:          string
    noRoomsAvailable:    string
    selectDates:         string
    unableToReserve:     string
    reserveCta:          string
    requestCta:          string
    visaComingSoon:      string
    serviceFeeAtCheckout:string
    perNightLabel:       (money: string, nights: number) => string
    notChargedYet:       string
  }
  requestModal: {
    eyebrow:       string
    titleDefault:  string
    titleFor:      (name: string) => string
    successTitle:  string
    successLead:   string
    successBody:   (email: string) => string
    done:          string
    nameLabel:     string
    emailLabel:    string
    phoneLabel:    string
    messageLabel:  string
    messagePlaceholder: string
    from:          string
    to:            string
    guests:        string
    send:          string
    footer:        string
    errNameRequired: string
    errEmailRequired:string
    errGeneric:      string
    pricedIn:      (cur: string) => string
    close:         string
  }
  capability: {
    unpayableMnTitle: string
    unpayableDescription: (cur: string) => string
    helpLink:         string
    /** Phase 6.2 — shown when non-MNT bookings are payable via MNT conversion. */
    conversionTitle:       string
    conversionDescription: (cur: string) => string
  }
  /** Desktop nav + mega menu — see `lib/i18n/public/megaNav.ts` */
  megaNav: MegaNavBundle
  /** Mobile drawer labels — see `lib/i18n/public/mobileNav.ts` */
  mobileNav: PublicMobileNavCopy
}

// ── English ────────────────────────────────────────────────────────────

const en: PublicTranslations = {
  nav: {
    signIn:              'Sign in',
    getStarted:          'Get Started',
    becomeHost:          'Become a Host',
    search:              'Search',
    closeMenu:           'Close menu',
    openMenu:            'Open menu',
    languageAndCurrency: 'Language & Currency',
  },
  switcher: {
    openLabel:      'Change language or currency',
    languageHeader: 'Language',
    currencyHeader: 'Currency',
    footnote:
      'Prices may be shown in your selected currency. You\u2019ll be charged in the listing\u2019s currency at checkout.',
  },
  tourCard: {
    perPerson:         '/ person',
    selectDeparture:   'Select Departure',
    noDepartures:
      'No upcoming departures available. Contact the provider for more information.',
    guests:            'Guests',
    guestsOne:         '1 guest',
    guestsMany:        'guests',
    seatsRemaining:    (n) => `${n} seat${n !== 1 ? 's' : ''} remaining`,
    sellingFast:       'Selling fast',
    sellingOut:        'Selling out',
    maxGuests:         (n) => `Max ${n} guests per booking`,
    reserveCta:        'Reserve Tour',
    noDepartureSelected: 'Select a departure to book',
    notAvailableCta:   'No departures available',
    requestCta:        'Request Booking',
    visaComingSoon:    'Pay later with international options (coming soon)',
    freeCancellation:  'Free cancellation up to 7 days before tour',
    confirmationNotice:'Confirmation after provider review',
    notChargedYet:     'You won\u2019t be charged yet',
    serviceFeeAtCheckout: 'Service fee and final total shown at checkout',
    pricePerPerson:    (money, guests) =>
      `${money} per person \u00B7 ${guests} guest${guests !== 1 ? 's' : ''}`,
  },
  stayCard: {
    perNight:          '/ night',
    roomType:          'Room Type',
    checkIn:           'Check-in',
    checkOut:          'Check-out',
    nights:            (n) => `${n} night${n !== 1 ? 's' : ''}`,
    guests:            'Guests',
    maxGuestsForRoom:  (n) => `Max ${n} guest${n !== 1 ? 's' : ''} for this room`,
    noRoomsYet:        'No rooms listed yet. Contact the provider for availability.',
    noRoomsAvailable:  'No rooms available',
    selectDates:       'Select your dates',
    unableToReserve:   'Unable to reserve',
    reserveCta:        'Reserve Stay',
    requestCta:        'Request Booking',
    visaComingSoon:    'Pay later with international options (coming soon)',
    serviceFeeAtCheckout: 'Service fee and final total shown at checkout',
    perNightLabel:     (money, nights) =>
      `${money} per night \u00B7 ${nights} night${nights !== 1 ? 's' : ''}`,
    notChargedYet:     'You won\u2019t be charged yet',
  },
  requestModal: {
    eyebrow:       'Booking request',
    titleDefault:  'Contact the host',
    titleFor:      (name) => `Contact about "${name}"`,
    successTitle:  'Request sent',
    successLead:   'We\u2019ll contact you to confirm and arrange payment.',
    successBody:   (email) =>
      `The host usually responds within 1 business day. You\u2019ll receive a copy at ${email}.`,
    done:          'Done',
    nameLabel:     'Your name',
    emailLabel:    'Email',
    phoneLabel:    'Phone (optional)',
    messageLabel:  'Message (optional)',
    messagePlaceholder: 'Anything the host should know?',
    from:          'From',
    to:            'To (optional)',
    guests:        'Guests',
    send:          'Send request',
    footer:
      'No charge now. The host will contact you to confirm availability and arrange payment.',
    errNameRequired:  'Please enter your name.',
    errEmailRequired: 'Please enter a valid email.',
    errGeneric:       'Could not send your request. Please try again.',
    pricedIn: (cur) =>
      `This listing is priced in ${cur}. International card payments are coming soon \u2014 for now, send a request and the host will arrange payment directly with you.`,
    close: 'Close',
  },
  capability: {
    unpayableMnTitle:
      'This listing can\u2019t be paid online yet',
    unpayableDescription: (cur) =>
      `Pricing shown in ${cur}. Our current payment gateway charges in MNT only \u2014 send a booking request and the host will arrange payment with you directly.`,
    helpLink: 'Why?',
    conversionTitle: 'Paid in MNT at checkout',
    conversionDescription: (cur) =>
      `Pricing is shown in ${cur}. Payment will be charged in Mongolian t\u00F6gr\u00F6g (MNT) using the current exchange rate at checkout.`,
  },
  megaNav: megaNavEn,
  mobileNav: mobileNavEn,
}

// ── Mongolian ──────────────────────────────────────────────────────────

const mn: PublicTranslations = {
  nav: {
    signIn:              '\u041D\u044D\u0432\u0442\u0440\u044D\u0445',                                 // Нэвтрэх
    getStarted:          '\u042D\u0445\u043B\u044D\u0445',                                             // Эхлэх
    becomeHost:          '\u0425\u0430\u0440\u0438\u043B\u0446\u0430\u0433\u0447 \u0431\u043E\u043B\u043E\u0445', // Харилцагч болох
    search:              '\u0425\u0430\u0439\u0445',                                                   // Хайх
    closeMenu:           '\u0426\u044D\u0441 \u0445\u0430\u0430\u0445',                                // Цэс хаах
    openMenu:            '\u0426\u044D\u0441 \u043D\u044D\u044D\u0445',                                // Цэс нээх
    languageAndCurrency: '\u0425\u044D\u043B \u0431\u0430 \u0432\u0430\u043B\u044E\u0442',             // Хэл ба валют
  },
  switcher: {
    openLabel:      'Хэл болон валют солих',
    languageHeader: 'Хэл',
    currencyHeader: 'Валют',
    footnote:
      'Үнэ сонгосон валютаар харагдах ба төлбөр жагсаалтын үндсэн валютаар хийгдэнэ.',
  },
  tourCard: {
    perPerson:         '/ хүн',
    selectDeparture:   'Хөдлөх өдөр сонгох',
    noDepartures:
      'Удахгүй хөдлөх хуваарь алга. Тухайн үйлчилгээ үзүүлэгчтэй холбогдоно уу.',
    guests:            'Зочин',
    guestsOne:         '1 зочин',
    guestsMany:        'зочин',
    seatsRemaining:    (n) => `${n} суудал үлдсэн`,
    sellingFast:       'Хурдан дуусч байна',
    sellingOut:        'Дуусаж байна',
    maxGuests:         (n) => `Нэг удаад дээд тал нь ${n} зочин`,
    reserveCta:        'Захиалах',
    noDepartureSelected: 'Хөдлөх өдөр сонгоно уу',
    notAvailableCta:   'Хөдлөх өдөр байхгүй',
    requestCta:        'Захиалга илгээх',
    visaComingSoon:    'Олон улсын картаар төлөх удахгүй нэмэгдэнэ',
    freeCancellation:  'Аяллаас 7 хоногийн өмнө үнэгүй цуцлах',
    confirmationNotice:'Байгууллагын баталгаажуулалт шаардлагатай',
    notChargedYet:     'Одоогоор төлбөр авахгүй',
    serviceFeeAtCheckout: 'Үйлчилгээний хураамж, эцсийн дүн баталгаажуулахад харагдана',
    pricePerPerson:    (money, guests) =>
      `${money} / хүн \u00B7 ${guests} зочин`,
  },
  stayCard: {
    perNight:          '/ шөнө',
    roomType:          'Өрөөний төрөл',
    checkIn:           'Буух өдөр',
    checkOut:          'Гарах өдөр',
    nights:            (n) => `${n} шөнө`,
    guests:            'Зочин',
    maxGuestsForRoom:  (n) => `Энэ өрөөнд дээд тал нь ${n} зочин`,
    noRoomsYet:        'Одоогоор өрөө бүртгэгдээгүй байна.',
    noRoomsAvailable:  'Боломжит өрөө алга',
    selectDates:       'Огноогоо сонгоно уу',
    unableToReserve:   'Захиалах боломжгүй',
    reserveCta:        'Захиалах',
    requestCta:        'Захиалга илгээх',
    visaComingSoon:    'Олон улсын картаар төлөх удахгүй нэмэгдэнэ',
    serviceFeeAtCheckout: 'Үйлчилгээний хураамж, эцсийн дүн баталгаажуулахад харагдана',
    perNightLabel:     (money, nights) =>
      `${money} / шөнө \u00B7 ${nights} шөнө`,
    notChargedYet:     'Одоогоор төлбөр авахгүй',
  },
  requestModal: {
    eyebrow:       'Захиалгын хүсэлт',
    titleDefault:  'Үйлчилгээ үзүүлэгчтэй холбогдох',
    titleFor:      (name) => `"${name}"-тай холбогдох`,
    successTitle:  'Хүсэлт илгээгдлээ',
    successLead:   'Бид тантай холбогдож баталгаажуулж, төлбөрийн нөхцлийг зохицуулна.',
    successBody:   (email) =>
      `Ихэвчлэн 1 ажлын өдрийн дотор хариу өгдөг. Хуулбар ${email} хаяг руу очно.`,
    done:          'Болсон',
    nameLabel:     'Таны нэр',
    emailLabel:    'Имэйл',
    phoneLabel:    'Утас (сонголтоор)',
    messageLabel:  'Зурвас (сонголтоор)',
    messagePlaceholder: 'Үйлчилгээ үзүүлэгчид юу мэдэгдэх вэ?',
    from:          'Эхлэх',
    to:            'Дуусах (сонголтоор)',
    guests:        'Зочин',
    send:          'Хүсэлт илгээх',
    footer:
      'Одоогоор төлбөр авахгүй. Үйлчилгээ үзүүлэгч тантай шууд холбогдож нөхцөлийг зохицуулна.',
    errNameRequired:  'Нэрээ оруулна уу.',
    errEmailRequired: 'Зөв имэйл оруулна уу.',
    errGeneric:       'Хүсэлт илгээх боломжгүй боллоо. Дахин оролдоно уу.',
    pricedIn: (cur) =>
      `Энэ бараа ${cur} валютаар үнэлэгдсэн. Олон улсын картаар төлөх удахгүй нэмэгдэнэ — одоогоор хүсэлт илгээвэл үйлчилгээ үзүүлэгч тантай шууд холбогдож төлбөрийг зохицуулна.`,
    close: 'Хаах',
  },
  capability: {
    unpayableMnTitle:
      'Энэ жагсаалтыг онлайн төлөх боломжгүй байна',
    unpayableDescription: (cur) =>
      `Үнэ ${cur}-ээр харагдаж байна. Одоогийн төлбөрийн сүлжээ зөвхөн MNT-ээр авдаг — захиалгын хүсэлт илгээж, үйлчилгээ үзүүлэгчтэй шууд нөхцөл тохироорой.`,
    helpLink: 'Яагаад?',
    conversionTitle: 'Төлбөр MNT-ээр авагдана',
    conversionDescription: (cur) =>
      `Үнэ ${cur}-ээр харагдаж байгаа ч төлбөрийн үед одоогийн ханшаар Монгол төгрөг (MNT)-өөр авагдана.`,
  },
  megaNav: megaNavMn,
  mobileNav: mobileNavMn,
}

export const publicLocales: Record<PublicLang, PublicTranslations> = { en, mn }
