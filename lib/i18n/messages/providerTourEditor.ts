/**
 * Provider business portal — single tour create/edit page (`services/tours/[id]`).
 * Stored API values (category strings, difficulty enums) stay English; UI labels only.
 */

export type ProviderTourEditorMessages = {
  readiness: {
    readyLine1: string
    readyActive: string
    readyLine2: string
    notReadyTitle: string
  }
  /** Matches backend `checkTourReadiness` English strings → UI copy */
  readinessMissing: {
    titleMin2: string
    descMin50: string
    pricePositive: string
    oneImage: string
    oneDeparture: string
  }
  departures: {
    hintPublish: string
    addDeparture: string
    startDate: string
    endDate: string
    availableSeats: string
    priceOverride: string
    basePricePlaceholder: string
    addSubmit: string
    deleteConfirm: string
    errCreate: string
    errDelete: string
    errDeleteGeneric: string
    removeDepartureAria: string
    seatsBooked: (booked: number, total: number) => string
    emptyUpcoming: string
    pastSummary: (n: number) => string
    pastSeats: (booked: number, total: number) => string
  }
  sections: {
    photos: string
    photosDesc: (count: number) => string
    basicInfo: string
    basicInfoDesc: string
    tripDetails: string
    tripDetailsDesc: string
    location: string
    locationDesc: string
    pricing: string
    pricingDesc: string
    schedule: string
    scheduleDesc: string
    publish: string
    publishDesc: string
  }
  labels: {
    title: string
    shortDesc: string
    fullDesc: string
    fullDescMin: string
    category: string
    difficulty: string
    durationDays: string
    maxGuests: string
    minGuests: string
    languages: string
    destination: string
    meetingPoint: string
    basePrice: string
    currency: string
    cancellation: string
  }
  placeholders: {
    shortDesc: string
    fullDesc: string
    duration: string
    maxGuests: string
    minGuests: string
    languages: string
    meetingPoint: string
    cancellation: string
  }
  hints: {
    shortDesc: string
    charCount: (n: number) => string
    needMore: (n: number) => string
    longEnough: string
    diffEasy: string
    diffModerate: string
    diffChallenging: string
    maxGroup: string
    minGroup: string
    langsComma: string
    destLink: string
    meetDay1: string
    pricePerPerson: string
    cancelClear: string
  }
  select: {
    placeholder: string
    none: string
  }
  /** Maps stored category value → display label */
  categories: Record<string, string>
  /** Difficulty enum value (API) → label */
  difficulties: { Easy: string; Moderate: string; Challenging: string }
  status: {
    draft: string
    draftDesc: string
    active: string
    activeDesc: string
    paused: string
    pausedDesc: string
    notLiveWarning: string
  }
  actions: {
    save: string
    saving: string
    archive: string
    archiving: string
    backToTours: string
    lastUpdated: (date: string) => string
    archiveTooltip: string
  }
  toasts: {
    saved: string
    errLoad: string
    errSave: string
    errArchive: string
    errImages: string
    errRemoveImage: string
  }
  confirmArchive: string
  tourNotFound: string
  signInUpload: string
  cover: string
  tourImage: (i: number) => string
  photosUploadHint: (n: string) => string
}

const categoriesEn: Record<string, string> = {
  Adventure: 'Adventure',
  Cultural: 'Cultural',
  'Wildlife & Nature': 'Wildlife & Nature',
  Photography: 'Photography',
  'Trekking & Hiking': 'Trekking & Hiking',
  'Horseback Riding': 'Horseback Riding',
  Luxury: 'Luxury',
  Budget: 'Budget',
  Family: 'Family',
  Festival: 'Festival',
  'Nomadic Life': 'Nomadic Life',
  Other: 'Other',
}

const categoriesMn: Record<string, string> = {
  Adventure: 'Адал явдал',
  Cultural: 'Соёл',
  'Wildlife & Nature': 'Ан амьтан, байгаль',
  Photography: 'Гэрэл зураг',
  'Trekking & Hiking': 'Алхалт, аялал',
  'Horseback Riding': 'Морь унах',
  Luxury: 'Дээд зэрэг',
  Budget: 'Хэмнэлттэй',
  Family: 'Гэр бүл',
  Festival: 'Наадам, арга хэмжээ',
  'Nomadic Life': 'Нүүдлийн амьдрал',
  Other: 'Бусад',
}

