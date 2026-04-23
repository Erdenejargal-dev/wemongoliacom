/**
 * lib/i18n/traveler/locales.ts
 *
 * Bilingual locale dictionaries for traveler-facing dashboard surfaces.
 * Default language: English (en) — most customers/travelers are foreign visitors.
 *
 * Covers:
 *   /dashboard (traveler overview), /account/*, /account/trips/*,
 *   AccountSidebar, TripsSection.
 */

import type { DashboardLang } from '../config'

// ── Type ─────────────────────────────────────────────────────────────────────

export interface TravelerTranslations {
  dateLocale: string
  langToggleLabel: string  // label shown on toggle button to switch TO the other lang

  dashboard: {
    title:    string
    subtitle: string
    cards: {
      trips:        { label: string; desc: string }
      account:      { label: string; desc: string }
      explore:      { label: string; desc: string }
      businessPortal: { label: string; desc: string }
      becomeHost:   { label: string; desc: string }
    }
    goToPortal:   string
    startOnboarding: string
  }

  account: {
    title:          string
    subtitle:       string
    notSignedIn:    string
    loadingAccount: string
    loadingProfile: string
    profileUnavailable: string
    sections: {
      profile:  { title: string; desc: string }
      settings: { title: string; desc: string }
      trips:    { title: string; desc: string }
      reviews:  { title: string; desc: string }
    }
    nav: {
      profile:  string
      settings: string
      trips:    string
      reviews:  string
      messages: string
    }
    navDesc: {
      profile:  string
      settings: string
      trips:    string
      reviews:  string
      messages: string
    }
    memberSince: (date: string) => string
  }

  trips: {
    pageTitle:    string
    pageSubtitle: string
    upcoming:     string
    completed:    string
    cancelled:    string
    loading:      string
    errorRetry:   string
    noTrips:      string
    noTripsDesc:  string
    noUpcoming:   string
    noUpcomingDesc: string
    exploreBtn:   string
    bookingId:    string
    totalLabel:   string
    guestCount:   (n: number) => string
    viewTour:     string
    myTripsCount: (n: number) => string
    browseTrips:  string
    statusLabels: {
      Upcoming:  string
      Completed: string
      Cancelled: string
    }
  }
}

// ── English (default for traveler) ────────────────────────────────────────────

export const en: TravelerTranslations = {
  dateLocale:      'en-US',
  langToggleLabel: 'МОН',

  dashboard: {
    title:    'My Dashboard',
    subtitle: 'Quick access to your trips, bookings, and account.',
    cards: {
      trips:          { label: 'My Trips',     desc: 'View upcoming and past bookings.' },
      account:        { label: 'Account',      desc: 'Profile, settings, and preferences.' },
      explore:        { label: 'Explore Tours', desc: 'Find your next adventure.' },
      businessPortal: { label: 'Business Portal', desc: 'Manage your listings, bookings, and messages.' },
      becomeHost:     { label: 'Become a Host', desc: 'Register your business and start listing tours, cars, or accommodation.' },
    },
    goToPortal:      'Go to Business Portal →',
    startOnboarding: 'Start onboarding →',
  },

  account: {
    title:          'My Account',
    subtitle:       'Manage your profile, trips, and preferences',
    notSignedIn:    'Not signed in.',
    loadingAccount: 'Loading account…',
    loadingProfile: 'Loading profile…',
    profileUnavailable: 'Profile unavailable.',
    sections: {
      profile:  { title: 'My Profile',   desc: 'Update your personal info and profile photo' },
      settings: { title: 'Settings',     desc: 'Password security and notification preferences' },
      trips:    { title: 'My Trips',     desc: 'Your upcoming and past bookings' },
      reviews:  { title: 'My Reviews',   desc: 'Reviews you have written for tours' },
    },
    nav: {
      profile:  'Profile',
      settings: 'Settings',
      trips:    'My Trips',
      reviews:  'Reviews',
      messages: 'Messages',
    },
    navDesc: {
      profile:  'Personal info & avatar',
      settings: 'Password & notifications',
      trips:    'Bookings & upcoming tours',
      reviews:  'Your written reviews',
      messages: 'Conversations with hosts',
    },
    memberSince: (date) => `Member since ${date}`,
  },

  trips: {
    pageTitle:    'My Trips',
    pageSubtitle: 'View and manage your upcoming and past travel experiences.',
    upcoming:     'Upcoming Trips',
    completed:    'Past Trips',
    cancelled:    'Cancelled Trips',
    loading:      'Loading your trips…',
    errorRetry:   'Please refresh and try again.',
    noTrips:      "You haven't booked any trips yet",
    noTripsDesc:  "Explore Mongolia's best tours and start your adventure.",
    noUpcoming:   'No upcoming trips',
    noUpcomingDesc: "You haven't booked any upcoming trips yet.",
    exploreBtn:   'Explore Tours',
    bookingId:    'Booking ID:',
    totalLabel:   'Total:',
    guestCount:   (n) => `${n} guest${n !== 1 ? 's' : ''}`,
    viewTour:     'View Tour',
    myTripsCount: (n) => `My Trips (${n})`,
    browseTrips:  'Browse Tours',
    statusLabels: {
      Upcoming:  'Upcoming',
      Completed: 'Completed',
      Cancelled: 'Cancelled',
    },
  },
}

