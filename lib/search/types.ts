export interface Tour {
  id: string
  title: string
  location: string
  region: string
  regionSlug: string        // matches hero region select values
  price: number
  duration: string
  durationDays: number
  rating: number
  reviewCount: number
  maxGuests: number
  groupSize: 'private' | 'small' | 'group'
  style: 'adventure' | 'cultural' | 'luxury' | 'budget' | 'photography' | 'trekking'
  experienceTypes: string[] // matches hero experience type values
  images: string[]
  shortDescription: string
  highlights: string[]
  included: string[]
  available: boolean
}

export interface SearchQuery {
  destination: string
  startDate: string
  endDate: string
  guests: { adults: number; children: number }
  priceRange: [number, number]
  durationFilter: string   // 'any' | '1' | '2-3' | '4-7' | '8+'
  rating: number           // min rating 0-5
  style: string            // 'any' | adventure | cultural | ...
  region: string           // hero region slug or ''
  experienceType: string   // hero experience type or ''
  sortBy: 'price_asc' | 'price_desc' | 'top_rated' | 'popular'
}

export const DEFAULT_QUERY: SearchQuery = {
  destination: '',
  startDate: '',
  endDate: '',
  guests: { adults: 1, children: 0 },
  priceRange: [0, 2000],
  durationFilter: 'any',
  rating: 0,
  style: 'any',
  region: '',
  experienceType: '',
  sortBy: 'popular',
}

export const DESTINATIONS = [
  'Ulaanbaatar',
  'Gobi Desert',
  'Lake Khövsgöl',
  'Terelj National Park',
  'Orkhon Valley',
  'Altai Mountains',
  'Khentii Province',
  'Erdene Zuu Monastery',
  'Flaming Cliffs (Bayanzag)',
  'Khorgo-Terkhiin Tsagaan Nuur',
]
