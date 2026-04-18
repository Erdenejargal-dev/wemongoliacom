/**
 * Persist checkout payment payload so users can return after re-login without losing QR context.
 */

import type { InitiatePaymentResponse } from '@/lib/api/payments'

const PAY_PREFIX = 'wm_checkout_pay_'

export function saveCheckoutPayPayload(bookingId: string, payload: InitiatePaymentResponse): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.setItem(PAY_PREFIX + bookingId, JSON.stringify(payload))
  } catch {
    /* quota / private mode */
  }
}

export function loadCheckoutPayPayload(bookingId: string): InitiatePaymentResponse | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = sessionStorage.getItem(PAY_PREFIX + bookingId)
    if (!raw) return null
    return JSON.parse(raw) as InitiatePaymentResponse
  } catch {
    return null
  }
}

export function clearCheckoutPayPayload(bookingId: string): void {
  if (typeof window === 'undefined') return
  try {
    sessionStorage.removeItem(PAY_PREFIX + bookingId)
  } catch {
    /* empty */
  }
}
