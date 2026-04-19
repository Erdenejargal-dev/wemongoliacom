/**
 * lib/api/booking-requests.ts
 *
 * Phase 6 — UX + Growth Layer. Frontend bindings for the BookingRequest
 * lead flow. Kept minimal on purpose — this is NOT a booking API; it's a
 * "please contact me" channel for listings that are not yet payable.
 */

import { apiClient } from './client'

export type BookingRequestStatus =
  | 'new'
  | 'in_review'
  | 'accepted'
  | 'declined'
  | 'expired'

export type BookingRequestListingType = 'tour' | 'vehicle' | 'accommodation'

export interface CreateBookingRequestInput {
  listingType: BookingRequestListingType
  listingId:   string
  name:        string
  email:       string
  phone?:      string
  message?:    string
  startDate?:  string
  endDate?:    string
  guests?:     number
  quantity?:   number
}

export interface BookingRequest {
  id:              string
  userId:          string | null
  providerId:      string
  listingType:     BookingRequestListingType
  listingId:       string
  name:            string
  email:           string
  phone:           string | null
  message:         string | null
  startDate:       string | null
  endDate:         string | null
  guests:          number | null
  quantity:        number | null
  listingCurrency: string | null
  status:          BookingRequestStatus
  providerNote:    string | null
  createdAt:       string
  updatedAt:       string
  reviewedAt:      string | null
}

/**
 * Submit a lead. `token` is optional: anonymous visitors can submit
 * requests (the backend will store userId as null). When the token is
 * present, the user gets linked to the lead for later review.
 */
export async function createBookingRequest(
  input: CreateBookingRequestInput,
  token?: string | null,
): Promise<{ id: string }> {
  return apiClient.post<{ id: string }>('/booking-requests', input, token ?? null)
}

/** Traveler's own leads (for an account-side "My requests" view). */
export async function fetchMyBookingRequests(token: string): Promise<{ data: BookingRequest[] }> {
  return apiClient.get('/booking-requests/mine', token)
}

/** Provider inbox. */
export async function fetchProviderBookingRequests(
  token: string,
  params: { status?: BookingRequestStatus; page?: number; limit?: number } = {},
): Promise<{ data: BookingRequest[]; pagination: { page: number; limit: number; total: number; pages: number } }> {
  const qs = new URLSearchParams()
  if (params.status) qs.set('status', params.status)
  if (params.page)   qs.set('page',   String(params.page))
  if (params.limit)  qs.set('limit',  String(params.limit))
  const query = qs.toString()
  return apiClient.get(`/booking-requests/provider${query ? `?${query}` : ''}`, token)
}

export async function fetchProviderBookingRequest(token: string, id: string): Promise<BookingRequest> {
  return apiClient.get(`/booking-requests/provider/${encodeURIComponent(id)}`, token)
}

export async function updateProviderBookingRequest(
  token: string,
  id: string,
  patch: { status?: BookingRequestStatus; providerNote?: string | null },
): Promise<BookingRequest> {
  return apiClient.patch(`/booking-requests/provider/${encodeURIComponent(id)}`, patch, token)
}
