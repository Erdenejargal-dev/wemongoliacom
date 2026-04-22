/**
 * Public browse / search / listing surfaces: stays, destinations, travel bar, checkout lead traveler.
 */

export type BrowseMessages = {
  stays: {
    heroEyebrow: string
    heroTitle: string
    heroTitleAccent: string
    heroLead: string
    searchPlaceholder: string
    from: string
    perNight: string
    priceOnRequest: string
    viewCta: string
    types: Record<string, string>
    staysCount: (n: number) => string
    emptyTitle: string
    emptyNoResults: (q: string) => string
    emptyNoFilter: string
    clearFilters: string
    ctaToursTitle: string
    ctaToursLead: string
    ctaToursButton: string
    /** Hero background image */
    heroImageAlt: string
  }
  destinations: {
    heroEyebrow: string
    heroTitle: string
    heroTitleAccent: string
    heroLead: string
    searchPlaceholder: string
    featured: string
    browseTours: string
    allRegions: string
    clear: string
    count: (n: number) => string
    emptyTitle: string
    emptyNoResults: (q: string) => string
    emptyHint: string
    clearFilters: string
    ctaTitle: string
    ctaLead: string
    ctaTours: string
    ctaStays: string
    heroImageAlt: string
  }
  travel: {
    whereLabel: string
    placeholderWhere: string
    checkIn: string
    checkOut: string
    search: string
    searchTours: string
    travelers: string
    addGuests: string
    guestSummary: (n: number) => string
    adults: string
    adultsSub: string
    children: string
    childrenSub: string
    done: string
  }
  checkout: {
    title: string
    subtitle: string
    fullName: string
    email: string
    phone: string
    country: string
    selectCountry: string
    specialLabel: string
    specialOptional: string
    placeholderName: string
    placeholderEmail: string
    placeholderPhone: string
    placeholderSpecial: string
    consentBefore: string
    terms: string
    consentBetween: string
    privacy: string
    consentAfter: string
  }
  detail: {
    breadcrumbTours: string
    breadcrumbStays: string
    breadcrumbExplore: string
    noPhotos: string
  }
}

export const browseEn: BrowseMessages = {
  stays: {
    heroEyebrow: 'Where to Stay',
    heroTitle: 'Ger Camps, Hotels &',
    heroTitleAccent: ' Lodges in Mongolia',
    heroLead:
      'From traditional nomadic ger camps to luxury resorts — find where to stay for your Mongolia adventure.',
    searchPlaceholder: 'Search by name or destination…',
    from: 'From',
    perNight: ' / night',
    priceOnRequest: 'Price on request',
    viewCta: 'View',
    types: {
      all: 'All Stays',
      ger_camp: 'Ger Camps',
      hotel: 'Hotels',
      resort: 'Resorts',
      lodge: 'Lodges',
      guesthouse: 'Guesthouses',
      homestay: 'Homestays',
    },
    staysCount: (n) => `${n} ${n === 1 ? 'stay' : 'stays'}`,
    emptyTitle: 'No stays found',
    emptyNoResults: (q) => `No results for "${q}"`,
    emptyNoFilter: 'No stays available for this filter',
    clearFilters: 'Clear filters',
    ctaToursTitle: 'Looking for tours too?',
    ctaToursLead: 'Browse guided tours and packages across Mongolia.',
    ctaToursButton: 'Browse all tours',
    heroImageAlt: 'Mongolia stays and landscapes',
  },
  destinations: {
    heroEyebrow: 'Mongolia Awaits',
    heroTitle: 'Explore Mongolia',
    heroTitleAccent: ' by Destination',
    heroLead:
      "From the Gobi Desert to the Altai Mountains — discover Mongolia's most remarkable landscapes.",
    searchPlaceholder: 'Search destinations…',
    featured: 'Featured Destinations',
    browseTours: 'Browse tours',
    allRegions: 'All regions',
    clear: 'Clear',
    count: (n) => `${n} destination${n !== 1 ? 's' : ''}`,
    emptyTitle: 'No destinations found',
    emptyNoResults: (q) => `No results for "${q}"`,
    emptyHint: 'Try a different region or clear your filters',
    clearFilters: 'Clear filters',
    ctaTitle: 'Ready to book your adventure?',
    ctaLead: 'Browse tours and stays across Mongolia — filter by destination, style, and dates.',
    ctaTours: 'Browse all tours',
    ctaStays: 'Browse stays',
    heroImageAlt: 'Mongolia destinations',
  },
  travel: {
    whereLabel: 'Where',
    placeholderWhere: 'Where to?',
    checkIn: 'Check-in',
    checkOut: 'Check-out',
    search: 'Search',
    searchTours: 'Search Tours',
    travelers: 'Travelers',
    addGuests: 'Add guests',
    guestSummary: (n) => `${n} guest${n !== 1 ? 's' : ''}`,
    adults: 'Adults',
    adultsSub: 'Ages 13+',
    children: 'Children',
    childrenSub: 'Ages 2–12',
    done: 'Done',
  },
  checkout: {
    title: 'Traveler details',
    subtitle: 'Main guest for this booking',
    fullName: 'Full Name',
    email: 'Email Address',
    phone: 'Phone Number',
    country: 'Country',
    selectCountry: 'Select your country',
    specialLabel: 'Special Requests',
    specialOptional: '(optional)',
    placeholderName: 'As it appears on your passport',
    placeholderEmail: 'you@example.com',
    placeholderPhone: '+1 555 000 0000',
    placeholderSpecial: 'Dietary requirements, accessibility needs, or any other requests…',
    consentBefore: 'By confirming your booking you agree to our',
    terms: 'Terms & Conditions',
    consentBetween: 'and',
    privacy: 'Privacy Policy',
    consentAfter: '. Your details will only be used to manage your booking.',
  },
  detail: {
    breadcrumbTours: 'Tours',
    breadcrumbStays: 'Stays',
    breadcrumbExplore: 'Explore',
    noPhotos: 'No photos available yet',
  },
}

