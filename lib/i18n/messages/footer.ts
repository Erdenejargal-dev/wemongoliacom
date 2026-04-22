/**
 * Public site footer — columns, CTA, legal. Hrefs are stable; labels only.
 */

export type FooterLink = { href: string; label: string }
export type FooterColumn = { heading: string; links: FooterLink[] }

export type FooterMessages = {
  ctaTitle: string
  ctaSubtitle: string
  ctaButton: string
  brandTagline: string
  /** © {year} WeMongolia… — pass year from component */
  copyright: (year: number) => string
  legalNavAria: string
  sections: [FooterColumn, FooterColumn, FooterColumn, FooterColumn]
  legal: [FooterLink, FooterLink, FooterLink, FooterLink]
}

const href = {
  tours: '/tours',
  destinations: '/destinations',
  travelBoard: '/travel-board',
  howItWorks: '/how-it-works',
  onboarding: '/onboarding',
  business: '/dashboard/business',
  providerHelp: '/help/provider-guidelines',
  standards: '/help/standards',
  help: '/help',
  bookingHelp: '/help/bookings',
  trust: '/trust',
  cancellation: '/help/cancellation',
  about: '/about',
  mission: '/about#mission',
  partnerships: '/partnerships',
  contact: '/contact',
  terms: '/terms',
  privacy: '/privacy',
  cookies: '/cookies',
  sitemap: '/sitemap',
} as const

export const footerEn: FooterMessages = {
  ctaTitle: 'Ready to explore Mongolia?',
  ctaSubtitle:
    'Trusted tours, stays, and transport — from local hosts who know it best.',
  ctaButton: 'Start exploring',
  brandTagline: 'A more thoughtful way to explore Mongolia.',
  copyright: (year) =>
    `© ${year} WeMongolia, Inc. All rights reserved.`,
  legalNavAria: 'Legal',
  sections: [
    {
      heading: 'Explore',
      links: [
        { href: href.tours, label: 'Tours & Experiences' },
        { href: href.destinations, label: 'Destinations' },
        { href: href.travelBoard, label: 'Travel Planning' },
        { href: href.howItWorks, label: 'How It Works' },
      ],
    },
    {
      heading: 'Hosting',
      links: [
        { href: href.onboarding, label: 'Become a Host' },
        { href: href.business, label: 'Business Portal' },
        { href: href.providerHelp, label: 'Provider Resources' },
        { href: href.standards, label: 'Hosting Standards' },
      ],
    },
    {
      heading: 'Support',
      links: [
        { href: href.help, label: 'Help Center' },
        { href: href.bookingHelp, label: 'Booking Support' },
        { href: href.trust, label: 'Trust & Safety' },
        { href: href.cancellation, label: 'Cancellation Policy' },
      ],
    },
    {
      heading: 'Company',
      links: [
        { href: href.about, label: 'About' },
        { href: href.mission, label: 'Our Mission' },
        { href: href.partnerships, label: 'Partnerships' },
        { href: href.contact, label: 'Contact' },
      ],
    },
  ],
  legal: [
    { href: href.terms, label: 'Terms' },
    { href: href.privacy, label: 'Privacy' },
    { href: href.cookies, label: 'Cookies' },
    { href: href.sitemap, label: 'Sitemap' },
  ],
}

export const footerMn: FooterMessages = {
  ctaTitle: 'Монголыг нээх бэлтгэл үү?',
  ctaSubtitle:
    'Нутгийн эзэн хөтчөөс — аялал, буудал, тээврийн итгэлт сонголт.',
  ctaButton: 'Эхлэх',
  brandTagline: 'Монголыг сэтгэлтэйгээр нээ',
  copyright: (year) =>
    `© ${year} WeMongolia, Inc. Бүх эрх хуулийн дагуу хамгаалагдсан.`,
  legalNavAria: 'Хууль эрх зүй',
  sections: [
    {
      heading: 'Нээнэ үү',
      links: [
        { href: href.tours, label: 'Аялал, туршлага' },
        { href: href.destinations, label: 'Чиглэлүүд' },
        { href: href.travelBoard, label: 'Аяллын төлөвлөлт' },
        { href: href.howItWorks, label: 'Хэрхэн ажилладаг вэ' },
      ],
    },
    {
      heading: 'Зочлох зочид буудал',
      links: [
        { href: href.onboarding, label: 'Хөтөч болох' },
        { href: href.business, label: 'Бизнесийн портал' },
        { href: href.providerHelp, label: 'Үзүүлэгчийн нөөц' },
        { href: href.standards, label: 'Стандарт' },
      ],
    },
    {
      heading: 'Дэмжлэг',
      links: [
        { href: href.help, label: 'Тусламжийн төв' },
        { href: href.bookingHelp, label: 'Захиалгын тусламж' },
        { href: href.trust, label: 'Итгэлт, аюулгүй байдал' },
        { href: href.cancellation, label: 'Цуцлалтын бодлого' },
      ],
    },
    {
      heading: 'Байгууллага',
      links: [
        { href: href.about, label: 'Танилцуулга' },
        { href: href.mission, label: 'Эрхэм зорилго' },
        { href: href.partnerships, label: 'Түншлэл' },
        { href: href.contact, label: 'Холбоо барих' },
      ],
    },
  ],
  legal: [
    { href: href.terms, label: 'Нөхцөл' },
    { href: href.privacy, label: 'Нууцлал' },
    { href: href.cookies, label: 'Күүки' },
    { href: href.sitemap, label: 'Сайтын бүтэц' },
  ],
}
