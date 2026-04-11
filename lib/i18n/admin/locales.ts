/**
 * lib/i18n/admin/locales.ts
 *
 * Bilingual locale dictionaries for the /admin area.
 * Default language: Mongolian (mn).
 *
 * Rules:
 * - Backend enum VALUES (pending_review, verified, etc.) are never translated here.
 * - Only UI labels are translated.
 * - Consistent terminology is enforced via this single file.
 */

// ── Type ──────────────────────────────────────────────────────────────────────

export interface AdminTranslations {
  /** ISO locale code used for Intl.DateTimeFormat */
  dateLocale: string

  common: {
    loading: string
    saving: string
    save: string
    cancel: string
    back: string
    noData: string
    errorHint: string
    viewAll: string
    details: string
    reviewAction: string
    editRole: string
    page: string
    of: string
    pageInfo: (page: number, pages: number, total: number) => string
    guestCount: (n: number) => string
    joinedPrefix: string  // "Joined" / "Элссэн"
  }

  layout: {
    adminConsole: string
    langLabel: string   // label shown on the toggle button to switch TO this lang
    notifications: string
  }

  sidebar: {
    operations: string
    overview: string
    users: string
    providers: string
    bookings: string
    support: string
  }

  overview: {
    title: string
    subtitle: string
    stats: {
      totalUsers: string
      usersNewThisMonth: (n: number) => string
      providers: string
      providersSub: (active: number, pending: number) => string
      totalBookings: string
      bookingsThisMonth: (n: number) => string
      revenue: string
      revenueThisMonth: (amt: string) => string
    }
    pendingQueue: {
      title: string
      empty: string
    }
    recentBookings: {
      title: string
      empty: string
    }
    quickActions: {
      title: string
      users:     { label: string; desc: string }
      providers: { label: string; desc: string }
      bookings:  { label: string; desc: string }
    }
    errorLoadingDashboard: string
  }

  users: {
    title: string
    totalAccounts: (n: number) => string
    searchPlaceholder: string
    roleFilter: {
      all:           string
      traveler:      string
      providerOwner: string
      admin:         string
    }
    table: {
      user:     string
      role:     string
      bookings: string
      reviews:  string
      joined:   string
    }
    roleLabels: {
      traveler:       string
      provider_owner: string
      admin:          string
    }
    modal: {
      title: string
      description: string
    }
    empty: string
    errorLoading: string
  }

  providers: {
    title: string
    totalBusinesses: (n: number) => string
    searchPlaceholder: string
    verifyFilter: {
      all:           string
      unverified:    string
      pendingReview: string
      verified:      string
      rejected:      string
    }
    table: {
      business:     string
      owner:        string
      type:         string
      verification: string
      status:       string
      joined:       string
    }
    verifyLabels: {
      unverified:     string
      pending_review: string
      verified:       string
      rejected:       string
    }
    statusLabels: {
      draft:    string
      active:   string
      paused:   string
      archived: string
    }
    detail: {
      owner:               string
      contact:             string
      about:               string
      location:            string
      listings:            string
      activity:            string
      tours:               string
      vehicles:            string
      accommodations:      string
      bookings:            string
      reviews:             string
      rejectionReasonBadge: string
      rejectionReasonLabel: string
      rejectionPlaceholder: string
      joined:              (date: string) => string
    }
    actions: {
      reject:            string
      rejectAgain:       string
      verify:            string
      revokeVerification: string
      confirmRejection:  string
    }
    empty: string
    errorLoading: string
  }

