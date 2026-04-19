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

// Kept 'bonum_mnt_only' in the union for backward compatibility with any
// stored state / logs; the classifier no longer produces it in MVP.
export type PaymentReasonCode =
  | 'ok'
  | 'ok_via_mnt_conversion'
  | 'bonum_mnt_only'
  | 'unsupported_currency'

export interface PaymentCapability {
  payable:               boolean
  bookingCurrency:       Currency
  /**
   * Currency the payment processor will actually settle in. Same as
   * `bookingCurrency` for MNT listings; 'MNT' for non-MNT listings (MVP:
   * converted at checkout via the active FX rate).
   */
  payableCurrency:       Currency
  /** True when the amount is converted to `payableCurrency` at checkout. */
  conversionRequired:    boolean
  supportingProcessors:  string[]
  plannedProcessors:     string[]
  userMessage:           string | null
  reasonCode:            PaymentReasonCode
}

/**
 * Static classifier used by listing/booking cards. Mirrors the backend's
 * Bonum settlement rules. Phase 6.2 (MVP): non-MNT listings are now
 * payable via MNT conversion — the authoritative FX lookup happens on the
 * server at payment initiation, but cards render the right CTA using this
 * classifier.
 */
export function describeListingPaymentCapability(currency: Currency): PaymentCapability {
  if (currency === 'MNT') {
    return {
      payable:              true,
      bookingCurrency:      'MNT',
      payableCurrency:      'MNT',
      conversionRequired:   false,
      supportingProcessors: ['bonum'],
      plannedProcessors:    [],
      userMessage:          null,
      reasonCode:           'ok',
    }
  }
  return {
    payable:              true,
    bookingCurrency:      currency,
    payableCurrency:      'MNT',
    conversionRequired:   true,
    supportingProcessors: ['bonum'],
    plannedProcessors:    [],
    userMessage:
      `Pricing is shown in ${currency}. Payment will be charged in Mongolian tögrög (MNT) ` +
      'using the current exchange rate at checkout.',
    reasonCode:           'ok_via_mnt_conversion',
  }
}

/**
 * Short one-line hint used on dense cards (no room for a full paragraph).
 */
export function shortCapabilityHint(cap: PaymentCapability): string | null {
  if (cap.reasonCode === 'ok_via_mnt_conversion') return 'Paid in MNT at checkout.'
  if (cap.payable) return null
  if (cap.reasonCode === 'bonum_mnt_only') return 'Payable in MNT only (via Bonum).'
  return 'Online payment not yet available.'
}
