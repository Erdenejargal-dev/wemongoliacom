/**
 * lib/i18n/provider/locales.ts
 *
 * Bilingual locale dictionaries for the provider/business portal.
 * Default language: Mongolian (mn) — local Mongolian operators.
 *
 * Covers:
 *   DashboardSidebar, DashboardHeader, DashboardOverview,
 *   VerificationBanner, and all business portal pages.
 */

import type { DashboardLang } from '../config'
import type { ProviderTourEditorMessages } from '../messages/providerTourEditor'
import { providerTourEditorEn, providerTourEditorMn } from '../messages/providerTourEditor'

// ── Type ─────────────────────────────────────────────────────────────────────

export interface ProviderTranslations {
  dateLocale: string
  langToggleLabel: string   // label shown on the toggle button to switch TO the other lang

  sidebar: {
    loading: string
    businessGroup: string
  }

  header: {
    businessPortal: string
  }

  /** Menu item labels keyed by item.id from lib/provider-menu.ts */
  menu: Record<string, string>

  /** Provider type labels keyed by ProviderType enum value */
  providerTypes: Record<string, string>

  overview: {
    manage: string
    draftWarning: string
    pendingBookings:     (n: number) => string
    pendingBookingsDesc: string
    completeProfile:     string
    completeProfileDesc: string
    allCaughtUp:         string
    readyToReceive:      string
    stats: {
      totalBookings: string
      pending:       (n: number) => string
      revenue:       string
      thisMonth:     (amt: string) => string
      monthBookings: string
      monthCount:    string
      reviews:       string
      avgRating:     (r: string) => string
    }
    quickActions: string
    addTour:      string
    bookings:     string
    messages:     string
    settings:     string
    recentBookings: string
    viewAll:        string
    noBookings:     string
    noBookingsDesc: string
    manageListings: string
  }

  verification: {
    unverified: { title: string; desc: string; btn: string }
    pendingReview: { title: string; desc: string }
    verified: { title: string }
    rejected: { title: string; desc: string; btn: string; reason: string }
    submitting: string
    failedToSubmit: string
  }

  bookings: {
    title:             string
    totalCount:        (n: number) => string
    searchPlaceholder: string
    refresh:           string
    confirmBtn:        string
    completeBtn:       string
    cancelBtn:         string
    cancellationPrompt: string
    signInNotice:      string
    errorLoading:      string
    actionFailed:      string
    columns: {
      bookingId: string
      customer:  string
      type:      string
      date:      string
      guests:    string
      status:    string
      payment:   string
      amount:    string
    }
    statusOptions: {
      all:       string
      pending:   string
      confirmed: string
      completed: string
      cancelled: string
    }
    empty: { title: string; description: string }
  }

  services: {
    title:             string
    description:       string
    tours:        { title: string; description: string }
    accommodations: { title: string; description: string }
    errorLoading:      string
  }

  analytics: {
    title:          string
    description:    string
    totalBookings:  string
    totalRevenue:   string
    thisMonth:      string
    reviews:        string
    bookingStatus:  string
    pending:        string
    confirmed:      string
    completed:      string
    cancelled:      string
    noData:         string
    noDataDesc:     string
    errorLoading:   string
    signInNotice:   string
    avgSuffix:      (r: string) => string
  }

  settings: {
    title:       string
    description: string
    labels: {
      businessName: string
      description:  string
      phone:        string
      email:        string
      website:      string
      address:      string
      city:         string
      country:      string
      logo:         string
      logoHint:     string
      cover:        string
      coverHint:    string
    }
    placeholders: {
      businessName: string
      description:  string
      phone:        string
      email:        string
      website:      string
      address:      string
      city:         string
      country:      string
    }
    saveBtn:       string
    savingBtn:     string
    successMsg:    string
    errorLoading:  string
    signInNotice:  string
  }

  reviews: {
    title:            string
    totalDescription: (n: number) => string
    refresh:          string
    replyBtn:         string
    yourReply:        string
    postReply:        string
    replyPlaceholder: string
    cancel:           string
    savingReply:      string
    failedReply:      string
    empty: { title: string; description: string }
    signInNotice:     string
    errorLoading:     string
  }

