/**
 * lib/api/provider.ts
 * Frontend helpers for Provider Dashboard endpoints.
 *
 * All shapes verified against backend/src/services/provider.service.ts
 */

import { apiClient } from './client'

// ── Types ──────────────────────────────────────────────────────────────────

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
