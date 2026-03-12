import { nanoid } from 'nanoid'

/**
 * Generate a human-readable booking code: WM-2026-XXXXX
 */
export function generateBookingCode(): string {
  const year = new Date().getFullYear()
  const suffix = nanoid(6).toUpperCase()
  return `WM-${year}-${suffix}`
}

/**
 * Calculate booking price breakdown.
 * serviceFee = 5% of subtotal (platform commission), rounded to 2 dp.
 */
export function calcPricing(pricePerUnit: number, units: number) {
  const subtotal    = Math.round(pricePerUnit * units * 100) / 100
  const serviceFee  = Math.round(subtotal * 0.05 * 100) / 100
  const totalAmount = Math.round((subtotal + serviceFee) * 100) / 100
  return { subtotal, serviceFee, taxes: 0, discountAmount: 0, totalAmount }
}

/**
 * Count the number of nights between two dates.
 */
export function countNights(checkIn: Date, checkOut: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000
  return Math.ceil((checkOut.getTime() - checkIn.getTime()) / msPerDay)
}

/**
 * Return an array of Date objects for each night in [checkIn, checkOut).
 */
export function eachNight(checkIn: Date, checkOut: Date): Date[] {
  const nights: Date[] = []
  const cur = new Date(checkIn)
  cur.setUTCHours(0, 0, 0, 0)
  const end = new Date(checkOut)
  end.setUTCHours(0, 0, 0, 0)
  while (cur < end) {
    nights.push(new Date(cur))
    cur.setUTCDate(cur.getUTCDate() + 1)
  }
  return nights
}
