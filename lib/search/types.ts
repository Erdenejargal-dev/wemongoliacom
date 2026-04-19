import type { Pricing } from '@/lib/pricing'

export interface Tour {
  id: string
  slug: string              // URL-friendly identifier
  destinationSlug: string   // matches destination page slugs
  hostSlug: string          // matches host profile page slugs
  title: string
  location: string
  region: string
  regionSlug: string        // matches hero region select values
  price: number
  /** Currency for `price` — 'MNT' or 'USD' (backend-sourced; defaults to 'USD' in legacy fixtures). */
  currency: string
  /**
   * Phase 2/6.2 — normalized pricing DTO from the backend so the card can
   * format in the user's display currency (MNT↔USD) without reaching for
   * a per-request FX call. `null`/absent when the backend has no rate
   * seeded or when the source is a legacy fixture.
   */
  pricing?: Pricing | null
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
  fromDate: string   // Earliest departure date (YYYY-MM-DD) — filters by real departure dates
  toDate: string     // Latest departure date (YYYY-MM-DD)
  guests: { adults: number; children: number }
  priceRange: [number, number]
  durationFilter: string   // 'any' | '1' | '2-3' | '4-7' | '8+'
  rating: number           // min rating 0-5
  style: string            // 'any' | adventure | cultural | ... (deprecated, kept for type compatibility)
  region: string           // hero region slug or ''
  experienceType: string   // hero experience type or '' (deprecated)
  sortBy: 'price_asc' | 'price_desc' | 'top_rated' | 'popular'
  page: number             // for pagination / load more
}

export const DEFAULT_QUERY: SearchQuery = {
  destination: '',
  fromDate: '',
  toDate: '',
  guests: { adults: 1, children: 0 },
  priceRange: [0, 2000],
  durationFilter: 'any',
  rating: 0,
  style: 'any',
  region: '',
  experienceType: '',
  sortBy: 'popular',
  page: 1,
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
