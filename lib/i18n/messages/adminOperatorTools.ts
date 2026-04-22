/**
 * Admin operator tools: pricing health + FX rates pages.
 * API enum raw values (status codes, reason codes) mapped to display labels where listed.
 */

export type AdminPricingHealthMessages = {
  title: string
  /** @param at locale-formatted */ subtitle: (at: string) => string
  kpi: {
    fxIssues: string
    staleMissing: (stale: number, missing: number) => string
    listingsNorm: string
    tourRoomVeh: (tours: number, rooms: number, veh: number) => string
    paymentBlocked: string
    nonMntNote: string
  }
  sectionProcessors: string
  sectionFxRates: string
  sectionCurrency: string
  table: { pair: string; rate: string; source: string; age: string; status: string }
  /** FX row + cards */
  fxBadge: { ok: string; stale: string; missing: string; fresh: string; veryStale: string }
  usdMnt: {
    title: string
    noSource: string
    updated: (age: string) => string
    manage: string
  }
  /** Payment processor row badge */
  processorStatus: { live: string; stub: string; planned: string }
  currencyListings: string
  currencyBookings: string
  listingRow: (kind: 'tour' | 'room' | 'vehicle', cur: string) => string
  /** Right column: "N bookings · formatted amount" */
  bookingStats: (count: number, amountFmt: string) => string
  payBlocked: {
    title: string
    open: (n: number) => string
    empty: string
    colBooking: string
    colCurrency: string
    colAmount: string
    colReason: string
    colStatus: string
  }
  reasonCode: { bonum_mnt_only: string; unsupported_currency: string }
  backfill: {
    title: string
    allResolved: string
    confirmResolve: string
    markResolved: string
    resolving: string
    closeTooltip: string
    category: { missing_fx_rate: string; unknown_units: string; legacy_currency: string; other: string }
  }
  errorLoad: string
  noData: string
  ageFmt: { sec: (n: number) => string; min: (n: number) => string; hour: (n: number) => string; day: (n: number) => string }
  resolveFailed: string
}

export type AdminFxRatesMessages = {
  title: string
  subtitle: string
  linkPricingHealth: string
  errorLoad: string
  cardUsdMnt: string
  cardMntUsd: string
  warnMissing: { title: string; body: string }
  warnStale: { title: string; body: (age: string) => string }
  form: {
    title: string
    hint: string
    pair: string
    rate: string
    source: string
    note: string
    notePlaceholder: string
    phUsdMnt: string
    phMntUsd: string
    rateInvalid: string
    confirmUnusual: (rate: string, pair: string) => string
    confirmNewRate: string
    saved: (pair: string, r: string) => string
    saveFailed: string
    saveCta: string
    saving: string
  }
  history: { title: string; hint: string; empty: string; table: { effFrom: string; note: string; status: string } }
  table: { pair: string; rate: string; source: string; status: string }
  badge: { active: string; history: string; fresh: string; stale: string; missing: string; veryStale: string }
  sourceDash: string
  updated: (age: string) => string
  ageFmt: { sec: (n: number) => string; min: (n: number) => string; hour: (n: number) => string; day: (n: number) => string; none: string }
}