  messages: {
    title:                string
    description:          string
    conversations:        (n: number) => string
    noMessages:           string
    noMessagesDesc:       string
    selectConversation:   string
    inquiry:              (type: string) => string
    noMessagesInThread:   string
    typeReply:            string
    enterToSend:          string
    sendFailed:           string
    yesterday:            string
    refresh:              string
    signInNotice:         string
    errorLoading:         string
  }

  /** Shared booking status labels used in tables/badges */
  statusLabels: Record<string, string>
  /** Shared payment status labels */
  paymentLabels: Record<string, string>

  /** Tour create/edit page (`services/tours/[id]`) */
  tourEditor: ProviderTourEditorMessages
}

// ── Mongolian ─────────────────────────────────────────────────────────────────

export const mn: ProviderTranslations = {
  dateLocale:      'mn-MN',
  langToggleLabel: 'EN',

  sidebar: {
    loading:       'Уншиж байна…',
    businessGroup: 'Бизнес',
  },

  header: {
    businessPortal: 'Бизнес портал',
  },

  menu: {
    overview:  'Тойм',
    services:  'Жагсаалтууд',
    bookings:  'Захиалгууд',
    messages:  'Мессеж',
    reviews:   'Үнэлгээнүүд',
    analytics: 'Аналитик',
    settings:  'Тохиргоо',
    calendar:  'Хуанли',
    payments:  'Төлбөр',
  },

  providerTypes: {
    tour_operator: 'Аялалын оператор',
    car_rental:    'Машин түрээс',
    accommodation: 'Буудал',
  },

  overview: {
    manage:      'Удирдах талбар.',
    draftWarning:'Таны профайл идэвхигүй төлөвт байна. Идэвхжүүлэхийн тулд баталгаажуулалт илгээнэ үү.',
    pendingBookings:     (n) => `${n} захиалга хянуулахыг хүлээж байна`,
    pendingBookingsDesc: 'Нээх Захиалгыг баталгаажуулах эсвэл цуцлах',
    completeProfile:     'Бүртгэлээ гүйцэд хийнэ үү',
    completeProfileDesc: 'Тайлбар хэсгийг бөглөснөөр харилцагчийн итгэл нэмэгдэнэ шүү :)',
    allCaughtUp:         'Бүх захиалга шийдвэрлэгдсэн',
    readyToReceive:      'Захиалга хүлээн авахад бэлэн',
    stats: {
      totalBookings: 'Нийт захиалга',
      pending:       (n) => `${n} хүлээгдэж буй`,
      revenue:       'Орлого',
      thisMonth:     (amt) => `${amt} энэ сар`,
      monthBookings: 'Энэ сар',
      monthCount:    'захиалга',
      reviews:       'Үнэлгээнүүд',
      avgRating:     (r) => `${r} дундаж`,
    },
    quickActions:   'Хурдан үйлдлүүд',
    addTour:        'Аялал нэмэх',
    bookings:       'Захиалгууд',
    messages:       'Мессеж',
    settings:       'Тохиргоо',
    recentBookings: 'Сүүлийн захиалгууд',
    viewAll:        'Бүгдийг харах',
    noBookings:     'Захиалга байхгүй',
    noBookingsDesc: 'Захиалга ирмэгц энд харагдана. Идэвхтэй жагсаалттай эсэхийг шалгаарай.',
    manageListings: 'Жагсаалтуудаа удирдах',
  },

  verification: {
    unverified: {
      title: 'Бизнес баталгаажаагүй байна',
      desc:  'Бүрэн эрхийг нээж, аялагчийн хайлтад гарахын тулд профайлаа хяналтанд илгээнэ үү.',
      btn:   'Хяналтанд илгээх',
    },
    pendingReview: {
      title: 'Баталгаажуулалт хянагдаж байна',
      desc:  'Таны хүсэлтийг манай баг шалгаж байна. Дуусмагц мэдэгдэнэ. Ихэвчлэн 1–2 ажлын өдөр зарцуулдаг.',
    },
    verified: {
      title: 'Бизнес баталгаажсан',
    },
    rejected: {
      title:  'Баталгаажуулалт түдгэлзэлт',
      desc:   'Баталгаажуулалтыг зөвшөөрөөгүй. Доорх шалтгааныг харж, профайлаа шинэчлэн дахин илгээнэ үү.',
      btn:    'Дахин илгээх',
      reason: 'WeMongolia-ийн тайлбар',
    },
    submitting:     'Илгээж байна…',
    failedToSubmit: 'Илгээж чадсангүй. Дахин оролдоно уу.',
  },

  bookings: {
    title:             'Захиалгууд',
    totalCount:        (n) => `${n} захиалга`,
    searchPlaceholder: 'Нэр эсвэл захиалгын дугаараар хайх…',
    refresh:           'Шинэчлэх',
    confirmBtn:        'Баталгаажуулах',
    completeBtn:       'Дуусгах',
    cancelBtn:         'Цуцлах',
    cancellationPrompt: 'Цуцлах шалтгаан:',
    signInNotice:      'Захиалгуудыг харахын тулд эрхлэгчийн эрхтэйгээр нэвтэрнэ үү.',
    errorLoading:      'Захиалга уншиж чадсангүй.',
    actionFailed:      'Үйлдэл амжилтгүй болсон.',
    columns: {
      bookingId: 'Захиалгын дугаар',
      customer:  'Зочин',
      type:      'Төрөл',
      date:      'Огноо',
      guests:    'Зочдын тоо',
      status:    'Захиалгын төлөв',
      payment:   'Төлбөр',
      amount:    'Дүн',
    },
    statusOptions: {
      all:       'Бүх төлөв',
      pending:   'Хүлээгдэж буй',
      confirmed: 'Баталгаажсан',
      completed: 'Дууссан',
      cancelled: 'Цуцлагдсан',
    },
    empty: {
      title:       'Захиалга олдсонгүй',
      description: 'Зочид захиалга хийсний дараа энд харагдана.',
    },
  },

  services: {
    title:       'Жагсаалтууд',
    description: 'Аялал, буудал болон бусад үйлчилгээгээ удирдах.',
    tours: {
      title:       'Аялалууд',
      description: 'Тур үйлчилгээнүүд удирдах',
    },
    accommodations: {
      title:       'Буудлууд',
      description: 'Өрөө болон Камп удирдах',
    },
    errorLoading: 'Жагсаалт уншиж чадсангүй.',
  },

  analytics: {
    title:         'Аналитик',
    description:   'Захиалга, орлого, үнэлгээний мэдээллээс тулгуурласан бизнесийн гүйцэтгэл.',
    totalBookings: 'Нийт захиалга',
    totalRevenue:  'Нийт орлого',
    thisMonth:     'Энэ сар',
    reviews:       'Үнэлгээнүүд',
    bookingStatus: 'Захиалгын төлөвийн задаргаа',
    pending:       'Хүлээгдэж буй',
    confirmed:     'Баталгаажсан',
    completed:     'Дууссан',
    cancelled:     'Цуцлагдсан',
    noData:        'Аналитик өгөгдөл байхгүй',
    noDataDesc:    'Захиалга хүлээн авч эхлэхэд гүйцэтгэлийн мэдээлэл энд харагдана.',
    errorLoading:  'Аналитик уншиж чадсангүй.',
    signInNotice:  'Аналитикийг харахын тулд нэвтэрнэ үү.',
    avgSuffix:     (r) => `${r} дундаж`,
  },

  settings: {
    title:       'Бизнесийн профайл',
    description: 'Бизнесийн мэдээллээ шинэчлэх — аялагчид таны санал болгосон зүйлийг хайх үед энэ мэдээллийг харна.',
    labels: {
      businessName: 'Бизнесийн нэр',
      description:  'Тайлбар',
      phone:        'Утас',
      email:        'Имэйл',
      website:      'Вэбсайт',
      address:      'Хаяг',
      city:         'Хот',
      country:      'Улс',
      logo:         'Бизнесийн лого',
      logoHint:     'Квадрат зураг, 400×400 санал болгоно',
      cover:        'Нүүр зураг',
      coverHint:    '16:9 хэвтээ, 1200×675 санал болгоно',
    },
    placeholders: {
      businessName: 'Жишээ: Говийн Аялал',
      description:  'Бизнесийнхаа тухай аялагчдад ярьна уу...',
      phone:        '+976…',
      email:        'contact@example.com',
      website:      'https://yoursite.com',
      address:      'Гудамж, барилга...',
      city:         'Улаанбаатар',
      country:      'Монгол',
    },
    saveBtn:      'Хадгалах',
    savingBtn:    'Хадгалж байна…',
    successMsg:   'Профайл амжилттай хадгалагдлаа.',
    errorLoading: 'Профайл уншиж чадсангүй.',
    signInNotice: 'Профайлаа засахын тулд нэвтрэх эсвэл онбординг дуусгана уу.',
  },

  reviews: {
    title:            'Үнэлгээнүүд',
    totalDescription: (n) => `Аялагчдын сэтгэгдэл — нийт ${n} үнэлгээ`,
    refresh:          'Шинэчлэх',
    replyBtn:         'Энэ үнэлгээнд хариу бичих',
    yourReply:        'Таны хариу',
    postReply:        'Хариу илгээх',
    replyPlaceholder: 'Зочинд хариу бичнэ үү...',
    cancel:           'Болих',
    savingReply:      'Хадгалж байна…',
    failedReply:      'Хариу хадгалж чадсангүй.',
    empty: {
      title:       'Үнэлгээ байхгүй байна',
      description: 'Аялагчид аяллаа дуусгасны дараа үнэлгээ үлдээх бөгөөд энд харагдана.',
    },
    signInNotice: 'Үнэлгээнүүдийг харахын тулд нэвтэрнэ үү.',
    errorLoading: 'Үнэлгээ уншиж чадсангүй.',
  },

  messages: {
    title:              'Мессеж',
    description:        'Захиалагчтай байнга холбоотой байж итгэлцэл үүсгэх нь чухал юм шүү',
    conversations:      (n) => `${n} чат`,
    noMessages:         'Мессеж байхгүй',
    noMessagesDesc:     'Аялагчид таны үйлчилгээнд сонирхвол мессеж илгээнэ.',
    selectConversation: 'Мессеж харахын тулд яриа сонгоно уу',
    inquiry:            (type) => `${type} лавлагаа`,
    noMessagesInThread: 'Мессеж байхгүй байна',
    typeReply:          'Хариугаа бичнэ үү…',
    enterToSend:        'Enter илгээх · Shift+Enter шинэ мөр',
    sendFailed:         'Илгээж чадсангүй. Дахин оролдоно уу.',
    yesterday:          'Өчигдөр',
    refresh:            'Шинэчлэх',
    signInNotice:       'Мессежүүдийг харахын тулд нэвтэрнэ үү.',
    errorLoading:       'Яриа уншиж чадсангүй.',
  },

  statusLabels: {
    pending:    'Хүлээгдэж буй',
    confirmed:  'Баталгаажсан',
    completed:  'Дууссан',
    cancelled:  'Цуцлагдсан',
    active:     'Идэвхтэй',
    draft:      'Ноорог',
    paused:     'Зогсоосон',
  },

  paymentLabels: {
    unpaid:     'Төлөгдөөгүй',
    authorized: 'Зөвшөөрсөн',
    paid:       'Төлсөн',
    refunded:   'Буцаасан',
    failed:     'Амжилтгүй',
    partial:    'Хэсэгчлэн',
  },

  tourEditor: providerTourEditorMn,
}

