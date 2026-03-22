export type TripStatus = 'Upcoming' | 'Completed' | 'Cancelled'

export type ListingType = 'tour' | 'vehicle' | 'accommodation'

export interface Trip {
  id: string
  bookingId: string
  listingType: ListingType
  listingSlug: string
  listingTitle: string
  location: string
  hostSlug: string
  hostName: string
  image: string
  date: string        // ISO date of tour start
  durationDays: number
  durationUnit: 'day' | 'night'
  guests: number
  price: number
  status: TripStatus
}

export const mockMyTrips: Trip[] = [
  {
    id: 'trip-101',
    bookingId: 'TABI-48231',
    listingType: 'tour',
    listingSlug: 'altai-eagle-hunter-expedition',
    listingTitle: 'Altai Eagle Hunter Expedition',
    location: 'Altai Mountains',
    hostSlug: 'altai-expeditions',
    hostName: 'Altai Expeditions',
    image: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=600',
    date: '2026-10-03',
    durationDays: 10,
    durationUnit: 'day',
    guests: 2,
    price: 2560,
    status: 'Upcoming',
  },
  {
    id: 'trip-102',
    bookingId: 'TABI-48290',
    listingType: 'tour',
    listingSlug: 'luxury-mongolia-grand-tour',
    listingTitle: 'Luxury Mongolia Grand Tour',
    location: 'Gobi Desert',
    hostSlug: 'gobi-adventure-tours',
    hostName: 'Gobi Adventure Tours',
    image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600',
    date: '2026-08-12',
    durationDays: 14,
    durationUnit: 'day',
    guests: 2,
    price: 3700,
    status: 'Upcoming',
  },
  {
    id: 'trip-103',
    bookingId: 'TABI-38812',
    listingType: 'tour',
    listingSlug: 'gobi-desert-camel-trek',
    listingTitle: 'Gobi Desert Camel Trek',
    location: 'Gobi Desert',
    hostSlug: 'gobi-adventure-tours',
    hostName: 'Gobi Adventure Tours',
    image: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600',
    date: '2025-09-10',
    durationDays: 4,
    durationUnit: 'day',
    guests: 2,
    price: 840,
    status: 'Completed',
  },
  {
    id: 'trip-104',
    bookingId: 'TABI-38800',
    listingType: 'tour',
    listingSlug: 'ulaanbaatar-city-culture-day',
    listingTitle: 'Ulaanbaatar City & Culture Day',
    location: 'Ulaanbaatar',
    hostSlug: 'ub-culture-tours',
    hostName: 'UB Culture Tours',
    image: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=600',
    date: '2025-09-08',
    durationDays: 1,
    durationUnit: 'day',
    guests: 2,
    price: 170,
    status: 'Completed',
  },
  {
    id: 'trip-105',
    bookingId: 'TABI-36411',
    listingType: 'tour',
    listingSlug: 'naadam-festival-special',
    listingTitle: 'Naadam Festival Special',
    location: 'Ulaanbaatar',
    hostSlug: 'ub-culture-tours',
    hostName: 'UB Culture Tours',
    image: 'https://images.unsplash.com/photo-1527004013197-933b6523d48e?w=600',
    date: '2025-07-11',
    durationDays: 3,
    durationUnit: 'day',
    guests: 2,
    price: 640,
    status: 'Completed',
  },
  {
    id: 'trip-106',
    bookingId: 'TABI-29901',
    listingType: 'tour',
    listingSlug: 'lake-khovsgol-horseback-expedition',
    listingTitle: 'Lake Khövsgöl Horseback Expedition',
    location: 'Lake Khövsgöl',
    hostSlug: 'northern-trails',
    hostName: 'Northern Trails Mongolia',
    image: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=600',
    date: '2025-06-15',
    durationDays: 7,
    durationUnit: 'day',
    guests: 1,
    price: 680,
    status: 'Cancelled',
  },
]
