/**
 * lib/api/admin.ts
 * Frontend helpers for Admin endpoints.
 * All calls require an admin-role access token.
 */

import { apiClient, type Paginated } from './client'

// ─── Types ───────────────────────────────────────────────────────────────────

// Phase 2/3 — grouped revenue bucket. One per time window (all/this/last).
//
// Shape matches `backend/src/services/admin.service.ts#summarize`:
//   - `byCurrency`        : raw sums kept per currency (never summed across!)
//   - `normalizedMnt`     : best-effort MNT equivalent (null if FX missing)
//   - `normalizationStatus`: 'ok' | 'missing_rate'
export interface RevenueBucket {
  byCurrency:           Record<string, number>
  normalizedMnt:        number | null
  normalizationStatus:  'ok' | 'missing_rate'
}

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
    total:     RevenueBucket
    thisMonth: RevenueBucket
    lastMonth: RevenueBucket
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
  plan: 'FREE' | 'PRO'
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

/** Admin-only: change a provider's plan (FREE → PRO or PRO → FREE). */
export async function setAdminProviderPlan(
  providerId: string,
  plan: 'FREE' | 'PRO',
  token: string,
): Promise<{ id: string; name: string; plan: 'FREE' | 'PRO' }> {
  return apiClient.patch(`/admin/providers/${providerId}/plan`, { plan }, token)
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

// ─── Destinations ─────────────────────────────────────────────────────────────

export interface AdminDestination {
  id:               string
  name:             string
  slug:             string
  country:          string
  region:           string | null
  shortDescription: string | null
  heroImageUrl:     string | null
  featured:         boolean
  createdAt:        string
  _count: {
    tours:          number
    accommodations: number
  }
}

export interface AdminDestinationDetail {
  id:               string
  name:             string
  slug:             string
  country:          string
  region:           string | null
  shortDescription: string | null
  description:      string | null
  heroImageUrl:     string | null
  gallery:          string[]
  highlights:       string[]
  activities:       string[]
  tips:             string[]
  bestTimeToVisit:  string | null
  weatherInfo:      string | null
  featured:         boolean
  createdAt:        string
  updatedAt:        string
}

export interface AdminDestinationInput {
  name:             string
  slug?:            string
  country?:         string
  region?:          string | null
  shortDescription?: string | null
  description?:     string | null
  heroImageUrl?:    string | null
  gallery?:         string[]
  highlights?:      string[]
  activities?:      string[]
  tips?:            string[]
  bestTimeToVisit?: string | null
  weatherInfo?:     string | null
  featured?:        boolean
}

export async function fetchAdminDestinations(token: string): Promise<AdminDestination[]> {
  return apiClient.get<AdminDestination[]>('/admin/destinations', token)
}

export async function fetchAdminDestination(id: string, token: string): Promise<AdminDestinationDetail> {
  return apiClient.get<AdminDestinationDetail>(`/admin/destinations/${id}`, token)
}

export async function createAdminDestination(
  data: AdminDestinationInput,
  token: string,
): Promise<AdminDestinationDetail> {
  return apiClient.post<AdminDestinationDetail>('/admin/destinations', data, token)
}

export async function updateAdminDestination(
  id:    string,
  data:  Partial<AdminDestinationInput>,
  token: string,
): Promise<AdminDestinationDetail> {
  return apiClient.put<AdminDestinationDetail>(`/admin/destinations/${id}`, data, token)
}

export async function deleteAdminDestination(id: string, token: string): Promise<void> {
  return apiClient.delete<void>(`/admin/destinations/${id}`, token)
}

export async function toggleAdminDestinationFeatured(
  id:    string,
  token: string,
): Promise<AdminDestinationDetail> {
  return apiClient.patch<AdminDestinationDetail>(`/admin/destinations/${id}/featured`, undefined, token)
}

// ─── Pricing health (Phase 3) ────────────────────────────────────────────

export interface FxRateHealth {
  fromCurrency:   'MNT' | 'USD'
  toCurrency:     'MNT' | 'USD'
  rate:           number | null
  source:         string | null
  effectiveFrom:  string | null
  ageSeconds:     number | null
  status:         'ok' | 'stale' | 'missing'
}

export interface CurrencyDistribution {
  listings: {
    tours:    Record<string, number>
    rooms:    Record<string, number>
    vehicles: Record<string, number>
  }
  bookings: {
    byChargeCurrency: Record<string, { count: number; totalAmount: number }>
    byBaseCurrency:   Record<string, { count: number; totalAmount: number }>
  }
}

export interface MissingNormalizationSummary {
  tours:    number
  rooms:    number
  vehicles: number
  samples: {
    tours:    string[]
    rooms:    string[]
    vehicles: string[]
  }
}

export interface PaymentBlockedBooking {
  id:             string
  bookingCode:    string
  currency:       string
  baseCurrency:   string | null
  totalAmount:    number
  paymentStatus:  string
  bookingStatus:  string
  reasonCode:     'ok' | 'bonum_mnt_only' | 'unsupported_currency'
  userMessage:    string
  createdAt:      string
}

export interface BackfillReport {
  id:          string
  entityType:  string
  entityId:    string
  issue:       string
  context:     any
  resolvedAt:  string | null
  resolvedBy:  string | null
  createdAt:   string
  category:    'missing_fx_rate' | 'unknown_units' | 'legacy_currency' | 'other'
}

export interface PaymentProcessor {
  id:                  string
  label:               string
  supportedCurrencies: ('MNT' | 'USD')[]
  status:              'live' | 'stub' | 'planned'
  constraintNote?:     string
}

export interface PricingHealthOverview {
  generatedAt:            string
  processors:             PaymentProcessor[]
  fxRates:                FxRateHealth[]
  currencyDistribution:   CurrencyDistribution
  missingNormalization:   MissingNormalizationSummary
  paymentBlockedBookings: PaymentBlockedBooking[]
}

export async function fetchAdminPricingHealth(token: string): Promise<PricingHealthOverview> {
  return apiClient.get<PricingHealthOverview>('/admin/pricing-health', token)
}

export async function fetchAdminBackfillReports(
  params: { resolved?: boolean; entityType?: string; page?: number; limit?: number },
  token: string,
): Promise<Paginated<BackfillReport> & { categoryCounts: Record<string, { total: number; unresolved: number }> }> {
  const qs = new URLSearchParams()
  if (params.resolved !== undefined) qs.set('resolved',   String(params.resolved))
  if (params.entityType)             qs.set('entityType', params.entityType)
  if (params.page)                   qs.set('page',       String(params.page))
  if (params.limit)                  qs.set('limit',      String(params.limit))
  const query = qs.toString()
  return apiClient.get(
    `/admin/pricing-health/backfill-reports${query ? `?${query}` : ''}`,
    token,
  )
}

/**
 * Phase 3 — inspect one backfill report (read-only). Returns the report
 * plus the live state of the flagged entity so ops can decide what to do
 * next. Never mutates the flagged entity.
 */
export async function fetchAdminBackfillReportDetail(
  reportId: string,
  token: string,
): Promise<{ report: BackfillReport & { category: string }; target: unknown | null }> {
  return apiClient.get(
    `/admin/pricing-health/backfill-reports/${encodeURIComponent(reportId)}`,
    token,
  )
}

/**
 * Phase 3 — close a backfill report (marks the REPORT resolved only).
 * This does NOT touch the flagged entity. Any data repair is a separate,
 * explicit action outside this audit surface.
 */
export async function resolveAdminBackfillReport(
  reportId: string,
  token: string,
): Promise<{ report: BackfillReport & { category: string } }> {
  return apiClient.post(
    `/admin/pricing-health/backfill-reports/${encodeURIComponent(reportId)}/resolve`,
    {},
    token,
  )
}
