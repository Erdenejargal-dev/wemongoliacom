/**
 * lib/api/stays.ts
 * Public frontend API helpers for the /stays (accommodations) endpoint.
 * Backed by backend/src/routes/accommodation.routes.ts
 *
 * AccommodationType enum values (from Prisma schema):
 *   ger_camp | hotel | lodge | guesthouse | resort | hostel | homestay
 */

import { apiClient, type Paginated } from './client'

// ── Shared types ──────────────────────────────────────────────────────────

export type AccommodationType =
  | 'ger_camp'
  | 'hotel'
  | 'lodge'
  | 'guesthouse'
  | 'resort'
  | 'hostel'
  | 'homestay'

/** Human-readable labels for each accommodation type */
export const ACCOMMODATION_TYPE_LABELS: Record<AccommodationType, string> = {
  ger_camp:   'Ger Camp',
  hotel:      'Hotel',
  lodge:      'Lodge',
  guesthouse: 'Guesthouse',
  resort:     'Resort',
  hostel:     'Hostel',
  homestay:   'Homestay',
}

// ── List endpoint response shape (GET /stays) ─────────────────────────────

export interface BackendStay {
  id: string
  slug: string
  name: string
  description: string | null
  accommodationType: AccommodationType
  starRating: number | null
  ratingAverage: number
  reviewsCount: number
  checkInTime: string | null
  checkOutTime: string | null
  amenities: string[]
  images: { imageUrl: string }[]
  provider: { name: string; slug: string; logoUrl: string | null; city: string | null } | null
  destination: { name: string; slug: string } | null
  /** Up to 3 room types returned by the list endpoint (no availability data). */
  roomTypes: {
    id: string
    name: string
    maxGuests: number
    basePricePerNight: number
    currency: string
  }[]
}

// ── Detail endpoint response shape (GET /stays/:slug) ─────────────────────

export interface BackendStayRoomAvailability {
  date: string          // ISO date string
  availableUnits: number
  status: string
}

export interface BackendStayRoomType {
  id: string
  accommodationId: string
  name: string
  description: string | null
  maxGuests: number
  bedType: string | null
  quantity: number
  basePricePerNight: number
  currency: string
  amenities: string[]
  /** Next ~60 days of availability returned by the detail endpoint. */
  availability: BackendStayRoomAvailability[]
}

export interface BackendStayDetail extends Omit<BackendStay, 'roomTypes' | 'images' | 'provider'> {
  address: string | null
  city: string | null
  region: string | null
  latitude: number | null
  longitude: number | null
  cancellationPolicy: string | null
  provider: {
    id: string
    name: string
    slug: string
    logoUrl: string | null
    city: string | null
    ratingAverage: number
    reviewsCount: number
  } | null
  /** Full image list ordered by sortOrder */
  images: { id: string; imageUrl: string; altText: string | null; sortOrder: number }[]
  /** Full room types with availability data */
  roomTypes: BackendStayRoomType[]
}

// ── Query params ──────────────────────────────────────────────────────────

export interface StayListParams {
  destinationId?: string
  /** Single type filter (backward compatible). */
  accommodationType?: AccommodationType
  /**
   * Multi-type filter — frontend passes an array, toQS converts it to a
   * comma-separated string sent as ?accommodationTypes=ger_camp,resort.
   * Backend splits and applies { in: [...] }.
   */
  accommodationTypes?: AccommodationType[]
  minPrice?: number
  maxPrice?: number
  guests?: number
  checkIn?: string
  checkOut?: string
  page?: number
  limit?: number
  /** Backend supports: price_asc | price_desc | rating | newest */
  sort?: 'price_asc' | 'price_desc' | 'rating' | 'newest'
}

function toQS(params: StayListParams): string {
  const parts: string[] = []
  for (const [k, v] of Object.entries(params)) {
    if (v === undefined || v === null) continue
    if (Array.isArray(v)) {
      if (v.length > 0) parts.push(`${k}=${v.join(',')}`)
    } else if (v !== '') {
      parts.push(`${k}=${encodeURIComponent(String(v))}`)
    }
  }
  return parts.length > 0 ? `?${parts.join('&')}` : ''
}

// ── API functions ─────────────────────────────────────────────────────────

/** Fetch paginated list of active accommodations. */
export async function fetchStays(
  params: StayListParams = {},
): Promise<Paginated<BackendStay>> {
  return apiClient.get<Paginated<BackendStay>>(`/stays${toQS(params)}`)
}

/** Fetch a single accommodation detail by slug. Returns null on 404. */
export async function fetchStayBySlug(slug: string): Promise<BackendStayDetail | null> {
  try {
    return await apiClient.get<BackendStayDetail>(`/stays/${slug}`)
  } catch {
    return null
  }
}
