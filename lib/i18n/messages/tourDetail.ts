/**
 * Tour detail page + tour-specific child components (itinerary, location, booking card extras).
 */

export type TourDetailMessages = {
  defaultRegionName: string
  durationDays: (n: number) => string
  maxGuests: (n: number) => string
  /** e.g. "(12 reviews)" in metadata row and booking card */
  reviewCount: (n: number) => string
  sectionTourInfo: string
  sectionHighlights: string
  highlightsPlaceholder: string
  sectionItinerary: string
  itineraryEmpty: string
  sectionIncluded: string
  includedHeading: string
  notIncludedHeading: string
  noIncludedItems: string
  noExcludedItems: string
  sectionReviews: string
  reviewsPlaceholder: string
  contactCardTitle: string
  contactCardWithProvider: (name: string) => string
  contactCardGeneric: string
  contactCtaButton: string
  infoDuration: string
  infoGroupSize: string
  infoExperience: string
  infoDifficulty: string
  infoLanguage: string
  infoPickup: string
  pickupYes: string
  pickupNo: string
  uiEmDash: string
  /** Tour location section */
  locationTitle: string
  locationProvincesMany: string
  locationProvinceOne: string
  locationRegion: string
  locationDestination: string
  locationMeetingPoint: string
  locationOpenMaps: string
  locationMultiProvinceNote: string
  /** Itinerary accordion */
  itineraryExpandAll: string
  itineraryCollapseAll: string
  itineraryDay: (day: number) => string
  /** Booking card duration line when public copy is not used */
  bookingDurationSummary: (n: number) => string
}

export const tourDetailEn: TourDetailMessages = {
  defaultRegionName: 'Mongolia',
  durationDays: (n) => (n === 1 ? '1 day' : `${n} days`),
  maxGuests: (n) => `Up to ${n} guests`,
  reviewCount: (n) => `(${n} review${n === 1 ? '' : 's'})`,
  sectionTourInfo: 'Tour Information',
  sectionHighlights: 'Tour Highlights',
  highlightsPlaceholder: 'The host will add trip highlights here.',
  sectionItinerary: 'Day-by-day itinerary',
  itineraryEmpty: 'Full itinerary coming soon.',
  sectionIncluded: "What's Included",
  includedHeading: 'Included',
  notIncludedHeading: 'Not Included',
  noIncludedItems: 'No included items listed yet.',
  noExcludedItems: 'No excluded items listed yet.',
  sectionReviews: 'Traveler Reviews',
  reviewsPlaceholder: 'Reviews will appear here once the reviews API is connected to tour pages.',
  contactCardTitle: 'Have questions?',
  contactCardWithProvider: (name) =>
    `Message ${name} — most hosts reply within a few hours.`,
  contactCardGeneric: 'We usually reply within a few hours.',
  contactCtaButton: 'Message',
  infoDuration: 'Duration',
  infoGroupSize: 'Group Size',
  infoExperience: 'Experience',
  infoDifficulty: 'Difficulty',
  infoLanguage: 'Language',
  infoPickup: 'Pickup',
  pickupYes: 'Included',
  pickupNo: 'Not included',
  uiEmDash: '—',
  locationTitle: 'Location & Coverage',
  locationProvincesMany: 'Provinces covered',
  locationProvinceOne: 'Province',
  locationRegion: 'Region',
  locationDestination: 'Destination',
  locationMeetingPoint: 'Meeting point',
  locationOpenMaps: 'Open in Google Maps',
  locationMultiProvinceNote:
    'This tour visits multiple provinces. Specific places and the full route are described in the itinerary below.',
  itineraryExpandAll: 'Expand all',
  itineraryCollapseAll: 'Collapse all',
  itineraryDay: (day) => `Day ${day}`,
  bookingDurationSummary: (n) => (n === 1 ? '1 day' : `${n} days`),
}

export const tourDetailMn: TourDetailMessages = {
  defaultRegionName: 'Монгол',
  durationDays: (n) => `${n} хоног`,
  maxGuests: (n) => `Хамгийн ихдээ ${n} зочин`,
  reviewCount: (n) => `(${n} сэтгэгдэл)`,
  sectionTourInfo: 'Аяллын мэдээлэл',
  sectionHighlights: 'Онцлохууд',
  highlightsPlaceholder: 'Аяллын эзэн тун удахгүй онцлогуудаа оруулна.',
  sectionItinerary: 'Өдөр бүрийн хөтөч',
  itineraryEmpty: 'Дэлгэрэнгүй хөтөч бэлэн болоход дөхөж байна.',
  sectionIncluded: 'Юу багтсан',
  includedHeading: 'Багтсан',
  notIncludedHeading: 'Багтаагүй',
  noIncludedItems: 'Одоогоор багтсан зүйл бүртгэгдээгүй.',
  noExcludedItems: 'Одоогоор багтаагүй зүйл бүртгэгдээгүй.',
  sectionReviews: 'Зочдын сэтгэгдэл',
  reviewsPlaceholder: 'Сэтгэгдэл одоогоор алга. Та эхний зочноор туршлагаа хуваалцана уу.',
  contactCardTitle: 'Асуулт байна уу?',
  contactCardWithProvider: (name) =>
    `${name}-д бичнэ үү — ихэвчлэн хэдэн цагийн дотор хариулдаг.`,
  contactCardGeneric: 'Ихэвчлэн хэдэн цагийн дотор хариулдаг.',
  contactCtaButton: 'Мессеж бичих',
  infoDuration: 'Үргэлжлэх хугацаа',
  infoGroupSize: 'Багийн хэмжээ',
  infoExperience: 'Төрөл',
  infoDifficulty: 'Хэцүү ачаалал',
  infoLanguage: 'Хэл',
  infoPickup: 'Очиж авах',
  pickupYes: 'Багтсан',
  pickupNo: 'Багтаагүй',
  uiEmDash: '—',
  locationTitle: 'Байршил, хамрах хүрээ',
  locationProvincesMany: 'Хамрах аймаг/нутаг',
  locationProvinceOne: 'Аймаг',
  locationRegion: 'Бүс',
  locationDestination: 'Чиглэл',
  locationMeetingPoint: 'Уулзах цэг',
  locationOpenMaps: 'Google Maps-д нээх',
  locationMultiProvinceNote:
    'Энэ аялал олон аймаг/нутаг дээр хийгдэнэ. Дэлгэрэнгүйг өдөр бүрийн хөтөчнөөс үзнэ үү.',
  itineraryExpandAll: 'Бүгдийг нээх',
  itineraryCollapseAll: 'Бүгдийг хаах',
  itineraryDay: (day) => `${day} өдөр`,
  bookingDurationSummary: (n) => `${n} хоног`,
}
