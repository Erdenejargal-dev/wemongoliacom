/**
 * lib/api/provider.ts
 * Frontend helpers for Provider Dashboard endpoints.
 *
 * All shapes verified against backend/src/services/provider.service.ts
 */

import { apiClient } from './client'

// ── Types ──────────────────────────────────────────────────────────────────

/** Provider profile from GET /provider/profile (Prisma Provider model) */
export interface ProviderProfile {
  id: string
  name: string
  slug?: string
  description?: string | null
  logoUrl?: string | null
  coverImageUrl?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  address?: string | null
  city?: string | null
  region?: string | null
  country?: string | null
  languages?: string[]
  providerTypes: string[]
  plan?: 'FREE' | 'PRO'
  ratingAverage?: number
  reviewsCount?: number
  totalGuestsHosted?: number
  isVerified?: boolean
  verificationStatus?: 'unverified' | 'pending_review' | 'verified' | 'rejected'
  rejectionReason?:    string | null
  reviewedAt?:         string | null
  status?: string
  createdAt?: string
  updatedAt?: string
}

/**
 * Provider listing limits from GET /provider/limits.
 * current = non-archived count (draft + active + paused).
 * limit = null means unlimited (PRO plan).
 */
export interface ProviderLimits {
  plan: string
  tours: {
    current: number
    limit:   number | null  // null = unlimited
  }
  accommodations: {
    current: number
    limit:   number | null
  }
}

/** Returns true if the usage is at or above the limit. */
export function isAtLimit(usage: { current: number; limit: number | null }): boolean {
  return usage.limit !== null && usage.current >= usage.limit
}

/** Returns true if the usage is exactly one below the limit (warn before blocking). */
export function isNearLimit(usage: { current: number; limit: number | null }): boolean {
  return usage.limit !== null && !isAtLimit(usage) && usage.current >= usage.limit - 1
}

/** Update profile input — matches backend updateProfileSchema */
export interface UpdateProviderProfileInput {
  name?: string
  tagline?: string
  description?: string
  logoUrl?: string
  coverUrl?: string
  phone?: string
  email?: string
  websiteUrl?: string
  address?: string
  city?: string
  country?: string
  socialLinks?: Record<string, string>
}

/**
 * Traveler info is returned nested under `user` by the backend.
 * Backend: prisma.booking.findMany({ include: { user: { select: {...} } } })
 */
export interface ProviderBookingUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  avatarUrl?: string
}

export interface ProviderBooking {
  id: string
  bookingCode: string
  bookingStatus: string
  paymentStatus: string
  totalAmount: number
  currency: string
  guests: number
  startDate: string
  listingType: string
  /** Traveler info — backend nests this under `user` (not as flat fields) */
  user?: ProviderBookingUser
  createdAt: string
}

/**
 * Actual analytics shape returned by GET /provider/analytics.
 * Source: backend/src/services/provider.service.ts → getProviderAnalytics()
 */
export interface ProviderAnalytics {
  bookings: {
    total:     number
    pending:   number
    confirmed: number
    completed: number
    cancelled: number
  }
  revenue: {
    total:          number
    thisMonth:      number
    lastMonth:      number
    thisMonthCount: number
    lastMonthCount: number
  }
  reviews: {
    total:     number
    avgRating: number
  }
}

// ── API functions ──────────────────────────────────────────────────────────

export async function submitProviderForVerification(
  token: string,
): Promise<{ id: string; name: string; verificationStatus: string }> {
  return apiClient.post('/provider/verify/submit', {}, token)
}

export async function fetchProviderProfile(token: string): Promise<ProviderProfile | null> {
  try {
    return await apiClient.get<ProviderProfile>('/provider/profile', token)
  } catch {
    return null
  }
}

export async function updateProviderProfile(
  token: string,
  data: UpdateProviderProfileInput,
): Promise<ProviderProfile | null> {
  try {
    return await apiClient.put<ProviderProfile>('/provider/profile', data, token)
  } catch {
    return null
  }
}

export async function fetchProviderBookings(
  token: string,
  params: { status?: string; page?: number; limit?: number } = {},
): Promise<{ data: ProviderBooking[]; total: number }> {
  try {
    const qs = new URLSearchParams()
    // Backend query param is `bookingStatus`, NOT `status`
    if (params.status && params.status !== 'all') qs.set('bookingStatus', params.status)
    if (params.page)  qs.set('page',  String(params.page))
    if (params.limit) qs.set('limit', String(params.limit))
    const query = qs.toString() ? `?${qs.toString()}` : ''

    // apiClient unwraps json.data → result = { data: [...], pagination: {...} }
    const result = await apiClient.get<{
      data: ProviderBooking[]
      pagination: { page: number; limit: number; total: number; pages: number }
    }>(`/provider/bookings${query}`, token)

    return { data: result.data ?? [], total: result.pagination?.total ?? 0 }
  } catch {
    return { data: [], total: 0 }
  }
}

