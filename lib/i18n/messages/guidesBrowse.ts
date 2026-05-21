export type GuidesBrowseMessages = {
  heroKicker:         string
  heroTitleLine1:     string
  heroTitleLine2:     string
  heroSubtitle:       string
  heroImageAlt:       string
  searchPlaceholder:  string
  filterAll:          string
  filterWildlife:     string
  filterTrekking:     string
  filterCultural:     string
  filterPhotography:  string
  filterBirdWatching: string
  filterWinter:       string
  filterFishing:      string
  filterHistory:      string
  filterAdventure:    string
  certifiedToggle:    string
  guideCount:         (n: number) => string
  noResultsTitle:     string
  noResultsHint:      string
  clearFilters:       string
  sortRating:         string
  sortNewest:         string
  sortExperience:     string
  ctaTitle:           string
  ctaSub:             string
  ctaButton:          string
  perDay:             string
  yearsExp:           (n: number) => string
  certifiedBadge:     string
  verifiedBadge:      string
}

export const guidesBrowseEn: GuidesBrowseMessages = {
  heroKicker:         'Licensed Local Guides',
  heroTitleLine1:     'Meet Mongolia\'s',
  heroTitleLine2:     'Expert Guides',
  heroSubtitle:       'Individual licensed guides for wildlife, culture, trekking, photography, and more — curated and verified.',
  heroImageAlt:       'Mongolia guide with travelers in the steppe',
  searchPlaceholder:  'Search by name or location…',
  filterAll:          'All Specialties',
  filterWildlife:     'Wildlife',
  filterTrekking:     'Trekking',
  filterCultural:     'Cultural',
  filterPhotography:  'Photography',
  filterBirdWatching: 'Bird Watching',
  filterWinter:       'Winter',
  filterFishing:      'Fishing',
  filterHistory:      'History',
  filterAdventure:    'Adventure',
  certifiedToggle:    'Certified only',
  guideCount:         (n) => `${n} guide${n !== 1 ? 's' : ''}`,
  noResultsTitle:     'No guides found',
  noResultsHint:      'Try adjusting your specialty filter or search',
  clearFilters:       'Clear filters',
  sortRating:         'Top rated',
  sortNewest:         'Newest',
  sortExperience:     'Most experienced',
  ctaTitle:           'Are you a licensed guide?',
  ctaSub:             'Join WeMongolia and connect with travelers looking for authentic local expertise.',
  ctaButton:          'Register as a Guide',
  perDay:             '/ day',
  yearsExp:           (n) => `${n} yr${n !== 1 ? 's' : ''} exp.`,
  certifiedBadge:     'Certified',
  verifiedBadge:      'Verified',
}

export const guidesBrowseMn: GuidesBrowseMessages = {
  heroKicker:         'Аяллын баталгаатай хамтрагчид',
  heroTitleLine1:     'Монгол дахь',
  heroTitleLine2:     'Найдвартай аяллын хамтрагчид',
  heroSubtitle:       'Байгаль судлал, соёл, тур, зураг авалт болон бусад чиглэлийн найдвартай хөтчүүд.',
  heroImageAlt:       'Монгол орныг найдвартай зааварлагчийн хамтаар аялаарай',
  searchPlaceholder:  'Нэр, байршлаар хайх…',
  filterAll:          'Бүх чиглэл',
  filterWildlife:     'Амьтан судлал',
  filterTrekking:     'Треккинг',
  filterCultural:     'Соёл',
  filterPhotography:  'Гэрэл зураг',
  filterBirdWatching: 'Ховор амьтад үзэх',
  filterWinter:       'Өвөл',
  filterFishing:      'Загас агнах',
  filterHistory:      'Түүхэн',
  filterAdventure:    'Адал явдалт',
  certifiedToggle:    'WeMongolia-р баталгаажсан',
  guideCount:         (n) => `${n} хөтөч`,
  noResultsTitle:     'Хөтөч олдсонгүй',
  noResultsHint:      'Чиглэл эсвэл хайлтаа өөрчлөн оролдоно уу',
  clearFilters:       'Шүүлтүүрийг арилгах',
  sortRating:         'Үнэлгээгээр',
  sortNewest:         'Шинэ',
  sortExperience:     'Туршлагатай',
  ctaTitle:           'Бидэнтэй нэгдэх ?',
  ctaSub:             'WeMongolia-д нэгдэж, аялагчидтай холбогдоно уу.',
  ctaButton:          'Хөтчөөр бүртгүүлэх',
  perDay:             '/ өдөр',
  yearsExp:           (n) => `${n} жил туршлага`,
  certifiedBadge:     'Лицензтэй',
  verifiedBadge:      'Баталгаажсан',
}
