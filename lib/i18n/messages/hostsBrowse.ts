/**
 * Public /hosts directory — listing page hero, filters, empty state, CTA.
 */

export type HostsBrowseMessages = {
  heroKicker: string
  /** First line of H1 (before &lt;br /&gt;) */
  heroTitleLine1: string
  /** Second line of H1 */
  heroTitleLine2: string
  heroSubtitle: string
  heroImageAlt: string
  searchPlaceholder: string
  featuredSection: string
  filterAll: string
  filterCompany: string
  filterGuide: string
  filterExperience: string
  filterDriver: string
  clearAll: string
  hostCount: (n: number) => string
  noResultsTitle: string
  noResultsHint: string
  clearFilters: string
  ctaTitle: string
  ctaSub: string
  ctaButton: string
}

export const hostsBrowseEn: HostsBrowseMessages = {
  heroKicker: 'Verified Operators',
  heroTitleLine1: 'Tour Guides &',
  heroTitleLine2: 'Local Operators',
  heroSubtitle: 'Trusted local guides and operators for real Mongolia experiences — from the steppe to the mountains.',
  heroImageAlt: 'Tour guides and operators',
  searchPlaceholder: 'Search by name or location…',
  featuredSection: 'Featured Operators',
  filterAll: 'All Types',
  filterCompany: 'Tour Companies',
  filterGuide: 'Private Guides',
  filterExperience: 'Experience Providers',
  filterDriver: 'Driver Guides',
  clearAll: 'Clear all',
  hostCount: (n) => `${n} host${n !== 1 ? 's' : ''}`,
  noResultsTitle: 'No hosts found',
  noResultsHint: 'Try adjusting your search or filter',
  clearFilters: 'Clear filters',
  ctaTitle: 'Are you a local guide or operator?',
  ctaSub: 'List your tours on WeMongolia and reach travelers who are ready to book.',
  ctaButton: 'Register as a Host',
}

export const hostsBrowseMn: HostsBrowseMessages = {
  heroKicker: 'Баталгаажсан операторууд',
  heroTitleLine1: 'Аяллын хөтөч',
  heroTitleLine2: 'болон орон нутгийн түншүүд',
  heroSubtitle: 'Степь, нуруу — Монголыг бодитоор мэдэрсэн итгэлт хөтөч, аяллын компанийн сонголт.',
  heroImageAlt: 'Аяллын хөтөч, операторууд',
  searchPlaceholder: 'Нэр, байршлаар хайх…',
  featuredSection: 'Онцлох операторууд',
  filterAll: 'Бүх төрөл',
  filterCompany: 'Аяллын компани',
  filterGuide: 'Хувийн хөтөч',
  filterExperience: 'Туршлага үйлчилгээ',
  filterDriver: 'Жолооч & хөтөч',
  clearAll: 'Бүгдийг арилгах',
  hostCount: (n) => `${n} зохион байгуулагч`,
  noResultsTitle: 'Үр дүн олдсонгүй',
  noResultsHint: 'Хайлт эсвэл шүүлтүүрээ өөрчлөн оролдоно уу',
  clearFilters: 'Шүүлтүүрийг арилгах',
  ctaTitle: 'Орон нутгийн хөтөч, оператор мөн үү?',
  ctaSub: 'Платформд нэгдэж, дэлхий даяах аялагчтай холбогдоно уу.',
  ctaButton: 'Зохион байгуулагч болон бүртгүүлэх',
}