export const pricingHealthEn: AdminPricingHealthMessages = {
  title: 'Pricing & FX Health',
  subtitle: (at) => `Read-only snapshot of pricing and FX. Last updated ${at}.`,
  kpi: {
    fxIssues: 'FX rate issues',
    staleMissing: (stale, missing) => `${stale} stale · ${missing} missing`,
    listingsNorm: 'Listings missing normalization',
    tourRoomVeh: (tours, rooms, veh) => `${tours} tours · ${rooms} rooms · ${veh} vehicles`,
    paymentBlocked: 'Payment-blocked bookings',
    nonMntNote: 'Non-MNT totals; live gateway settles in MNT only.',
  },
  sectionProcessors: 'Payment processors',
  sectionFxRates: 'FX rates',
  sectionCurrency: 'Currency distribution',
  table: { pair: 'Pair', rate: 'Rate', source: 'Source', age: 'Age', status: 'Status' },
  fxBadge: { ok: 'ok', stale: 'stale', missing: 'missing', fresh: 'fresh', veryStale: 'very stale' },
  usdMnt: {
    title: 'Active USD → MNT rate',
    noSource: 'no source',
    updated: (age) => `updated ${age}`,
    manage: 'Manage →',
  },
  processorStatus: { live: 'live', stub: 'stub', planned: 'planned' },
  currencyListings: 'Listings',
  currencyBookings: 'Bookings by charge currency',
  listingRow: (kind, cur) => {
    const k = kind === 'tour' ? 'Tours' : kind === 'room' ? 'Rooms' : 'Vehicles'
    return `${k} (${cur})`
  },
  bookingStats: (count, amountFmt) => `${count} bookings · ${amountFmt}`,
  payBlocked: {
    title: 'Payment-blocked bookings',
    open: (n) => `${n} open`,
    empty: 'None. All open bookings can be paid through a live processor.',
    colBooking: 'Booking',
    colCurrency: 'Currency',
    colAmount: 'Amount',
    colReason: 'Reason',
    colStatus: 'Status',
  },
  reasonCode: {
    bonum_mnt_only: 'Gateway MNT-only (non-MNT booking)',
    unsupported_currency: 'Unsupported currency for active gateway',
  },
  backfill: {
    title: 'Unresolved backfill reports',
    allResolved: 'All backfill reports resolved.',
    confirmResolve: 'Close this backfill report? This only marks the ticket resolved — it does NOT modify the flagged row.',
    markResolved: 'Mark resolved',
    resolving: 'Resolving…',
    closeTooltip: 'Close the report only. Does not modify the flagged row.',
    category: {
      missing_fx_rate: 'Missing FX rate',
      unknown_units: 'Unknown units',
      legacy_currency: 'Legacy currency',
      other: 'Other',
    },
  },
  errorLoad: 'Failed to load pricing health',
  noData: 'No data',
  ageFmt: {
    sec: (n) => `${n}s`,
    min: (n) => `${n}m`,
    hour: (n) => `${n}h`,
    day: (n) => `${n}d`,
  },
  resolveFailed: 'Failed to resolve report',
}