export async function fetchProviderAnalytics(token: string): Promise<ProviderAnalytics | null> {
  try {
    // apiClient unwraps json.data → result = { bookings:{...}, revenue:{...}, reviews:{...} }
    return await apiClient.get<ProviderAnalytics>('/provider/analytics', token)
  } catch {
    return null
  }
}

export async function confirmProviderBooking(bookingCode: string, token: string) {
  return apiClient.patch(`/provider/bookings/${bookingCode}/confirm`, undefined, token)
}

export async function completeProviderBooking(bookingCode: string, token: string) {
  return apiClient.patch(`/provider/bookings/${bookingCode}/complete`, undefined, token)
}

export async function cancelProviderBooking(
  bookingCode: string,
  reason: string,
  token: string,
) {
  return apiClient.patch(`/provider/bookings/${bookingCode}/cancel`, { reason }, token)
}

// ── Provider Reviews ────────────────────────────────────────────────────────

export interface ProviderReview {
  id:            string
  rating:        number
  title:         string | null
  comment:       string | null
  providerReply: string | null
  createdAt:     string
  listingType:   string
  listingId:     string
  listingName:   string
  user: {
    firstName: string
    lastName:  string
    avatarUrl: string | null
  }
}

export async function fetchProviderReviews(
  token: string,
  params: { page?: number; limit?: number } = {},
): Promise<{ data: ProviderReview[]; total: number }> {
  try {
    const qs = new URLSearchParams()
    if (params.page)  qs.set('page',  String(params.page))
    if (params.limit) qs.set('limit', String(params.limit))
    const query = qs.toString() ? `?${qs.toString()}` : ''

    const result = await apiClient.get<{
      data: ProviderReview[]
      pagination: { page: number; limit: number; total: number; pages: number }
    }>(`/provider/reviews${query}`, token)

    return {
      data: result.data ?? [],
      total: result.pagination?.total ?? 0,
    }
  } catch {
    return { data: [], total: 0 }
  }
}

export async function replyToProviderReview(
  reviewId: string,
  reply: string,
  token: string,
): Promise<ProviderReview | null> {
  try {
    return await apiClient.patch<ProviderReview>(
      `/provider/reviews/${reviewId}/reply`,
      { reply },
      token,
    )
  } catch {
    return null
  }
}

// ── Provider Tours ───────────────────────────────────────────────────────────

export interface ProviderTour {
  id:               string
  slug:             string
  title:            string
  shortDescription: string | null
  durationDays:     number | null
  basePrice:        number
  currency:         string
  status:           string
  ratingAverage:    number
  reviewsCount:     number
  createdAt:        string
  updatedAt:        string
  images:           { imageUrl: string }[]
  destination:      { id: string; name: string; slug: string } | null
}

export interface TourImage {
  id:        string
  imageUrl:  string
  publicId:  string | null
  altText:   string | null
  sortOrder: number
}

export interface ReadinessResult {
  ready:   boolean
  missing: string[]
}

export interface ProviderTourDetail extends ProviderTour {
  description:        string | null
  category:           string | null
  difficulty:         string | null
  maxGuests:          number
  minGuests:          number
  meetingPoint:       string | null
  cancellationPolicy: string | null
  languages:          string[]
  images:             TourImage[]
  _count:             { departures: number; images: number }
  readiness:          ReadinessResult
}

export interface TourDeparture {
  id:             string
  tourId:         string
  startDate:      string
  endDate:        string
  availableSeats: number
  bookedSeats:    number
  priceOverride:  number | null
  currency:       string
  status:         string
  createdAt:      string
  updatedAt:      string
}

export interface CreateTourInput {
  title:             string
  shortDescription?: string
  description?:      string
  durationDays?:     number
  basePrice:         number
  currency?:         string
  destinationId?:    string
  status?:           'draft' | 'active' | 'paused'
}