export const browseMn: BrowseMessages = {
  stays: {
    heroEyebrow: 'Байр сонгох',
    heroTitle: 'Гэр буудал, зочид буудал,',
    heroTitleAccent: ' лодж — Монголд',
    heroLead:
      'Уламжлалт гэр ба зочид буудлаас тансаг амралт хүртэл — аяллын хоноглолтоо сонгоорой.',
    searchPlaceholder: 'Нэр эсвэл чиглэлээр хайх…',
    from: 'Эхлэх үнэ',
    perNight: ' / шөнө',
    priceOnRequest: 'Үнэ зөвлөмж',
    viewCta: 'Үзэх',
    types: {
      all: 'Бүгд',
      ger_camp: 'Гэр буудал',
      hotel: 'Зочид буудал',
      resort: 'Амралт',
      lodge: 'Лодж',
      guesthouse: 'Зочид гэр',
      homestay: 'Айлын амралт',
    },
    staysCount: (n) => `${n} хоноглолт`,
    emptyTitle: 'Олдсонгүй',
    emptyNoResults: (q) => `"${q}" гэсэн илэрц алга`,
    emptyNoFilter: 'Энэ шүүлтүүрт нийцэх сонголт алга',
    clearFilters: 'Шүүлтүүр арилгах',
    ctaToursTitle: 'Аялал хайж байна уу?',
    ctaToursLead: 'Монгол даяарх аялал, багцуудыг үзнэ үү.',
    ctaToursButton: 'Бүх аяллыг үзэх',
    heroImageAlt: 'Монголын амралт, байршил',
  },
  destinations: {
    heroEyebrow: 'Монголыг нээнэ үү',
    heroTitle: 'Чиглэлээр',
    heroTitleAccent: ' Монголыг нээ',
    heroLead: 'Говиос Алтай хүртэл — тухайн бүс нутаг бүрийн онцлогыг нээнэ үү.',
    searchPlaceholder: 'Чиглэл хайх…',
    featured: 'Онцлох чиглэл',
    browseTours: 'Аяллууд',
    allRegions: 'Бүх бүс',
    clear: 'Арилгах',
    count: (n) => `${n} чиглэл`,
    emptyTitle: 'Чиглэл олдсонгүй',
    emptyNoResults: (q) => `"${q}" гэсэн илэрц алга`,
    emptyHint: 'Өөр бүс сонгох эсвэл шүүлтүүрийг цэвэрлэнэ үү',
    clearFilters: 'Шүүлтүүрийг арилгах',
    ctaTitle: 'Адал явдлаа бүртгүүлмээр байна уу?',
    ctaLead: 'Монгол даяарх аялал, хоноглолт — чиглэл, хэв маяг, огноогоор шүү.',
    ctaTours: 'Бүх аялал үзэх',
    ctaStays: 'Амралт, буудал',
    heroImageAlt: 'Монголын чиглэл, газар',
  },
  travel: {
    whereLabel: 'Хаашаа',
    placeholderWhere: 'Аялах зорьсон газар?',
    checkIn: 'Ирэх',
    checkOut: 'Гарах',
    search: 'Хайх',
    searchTours: 'Аялал хайх',
    travelers: 'Аялагч',
    addGuests: 'Зочин нэмэх',
    guestSummary: (n) => `${n} зочин`,
    adults: 'Томчууд',
    adultsSub: '13+ нас',
    children: 'Хүүхдүүд',
    childrenSub: '2–12 нас',
    done: 'Болсон',
  },
  checkout: {
    title: 'Зочны мэдээлэл',
    subtitle: 'Энэ захиалгын гол зочин',
    fullName: 'Бүтэн нэр',
    email: 'Имэйл',
    phone: 'Утас',
    country: 'Улс',
    selectCountry: 'Улсаа сонгоно уу',
    specialLabel: 'Нэмэлт хүсэлт',
    specialOptional: '(заавал биш)',
    placeholderName: 'Паспорт дээрхтэй ижил',
    placeholderEmail: 'you@example.com',
    placeholderPhone: '+976 9900 0000',
    placeholderSpecial: 'Хоолны хязгаарлалт, нэвтрэхэд тусламж, бусад хүсэлт…',
    consentBefore: 'Захиалга баталгаажуулахдаа',
    terms: 'Үйлчилгээний нөхцөл',
    consentBetween: 'болон',
    privacy: 'Нууцлалын бодлогыг',
    consentAfter: ' зөвшөөрнө. Мэдээллийг зөвхөн захиалгад ашиглана.',
  },
  detail: {
    breadcrumbTours: 'Аялал',
    breadcrumbStays: 'Амралт',
    breadcrumbExplore: 'Аялал, амралт',
    noPhotos: 'Зураг ороогүй байна',
  },
}
