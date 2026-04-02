/**
 * lib/api/bookings.ts
 * Frontend helpers for Bookings endpoints.
 */

import { apiClient } from './client'

export interface CreateBookingPayload {
  listingType: 'tour' | 'vehicle' | 'accommodation'
  listingId: string
  // ── Tour-specific ──────────────────────────────────────────────────────────
  tourDepartureId?: string
  // ── Vehicle-specific ───────────────────────────────────────────────────────
  vehicleAvailabilityId?: string
  /** startDate / endDate are used for VEHICLE bookings. */
  startDate?: string
  endDate?: string
  // ── Accommodation-specific ─────────────────────────────────────────────────
  roomTypeId?: string
  /**
   * checkIn / checkOut are the correct field names for ACCOMMODATION bookings.
   * The backend booking service explicitly checks for input.checkIn and input.checkOut
   * (not startDate/endDate) when listingType === 'accommodation'.
   * Sending startDate/endDate instead causes 400: "roomTypeId, checkIn, and checkOut
   * are required for accommodation bookings."
   */
  checkIn?: string
  checkOut?: string
  // ── Shared ─────────────────────────────────────────────────────────────────
  guests: number
  adults: number
  children: number
  travelerFullName: string
  travelerEmail: string
  travelerPhone: string
  travelerCountry: string
  specialRequests?: string
}

export interface BackendBooking {
  id: string
  bookingCode: string
  bookingStatus: string
  paymentStatus: string
  subtotal: number
  serviceFee: number
  totalAmount: number
  currency: string
  listingType: string
  startDate: string
  endDate?: string
  guests: number

  /**
   * provider.id is needed to call POST /conversations (startConversation).
   * Added to backend listMyBookings select in booking.service.ts.
   */
  provider?: { id: string; name: string; slug: string; logoUrl?: string | null } | null

  listingSnapshot?: any
  cancelReason?: string | null

  // Included for tour bookings via BookingService.listMyBookings select()
  tourDeparture?: {
    tour?: {
      slug: string
      title: string
      durationDays: number
      destination?: { name: string; slug: string }
      images?: { imageUrl: string }[]
    }
  } | null

  vehicleAvailability?: {
    vehicle?: {
      slug: string
      title: string
      destination?: { name: string; slug: string }
      images?: { imageUrl: string }[]
    }
  } | null

  roomType?: {
    accommodation?: {
      slug: string
      name: string
      destination?: { name: string; slug: string }
      images?: { imageUrl: string }[]
    }
  } | null
}

export async function createBooking(
  payload: CreateBookingPayload,
  token: string,
): Promise<BackendBooking> {
  return apiClient.post<BackendBooking>('/bookings', payload, token)
}

export async function fetchBookingByCode(bookingCode: string, token: string): Promise<BackendBooking | null> {
  try {
    return await apiClient.get<BackendBooking>(`/bookings/${bookingCode}`, token)
  } catch {
    return null
  }
}

export async function fetchMyBookings(token: string): Promise<BackendBooking[]> {
  try {
    // Backend returns the array directly as data: GET /bookings/me → { success, data: [...] }
    // apiClient.get<T> unwraps json.data, so result IS the array, not { data: [...] }
    const result = await apiClient.get<BackendBooking[]>('/bookings/me', token)
    return result ?? []
  } catch (err: unknown) {
    // If the backend says the token is expired, do not silently degrade to empty UI.
    if (err instanceof Error && 'status' in err && (err as any).status === 401) throw err
    return []
  }
}

export async function cancelBooking(bookingCode: string, reason: string, token: string) {
  return apiClient.patch(`/bookings/${bookingCode}/cancel`, { reason }, token)
}