export interface UpdateTourInput {
  // Core info
  title?:              string
  shortDescription?:   string
  description?:        string
  // Trip setup
  category?:           string
  difficulty?:         'Easy' | 'Moderate' | 'Challenging' | null
  durationDays?:       number
  maxGuests?:          number
  minGuests?:          number
  languages?:          string[]
  // Location
  destinationId?:      string | null
  meetingPoint?:       string | null
  // Pricing & policy
  basePrice?:          number
  currency?:           string
  cancellationPolicy?: string | null
  // Status
  status?:             'draft' | 'active' | 'paused'
}

export async function fetchProviderTours(
  token: string,
  params: { status?: string; page?: number; limit?: number } = {},
): Promise<{ data: ProviderTour[]; total: number }> {
  const qs = new URLSearchParams()
  if (params.status) qs.set('status', params.status)
  if (params.page)   qs.set('page', String(params.page))
  if (params.limit)  qs.set('limit', String(params.limit))
  const query = qs.toString() ? `?${qs}` : ''

  const result = await apiClient.get<{
    data: ProviderTour[]
    pagination: { page: number; limit: number; total: number; pages: number }
  }>(`/provider/tours${query}`, token)

  return { data: result.data ?? [], total: result.pagination?.total ?? 0 }
}

export async function fetchProviderTour(
  token: string,
  tourId: string,
): Promise<ProviderTourDetail> {
  return apiClient.get<ProviderTourDetail>(`/provider/tours/${tourId}`, token)
}

export async function createProviderTour(
  token: string,
  input: CreateTourInput,
): Promise<ProviderTour> {
  return apiClient.post<ProviderTour>('/provider/tours', input, token)
}

export async function updateProviderTour(
  token: string,
  tourId: string,
  input: UpdateTourInput,
): Promise<ProviderTour> {
  return apiClient.put<ProviderTour>(`/provider/tours/${tourId}`, input, token)
}

export async function archiveProviderTour(
  token: string,
  tourId: string,
): Promise<ProviderTour> {
  return apiClient.delete<ProviderTour>(`/provider/tours/${tourId}`, token)
}

// Tour images

export async function addTourImages(
  token: string,
  tourId: string,
  images: { imageUrl: string; publicId?: string; altText?: string; width?: number; height?: number; format?: string; bytes?: number }[],
): Promise<TourImage[]> {
  return apiClient.post<TourImage[]>(`/provider/tours/${tourId}/images`, { images }, token)
}

export async function removeTourImage(
  token: string,
  tourId: string,
  imageId: string,
): Promise<{ deleted: boolean; publicId: string | null }> {
  return apiClient.delete<{ deleted: boolean; publicId: string | null }>(`/provider/tours/${tourId}/images/${imageId}`, token)
}

// Tour departures

export async function fetchTourDepartures(
  token: string,
  tourId: string,
): Promise<TourDeparture[]> {
  return apiClient.get<TourDeparture[]>(`/provider/tours/${tourId}/departures`, token)
}

export async function createTourDeparture(
  token: string,
  tourId: string,
  input: { startDate: string; endDate: string; availableSeats: number; priceOverride?: number; currency?: string },
): Promise<TourDeparture> {
  return apiClient.post<TourDeparture>(`/provider/tours/${tourId}/departures`, input, token)
}

export async function updateTourDeparture(
  token: string,
  tourId: string,
  departureId: string,
  input: { startDate?: string; endDate?: string; availableSeats?: number; priceOverride?: number | null; currency?: string; status?: 'scheduled' | 'cancelled' },
): Promise<TourDeparture> {
  return apiClient.put<TourDeparture>(`/provider/tours/${tourId}/departures/${departureId}`, input, token)
}

export async function deleteTourDeparture(
  token: string,
  tourId: string,
  departureId: string,
): Promise<{ deleted: boolean }> {
  return apiClient.delete<{ deleted: boolean }>(`/provider/tours/${tourId}/departures/${departureId}`, token)
}

// ── Provider Limits ─────────────────────────────────────────────────────────

/**
 * Fetch the provider's current plan and listing usage.
 * Returns null if the request fails (provider not found, auth error, etc.)
 * Never throws — safe to call without try/catch.
 */
export async function fetchProviderLimits(token: string): Promise<ProviderLimits | null> {
  try {
    return await apiClient.get<ProviderLimits>('/provider/limits', token)
  } catch {
    return null
  }
}

// ── Destinations (for create-tour dropdown) ─────────────────────────────────

export interface Destination {
  id:   string
  name: string
  slug: string
}

export async function fetchDestinations(
  token: string,
): Promise<Destination[]> {
  try {
    const result = await apiClient.get<{
      data: Destination[]
      pagination: unknown
    }>('/destinations?limit=100', token)
    return result.data ?? []
  } catch {
    return []
  }
}
