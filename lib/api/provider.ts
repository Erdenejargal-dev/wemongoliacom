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
  ratingAverage?: number
  reviewsCount?: number
  totalGuestsHosted?: number
  isVerified?: boolean
  status?: string
  createdAt?: string
  updatedAt?: string
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
