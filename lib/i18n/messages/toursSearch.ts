/**
 * /tours listing — filters, sort, and results chrome (search uses USD sliders; copy only).
 */

export type SortKey = 'popular' | 'top_rated' | 'price_asc' | 'price_desc'

export type ToursSearchMessages = {
  sort: Record<SortKey, string>
  titleAll: string
  titleInDestination: (dest: string) => string
  searching: string
  resultsLine: (total: number) => string
  subline: string
  filters: string
  clearAll: string
  clearDates: string
  mobileShowTours: (total: number) => string
  suspenseLoading: string
  chipUnder: (money: string) => string
  chipStars: (n: number) => string
  chipGuests: (n: number) => string
  durationChip: Record<string, string>
  regionChip: Record<string, string>
  grid: {
    errorTitle: string
    tryAgain: string
    emptyTitle: string
    emptyBody: string
    clearFilters: string
    loadMoreButton: (shown: number, total: number) => string
  }
  filterSidebar: {
    filters: string
    reset: string
    price: string
    departureDates: string
    departureHint: string
    from: string
    to: string
    clearDates: string
    region: string
    allRegions: string
    regionLabels: Record<string, string>
    duration: string
    durationLabels: Record<string, string>
    groupSize: string
    groupSizeHint: string
    minRating: string
    anyRating: string
    starsPlus: (r: number) => string
    matchCount: (total: number) => string
  }
}

const regionKeys = ['gobi', 'khangai', 'khuvsgul', 'ulaanbaatar', 'altai', 'steppe'] as const

function regionLabelsEn(): Record<string, string> {
  return {
    gobi: 'Gobi Desert',
    khangai: 'Khangai Mountains',
    khuvsgul: 'Lake Khuvsgul',
    ulaanbaatar: 'Ulaanbaatar',
    altai: 'Altai Mountains',
    steppe: 'Central Steppes',
  }
}

function regionLabelsMn(): Record<string, string> {
  return {
    gobi: 'Говь цөл',
    khangai: 'Хангайн нуруу',
    khuvsgul: 'Хөвсгөл нуур',
    ulaanbaatar: 'Улаанбаатар',
    altai: 'Алтайн нуруу',
    steppe: 'Тал нутаг',
  }
}

export const toursSearchEn: ToursSearchMessages = {
  sort: {
    popular: 'Most popular',
    top_rated: 'Top rated',
    price_asc: 'Price: low to high',
    price_desc: 'Price: high to low',
  },
  titleAll: 'All Mongolia Tours',
  titleInDestination: (dest) => `Tours in ${dest}`,
  searching: 'Searching…',
  resultsLine: (total) =>
    `${total} tour${total !== 1 ? 's' : ''} with scheduled departures`,
  subline: 'Select a tour to see exact dates and confirm availability',
  filters: 'Filters',
  clearAll: 'Clear all',
  clearDates: 'Clear dates',
  mobileShowTours: (total) => `Show ${total} tour${total !== 1 ? 's' : ''}`,
  suspenseLoading: 'Loading…',
  chipUnder: (money) => `Under ${money}`,
  chipStars: (n) => `${n}+ stars`,
  chipGuests: (n) => `${n} guests`,
  durationChip: {
    '1': '1 Day',
    '2-3': '2–3 Days',
    '4-7': '4–7 Days',
    '8+': '8+ Days',
  },
  regionChip: {
    gobi: 'Gobi Desert',
    khangai: 'Khangai Mountains',
    khuvsgul: 'Lake Khuvsgul',
    ulaanbaatar: 'Ulaanbaatar',
    altai: 'Altai Mountains',
    steppe: 'Central Steppes',
  },
  grid: {
    errorTitle: 'Unable to load tours',
    tryAgain: 'Try again',
    emptyTitle: 'No tours found',
    emptyBody:
      'No tours match your current filters. Try adjusting your search or clearing some filters.',
    clearFilters: 'Clear all filters',
    loadMoreButton: (shown, total) => `Load more (${shown} of ${total} shown)`,
  },
  filterSidebar: {
    filters: 'Filters',
    reset: 'Reset',
    price: 'Price (USD / person)',
    departureDates: 'Departure dates',
    departureHint: 'Filter by scheduled departure date',
    from: 'From',
    to: 'To',
    clearDates: 'Clear dates',
    region: 'Region',
    allRegions: 'All regions',
    regionLabels: {
      '': 'All regions',
      ...Object.fromEntries(regionKeys.map((k) => [k, regionLabelsEn()[k]])),
    },
    duration: 'Duration',
    durationLabels: {
      any: 'Any duration',
      '1': '1 Day',
      '2-3': '2–3 Days',
      '4-7': '4–7 Days',
      '8+': '8+ Days',
    },
    groupSize: 'Group size',
    groupSizeHint: 'Tours with future departures that fit your party',
    minRating: 'Minimum Rating',
    anyRating: 'Any rating',
    starsPlus: (r) => `${r}+ stars`,
    matchCount: (total) =>
      `${total} tour${total !== 1 ? 's' : ''} match your filters`,
  },
}

