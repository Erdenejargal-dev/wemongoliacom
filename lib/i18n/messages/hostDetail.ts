/**
 * Public host profile page (mock hosts) — breadcrumb + visible chrome.
 */

export type HostDetailMessages = {
  breadcrumbHosts: string
  aboutTitle: (name: string) => string
  toursBy: (name: string) => string
  browseAllTours: string
  tourMaxGuests: (n: number) => string
  perPersonSuffix: string
  quickFacts: string
  factType: string
  typeCompany: string
  typeGuide: string
  typeDriver: string
  typeProvider: string
  /** Badge next to host name */
  verifiedBadge: string
  linkWebsite: string
  /** e.g. "(12 reviews)" */
  reviewsWithCount: (n: number) => string
  /** Card footer: "3 tours" */
  toursOfferedCount: (n: number) => string
  factBasedIn: string
  factLanguages: string
  factExperienceLabel: string
  factExperience: (years: number) => string
  factGuestsServed: string
  atAGlance: string
  statYears: string
  statToursOffered: string
  statGuestsHosted: string
  statReviews: string
  reviewsTitle: string
  reviewsVerified: (n: number) => string
  reviewsOverall: string
  reviewTourLine: (tourName: string) => string
  contactWidgetTitle: (name: string) => string
  labelEmail: string
  labelPhone: string
  sendMessage: string
  respondsWithin: string
  modalMessageTitle: (name: string) => string
  messageSent: string
  messageSentSub: (name: string) => string
  formYourName: string
  formYourEmail: string
  yourMessage: string
  contactCancel: string
  contactSend: string
  sending: string
  placeholderContactName: string
  placeholderContactEmail: string
  placeholderContactMessage: string
  sendMessageButton: string
}

export const hostDetailEn: HostDetailMessages = {
  breadcrumbHosts: 'Hosts',
  aboutTitle: (name) => `About ${name}`,
  toursBy: (name) => `Tours by ${name}`,
  browseAllTours: 'Browse all tours',
  tourMaxGuests: (n) => `Max ${n} guests`,
  perPersonSuffix: '/p',
  quickFacts: 'Quick Facts',
  factType: 'Type',
  typeCompany: 'Tour Company',
  typeGuide: 'Private Guide',
  typeDriver: 'Driver & Guide',
  typeProvider: 'Experience Provider',
  verifiedBadge: 'Verified',
  linkWebsite: 'Website',
  reviewsWithCount: (n) => `(${n} review${n === 1 ? '' : 's'})`,
  toursOfferedCount: (n) => (n === 1 ? '1 tour' : `${n} tours`),
  factBasedIn: 'Based in',
  factLanguages: 'Languages',
  factExperienceLabel: 'Experience',
  factExperience: (y) => `${y}+ years`,
  factGuestsServed: 'Guests served',
  atAGlance: 'At a Glance',
  statYears: 'Years Experience',
  statToursOffered: 'Tours Offered',
  statGuestsHosted: 'Guests Hosted',
  statReviews: 'Reviews',
  reviewsTitle: 'Guest reviews',
  reviewsVerified: (n) => `${n} verified reviews`,
  reviewsOverall: 'Overall',
  reviewTourLine: (tourName) => `Tour: ${tourName}`,
  contactWidgetTitle: (name) => `Contact ${name}`,
  labelEmail: 'Email',
  labelPhone: 'Phone',
  sendMessage: 'Send a Message',
  respondsWithin: 'Usually replies within 24 hours',
  modalMessageTitle: (name) => `Message ${name}`,
  messageSent: 'Message sent',
  messageSentSub: (name) => `${name} will get back to you within 24 hours.`,
  formYourName: 'Your Name',
  formYourEmail: 'Your Email',
  yourMessage: 'Message',
  contactCancel: 'Cancel',
  contactSend: 'Send',
  sending: 'Sending…',
  placeholderContactName: 'Jane Smith',
  placeholderContactEmail: 'you@example.com',
  placeholderContactMessage: "Hi! I'm interested in your tours and have a few questions…",
  sendMessageButton: 'Send Message',
}

export const hostDetailMn: HostDetailMessages = {
  breadcrumbHosts: 'Зохион байгуулагчид',
  aboutTitle: (name) => `${name} — танилцуулга`,
  toursBy: (name) => `${name}-ийн аяллууд`,
  browseAllTours: 'Бүх аялал үзэх',
  tourMaxGuests: (n) => `Дээд тал нь ${n} зочин`,
  perPersonSuffix: '/хүн',
  quickFacts: 'Товч мэдээлэл',
  factType: 'Төрөл',
  typeCompany: 'Аяллын компани',
  typeGuide: 'Хувийн хөтөч',
  typeDriver: 'Жолооч & хөтөч',
  typeProvider: 'Туршлага үйлчилгээ',
  verifiedBadge: 'Баталгаажсан',
  linkWebsite: 'Вэбсайт',
  reviewsWithCount: (n) => `(${n} сэтгэгдэл)`,
  toursOfferedCount: (n) => `${n} аялал`,
  factBasedIn: 'База',
  factLanguages: 'Хэл',
  factExperienceLabel: 'Туршлага',
  factExperience: (y) => `${y}+ жил`,
  factGuestsServed: 'Үйлчлэсэн зочин',
  atAGlance: 'Товчоор',
  statYears: 'Ажлын жил',
  statToursOffered: 'Санал болгож буй аялал',
  statGuestsHosted: 'Зочилсон',
  statReviews: 'Сэтгэгдэл',
  reviewsTitle: 'Зочдын сэтгэгдэл',
  reviewsVerified: (n) => `Баталгаажсан ${n} сэтгэгдэл`,
  reviewsOverall: 'Нийт',
  reviewTourLine: (tourName) => `Аялал: ${tourName}`,
  contactWidgetTitle: (name) => `${name}-той холбогдох`,
  labelEmail: 'Имэйл',
  labelPhone: 'Утас',
  sendMessage: 'Мессеж илгээх',
  respondsWithin: '24 цагийн дотор ихэвчлэн хариулдаг',
  modalMessageTitle: (name) => `${name} руу мессеж`,
  messageSent: 'Илгээгдлээ',
  messageSentSub: (name) => `${name} 24 цагийн дотор холбогдоно.`,
  formYourName: 'Таны нэр',
  formYourEmail: 'Таны имэйл',
  yourMessage: 'Мессеж',
  contactCancel: 'Цуцлах',
  contactSend: 'Илгээх',
  sending: 'Илгээж байна…',
  placeholderContactName: 'Батбаяр Б.',
  placeholderContactEmail: 'you@example.com',
  placeholderContactMessage: 'Сайн байна уу! Аяллын талаар асуух зүйл байна…',
  sendMessageButton: 'Мессеж илгээх',
}