export const providerTourEditorEn: ProviderTourEditorMessages = {
  readiness: {
    readyLine1: 'This tour meets all publish requirements. Set status to',
    readyActive: 'Active',
    readyLine2: 'to make it visible to travelers.',
    notReadyTitle: 'Not ready to publish yet',
  },
  readinessMissing: {
    titleMin2: 'Title must be at least 2 characters',
    descMin50: 'Description must be at least 50 characters',
    pricePositive: 'Price must be greater than 0',
    oneImage: 'At least 1 image is required',
    oneDeparture: 'At least 1 upcoming departure is required',
  },
  departures: {
    hintPublish: 'At least one upcoming departure is required to publish.',
    addDeparture: 'Add Departure',
    startDate: 'Start date',
    endDate: 'End date',
    availableSeats: 'Available seats',
    priceOverride: 'Price override',
    basePricePlaceholder: 'Base price',
    addSubmit: 'Add Departure',
    deleteConfirm: 'Delete this departure? This cannot be undone.',
    errCreate: 'Failed to create departure.',
    errDelete: 'Failed to delete departure.',
    errDeleteGeneric: 'Failed to delete departure.',
    removeDepartureAria: 'Remove departure',
    seatsBooked: (b, t) => `${b}/${t} seats booked`,
    emptyUpcoming: 'No upcoming departures. Add one to make this tour bookable.',
    pastSummary: (n) => `${n} past / cancelled departure${n !== 1 ? 's' : ''}`,
    pastSeats: (b, t) => `${b}/${t} seats`,
  },
  sections: {
    photos: 'Photos',
    photosDesc: (count) => `${count} uploaded — at least 1 required to publish`,
    basicInfo: 'Basic Info',
    basicInfoDesc: 'The title and description travelers see on listing cards and the tour detail page.',
    tripDetails: 'Trip Details',
    tripDetailsDesc: 'Helps travelers filter and compare your tour against others.',
    location: 'Location',
    locationDesc: 'Where this tour takes place and where travelers should meet you.',
    pricing: 'Pricing & Policy',
    pricingDesc: 'Set your per-person price and cancellation terms.',
    schedule: 'Schedule',
    scheduleDesc: 'Upcoming departures travelers can book. At least one is required to publish.',
    publish: 'Publish Status',
    publishDesc: 'Control whether this tour is visible to travelers.',
  },
  labels: {
    title: 'Title',
    shortDesc: 'Short description',
    fullDesc: 'Full description',
    fullDescMin: '(min 50 chars to publish)',
    category: 'Category',
    difficulty: 'Difficulty',
    durationDays: 'Duration (days)',
    maxGuests: 'Max group size',
    minGuests: 'Minimum group size',
    languages: 'Languages spoken by guides',
    destination: 'Destination',
    meetingPoint: 'Meeting point',
    basePrice: 'Base price',
    currency: 'Currency',
    cancellation: 'Cancellation policy',
  },
  placeholders: {
    shortDesc: 'One-line summary shown on search and listing cards…',
    fullDesc: 'Describe what makes this tour special — the experience, landscapes, culture, what\'s included…',
    duration: 'e.g. 3',
    maxGuests: 'e.g. 12',
    minGuests: 'e.g. 2',
    languages: 'e.g. English, Mongolian, Chinese',
    meetingPoint: 'e.g. Chinggis Khaan International Airport, or hotel lobby in Ulaanbaatar',
    cancellation: 'e.g. Full refund if cancelled more than 14 days before departure. 50% refund within 14 days. No refund within 48 hours.',
  },
  hints: {
    shortDesc: 'Keep this under 100 characters for best display in search results.',
    charCount: (n) => `${n.toLocaleString()}/10 000 ·`,
    needMore: (n) => `${n} more characters needed to publish`,
    longEnough: '✓ Long enough to publish',
    diffEasy: 'Suitable for all fitness levels.',
    diffModerate: 'Some physical activity required.',
    diffChallenging: 'Good fitness level needed.',
    maxGroup: 'Maximum travelers per departure.',
    minGroup: 'Minimum travelers required to run this tour. Leave blank if any group size is fine.',
    langsComma: 'Separate with commas.',
    destLink: 'Links your tour to a destination discovery page. Optional but recommended for discoverability.',
    meetDay1: 'Where should travelers meet you on day 1?',
    pricePerPerson: 'Price per person per departure.',
    cancelClear: 'Describe your refund and cancellation terms clearly so travelers know what to expect.',
  },
  select: {
    placeholder: '— Select —',
    none: '— None —',
  },
  categories: categoriesEn,
  difficulties: {
    Easy: 'Easy',
    Moderate: 'Moderate',
    Challenging: 'Challenging',
  },
  status: {
    draft: 'Draft',
    draftDesc: 'Hidden from travelers. Use this while setting up.',
    active: 'Active',
    activeDesc: 'Visible on WeMongolia. Travelers can discover and book.',
    paused: 'Paused',
    pausedDesc: 'Temporarily hidden. Existing bookings are not affected.',
    notLiveWarning: 'This tour won\'t go live until all readiness requirements above are met.',
  },
  actions: {
    save: 'Save Changes',
    saving: 'Saving…',
    archive: 'Archive',
    archiving: 'Archiving…',
    backToTours: '← Back to tours',
    lastUpdated: (d) => `Last updated ${d}`,
    archiveTooltip: 'Archive tour',
  },
  toasts: {
    saved: 'Changes saved.',
    errLoad: 'Failed to load tour.',
    errSave: 'Failed to save tour.',
    errArchive: 'Failed to archive tour.',
    errImages: 'Failed to save images.',
    errRemoveImage: 'Failed to remove image.',
  },
  confirmArchive: 'Archive this tour? It will be hidden from travelers and cannot be re-activated from here.',
  tourNotFound: 'Tour not found.',
  signInUpload: 'Sign in to upload photos.',
  cover: 'Cover',
  tourImage: (i) => `Tour image ${i}`,
  photosUploadHint: (n) => `Up to ${n} more photos. JPEG, PNG, WebP — max 10 MB each. First photo becomes the cover.`,
}

