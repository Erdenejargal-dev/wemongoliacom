import { nanoid } from 'nanoid'
import { roundMoney, type Currency } from './currency'

/**
 * Generate a human-readable booking code: WM-2026-XXXXX
 */
export function generateBookingCode(): string {
  const year = new Date().getFullYear()
  const suffix = nanoid(6).toUpperCase()
  return `WM-${year}-${suffix}`
}

/**
 * Canonical pricing calculator — the ONLY source of truth for
 * subtotal / serviceFee / totalAmount anywhere in the platform.
 *
 * serviceFee = 5% of subtotal (platform commission).
 *
 * Rounding is currency-aware:
 *   - MNT: rounded to 0 decimals (Bonum expects integer MNT)
 *   - USD: rounded to 2 decimals (cent precision)
 *
 * No currency-blind minimums (the previous frontend helper applied a $5
 * minimum service fee, which is explicitly removed in Phase 1).
 */
export function calcPricing(
  pricePerUnit: number,
  units: number,
  currency: Currency,
) {
  const rawSubtotal   = pricePerUnit * units
  const subtotal      = roundMoney(rawSubtotal, currency)
  const serviceFee    = roundMoney(subtotal * 0.05, currency)
  const totalAmount   = roundMoney(subtotal + serviceFee, currency)
  return {
    pricePerUnit: roundMoney(pricePerUnit, currency),
    units,
    subtotal,
    serviceFee,
    taxes:          0,
    discountAmount: 0,
    totalAmount,
    currency,
  }
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
