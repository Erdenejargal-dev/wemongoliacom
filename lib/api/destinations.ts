/**
 * lib/api/destinations.ts
 * Frontend API helpers for the Destinations endpoints.
 * All field names reflect the real Prisma Destination model.
 */

import { apiClient, type Paginated } from './client'

// ── Backend response shapes ───────────────────────────────────────────────────

/** Shape returned by GET /destinations (list) */
export interface BackendDestination {
  id:               string
  name:             string
  slug:             string
  country:          string
  region:           string | null
  shortDescription: string | null
  heroImageUrl:     string | null
  /** Plain strings — e.g. "Khongoryn Els sand dunes" */
  highlights:       string[]
  bestTimeToVisit:  string | null
  featured:         boolean
}

/** Full destination shape returned by GET /destinations/:slug */
export interface BackendDestinationDetail {
  id:                string
  name:              string
  slug:              string
  country:           string
  region:            string | null
  shortDescription:  string | null
  description:       string | null
  heroImageUrl:      string | null
  heroImagePublicId: string | null
  /** Array of image URLs */
  gallery:           string[]
  /** Plain-text highlight strings */
  highlights:        string[]
  /** Plain-text activity strings */
  activities:        string[]
  /** Plain-text tip strings */
  tips:              string[]
  bestTimeToVisit:   string | null
  weatherInfo:       string | null
  featured:          boolean
  createdAt:         string
  updatedAt:         string
}

/**
 * Tour shape embedded in the destination detail response.
 * Returned by the backend's getDestinationBySlug — real active tours
 * linked via destinationId.
 */
export interface BackendTourInDestination {
  id:               string
  slug:             string
  title:            string
  shortDescription: string | null
  basePrice:        number
  currency:         string
  durationDays:     number | null
  difficulty:       string | null
  ratingAverage:    number
  reviewsCount:     number
  featured:         boolean
  images:           { imageUrl: string }[]
  provider:         { name: string; slug: string; logoUrl: string | null }
}

/** Shape of GET /destinations/:slug response */
export interface DestinationDetailResponse {
  destination: BackendDestinationDetail
  tours:       BackendTourInDestination[]
}

// ── Query params ──────────────────────────────────────────────────────────────

export interface DestinationListParams {
  featured?: boolean
  page?:     number
  limit?:    number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function toQS(params: Record<string, string | number | boolean | undefined>): string {
  const q = Object.entries(params)
    .filter(([, v]) => v !== undefined)
    .map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`)
    .join('&')
  return q ? `?${q}` : ''
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function fetchDestinations(
  params: DestinationListParams = {},
): Promise<Paginated<BackendDestination>> {
  const qs = toQS(params as Record<string, string | number | boolean | undefined>)
  return apiClient.get<Paginated<BackendDestination>>(`/destinations${qs}`)
}

export async function fetchDestinationBySlug(
  slug: string,
): Promise<DestinationDetailResponse | null> {
  try {
    return await apiClient.get<DestinationDetailResponse>(`/destinations/${slug}`)
  } catch {
    return null
  }
}
