export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  country: string
  avatar: string
  bio: string
  memberSince: string
}

export type TripStatus = 'Upcoming' | 'Completed' | 'Cancelled'

export interface UserTrip {
  id: string
  tourSlug: string
  tourTitle: string
  tourImage: string
  date: string
  guests: number
  price: number
  /** Currency for `price` (MNT | USD). Optional for legacy mocks. */
  currency?: string
  bookingId: string
  status: TripStatus
}

export interface UserReview {
  id: string
  tourSlug: string
  tourTitle: string
  tourImage: string
  rating: number
  comment: string
  date: string
}

export const mockUser: UserProfile = {
  id: 'user-1',
  firstName: 'Alex',
  lastName: 'Morgan',
  email: 'alex.morgan@example.com',
  phone: '+1 555 234 5678',
  country: 'United States',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
  bio: 'Adventure traveler passionate about authentic cultural experiences and off-the-beaten-path destinations. Mongolia has been on my bucket list for years!',
  memberSince: '2024-03-01',
}

export const mockTrips: UserTrip[] = [
  {
    id: 'trip-1',
    tourSlug: 'altai-eagle-hunter-expedition',
    tourTitle: 'Altai Eagle Hunter Expedition',
    tourImage: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=600',
    date: '2026-10-03',
    guests: 2,
    price: 2560,
    bookingId: 'TABI-48231',
    status: 'Upcoming',
  },
  {
    id: 'trip-2',
    tourSlug: 'gobi-desert-camel-trek',
    tourTitle: 'Gobi Desert Camel Trek',
    tourImage: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600',
    date: '2025-09-10',
    guests: 2,
    price: 840,
    bookingId: 'TABI-38812',
    status: 'Completed',
  },
  {
    id: 'trip-3',
    tourSlug: 'ulaanbaatar-city-culture-day',
    tourTitle: 'Ulaanbaatar City & Culture Day',
    tourImage: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=600',
    date: '2025-09-08',
    guests: 2,
    price: 170,
    bookingId: 'TABI-38800',
    status: 'Completed',
  },
  {
    id: 'trip-4',
    tourSlug: 'lake-khovsgol-horseback-expedition',
    tourTitle: 'Lake Khövsgöl Horseback Expedition',
    tourImage: 'https://images.unsplash.com/photo-1549880338-65ddcdfd017b?w=600',
    date: '2025-06-15',
    guests: 1,
    price: 680,
    bookingId: 'TABI-29901',
    status: 'Cancelled',
  },
]

export const mockReviews: UserReview[] = [
  {
    id: 'rev-1',
    tourSlug: 'gobi-desert-camel-trek',
    tourTitle: 'Gobi Desert Camel Trek',
    tourImage: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=600',
    rating: 5,
    comment: 'One of the most extraordinary experiences of my life. Our guide Batmunkh was knowledgeable and warm, the camel trek at sunrise was breathtaking, and the ger camp under the stars was simply magic. Already planning to come back.',
    date: '2025-09-18',
  },
  {
    id: 'rev-2',
    tourSlug: 'ulaanbaatar-city-culture-day',
    tourTitle: 'Ulaanbaatar City & Culture Day',
    tourImage: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=600',
    rating: 4,
    comment: 'A great introduction to Mongolian history and culture. The Gandantegchinlen Monastery was stunning. Would have liked slightly more time at the Narantuul Market, but overall an excellent day tour.',
    date: '2025-09-10',
  },
]
