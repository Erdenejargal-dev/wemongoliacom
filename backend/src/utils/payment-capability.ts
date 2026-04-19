/**
 * backend/src/utils/payment-capability.ts
 *
 * Phase 3 — payment-method capability registry.
 *
 * PURPOSE:
 *   A pure module that answers, deterministically, "can processor X charge
 *   this booking/listing in currency Y?" without touching the database or
 *   talking to the processor. The registry is the single place where
 *   processor constraints live; everything else (UI, booking creation,
 *   payment initiation, admin visibility) consults it.
 *
 * PHASE 1/2 CONSTRAINTS IT MODELS:
 *   - Bonum (`bonum`, `bonum_stub`): MNT-only. Bonum's invoice/QR API only
 *     accepts integer MNT minor units. Until a non-MNT pipeline exists,
 *     attempting to pass anything else is incorrect and is refused loudly.
 *
 * FUTURE VISA / GLOBAL CARD:
 *   A future processor entry (e.g. `visa_stripe`) will declare USD support.
 *   When it's added, no other file needs to change — UI copy, admin
 *   visibility, and backend validation will pick it up automatically.
 *
 * DESIGN RULES:
 *   - No DB access here. Registry is data.
 *   - No silent auto-conversion. If the only processor for a booking's
 *     currency does not exist, the caller must surface that to the user
 *     explicitly, not auto-swap currencies.
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
  /** True when at least one live processor supports the given currency. */
  payable:                  boolean
  /** The currency the listing/booking is priced in. */
  bookingCurrency:          Currency
  /** Processors that CAN settle in `bookingCurrency` today. */
  supportingProcessors:     PaymentProcessorId[]
  /**
   * Processors that are planned but not yet live (e.g. future Visa support
   * for USD). Surfaced so UI can say "coming soon" honestly instead of
   * offering a dead path.
   */
  plannedProcessors:        PaymentProcessorId[]
  /**
   * User-facing explanation when `payable === false`. Intentionally neutral
   * and trust-building. Never null when `payable === false`.
   */
  userMessage:              string | null
  /**
   * Stable machine-readable code consumed by UI or alerts.
   *   - 'ok'                       : at least one live processor can charge
   *   - 'bonum_mnt_only'           : MNT-only processor; booking is non-MNT
   *   - 'unsupported_currency'     : no processor (live or planned) matches
   */
  reasonCode:               'ok' | 'bonum_mnt_only' | 'unsupported_currency'
}

/**
 * Returns the capability object for a booking/listing priced in `currency`.
 * Pure; safe to call anywhere (UI, admin audits, payment initiation).
 */
export function describeBookingPaymentCapability(currency: Currency): PaymentCapability {
  const supporting  = PAYMENT_PROCESSORS
    .filter((p) => p.status === 'live' && p.supportedCurrencies.includes(currency))
    .map((p) => p.id)
  const planned     = PAYMENT_PROCESSORS
    .filter((p) => p.status === 'planned' && p.supportedCurrencies.includes(currency))
    .map((p) => p.id)

  if (supporting.length > 0) {
    return {
      payable:               true,
      bookingCurrency:       currency,
      supportingProcessors:  supporting,
      plannedProcessors:     planned,
      userMessage:           null,
      reasonCode:            'ok',
    }
  }

  // No live processor for this currency.
  // Today that means the booking is priced in USD and Bonum only does MNT.
  const hasAnyMntProcessor = PAYMENT_PROCESSORS.some(
    (p) => p.status === 'live' && p.supportedCurrencies.includes('MNT'),
  )
  if (currency !== 'MNT' && hasAnyMntProcessor) {
    return {
      payable:              false,
      bookingCurrency:      currency,
      supportingProcessors: [],
      plannedProcessors:    planned,
      userMessage:
        `This tour is priced in ${currency}, but our current payment gateway can only charge ` +
        'Mongolian tögrög (MNT). You can still browse the listing in ' +
        `${currency}; when international card payments go live we will email you — ` +
        'or you can contact support for manual arrangements.',
      reasonCode:           'bonum_mnt_only',
    }
  }

  return {
    payable:              false,
    bookingCurrency:      currency,
    supportingProcessors: [],
    plannedProcessors:    planned,
    userMessage:
      `Online payment is not yet available for ${currency}. Please contact support ` +
      'to complete this booking, or choose a listing priced in MNT.',
    reasonCode:           'unsupported_currency',
  }
}

/**
 * True if the given booking currency CAN be charged by Bonum. Used by the
 * payment service's pre-flight guard in addition to the explicit MNT check,
 * so the truth is sourced from this registry and future processors slot in
 * cleanly.
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
