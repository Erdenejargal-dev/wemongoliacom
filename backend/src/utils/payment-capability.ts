/**
 * backend/src/utils/payment-capability.ts
 *
 * Phase 3 — payment-method capability registry.
 * Phase 6.2 (MVP) — non-MNT bookings are now payable via MNT conversion at
 * payment-initiation time. Bonum still only receives MNT; the conversion
 * happens in `payment.service.initiatePayment` using the FX layer.
 *
 * PURPOSE:
 *   A pure module that answers, deterministically, "can processor X charge
 *   this booking/listing in currency Y — directly or via conversion?"
 *   without touching the database or talking to the processor. The registry
 *   is the single place where processor constraints live; everything else
 *   (UI, booking creation, payment initiation, admin visibility) consults
 *   it.
 *
 * PHASE 1/2 CONSTRAINTS IT MODELS:
 *   - Bonum (`bonum`, `bonum_stub`): settles in MNT only. Bonum's invoice/QR
 *     API only accepts integer MNT minor units. For non-MNT bookings, the
 *     payment service converts to MNT first (see `initiatePayment`).
 *
 * FUTURE VISA / GLOBAL CARD:
 *   A future processor entry (e.g. `visa_stripe`) will declare USD support
 *   directly (no conversion required). When it's added, no other file needs
 *   to change — UI copy, admin visibility, and backend validation will pick
 *   it up automatically.
 *
 * DESIGN RULES:
 *   - No DB access here. Registry is data.
 *   - Conversion is expressed as a capability-level signal
 *     (`conversionRequired`, `payableCurrency`). The actual FX lookup and
 *     conversion happens in the payment service, where DB access is allowed
 *     and FX snapshots can be persisted on the Payment row.
 *   - `describeBookingPaymentCapability` returns a serializable object so
 *     the same shape can be sent to the frontend verbatim.
 */

import type { Currency } from './currency'

export type PaymentProcessorId = 'bonum' | 'bonum_stub'

export interface PaymentProcessor {
  id:                    PaymentProcessorId
  /** Human-readable label for admin/ops surfaces. */
  label:                 string
  /** Currencies this processor can settle in. */
  supportedCurrencies:   Currency[]
  /**
   * `live` means we integrate with it; `stub` is a fake used in dev/test.
   * `planned` is reserved for future Visa / global-card rails — NOT
   * available yet and should NEVER be chosen as a live processor.
   */
  status:                'live' | 'stub' | 'planned'
  /**
   * Optional short explanation of the constraint shown to travelers when a
   * listing cannot currently be paid with this processor. Kept neutral so
   * it's reusable in UI and support responses.
   */
  constraintNote?:       string
}

export const PAYMENT_PROCESSORS: readonly PaymentProcessor[] = Object.freeze([
  {
    id:                  'bonum',
    label:               'Bonum (Mongolian bank QR / invoice)',
    supportedCurrencies: ['MNT'],
    status:              'live',
    constraintNote:      'Bonum settles in Mongolian tögrög (MNT) only.',
  },
  {
    id:                  'bonum_stub',
    label:               'Bonum (local stub)',
    supportedCurrencies: ['MNT'],
    status:              'stub',
    constraintNote:      'Local stub mirrors Bonum; MNT only.',
  },
]) as readonly PaymentProcessor[]

export interface PaymentCapability {
  /**
   * True when the booking CAN be charged online today — either directly in
   * its own currency or via MNT conversion at payment time (MVP).
   */
  payable:                  boolean
  /** The currency the listing/booking is priced in. */
  bookingCurrency:          Currency
  /**
   * The currency Bonum (or whichever processor is used) will actually settle
   * in. For MNT bookings this equals `bookingCurrency`. For non-MNT bookings
   * it is 'MNT' — the payment service converts the amount at initiation
   * time using the active FX rate and persists the snapshot on the Payment.
   */
  payableCurrency:          Currency
  /**
   * True when the payable amount is produced by converting the booking
   * total to `payableCurrency` at payment time. UI should surface this so
   * travelers understand they'll be charged in MNT even though prices were
   * shown in their display currency.
   */
  conversionRequired:       boolean
  /** Processors that CAN settle in `payableCurrency` today. */
  supportingProcessors:     PaymentProcessorId[]
  /**
   * Processors that are planned but not yet live. Surfaced so UI can say
   * "coming soon" honestly instead of offering a dead path. Retained for
   * forward compatibility even though MVP collapses most cases to "payable".
   */
  plannedProcessors:        PaymentProcessorId[]
  /**
   * User-facing explanation when payment is not fully straightforward
   * (e.g. conversion, or unsupported currency). Null when there's nothing
   * noteworthy to tell the user.
   */
  userMessage:              string | null
  /**
   * Stable machine-readable code consumed by UI or alerts.
   *   - 'ok'                       : live processor charges `bookingCurrency` directly
   *   - 'ok_via_mnt_conversion'    : payable after MNT conversion at checkout (MVP)
   *   - 'unsupported_currency'     : no processor (direct or via MNT) matches
   */
  reasonCode:               'ok' | 'ok_via_mnt_conversion' | 'unsupported_currency'
}

