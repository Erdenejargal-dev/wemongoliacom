/**
 * lib/api/tours.ts
 * Frontend API helpers for Tours endpoints.
 * Maps backend response shapes → frontend Tour type used by TourCard / TourGrid.
 */

import { apiClient, type Paginated } from './client'

// ── Backend response shapes ───────────────────────────────────────────────

export interface BackendTour {
  id: string
  slug: string
  title: string
  shortDescription?: string
  category?: string
  basePrice: number
  currency: string
  durationDays?: number
  difficulty?: string
  ratingAverage: number
  reviewsCount: number
  featured?: boolean
  images: { imageUrl: string }[]
  provider?: { id: string; name: string; slug: string }
  destination?: { id: string; name: string; slug: string }
}

export interface BackendTourDetail extends BackendTour {
  description?: string | null
  maxGuests: number
  minGuests: number
  languages: string[]
  pickupIncluded: boolean
  cancellationPolicy?: string | null
  experienceType?: string | null
  meetingPoint?: string | null
  durationNights?: number | null

  images: { imageUrl: string; altText?: string | null; sortOrder: number }[]
  itinerary: { dayNumber: number; title: string; description?: string | null; overnightLocation?: string | null }[]
  includedItems: { label: string }[]
  excludedItems: { label: string }[]
  departures?: BackendDeparture[]
}

export interface BackendDeparture {
  id: string
  startDate: string
  endDate?: string
  availableSeats: number
  bookedSeats?: number
  priceOverride?: number | null
  currency?: string
  status: string
}

// ── Mapper: BackendTour → frontend Tour (lib/search/types.ts) ─────────────

export function mapTour(t: BackendTour) {
  return {
    id: t.id,
    slug: t.slug,
    destinationSlug: t.destination?.name?.toLowerCase().replace(/\s+/g, '-') ?? '',
    hostSlug: t.provider?.slug ?? '',
    title: t.title,
    location: t.destination?.name ?? 'Mongolia',
    region: t.destination?.name ?? '',
    regionSlug: '',
    price: t.basePrice,
    duration: t.durationDays ? `${t.durationDays} day${t.durationDays > 1 ? 's' : ''}` : '',
    durationDays: t.durationDays ?? 0,
    rating: t.ratingAverage,
    reviewCount: t.reviewsCount,
    maxGuests: 12,
    groupSize: 'group' as const,
    style: 'adventure' as const,
    experienceTypes: [],
    images: t.images.map(i => i.imageUrl),
    shortDescription: t.shortDescription ?? '',
    highlights: [],
    included: [],
    available: true,
  }
}

// ── Query params ───────────────────────────────────────────────────────────

export interface TourListParams {
  q?: string
  destinationId?: string
  minPrice?: number
  maxPrice?: number
  difficulty?: string
  minDays?: number
  maxDays?: number
  /**
   * The /tours endpoint uses `sort`, NOT `sortBy`.
   * (search.service uses `sortBy` — these are different endpoints.)
   */
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular'
  page?: number
  limit?: number
}

function toQS(params: Record<string, string | number | undefined>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== '' && v !== null)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&')
  return q ? `?${q}` : ''
}

// ── API functions ──────────────────────────────────────────────────────────

export async function fetchTours(params: TourListParams = {}): Promise<Paginated<BackendTour>> {
  const qs = toQS(params as Record<string, string | number | undefined>)
  return apiClient.get<Paginated<BackendTour>>(`/tours${qs}`)
}

export async function fetchTourBySlug(slug: string): Promise<BackendTourDetail | null> {
  try {
    return await apiClient.get<BackendTourDetail>(`/tours/${slug}`)
  } catch {
    return null
  }
}

export async function fetchTourDepartures(tourId: string): Promise<BackendDeparture[]> {
  try {
    return await apiClient.get<BackendDeparture[]>(`/tours/${tourId}/departures`)
  } catch {
    return []
  }
}
