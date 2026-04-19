/**
 * lib/payment-capability.ts
 *
 * Phase 3 — frontend mirror of backend/src/utils/payment-capability.ts.
 *
 * Importantly, this file has NO pricing math — it only classifies a listing
 * or booking currency against the processor registry the backend exposes.
 * When the real answer depends on server state (e.g. a specific booking),
 * we call `/payments/capability`. For at-a-glance UI decisions on listing
 * cards (where no booking exists yet), the static helper is correct and
 * cheap.
 *
 * Keep shape in sync with backend `PaymentCapability`.
 */

import type { Currency } from './money'

export type PaymentReasonCode = 'ok' | 'bonum_mnt_only' | 'unsupported_currency'

export interface PaymentCapability {
  payable:               boolean
  bookingCurrency:       Currency
  supportingProcessors:  string[]
  plannedProcessors:     string[]
  userMessage:           string | null
  reasonCode:            PaymentReasonCode
}

/**
 * Static classifier used by listing/booking cards. Mirrors the backend's
 * Bonum MNT-only constraint so we can render "payable in MNT only" without
 * round-tripping for every card. The authoritative check happens again on
 * the server during payment initiation.
 */
export function describeListingPaymentCapability(currency: Currency): PaymentCapability {
  if (currency === 'MNT') {
    return {
      payable:              true,
      bookingCurrency:      'MNT',
      supportingProcessors: ['bonum'],
      plannedProcessors:    [],
      userMessage:          null,
      reasonCode:           'ok',
    }
  }
  return {
    payable:              false,
    bookingCurrency:      currency,
    supportingProcessors: [],
    plannedProcessors:    [],
    userMessage:
      `This listing is priced in ${currency}. Our current payment gateway can only ` +
      'charge Mongolian tögrög (MNT). You can still browse and request to book; ' +
      'international card payments are coming soon. Contact support for manual arrangements.',
    reasonCode:           'bonum_mnt_only',
  }
}

/**
 * Short one-line hint used on dense cards (no room for a full paragraph).
 */
export function shortCapabilityHint(cap: PaymentCapability): string | null {
  if (cap.payable) return null
  if (cap.reasonCode === 'bonum_mnt_only') return 'Payable in MNT only (via Bonum).'
  return 'Online payment not yet available.'
}
