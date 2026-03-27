/**
 * lib/api/admin.ts
 * Frontend helpers for Admin endpoints.
 * All calls require an admin-role access token.
 */

import { apiClient, type Paginated } from './client'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface AdminAnalytics {
  users: {
    total: number
    newThisMonth: number
  }
  providers: {
    total: number
    active: number
    pendingVerification: number
  }
  bookings: {
    total: number
    thisMonth: number
  }
  revenue: {
    total: number
    thisMonth: number
    lastMonth: number
  }
  reviews: {
    total: number
    avgRating: number
  }
}

export interface AdminUser {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  role: 'traveler' | 'provider_owner' | 'admin'
  avatarUrl?: string | null
  createdAt: string
  _count: {
    bookings: number
    reviews: number
  }
}

export interface AdminProvider {
  id: string
  name: string
  slug: string
  description?: string | null
  email?: string | null
  phone?: string | null
  city?: string | null
  region?: string | null
  providerTypes: string[]
  status: string
  verificationStatus: string
  rejectionReason?: string | null
  reviewedAt?: string | null
  isVerified: boolean
  ratingAverage: number
  reviewsCount: number
  createdAt: string
  owner: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  _count: {
    tours: number
    vehicles: number
    accommodations: number
    bookings: number
  }
}

export interface AdminBooking {
  id: string
  bookingCode: string
  listingType: 'tour' | 'vehicle' | 'accommodation'
  listingId: string
  bookingStatus: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  paymentStatus: 'unpaid' | 'authorized' | 'paid' | 'refunded' | 'failed'
  totalAmount: number
  currency: string
  guests: number
  startDate: string
  endDate?: string | null
  travelerFullName?: string | null
  travelerEmail?: string | null
  specialRequests?: string | null
  createdAt: string
  listingSnapshot?: any
  user: {
    id: string
    firstName: string
    lastName: string
    email: string
  }
  provider: {
    id: string
    name: string
    slug: string
  }
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export async function fetchAdminAnalytics(token: string): Promise<AdminAnalytics> {
  return apiClient.get<AdminAnalytics>('/admin/analytics', token)
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface UserListParams {
  search?: string
  role?: string
  page?: number
  limit?: number
}

export async function fetchAdminUsers(
  params: UserListParams,
  token: string,
): Promise<Paginated<AdminUser>> {
  const qs = new URLSearchParams()
  if (params.search) qs.set('search', params.search)
  if (params.role)   qs.set('role',   params.role)
  if (params.page)   qs.set('page',   String(params.page))
  if (params.limit)  qs.set('limit',  String(params.limit))
  const query = qs.toString()
  return apiClient.get<Paginated<AdminUser>>(`/admin/users${query ? `?${query}` : ''}`, token)
}

export async function setAdminUserRole(
  userId: string,
  role: 'traveler' | 'provider_owner' | 'admin',
  token: string,
) {
  return apiClient.patch(`/admin/users/${userId}/role`, { role }, token)
}

// ─── Providers ───────────────────────────────────────────────────────────────

export interface ProviderListParams {
  search?: string
  verificationStatus?: string
  page?: number
  limit?: number
}

export async function fetchAdminProviders(
  params: ProviderListParams,
  token: string,
): Promise<Paginated<AdminProvider>> {
  const qs = new URLSearchParams()
  if (params.search)             qs.set('search',             params.search)
  if (params.verificationStatus) qs.set('verificationStatus', params.verificationStatus)
  if (params.page)               qs.set('page',               String(params.page))
  if (params.limit)              qs.set('limit',              String(params.limit))
  const query = qs.toString()
  return apiClient.get<Paginated<AdminProvider>>(`/admin/providers${query ? `?${query}` : ''}`, token)
}

export async function setAdminProviderVerification(
  providerId: string,
  verificationStatus: 'unverified' | 'pending_review' | 'verified' | 'rejected',
  token: string,
  rejectionReason?: string | null,
) {
  return apiClient.patch(`/admin/providers/${providerId}/verify`, { verificationStatus, rejectionReason }, token)
}

export async function setAdminProviderStatus(
  providerId: string,
  status: 'draft' | 'active' | 'paused' | 'archived',
  token: string,
) {
  return apiClient.patch(`/admin/providers/${providerId}/status`, { status }, token)
}

// ─── Bookings ────────────────────────────────────────────────────────────────

export interface BookingListParams {
  search?: string
  status?: string
  listingType?: string
  page?: number
  limit?: number
}

export async function fetchAdminBookings(
  params: BookingListParams,
  token: string,
): Promise<Paginated<AdminBooking>> {
  const qs = new URLSearchParams()
  if (params.search)      qs.set('search',      params.search)
  if (params.status)      qs.set('status',      params.status)
  if (params.listingType) qs.set('listingType', params.listingType)
  if (params.page)        qs.set('page',        String(params.page))
  if (params.limit)       qs.set('limit',       String(params.limit))
  const query = qs.toString()
  return apiClient.get<Paginated<AdminBooking>>(`/admin/bookings${query ? `?${query}` : ''}`, token)
}