// ── Mongolian ─────────────────────────────────────────────────────────────────

export const mn: TravelerTranslations = {
  dateLocale:      'mn-MN',
  langToggleLabel: 'EN',

  dashboard: {
    title:    'Удирдлагын самбар',
    subtitle: 'Аялал, захиалга, бүртгэл хянах.',
    cards: {
      trips:          { label: 'Миний аялалууд', desc: 'Захиалгуудыг харах.' },
      account:        { label: 'Бүртгэл',        desc: 'Профайл, тохиргоо' },
      explore:        { label: 'Аялалуудыг харах', desc: 'Дараагийн адал явдлаа олоорой.' },
      businessPortal: { label: 'Бизнес портал',  desc: 'Жагсаалт, захиалга, мессежүүдийг удирдах.' },
      becomeHost:     { label: 'Бидний нэг болох', desc: 'Бизнесээ бүртгүүлэх' },
    },
    goToPortal:      'Бизнес портал руу →',
    startOnboarding: 'Удиртгал тохиргоог эхлүүлэх →',
  },

  account: {
    title:          'Бүртгэл',
    subtitle:       'Профайл, аялал, тохиргоогоо тохируулах',
    notSignedIn:    'Нэвтрээгүй байна.',
    loadingAccount: 'Бүртгэл уншиж байна…',
    loadingProfile: 'Профайл уншиж байна…',
    profileUnavailable: 'Профайл байхгүй байна.',
    sections: {
      profile:  { title: 'Миний профайл',    desc: 'Хувийн мэдээлэл, профайл зурагаа шинэчлэх' },
      settings: { title: 'Тохиргоо',          desc: 'Нууц үг, аюулгүй байдал, мэдэгдлийн тохиргоо' },
      trips:    { title: 'Миний аялалууд',    desc: 'Ирэх болон өнгөрсөн захиалгуудыг харах' },
      reviews:  { title: 'Миний үнэлгээнүүд', desc: 'Аяллуудад бичсэн үнэлгээнүүд' },
    },
    nav: {
      profile:  'Профайл',
      settings: 'Тохиргоо',
      trips:    'Миний аялалууд',
      reviews:  'Үнэлгээнүүд',
      messages: 'Мессеж',
    },
    navDesc: {
      profile:  'Хувийн мэдээлэл & зураг',
      settings: 'Нууц үг & мэдэгдэл',
      trips:    'Захиалга & ирэх аялал',
      reviews:  'Бичсэн үнэлгээнүүд',
      messages: 'Чат',
    },
    memberSince: (date) => `Гишүүн болсон: ${date}`,
  },

  trips: {
    pageTitle:    'Миний аялалууд',
    pageSubtitle: 'Ирэх болон өнгөрсөн аяллуудаа харах.',
    upcoming:     'Ирэх аялалууд',
    completed:    'Дууссан аялалууд',
    cancelled:    'Цуцлагдсан аялалууд',
    loading:      'Аялал уншиж байна…',
    errorRetry:   'Дахин ачааллах.',
    noTrips:      'Аялал захиалаагүй байна',
    noTripsDesc:  'Адал явдлаа эхлүүлнэ үү.',
    noUpcoming:   'Ирэх аялал байхгүй',
    noUpcomingDesc: 'Ирэх аялал захиалаагүй байна.',
    exploreBtn:   'Аялалуудыг харах',
    bookingId:    'Захиалгын дугаар:',
    totalLabel:   'Нийт:',
    guestCount:   (n) => `${n} зочин`,
    viewTour:     'Аяллыг харах',
    myTripsCount: (n) => `Миний аялалууд (${n})`,
    browseTrips:  'Аялал хайх',
    statusLabels: {
      Upcoming:  'Ирэх',
      Completed: 'Дууссан',
      Cancelled: 'Цуцлагдсан',
    },
  },
}

// ── Supported languages ───────────────────────────────────────────────────────

export type TravelerLang = DashboardLang
export const travelerLocales: Record<TravelerLang, TravelerTranslations> = { mn, en }