/**
 * Returns the capability object for a booking/listing priced in `currency`.
 * Pure; safe to call anywhere (UI, admin audits, payment initiation).
 *
 * MVP behavior (Phase 6.2):
 *   - MNT booking → payable directly via Bonum ('ok').
 *   - Non-MNT booking → payable via MNT conversion ('ok_via_mnt_conversion').
 *     The actual FX lookup and conversion is done in `payment.service` at
 *     initiation time; if no rate exists, that path fails clearly.
 */
export function describeBookingPaymentCapability(currency: Currency): PaymentCapability {
  const directSupporting = PAYMENT_PROCESSORS
    .filter((p) => p.status === 'live' && p.supportedCurrencies.includes(currency))
    .map((p) => p.id)
  const planned = PAYMENT_PROCESSORS
    .filter((p) => p.status === 'planned' && p.supportedCurrencies.includes(currency))
    .map((p) => p.id)

  if (directSupporting.length > 0) {
    return {
      payable:              true,
      bookingCurrency:      currency,
      payableCurrency:      currency,
      conversionRequired:   false,
      supportingProcessors: directSupporting,
      plannedProcessors:    planned,
      userMessage:          null,
      reasonCode:           'ok',
    }
  }

  // No processor settles in `currency` directly.
  // MVP rule: if at least one live processor can charge MNT, we convert
  // to MNT at payment time so the booking is still payable.
  const mntSupporting = PAYMENT_PROCESSORS
    .filter((p) => p.status === 'live' && p.supportedCurrencies.includes('MNT'))
    .map((p) => p.id)

  if (mntSupporting.length > 0 && currency !== 'MNT') {
    return {
      payable:              true,
      bookingCurrency:      currency,
      payableCurrency:      'MNT',
      conversionRequired:   true,
      supportingProcessors: mntSupporting,
      plannedProcessors:    planned,
      userMessage:
        `Pricing is shown in ${currency}. Payment will be charged in Mongolian tögrög (MNT) ` +
        'using the current exchange rate at checkout.',
      reasonCode:           'ok_via_mnt_conversion',
    }
  }

  return {
    payable:              false,
    bookingCurrency:      currency,
    payableCurrency:      currency,
    conversionRequired:   false,
    supportingProcessors: [],
    plannedProcessors:    planned,
    userMessage:
      `Online payment is not yet available for ${currency}. Please contact support ` +
      'to complete this booking, or choose a listing priced in MNT.',
    reasonCode:           'unsupported_currency',
  }
}

/**
 * True if the given booking currency CAN be charged by Bonum directly (no
 * conversion). Used as a narrow check where the caller specifically wants
 * to know whether Bonum will settle in the booking's own currency — e.g.
 * legacy guards that predate the conversion path.
 */
export function bonumCanCharge(currency: Currency): boolean {
  const bonum = PAYMENT_PROCESSORS.find((p) => p.id === 'bonum' || p.id === 'bonum_stub')
  return !!bonum && bonum.supportedCurrencies.includes(currency)
}

/**
 * Convenience for admin / health dashboards.
 * Returns the registry in a JSON-safe shape (e.g. readonly arrays → mutable).
 */
export function listPaymentProcessors(): PaymentProcessor[] {
  return PAYMENT_PROCESSORS.map((p) => ({
    ...p,
    supportedCurrencies: [...p.supportedCurrencies],
  }))
}