// ── English ───────────────────────────────────────────────────────────────────

export const en: ProviderTranslations = {
  dateLocale:      'en-US',
  langToggleLabel: 'МОН',

  sidebar: {
    loading:       'Loading business…',
    businessGroup: 'Business',
  },

  header: {
    businessPortal: 'Business Portal',
  },

  menu: {
    overview:  'Overview',
    services:  'Listings',
    bookings:  'Bookings',
    messages:  'Messages',
    reviews:   'Reviews',
    analytics: 'Analytics',
    settings:  'Settings',
    calendar:  'Calendar',
    payments:  'Payments',
  },

  providerTypes: {
    tour_operator: 'Tours & Experiences',
    car_rental:    'Car Rentals',
    accommodation: 'Accommodation',
  },

  overview: {
    manage:      'Manage your listings, bookings, and traveler communications from here.',
    draftWarning:'Your provider profile is in draft. Submit for verification to activate your listing.',
    pendingBookings:     (n) => `${n} booking${n !== 1 ? 's' : ''} waiting for review`,
    pendingBookingsDesc: 'Open Bookings to confirm or decline',
    completeProfile:     'Complete your business profile',
    completeProfileDesc: 'Add a description to build trust with travelers',
    allCaughtUp:         "You're all caught up — no pending actions",
    readyToReceive:      "You're ready to receive bookings",
    stats: {
      totalBookings: 'Total Bookings',
      pending:       (n) => `${n} pending`,
      revenue:       'Revenue',
      thisMonth:     (amt) => `${amt} this month`,
      monthBookings: 'This Month',
      monthCount:    'bookings',
      reviews:       'Reviews',
      avgRating:     (r) => `${r} avg rating`,
    },
    quickActions:   'Quick Actions',
    addTour:        'Add Tour',
    bookings:       'Bookings',
    messages:       'Messages',
    settings:       'Settings',
    recentBookings: 'Recent Bookings',
    viewAll:        'View all',
    noBookings:     'No bookings yet',
    noBookingsDesc: 'Bookings will appear here when travelers reserve your services. Make sure you have active listings.',
    manageListings: 'Manage your listings',
  },

  verification: {
    unverified: {
      title: 'Your business is not yet verified',
      desc:  'Submit your profile for admin review to unlock full access and appear in traveler search.',
      btn:   'Submit for Review',
    },
    pendingReview: {
      title: 'Verification under review',
      desc:  'Your submission is being reviewed by our team. We will notify you once complete. This typically takes 1–2 business days.',
    },
    verified: {
      title: 'Business verified',
    },
    rejected: {
      title:  'Verification not approved',
      desc:   'Your verification was not approved. Please review the reason below, update your profile, then resubmit.',
      btn:    'Resubmit',
      reason: 'Reason from WeMongolia',
    },
    submitting:     'Submitting…',
    failedToSubmit: 'Failed to submit. Please try again.',
  },

  bookings: {
    title:             'Bookings',
    totalCount:        (n) => `${n} booking${n !== 1 ? 's' : ''}`,
    searchPlaceholder: 'Search by customer name or booking ID…',
    refresh:           'Refresh',
    confirmBtn:        'Confirm',
    completeBtn:       'Complete',
    cancelBtn:         'Cancel',
    cancellationPrompt: 'Reason for cancellation:',
    signInNotice:      'Sign in as a provider to see your bookings.',
    errorLoading:      'Failed to load bookings.',
    actionFailed:      'Action failed.',
    columns: {
      bookingId: 'Booking ID',
      customer:  'Customer',
      type:      'Type',
      date:      'Date',
      guests:    'Guests',
      status:    'Status',
      payment:   'Payment',
      amount:    'Amount',
    },
    statusOptions: {
      all:       'All Status',
      pending:   'Pending',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    empty: {
      title:       'No bookings found',
      description: 'Bookings will appear here once customers reserve your services.',
    },
  },

  services: {
    title:       'Listings',
    description: 'Manage your tours, accommodations, and services.',
    tours: {
      title:       'Tours',
      description: 'Manage your tour experiences',
    },
    accommodations: {
      title:       'Accommodations',
      description: 'Manage your properties and rooms',
    },
    errorLoading: 'Failed to load listings.',
  },

  analytics: {
    title:         'Analytics',
    description:   'Your business performance — real data from your bookings and reviews.',
    totalBookings: 'Total Bookings',
    totalRevenue:  'Total Revenue',
    thisMonth:     'This Month',
    reviews:       'Reviews',
    bookingStatus: 'Booking status breakdown',
    pending:       'Pending',
    confirmed:     'Confirmed',
    completed:     'Completed',
    cancelled:     'Cancelled',
    noData:        'No analytics data yet',
    noDataDesc:    'Start receiving bookings to see your performance here.',
    errorLoading:  'Failed to load analytics.',
    signInNotice:  'Sign in to view your analytics.',
    avgSuffix:     (r) => `${r} avg`,
  },

  settings: {
    title:       'Business Profile',
    description: 'Update your business details — travelers will see this information when browsing your offerings.',
    labels: {
      businessName: 'Business name',
      description:  'Description',
      phone:        'Phone',
      email:        'Email',
      website:      'Website',
      address:      'Address',
      city:         'City',
      country:      'Country',
      logo:         'Business Logo',
      logoHint:     'Square image, 400×400 recommended',
      cover:        'Cover Image',
      coverHint:    '16:9 landscape, 1200×675 recommended',
    },
    placeholders: {
      businessName: 'e.g. Gobi Adventure Tours',
      description:  'Tell travelers about your business...',
      phone:        '+976…',
      email:        'contact@example.com',
      website:      'https://yoursite.com',
      address:      'Street, building...',
      city:         'Ulaanbaatar',
      country:      'Mongolia',
    },
    saveBtn:      'Save changes',
    savingBtn:    'Saving…',
    successMsg:   'Profile saved successfully.',
    errorLoading: 'Failed to load profile.',
    signInNotice: 'Sign in or complete onboarding to edit your profile.',
  },

  reviews: {
    title:            'Reviews',
    totalDescription: (n) => `What travelers are saying — ${n} review${n !== 1 ? 's' : ''}`,
    refresh:          'Refresh',
    replyBtn:         'Reply to this review',
    yourReply:        'Your reply',
    postReply:        'Post reply',
    replyPlaceholder: 'Write your reply to the customer...',
    cancel:           'Cancel',
    savingReply:      'Saving…',
    failedReply:      'Failed to save reply.',
    empty: {
      title:       'No reviews yet',
      description: 'Reviews from travelers will appear here after they complete their trips.',
    },
    signInNotice: 'Sign in to view your reviews.',
    errorLoading: 'Failed to load reviews.',
  },

  messages: {
    title:              'Messages',
    description:        'Reply to inquiries — stay on top of conversations',
    conversations:      (n) => `${n} conversation${n !== 1 ? 's' : ''}`,
    noMessages:         'No messages yet',
    noMessagesDesc:     "Travelers can message you when they're interested in your services.",
    selectConversation: 'Select a conversation to view messages',
    inquiry:            (type) => `${type} inquiry`,
    noMessagesInThread: 'No messages yet',
    typeReply:          'Type your reply…',
    enterToSend:        'Enter to send · Shift+Enter for new line',
    sendFailed:         'Failed to send. Please try again.',
    yesterday:          'Yesterday',
    refresh:            'Refresh',
    signInNotice:       'Sign in to view your messages.',
    errorLoading:       'Failed to load conversations.',
  },

  statusLabels: {
    pending:    'Pending',
    confirmed:  'Confirmed',
    completed:  'Completed',
    cancelled:  'Cancelled',
    active:     'Active',
    draft:      'Draft',
    paused:     'Paused',
  },

  paymentLabels: {
    unpaid:     'Unpaid',
    authorized: 'Authorized',
    paid:       'Paid',
    refunded:   'Refunded',
    failed:     'Failed',
    partial:    'Partial',
  },

  tourEditor: providerTourEditorEn,
}

// ── Supported languages ───────────────────────────────────────────────────────

export type ProviderLang = DashboardLang
export const providerLocales: Record<ProviderLang, ProviderTranslations> = { mn, en }
