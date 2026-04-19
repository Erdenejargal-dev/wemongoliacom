export interface Booking {
  id: string
  tourId: string
  tourSlug: string
  tourTitle: string
  tourLocation: string
  tourDuration: string
  date: string
  guests: number
  pricePerPerson: number
  subtotal: number
  serviceFee: number
  total: number
  /**
   * Currency of subtotal / serviceFee / total.
   * Phase 1 (Stabilization): persisted from the backend booking response so
   * the success page can render the same currency the user was charged in.
   * Defaults to 'USD' for older session-storage payloads without the field.
   */
  currency: string
  travelerName: string
  email: string
  phone: string
  country: string
  specialRequests: string
  createdAt: string
}

/** Generate a TABI-XXXXX style mock booking ID */
export function generateBookingId(): string {
  const num = Math.floor(10000 + Math.random() * 90000)
  return `TABI-${num}`
}

/** Persist booking to sessionStorage so success page can read it */
export function saveBooking(booking: Booking): void {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('last_booking', JSON.stringify(booking))
  }
}

/** Read last booking from sessionStorage */
export function getLastBooking(): Booking | null {
  if (typeof window === 'undefined') return null
  const raw = sessionStorage.getItem('last_booking')
  return raw ? (JSON.parse(raw) as Booking) : null
}

/**
 * Phase 1 note: calcServiceFee has been intentionally removed.
 *
 * Service fee and total are computed exclusively by the backend in
 * backend/src/utils/booking.ts::calcPricing. The frontend must fetch these
 * values via POST /bookings/quote (lib/api/quotes.ts) or read them from
 * the BackendBooking response after POST /bookings — never re-derive them.
 */