export const toursSearchMn: ToursSearchMessages = {
  sort: {
    popular: 'Ихэвчлэн сонгогддог',
    top_rated: 'Өндөр үнэлгээтэй',
    price_asc: 'Үнэ: багаас их рүү',
    price_desc: 'Үнэ: ихээс бага руу',
  },
  titleAll: 'Бүх аялал',
  titleInDestination: (dest) => `${dest} — аялал`,
  searching: 'Хайж байна…',
  resultsLine: (total) => `${total} аялал (хуваарьт хөдлөлттой)`,
  subline: 'Аялах өдрөө сонгож боломжтой аяллуудыг хараарай',
  filters: 'Шүүлтүүр',
  clearAll: 'Бүгдийг арилгах',
  clearDates: 'Огноо арилгах',
  mobileShowTours: (total) => `${total} аяллыг харуулах`,
  suspenseLoading: 'Ачаалж байна…',
  chipUnder: (money) => `${money}-оос бага`,
  chipStars: (n) => `${n}+ од`,
  chipGuests: (n) => `${n} зочин`,
  durationChip: {
    '1': '1 өдөр',
    '2-3': '2–3 өдөр',
    '4-7': '4–7 өдөр',
    '8+': '8+ өдөр',
  },
  regionChip: {
    gobi: 'Говь цөл',
    khangai: 'Хангайн нуруу',
    khuvsgul: 'Хөвсгөл нуур',
    ulaanbaatar: 'Улаанбаатар',
    altai: 'Алтайн нуруу',
    steppe: 'Тал нутаг',
  },
  grid: {
    errorTitle: 'Аялал ачаалагдсангүй',
    tryAgain: 'Дахин оролдох',
    emptyTitle: 'Аялал олдсонгүй',
    emptyBody: 'Одоогийн шүүлтүүрт таарах аялал алга. Хайлтаа өөрчлөх эсвэл шүүлтүүр цэвэрлэнэ үү.',
    clearFilters: 'Бүх шүүлтүүрийг арилгах',
    loadMoreButton: (shown, total) => `Дахин ачаалах (${shown} / ${total} харагдсан)`,
  },
  filterSidebar: {
    filters: 'Шүүлтүүр',
    reset: 'Дахин тохируулах',
    price: 'Үнэ (USD / хүн)',
    departureDates: 'Хөдлөх өдөр',
    departureHint: 'Хуваарьт хөдлөх өдрөөр шүүх',
    from: 'Эхлэх',
    to: 'Дуусах',
    clearDates: 'Огноо арилгах',
    region: 'Бүс нутаг',
    allRegions: 'Бүх бүс',
    regionLabels: {
      '': 'Бүх бүс',
      ...Object.fromEntries(regionKeys.map((k) => [k, regionLabelsMn()[k]])),
    },
    duration: 'Үргэлжлэх хугацаа',
    durationLabels: {
      any: 'Аль ч урттай',
      '1': '1 өдөр',
      '2-3': '2–3 өдөр',
      '4-7': '4–7 өдөр',
      '8+': '8+ өдөр',
    },
    groupSize: 'Бүлгийн хэмжээ',
    groupSizeHint: ' ',
    minRating: 'Доод үнэлгээ',
    anyRating: 'Аль ч үнэлгээ',
    starsPlus: (r) => `${r}+ од`,
    matchCount: (total) => `Таны шүүлтүүрт ${total} аялал таарлаа`,
  },
}

export const TOURS_SORT_ORDER: SortKey[] = ['popular', 'top_rated', 'price_asc', 'price_desc']
