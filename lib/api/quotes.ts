/**
 * lib/api/quotes.ts
 *
 * Frontend helper for POST /bookings/quote — the authoritative source for
 * subtotal / serviceFee / totalAmount displayed in booking cards and checkout.
 *
 * The quote is non-persisting and safe to call whenever the user changes
 * dates, room selection, or guest count. It requires auth because the rest
 * of the booking surface does — unauthenticated users see per-unit price
 * only (no computed totals) and are prompted to sign in before checkout.
 */

import { apiClient } from './client'

export interface BookingQuoteInput {
  listingType:      'tour' | 'vehicle' | 'accommodation'
  listingId:        string
  tourDepartureId?: string
  startDate?:       string
  endDate?:         string
  roomTypeId?:      string
  checkIn?:         string
  checkOut?:        string
  guests:           number
}

export interface BookingQuote {
  pricePerUnit:   number
  units:          number
  subtotal:       number
  serviceFee:     number
  taxes:          number
  discountAmount: number
  totalAmount:    number
  currency:       string
}

export async function getBookingQuote(
  payload: BookingQuoteInput,
  token: string,
): Promise<BookingQuote> {
  return apiClient.post<BookingQuote>('/bookings/quote', payload, token)
}