export const pricingHealthMn: AdminPricingHealthMessages = {
  title: 'Үнэ & FX эрүүл мэдрэмж',
  subtitle: (at) => `Үнэ, FX-ийн тойм (зөвхөн уншилт). Сүүлд шинэчилсэн: ${at}.`,
  kpi: {
    fxIssues: 'FX ханшийн асуудал',
    staleMissing: (stale, missing) => `${stale} хуучин · ${missing} дутуу`,
    listingsNorm: 'Нормчлол дутсан жагсаалт',
    tourRoomVeh: (tours, rooms, veh) => `${tours} аялал · ${rooms} өрөө · ${veh} тээвэр`,
    paymentBlocked: 'Төлбөр түгжигдсөн захиалга',
    nonMntNote: 'Bonum MNT-зөвхөн, MNT биш валютаар',
  },
  sectionProcessors: 'Төлбөрийн процессорууд',
  sectionFxRates: 'FX ханш',
  sectionCurrency: 'Валюта тархалт',
  table: { pair: 'Хослол', rate: 'Ханш', source: 'Эх сурвалж', age: 'Нас', status: 'Төлөв' },
  fxBadge: { ok: 'ok', stale: 'хуучин', missing: 'дутуу', fresh: 'шинэ', veryStale: 'маш хуучин' },
  usdMnt: {
    title: 'Идэвхтэй USD → MNT ханш',
    noSource: 'эх сурвалжгүй',
    updated: (age) => `шинэчилсэн ${age}`,
    manage: 'Удирдах →',
  },
  processorStatus: { live: 'идэвхтэй', stub: 'туршилт', planned: 'төлөвлөгдсөн' },
  currencyListings: 'Жагсаалт',
  currencyBookings: 'Төлбөрийн валутаар захиалга',
  listingRow: (kind, cur) => {
    const k = kind === 'tour' ? 'Аялал' : kind === 'room' ? 'Өрөө' : 'Тээвэр'
    return `${k} (${cur})`
  },
  bookingStats: (count, amountFmt) => `${count} захиалга · ${amountFmt}`,
  payBlocked: {
    title: 'Төлбөр түгжигдсэн захиалга',
    open: (n) => `${n} нээгдсэн`,
    empty: 'Байхгүй — нээлттэй бүх захиалгад төлбөр татах боломжтой.',
    colBooking: 'Захиалга',
    colCurrency: 'Валют',
    colAmount: 'Дүн',
    colReason: 'Шалтгаан',
    colStatus: 'Төлөв',
  },
  reasonCode: {
    bonum_mnt_only: 'Төлбөрийн MNT-зөвхөн (MNT биш валют)',
    unsupported_currency: 'Процессор дэмждэггүй валют',
  },
  backfill: {
    title: 'Шийдвэрлэгдээгүй backfill тасалбар',
    allResolved: 'Бүх backfill тасалбар шийдсэн.',
    confirmResolve: 'Тасалбарыг хаах уу? Зөвхөн "шийдсэн" гэж тэмдэглэнэ — мөрийг өөрчлөхгүй.',
    markResolved: 'Шийдсэн гэж тэмдэглэх',
    resolving: 'Шийдэж байна…',
    closeTooltip: 'Зөвхөн тасалбар хаана. Мөрийг өөрчлөхгүй.',
    category: {
      missing_fx_rate: 'FX ханш дутсан',
      unknown_units: 'Нэгж тодорхойгүй',
      legacy_currency: 'Өмнөх валют',
      other: 'Бусад',
    },
  },
  errorLoad: 'Үнэ/FX мэдээлэл ачаалж чадсангүй',
  noData: 'Өгөгдөл байхгүй',
  ageFmt: {
    sec: (n) => `${n}сек`,
    min: (n) => `${n}мин`,
    hour: (n) => `${n}цаг`,
    day: (n) => `${n}хоног`,
  },
  resolveFailed: 'Тасалбар шийдэж чадсангүй',
}

export const fxRatesEn: AdminFxRatesMessages = {
  title: 'FX rates',
  subtitle: 'Set USD↔MNT rates used at payment time. Each change is a new row — you never edit an old rate.',
  linkPricingHealth: '← Pricing health',
  errorLoad: 'Failed to load FX rates',
  cardUsdMnt: 'USD → MNT (primary)',
  cardMntUsd: 'MNT → USD (reverse)',
  warnMissing: {
    title: 'No USD→MNT rate is set.',
    body: 'Payments on USD listings will fail until you add a rate below. Existing MNT bookings are unaffected.',
  },
  warnStale: {
    title: 'USD→MNT rate is stale.',
    body: (age) => `Last update ${age}. Payments still work, but add a refreshed rate to keep conversions accurate.`,
  },
  form: {
    title: 'Add / update rate',
    hint: 'This affects new quotes and payments only. Existing bookings and payments stay unchanged.',
    pair: 'Pair',
    rate: 'Rate',
    source: 'Source',
    note: 'Note (optional)',
    notePlaceholder: 'Ref bank rate, manual update, …',
    phUsdMnt: 'e.g. 3450',
    phMntUsd: 'e.g. 0.000290',
    rateInvalid: 'Rate must be a positive number.',
    confirmUnusual: (r, p) => `Rate ${r} for ${p} looks unusual. Continue anyway?`,
    confirmNewRate: 'This affects NEW quotes and payments only. Existing bookings and payments stay unchanged — their FX snapshot was recorded at the time of booking/payment.\n\nContinue?',
    saved: (pair, r) => `Saved ${pair} = ${r}. It is now active for new payments.`,
    saveFailed: 'Failed to save FX rate',
    saveCta: 'Save new rate',
    saving: 'Saving…',
  },
  history: {
    title: 'Recent rates',
    hint: 'Top row of each pair is what payments use.',
    empty: 'No FX rates have been recorded yet.',
    table: { effFrom: 'Effective from', note: 'Note', status: 'Status' },
  },
  table: { pair: 'Pair', rate: 'Rate', source: 'Source', status: 'Status' },
  badge: { active: 'active', history: 'history', fresh: 'fresh', stale: 'stale', missing: 'missing', veryStale: 'very stale' },
  sourceDash: '—',
  /** @param age already includes relative suffix, e.g. "5m ago" */
  updated: (age) => `updated ${age}`,
  ageFmt: {
    sec: (n) => `${n}s ago`,
    min: (n) => `${n}m ago`,
    hour: (n) => `${n}h ago`,
    day: (n) => `${n}d ago`,
    none: '—',
  },
}