  bookings: {
    title: string
    totalBookings: (n: number) => string
    searchPlaceholder: string
    statusFilter: {
      all:       string
      pending:   string
      confirmed: string
      completed: string
      cancelled: string
    }
    typeFilter: {
      all:           string
      tour:          string
      vehicle:       string
      accommodation: string
    }
    table: {
      code:     string
      traveler: string
      provider: string
      type:     string
      status:   string
      amount:   string
      date:     string
    }
    statusLabels: {
      pending:   string
      confirmed: string
      cancelled: string
      completed: string
    }
    paymentLabels: {
      unpaid:     string
      authorized: string
      paid:       string
      refunded:   string
      failed:     string
    }
    listingTypeLabels: {
      tour:          string
      vehicle:       string
      accommodation: string
    }
    detail: {
      bookingLabel:    string
      listing:         string
      traveler:        string
      provider:        string
      checkIn:         string
      departure:       string
      guests:          string
      total:           string
      specialRequests: string
      bookingId:       string
      created:         string
    }
    empty: string
    errorLoading: string
  }
}

// ── Mongolian (default) ───────────────────────────────────────────────────────

export const mn: AdminTranslations = {
  dateLocale: 'mn-MN',

  common: {
    loading:    'Уншиж байна…',
    saving:     'Хадгалж байна…',
    save:       'Хадгалах',
    cancel:     'Болих',
    back:       'Буцах',
    noData:     'Мэдээлэл байхгүй.',
    errorHint:  'Backend ажиллаж буйг болон админ эрхтэйгээр нэвтэрснийг шалгана уу.',
    viewAll:    'Бүгдийг харах',
    details:    'Дэлгэрэнгүй',
    reviewAction: 'Хянах',
    editRole:   'Эрх засах',
    page:       'Хуудас',
    of:         '/',
    pageInfo:   (page, pages, total) => `${page} / ${pages} хуудас · ${total} нийт`,
    guestCount: (n) => `${n} зочин`,
    joinedPrefix: 'Элссэн',
  },

  layout: {
    adminConsole:  'Админ хяналт',
    langLabel:     'EN',
    notifications: 'Мэдэгдэлүүд',
  },

  sidebar: {
    operations: 'Үйл ажиллагаа',
    overview:   'Тойм',
    users:      'Хэрэглэгчид',
    providers:  'Үйлчилгээ эрхлэгчид',
    bookings:   'Захиалгууд',
    support:    'Тусламж',
  },

  overview: {
    title:    'Ерөнхий байдал',
    subtitle: 'Платформын бодит цагийн мэдээлэл ба хүлээгдэж буй үйлдлүүд.',
    stats: {
      totalUsers:          'Нийт хэрэглэгч',
      usersNewThisMonth:   (n) => `+${n} энэ сар`,
      providers:           'Үйлчилгээ эрхлэгчид',
      providersSub:        (active, pending) => `${active} идэвхтэй · ${pending} хүлээгдэж буй`,
      totalBookings:       'Нийт захиалга',
      bookingsThisMonth:   (n) => `${n} энэ сар`,
      revenue:             'Орлого (төлсөн)',
      revenueThisMonth:    (amt) => `${amt} энэ сар`,
    },
    pendingQueue: {
      title: 'Баталгаажуулалт хүлээж буй',
      empty: 'Хяналт хүлээж буй үйлчилгээ эрхлэгч байхгүй.',
    },
    recentBookings: {
      title: 'Сүүлийн захиалгууд',
      empty: 'Захиалга байхгүй байна.',
    },
    quickActions: {
      title: 'Хурдан үйлдлүүд',
      users:     { label: 'Хэрэглэгч удирдах',          desc: 'Хэрэглэгчдийн эрхийг харах, засах' },
      providers: { label: 'Үйлчилгээ эрхлэгч удирдах', desc: 'Бизнесийг баталгаажуулах, хянах' },
      bookings:  { label: 'Захиалга удирдах',            desc: 'Захиалгыг хянах, дэмжлэг үзүүлэх' },
    },
    errorLoadingDashboard: 'Хяналтын самбарын мэдээлэл уншиж чадсангүй.',
  },

  users: {
    title: 'Хэрэглэгчид',
    totalAccounts:     (n) => `${n.toLocaleString()} нийт бүртгэл`,
    searchPlaceholder: 'Нэр, имэйл хайх…',
    roleFilter: {
      all:           'Бүх эрх',
      traveler:      'Аялагч',
      providerOwner: 'Эрхлэгчийн эзэн',
      admin:         'Админ',
    },
    table: {
      user:     'Хэрэглэгч',
      role:     'Эрх',
      bookings: 'Захиалга',
      reviews:  'Үнэлгээ',
      joined:   'Элссэн',
    },
    roleLabels: {
      traveler:       'Аялагч',
      provider_owner: 'Эрхлэгчийн эзэн',
      admin:          'Админ',
    },
    modal: {
      title:       'Эрх өөрчлөх',
      description: 'Шинэ эрхийг сонгоно уу.',
    },
    empty:        'Хэрэглэгч олдсонгүй.',
    errorLoading: 'Хэрэглэгчдийг уншиж чадсангүй.',
  },

  providers: {
    title: 'Үйлчилгээ эрхлэгчид',
    totalBusinesses:   (n) => `${n.toLocaleString()} бүртгэлтэй бизнес`,
    searchPlaceholder: 'Бизнесийн нэр, имэйл, хот хайх…',
    verifyFilter: {
      all:           'Бүх баталгаажуулалт',
      unverified:    'Баталгаажаагүй',
      pendingReview: 'Хяналт хүлээж буй',
      verified:      'Баталгаажсан',
      rejected:      'Татгаасан',
    },
    table: {
      business:     'Бизнес',
      owner:        'Эзэн',
      type:         'Төрөл',
      verification: 'Баталгаажуулалт',
      status:       'Төлөв',
      joined:       'Элссэн',
    },
    verifyLabels: {
      unverified:     'Баталгаажаагүй',
      pending_review: 'Хяналт хүлээж буй',
      verified:       'Баталгаажсан',
      rejected:       'Татгаасан',
    },
    statusLabels: {
      draft:    'Ноорог',
      active:   'Идэвхтэй',
      paused:   'Зогсоосон',
      archived: 'Архивласан',
    },
    detail: {
      owner:               'Эзэн',
      contact:             'Холбоо барих',
      about:               'Тухай',
      location:            'Байршил',
      listings:            'Жагсаалтууд',
      activity:            'Үйл ажиллагаа',
      tours:               'Аялалууд',
      vehicles:            'Тээврийн хэрэгсэл',
      accommodations:      'Буудлууд',
      bookings:            'Захиалгууд',
      reviews:             'Үнэлгээнүүд',
      rejectionReasonBadge: 'Татгаасан шалтгаан',
      rejectionReasonLabel: 'Татгаасан шалтгаан',
      rejectionPlaceholder:
        'Яагаад энэ эрхлэгчийг татгааж буйгаа тайлбарлана уу. Энэ мэдэгдлийг имэйлээр тэдэнд явуулна.',
      joined: (date) => `Элссэн: ${date}`,
    },
    actions: {
      reject:             'Түдгэлзүүлэх',
      rejectAgain:        'Дахин түдгэлзүүлэх',
      verify:             'Баталгаажуулах',
      revokeVerification: 'Баталгааг цуцлах',
      confirmRejection:   'Түдгэлзэлт  баталгаажуулах',
    },
    empty:        'Үйлчилгээ эрхлэгч олдсонгүй.',
    errorLoading: 'Үйлчилгээ эрхлэгчдийг уншиж чадсангүй.',
  },

  bookings: {
    title: 'Захиалгууд',
    totalBookings:     (n) => `${n.toLocaleString()} нийт захиалга`,
    searchPlaceholder: 'Захиалгын код, аялагч, эрхлэгч хайх…',
    statusFilter: {
      all:       'Бүх төлөв',
      pending:   'Хүлээгдэж буй',
      confirmed: 'Баталгаажсан',
      completed: 'Дууссан',
      cancelled: 'Цуцлагдсан',
    },
    typeFilter: {
      all:           'Бүх төрөл',
      tour:          'Аялал',
      vehicle:       'Тээврийн хэрэгсэл',
      accommodation: 'Буудал',
    },
    table: {
      code:     'Код',
      traveler: 'Аялагч',
      provider: 'Эрхлэгч',
      type:     'Төрөл',
      status:   'Төлөв',
      amount:   'Дүн',
      date:     'Огноо',
    },
    statusLabels: {
      pending:   'Хүлээгдэж буй',
      confirmed: 'Баталгаажсан',
      cancelled: 'Цуцлагдсан',
      completed: 'Дууссан',
    },
    paymentLabels: {
      unpaid:     'Төлөгдөөгүй',
      authorized: 'Зөвшөөрсөн',
      paid:       'Төлсөн',
      refunded:   'Буцаасан',
      failed:     'Амжилтгүй',
    },
    listingTypeLabels: {
      tour:          'Аялал',
      vehicle:       'Тээврийн хэрэгсэл',
      accommodation: 'Буудал',
    },
    detail: {
      bookingLabel:    'Захиалга',
      listing:         'Жагсаалт',
      traveler:        'Аялагч',
      provider:        'Эрхлэгч',
      checkIn:         'Хүрэлцэх өдөр',
      departure:       'Гарах өдөр',
      guests:          'Зочид',
      total:           'Нийт дүн',
      specialRequests: 'Тусгай хүсэлтүүд',
      bookingId:       'Захиалгын ID:',
      created:         'Үүсгэсэн:',
    },
    empty:        'Захиалга олдсонгүй.',
    errorLoading: 'Захиалгуудыг уншиж чадсангүй.',
  },
}

