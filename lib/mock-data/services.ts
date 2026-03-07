export type ServiceStatus = 'active' | 'draft' | 'paused'

export interface Service {
  id: string
  title: string
  description: string
  price: number
  duration: string
  location: string
  groupSize: number
  status: ServiceStatus
  totalBookings: number
  rating: number
  images: string[]
  includedItems: string[]
  available: boolean
  category: string
}

export const mockServices: Service[] = [
  {
    id: 's1',
    title: 'Gobi Desert Adventure',
    description: 'A 5-day journey through the stunning Gobi Desert with camel riding and stargazing.',
    price: 450,
    duration: '5 days',
    location: 'Gobi Desert, South Mongolia',
    groupSize: 12,
    status: 'active',
    totalBookings: 87,
    rating: 4.8,
    images: [],
    includedItems: ['Meals', 'Accommodation', 'Guide', 'Transport'],
    available: true,
    category: 'Adventure',
  },
  {
    id: 's2',
    title: 'Khövsgöl Lake Trek',
    description: 'Hike around the crystal-clear Khövsgöl Lake with a certified local guide.',
    price: 320,
    duration: '3 days',
    location: 'Khövsgöl Province',
    groupSize: 8,
    status: 'active',
    totalBookings: 54,
    rating: 4.9,
    images: [],
    includedItems: ['Meals', 'Camping gear', 'Guide'],
    available: true,
    category: 'Trekking',
  },
  {
    id: 's3',
    title: 'Naadam Festival Tour',
    description: 'Experience the traditional Mongolian Naadam Festival with cultural activities.',
    price: 280,
    duration: '2 days',
    location: 'Ulaanbaatar',
    groupSize: 20,
    status: 'paused',
    totalBookings: 130,
    rating: 4.7,
    images: [],
    includedItems: ['Festival tickets', 'Traditional meals', 'Guide'],
    available: false,
    category: 'Cultural',
  },
  {
    id: 's4',
    title: 'Eagle Hunting Experience',
    description: 'Learn the ancient art of eagle hunting with a Kazakh eagle hunter family.',
    price: 550,
    duration: '4 days',
    location: 'Bayan-Ölgii Province',
    groupSize: 6,
    status: 'active',
    totalBookings: 32,
    rating: 5.0,
    images: [],
    includedItems: ['Homestay', 'All meals', 'Eagle hunting demo', 'Guide'],
    available: true,
    category: 'Cultural',
  },
  {
    id: 's5',
    title: 'Ulaanbaatar City Tour',
    description: 'A full-day tour of Mongolia\'s vibrant capital city.',
    price: 80,
    duration: '1 day',
    location: 'Ulaanbaatar',
    groupSize: 15,
    status: 'draft',
    totalBookings: 0,
    rating: 0,
    images: [],
    includedItems: ['Transport', 'Guide', 'Lunch'],
    available: false,
    category: 'City Tour',
  },
]