export const fxRatesMn: AdminFxRatesMessages = {
  title: 'FX ханш',
  subtitle: 'Төлбөрийн хөрвүүлэлтэд ашиглах USD↔MNT ханш. Мөр нэмэгдлээр л өөрчлөгдөнө — засвар нь шинэ мөр.',
  linkPricingHealth: '← Үнэ/FX эрүүл мэдрэмж',
  errorLoad: 'FX ханш ачаалж чадсангүй',
  cardUsdMnt: 'USD → MNT (үндсэн)',
  cardMntUsd: 'MNT → USD (урвуу)',
  warnMissing: {
    title: 'USD→MNT ханш тавигдаагүй байна.',
    body: 'Доор ханш нэмэх хүртэл USD-ийн жагсаалт дээрх төлбөр амжилтгүй. Одоо байгаа MNT захиалгад нөлөөгүй.',
  },
  warnStale: {
    title: 'USD→MNT ханш хуучин байна.',
    body: (age) => `Сүүлд ${age}. Төлбөр дараа ч ажиллана, нарийвчлалыг хадгалахаар шинэчлээрэй.`,
  },
  form: {
    title: 'Ханш нэмэх / шинэчлэх',
    hint: 'Зөвхөн шинэ үнийн санал, төлбөрт нөлөөлнө. Одоо байгаа захиалга, төлбөрт өөрчлөгдөхгүй.',
    pair: 'Хослол',
    rate: 'Ханш',
    source: 'Эх сурвалж',
    note: 'Тэмдэглэл (сонголттой)',
    notePlaceholder: 'Банкны ханш, гарын засвар…',
    phUsdMnt: 'жш. 3450',
    phMntUsd: 'жш. 0.000290',
    rateInvalid: 'Ханш эерэг тоо байх ёстой.',
    confirmUnusual: (r, p) => `${p}-д ханш ${r} — хэвийн бус харагдаж байна. Үргэлжлүүлэх үү?`,
    confirmNewRate: 'Зөвхөн ШИНЭ үнийн санал, төлбөрт нөлөөлнө. Одоо байгаа захиалга, төлбөрийн FX нөхцөл хуучин хэвээр.\n\nҮргэлжлүүлэх үү?',
    saved: (pair, r) => `${pair} = ${r} хадгалагдлаа. Шинэ төлбөрт идэвхтэй.`,
    saveFailed: 'FX ханш хадгалж чадсангүй',
    saveCta: 'Шинэ ханш хадгалах',
    saving: 'Хадгалж байна…',
  },
  history: {
    title: 'Сүүлийн ханшууд',
    hint: 'Тухайн хослолын эхний мөрийг төлбөр ашиглана.',
    empty: 'FX ханш бүртгэгдсэнгүй.',
    table: { effFrom: 'Хүчинтэй эхлэх', note: 'Тэмдэглэл', status: 'Төлөв' },
  },
  table: { pair: 'Хослол', rate: 'Ханш', source: 'Эх', status: 'Төлөв' },
  badge: { active: 'идэвхтэй', history: 'түүх', fresh: 'шинэ', stale: 'хуучин', missing: 'дутуу', veryStale: 'маш хуучин' },
  sourceDash: '—',
  /** ageStr already localized with "өмнө" etc. */
  updated: (age) => `шинэчилсэн: ${age}`,
  ageFmt: {
    sec: (n) => `${n}сек өмнө`,
    min: (n) => `${n}мин өмнө`,
    hour: (n) => `${n}цаг өмнө`,
    day: (n) => `${n}хоног өмнө`,
    none: '—',
  },
}