export const providerTourEditorMn: ProviderTourEditorMessages = {
  readiness: {
    readyLine1: 'Нийтлэх бүх шаардлага хангагдсан. Төлөвийг',
    readyActive: 'Идэвхтэй',
    readyLine2: 'болгож, аялагчдад харагдана.',
    notReadyTitle: 'Одоогоор нийтлэхэд бэлэн биш',
  },
  readinessMissing: {
    titleMin2: 'Гарчиг дор хаяж 2 тэмдэгт байх ёстой',
    descMin50: 'Тайлбар дор хаяж 50 тэмдэгт байх ёстой',
    pricePositive: 'Үнэ 0-оос их байх ёстой',
    oneImage: 'Дор хаяж 1 зураг шаардлагатай',
    oneDeparture: 'Дор хаяж 1 ирээдүйн аялал (departure) шаардлагатай',
  },
  departures: {
    hintPublish: 'Нийтлэхэд ирээдүйн дор хаяж нэг аялал (departure) шаардлагатай.',
    addDeparture: 'Аялал нэмэх',
    startDate: 'Эхлэх огноо',
    endDate: 'Дуусах огноо',
    availableSeats: 'Суудлын тоо',
    priceOverride: 'Үнэ (онцлох)',
    basePricePlaceholder: 'Үндсэн үнэ',
    addSubmit: 'Аялал нэмэх',
    deleteConfirm: 'Энэ аяллыг устгах уу? Буцаах боломжгүй.',
    errCreate: 'Аялал үүсгэж чадсангүй.',
    errDelete: 'Устгаж чадсангүй.',
    errDeleteGeneric: 'Устгаж чадсангүй.',
    removeDepartureAria: 'Аяллыг устгах',
    seatsBooked: (b, t) => `${b}/${t} суудал захиалсан`,
    emptyUpcoming: 'Ирээдүйн аялал байхгүй. Захиалгатай болгохын тулд нэмнэ үү.',
    pastSummary: (n) => `Өнгөрсөн / цуцлагдсан ${n}`,
    pastSeats: (b, t) => `${b}/${t} суудал`,
  },
  sections: {
    photos: 'Зураг',
    photosDesc: (count) => `${count} оруулсан — нийтлэхэд доорх нь 1+ шаардлагатай`,
    basicInfo: 'Үндсэн мэдээлэл',
    basicInfoDesc: 'Гарчиг, тайлбар — аялагч жагсаалт, дэлгэрэнгүй хуудсанд харна.',
    tripDetails: 'Аяллын нөхцөл',
    tripDetailsDesc: 'Шүүлтүүр, харьцуулалтад тусална.',
    location: 'Байршил',
    locationDesc: 'Аялал хаана явагдаж, хаана уулзах вэ.',
    pricing: 'Үнэ & бодлого',
    pricingDesc: 'Нэг хүний үнэ, цуцлалтын нөхцөл.',
    schedule: 'Хуанли',
    scheduleDesc: 'Захиалгатай ирээдүйн аяллууд. Нийтлэхэд нэг нь ч шаардлагатай.',
    publish: 'Нийтлэх төлөв',
    publishDesc: 'Аялагчдад харагдах эсэх.',
  },
  labels: {
    title: 'Гарчиг',
    shortDesc: 'Товч тайлбар',
    fullDesc: 'Бүрэн тайлбар',
    fullDescMin: '(нийтлэхэд доод тал нь 50 тэмдэгт)',
    category: 'Ангилал',
    difficulty: 'Хэцүүн',
    durationDays: 'Үргэлжлэх хугацаа (хоног)',
    maxGuests: 'Дээд бүлгийн хэмжээ',
    minGuests: 'Доод бүлгийн хэмжээ',
    languages: 'Хөтөчийн хэлнүүд',
    destination: 'Чиглэл',
    meetingPoint: 'Уулзах цэг',
    basePrice: 'Үндсэн үнэ',
    currency: 'Валют',
    cancellation: 'Цуцлалтын бодлого',
  },
  placeholders: {
    shortDesc: 'Нэг мөрт хайлтад, картан дээр гарч ирнэ…',
    fullDesc: 'Энэ аяллыг ялгах онцлог, үзэсгэлэн, соёл, багтсан зүйлс…',
    duration: 'жш. 3',
    maxGuests: 'жш. 12',
    minGuests: 'жш. 2',
    languages: 'жш. English, Mongolian, Chinese',
    meetingPoint: 'жш. Чингис хаан олон улсын нисэх, эсвэл зочид буудлын лобби (Улаанбаатар)',
    cancellation: 'жш. 14-оос олон хоног өмнө бүрэн буцаан олгоно. 14 хоногт 50%…',
  },
  hints: {
    shortDesc: 'Хайлтад сайн харагдахын тулд 100 тэмдэгтээс богино байлга.',
    charCount: (n) => `${n.toLocaleString()}/10 000 ·`,
    needMore: (n) => `Нийтлэхэд дахин ${n} тэмдэгт оруулна уу`,
    longEnough: '✓ Нийтлэхэд хангалттай урт',
    diffEasy: 'Бүх хүнд тохиромжтой.',
    diffModerate: 'Дунд зэргийн физ ачаалал.',
    diffChallenging: 'Сайн биеийн нөхцөл шаардлагатай.',
    maxGroup: 'Аялал бүрт дээд тоо зочин.',
    minGroup: 'Аялал хөдлөх доод бүлгийн хэмжээ. Хоосон бол дурын тоо зөвшөөрнө.',
    langsComma: 'Таслалаар тусгаарлана.',
    destLink: 'Чиглэл олж нээх хуудсанд холбоно. Сонголттой, гэвч зөвлөмжтэй.',
    meetDay1: '1-р өдөр хаана уулзах вэ?',
    pricePerPerson: 'Аялал, нэг хүнд ногдох үнэ.',
    cancelClear: 'Буцаан олголт, цуцлалтыг тодорхой бичнэ үү.',
  },
  select: {
    placeholder: '— Сонгох —',
    none: '— Байхгүй —',
  },
  categories: categoriesMn,
  difficulties: {
    Easy: 'Амархан',
    Moderate: 'Дунд',
    Challenging: 'Хэцүүн',
  },
  status: {
    draft: 'Ноорог',
    draftDesc: 'Аялагчдад харагдахгүй. Бэлтгэж буй үед ашиглана.',
    active: 'Идэвхтэй',
    activeDesc: 'WeMongolia дээр харагдаж, захиалга авах боломжтой.',
    paused: 'Зогсоосон',
    pausedDesc: 'Түр нуугдсан. Одоо байгаа захиалгад нөлөөгүй.',
    notLiveWarning: 'Дээрх бүх бэлэн шаардлага хангах хүртэл нийтлэгдэхгүй.',
  },
  actions: {
    save: 'Өөрчлөлтийг хадгалах',
    saving: 'Хадгалж байна…',
    archive: 'Архивлах',
    archiving: 'Архивлаж байна…',
    backToTours: '← Аяллууд руу',
    lastUpdated: (d) => `Сүүлд шинэчлэгдсэн: ${d}`,
    archiveTooltip: 'Аяллыг архивлах',
  },
  toasts: {
    saved: 'Хадгалагдсан.',
    errLoad: 'Аялал ачаалж чадсангүй.',
    errSave: 'Хадгалж чадсангүй.',
    errArchive: 'Архивлаж чадсангүй.',
    errImages: 'Зураг хадгалж чадсангүй.',
    errRemoveImage: 'Зураг устгаж чадсангүй.',
  },
  confirmArchive: 'Энэ аяллыг архивлах уу? Аялагчдаас нуугдаж, энд дахин идэвхжүүлж болохгүй.',
  tourNotFound: 'Аялал олдсонгүй.',
  signInUpload: 'Зураг оруулахын тулд нэвтэрнэ үү.',
  cover: 'Нүүр',
  tourImage: (i) => `Аяллын зураг ${i}`,
  photosUploadHint: (n) => `Дээд нь ${n} зураг. JPEG, PNG, WebP — фонд 10 MB. Эхний нь нүүр зураг болно.`,
}
