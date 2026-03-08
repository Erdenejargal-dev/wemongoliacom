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

/** Calculate service fee (5% of subtotal, min $5) */
export function calcServiceFee(subtotal: number): number {
  return Math.max(5, Math.round(subtotal * 0.05))
}