// ── English ───────────────────────────────────────────────────────────────────

export const en: AdminTranslations = {
  dateLocale: 'en-US',

  common: {
    loading:    'Loading…',
    saving:     'Saving…',
    save:       'Save',
    cancel:     'Cancel',
    back:       'Back',
    noData:     'No data found.',
    errorHint:  'Check that the backend is running and you are signed in as admin.',
    viewAll:    'View all',
    details:    'Details',
    reviewAction: 'Review',
    editRole:   'Edit role',
    page:       'Page',
    of:         'of',
    pageInfo:   (page, pages, total) => `Page ${page} of ${pages} · ${total} total`,
    guestCount: (n) => `${n} guest${n !== 1 ? 's' : ''}`,
    joinedPrefix: 'Joined',
  },

  layout: {
    adminConsole:  'Admin Console',
    langLabel:     'МОН',
    notifications: 'Notifications',
  },

  sidebar: {
    operations: 'Operations',
    overview:   'Overview',
    users:      'Users',
    providers:  'Providers',
    bookings:   'Bookings',
    support:    'Support',
  },

  overview: {
    title:    'Operations Overview',
    subtitle: 'Real-time platform health and pending actions.',
    stats: {
      totalUsers:          'Total Users',
      usersNewThisMonth:   (n) => `+${n} this month`,
      providers:           'Providers',
      providersSub:        (active, pending) => `${active} active · ${pending} pending`,
      totalBookings:       'Total Bookings',
      bookingsThisMonth:   (n) => `${n} this month`,
      revenue:             'Revenue (paid)',
      revenueThisMonth:    (amt) => `${amt} this month`,
    },
    pendingQueue: {
      title: 'Pending Verification',
      empty: 'No providers awaiting verification.',
    },
    recentBookings: {
      title: 'Recent Bookings',
      empty: 'No bookings yet.',
    },
    quickActions: {
      title: 'Quick Actions',
      users:     { label: 'Manage Users',     desc: 'View and edit user roles' },
      providers: { label: 'Manage Providers', desc: 'Verify and moderate businesses' },
      bookings:  { label: 'Manage Bookings',  desc: 'Review and support bookings' },
    },
    errorLoadingDashboard: 'Failed to load dashboard data.',
  },

  users: {
    title: 'Users',
    totalAccounts:     (n) => `${n.toLocaleString()} total accounts`,
    searchPlaceholder: 'Search name or email…',
    roleFilter: {
      all:           'All roles',
      traveler:      'Traveler',
      providerOwner: 'Provider Owner',
      admin:         'Admin',
    },
    table: {
      user:     'User',
      role:     'Role',
      bookings: 'Bookings',
      reviews:  'Reviews',
      joined:   'Joined',
    },
    roleLabels: {
      traveler:       'Traveler',
      provider_owner: 'Provider Owner',
      admin:          'Admin',
    },
    modal: {
      title:       'Change Role',
      description: 'Select the new role for this user.',
    },
    empty:        'No users found.',
    errorLoading: 'Failed to load users.',
  },

  providers: {
    title: 'Providers',
    totalBusinesses:   (n) => `${n.toLocaleString()} registered businesses`,
    searchPlaceholder: 'Search business name, email, city…',
    verifyFilter: {
      all:           'All verification states',
      unverified:    'Unverified',
      pendingReview: 'Pending Review',
      verified:      'Verified',
      rejected:      'Rejected',
    },
    table: {
      business:     'Business',
      owner:        'Owner',
      type:         'Type',
      verification: 'Verification',
      status:       'Status',
      joined:       'Joined',
    },
    verifyLabels: {
      unverified:     'Unverified',
      pending_review: 'Pending Review',
      verified:       'Verified',
      rejected:       'Rejected',
    },
    statusLabels: {
      draft:    'Draft',
      active:   'Active',
      paused:   'Paused',
      archived: 'Archived',
    },
    detail: {
      owner:               'Owner',
      contact:             'Contact',
      about:               'About',
      location:            'Location',
      listings:            'Listings',
      activity:            'Activity',
      tours:               'Tours',
      vehicles:            'Vehicles',
      accommodations:      'Accommodations',
      bookings:            'Bookings',
      reviews:             'Reviews',
      rejectionReasonBadge: 'Rejection Reason',
      rejectionReasonLabel: 'Rejection reason',
      rejectionPlaceholder:
        'Describe why this provider is being rejected. This will be sent to them by email.',
      joined: (date) => `Joined ${date}`,
    },
    actions: {
      reject:             'Reject',
      rejectAgain:        'Reject Again',
      verify:             'Verify',
      revokeVerification: 'Revoke Verification',
      confirmRejection:   'Confirm Rejection',
    },
    empty:        'No providers found.',
    errorLoading: 'Failed to load providers.',
  },

  bookings: {
    title: 'Bookings',
    totalBookings:     (n) => `${n.toLocaleString()} total bookings`,
    searchPlaceholder: 'Search booking code, traveler, provider…',
    statusFilter: {
      all:       'All statuses',
      pending:   'Pending',
      confirmed: 'Confirmed',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    typeFilter: {
      all:           'All types',
      tour:          'Tour',
      vehicle:       'Vehicle',
      accommodation: 'Stay',
    },
    table: {
      code:     'Code',
      traveler: 'Traveler',
      provider: 'Provider',
      type:     'Type',
      status:   'Status',
      amount:   'Amount',
      date:     'Date',
    },
    statusLabels: {
      pending:   'Pending',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
      completed: 'Completed',
    },
    paymentLabels: {
      unpaid:     'Unpaid',
      authorized: 'Authorized',
      paid:       'Paid',
      refunded:   'Refunded',
      failed:     'Failed',
    },
    listingTypeLabels: {
      tour:          'Tour',
      vehicle:       'Vehicle',
      accommodation: 'Stay',
    },
    detail: {
      bookingLabel:    'Booking',
      listing:         'Listing',
      traveler:        'Traveler',
      provider:        'Provider',
      checkIn:         'Check-in',
      departure:       'Departure',
      guests:          'Guests',
      total:           'Total',
      specialRequests: 'Special Requests',
      bookingId:       'Booking ID:',
      created:         'Created:',
    },
    empty:        'No bookings found.',
    errorLoading: 'Failed to load bookings.',
  },
}

// ── Supported languages ───────────────────────────────────────────────────────

export type AdminLang = 'mn' | 'en'

export const locales: Record<AdminLang, AdminTranslations> = { mn, en }
