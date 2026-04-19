/**
 * backend/src/utils/pricing.ts
 *
 * Phase 2 (Option B) — helpers shared by every write path that persists a
 * listing price (tours, vehicles, room types).
 *
 * Responsibilities:
 *   1. Accept a normalized Option B input (baseAmount + baseCurrency) OR
 *      fall back to legacy (price + currency) for a transitional release.
 *   2. Round baseAmount per its native currency (reuses roundMoney).
 *   3. Compute normalizedAmountMnt via the central FX layer — never via
 *      ad-hoc math. Same-currency (MNT) rows short-circuit with rate = 1.
 *   4. Return a ready-to-spread object for Prisma `create`/`update`,
 *      including a dual-write of the legacy price column so pre-migration
 *      clients keep working until the drop-legacy migration ships.
 *
 * The helper itself is generic over the legacy column name so the same
 * code path covers Tour.basePrice, Vehicle.pricePerDay, and
 * RoomType.basePricePerNight.
 */

import { AppError } from '../middleware/error'
import { calcPricing } from './booking'
import { assertSupportedCurrency, roundMoney, type Currency } from './currency'
import { getActiveRate, type FxRateSnapshot } from './fx'

export interface ResolveBasePricingInput {
  // New Option B inputs (preferred)
  baseAmount?:   number
  baseCurrency?: string
  // Legacy inputs (kept for one release so we don't break existing
  // provider portal flows mid-deploy; normalized into baseAmount/baseCurrency
  // below).
  legacyAmount?:   number
  legacyCurrency?: string
}

export interface ResolvedBasePricing {
  baseAmount:          number
  baseCurrency:        Currency
  normalizedAmountMnt: number
  normalizedFxRate:    number
  normalizedFxRateAt:  Date
  // The caller spreads this into Prisma `data`. Legacy dual-write fields
  // are returned separately so the caller (who owns the model) can map
  // them under the right column name (basePrice / pricePerDay / ...).
  legacyAmount:        number
  legacyCurrency:      Currency
}

/**
 * Normalizes Option B + legacy inputs into a single persisted shape.
 * Throws AppError(400) when the input is ambiguous or unparseable.
 *
 * Contract:
 *   - If baseAmount AND baseCurrency are provided, those are used.
 *   - Else if legacyAmount AND legacyCurrency are provided, they seed
 *     both the new and legacy fields (common path for clients that haven't
 *     been updated yet).
 *   - Else throws 400.
 */
export async function resolveBasePricing(input: ResolveBasePricingInput): Promise<ResolvedBasePricing> {
  const rawAmount = input.baseAmount ?? input.legacyAmount
  const rawCurrency = input.baseCurrency ?? input.legacyCurrency

  if (rawAmount === undefined || rawAmount === null) {
    throw new AppError('Pricing requires an amount.', 400)
  }
  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    throw new AppError('Pricing amount must be a positive, finite number.', 400)
  }

  const currency = assertSupportedCurrency(rawCurrency ?? 'USD', 'baseCurrency')
  const baseAmount = roundMoney(rawAmount, currency)

  const snapshot = await getActiveRate(currency, 'MNT')
  const normalizedAmountMnt = roundMoney(baseAmount * snapshot.rate, 'MNT')

  return {
    baseAmount,
    baseCurrency:        currency,
    normalizedAmountMnt,
    normalizedFxRate:    snapshot.rate,
    normalizedFxRateAt:  snapshot.capturedAt,
    legacyAmount:        baseAmount,
    legacyCurrency:      currency,
  }
}

/**
 * Override variant — used on TourDeparture / VehicleAvailability /
 * RoomAvailability. Overrides do NOT carry a normalizedAmountMnt — search
 * always runs against the listing's base, and booking flow converts the
 * override on demand. We still enforce currency validation.
 */
export interface ResolveOverridePricingInput {
  baseOverrideAmount?:   number | null
  baseOverrideCurrency?: string | null
  legacyAmount?:         number | null
  legacyCurrency?:       string | null
}

export interface ResolvedOverridePricing {
  baseOverrideAmount:   number | null
  baseOverrideCurrency: Currency | null
  legacyAmount:         number | null
  legacyCurrency:       Currency | null
}

export function resolveOverridePricing(input: ResolveOverridePricingInput): ResolvedOverridePricing {
  const rawAmount = input.baseOverrideAmount ?? input.legacyAmount ?? null
  const rawCurrency = input.baseOverrideCurrency ?? input.legacyCurrency ?? null

  if (rawAmount === null || rawAmount === undefined) {
    return {
      baseOverrideAmount:   null,
      baseOverrideCurrency: null,
      legacyAmount:         null,
      legacyCurrency:       null,
    }
  }

  if (!Number.isFinite(rawAmount) || rawAmount <= 0) {
    throw new AppError('Override amount must be a positive, finite number.', 400)
  }

  const currency = assertSupportedCurrency(rawCurrency ?? 'USD', 'baseOverrideCurrency')
  const amount = roundMoney(rawAmount, currency)

  return {
    baseOverrideAmount:   amount,
    baseOverrideCurrency: currency,
    legacyAmount:         amount,
    legacyCurrency:       currency,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// PricingDTO — the single shape every read path exposes to the frontend.
//
// DESIGN NOTES:
//   * `base` is authoritative: the listing's native price in its native currency.
//   * `normalized` holds the MNT equivalent used for search/sort/filter. It's
//     nullable because a row may predate an FX seed (see fx_backfill_reports).
//   * `legacy` mirrors the Phase 1 shape so existing frontend code keeps
//     working during the transition; it will be removed one release after
//     the frontend Pricing contract lands.
// ─────────────────────────────────────────────────────────────────────────────

export interface PricingDTO {
  base: {
    amount:   number
    currency: Currency
  }
  normalized: {
    amount:   number
    currency: 'MNT'
    fxRate:   number
    fxRateAt: string
  } | null
  legacy: {
    amount:   number
    currency: Currency
  }
}

interface PricingSource {
  baseAmount?:          number | null
  baseCurrency?:        string | null
  normalizedAmountMnt?: number | null
  normalizedFxRate?:    number | null
  normalizedFxRateAt?:  Date | string | null
  // Fallbacks for rows created before Phase 2:
  legacyAmount?:        number | null
  legacyCurrency?:      string | null
}

export function toPricingDTO(source: PricingSource): PricingDTO | null {
  const amount =
    source.baseAmount   ?? source.legacyAmount   ?? null
  const currencyRaw =
    source.baseCurrency ?? source.legacyCurrency ?? null

  if (amount === null || amount === undefined || currencyRaw === null) return null

  const currency = assertSupportedCurrency(currencyRaw, 'baseCurrency')

  const normalized =
    source.normalizedAmountMnt != null && source.normalizedFxRate != null
      ? {
          amount:   source.normalizedAmountMnt,
          currency: 'MNT' as const,
          fxRate:   source.normalizedFxRate,
          fxRateAt: (source.normalizedFxRateAt instanceof Date
            ? source.normalizedFxRateAt
            : new Date(source.normalizedFxRateAt ?? Date.now())
          ).toISOString(),
        }
      : null

  return {
    base:       { amount, currency },
    normalized,
    legacy:     { amount, currency },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Booking pricing — Phase 2 Option B.
//
// calcBookingPricing captures BOTH:
//   * base pricing: pricePerUnit * units in the listing's native currency,
//     plus serviceFee + total, all rounded per baseCurrency rules.
//   * booking pricing: same math in the booking currency (what the traveler
//     pays). When booking currency === base currency, it's a no-op pass
//     through (rate = 1, source = 'same_currency').
//
// This is the single source of truth used by quoteBooking and createBooking
// so the numbers shown at checkout are identical to the numbers persisted.
// ─────────────────────────────────────────────────────────────────────────────

export interface BookingPricing {
  baseCurrency:      Currency
  basePricePerUnit:  number
  baseSubtotal:      number
  baseServiceFee:    number
  baseTotalAmount:   number

  bookingCurrency:   Currency
  pricePerUnit:      number
  subtotal:          number
  serviceFee:        number
  taxes:             number
  discountAmount:    number
  totalAmount:       number

  units:             number
  fxRate:            number
  fxRateCapturedAt:  Date
  fxRateSource:      string
}

export async function calcBookingPricing(params: {
  basePricePerUnit: number
  baseCurrency:     Currency
  units:            number
  bookingCurrency:  Currency
}): Promise<BookingPricing> {
  const { basePricePerUnit, baseCurrency, units, bookingCurrency } = params

  if (!Number.isFinite(basePricePerUnit) || basePricePerUnit <= 0) {
    throw new AppError('basePricePerUnit must be a positive, finite number.', 400)
  }
  if (!Number.isInteger(units) || units <= 0) {
    throw new AppError('units must be a positive integer.', 400)
  }

  const baseCalc = calcPricing(basePricePerUnit, units, baseCurrency)

  let snapshot: FxRateSnapshot
  if (baseCurrency === bookingCurrency) {
    snapshot = {
      fromCurrency: baseCurrency,
      toCurrency:   bookingCurrency,
      rate:         1,
      capturedAt:   new Date(),
      source:       'same_currency',
    }
  } else {
    snapshot = await getActiveRate(baseCurrency, bookingCurrency)
  }

  // Convert the per-unit base price into booking currency, round to that
  // currency's native precision, then let calcPricing compute the rest — this
  // guarantees subtotal/total math is internally consistent in the booking
  // currency even after rounding.
  const bookingPricePerUnit = roundMoney(basePricePerUnit * snapshot.rate, bookingCurrency)
  const bookingCalc = calcPricing(bookingPricePerUnit, units, bookingCurrency)

  return {
    baseCurrency,
    basePricePerUnit:  baseCalc.pricePerUnit,
    baseSubtotal:      baseCalc.subtotal,
    baseServiceFee:    baseCalc.serviceFee,
    baseTotalAmount:   baseCalc.totalAmount,

    bookingCurrency,
    pricePerUnit:      bookingCalc.pricePerUnit,
    subtotal:          bookingCalc.subtotal,
    serviceFee:        bookingCalc.serviceFee,
    taxes:             bookingCalc.taxes,
    discountAmount:    bookingCalc.discountAmount,
    totalAmount:       bookingCalc.totalAmount,

    units,
    fxRate:            snapshot.rate,
    fxRateCapturedAt:  snapshot.capturedAt,
    fxRateSource:      snapshot.source,
  }
}

/**
 * Picks the effective base price per unit for a listing row, honoring any
 * Option B override (e.g. TourDeparture.baseOverrideAmount) and falling back
 * through legacy columns. Returns { amount, currency } — the caller is
 * responsible for feeding those into calcBookingPricing.
 */
export function resolveListingBasePricePerUnit(params: {
  baseAmount?:          number | null
  baseCurrency?:        string | null
  baseOverrideAmount?:  number | null
  baseOverrideCurrency?: string | null
  legacyAmount?:        number | null
  legacyCurrency?:      string | null
  legacyOverrideAmount?: number | null
  legacyOverrideCurrency?: string | null
  label:                string
}): { amount: number; currency: Currency } {
  const {
    baseAmount, baseCurrency,
    baseOverrideAmount, baseOverrideCurrency,
    legacyAmount, legacyCurrency,
    legacyOverrideAmount, legacyOverrideCurrency,
    label,
  } = params

  const overrideAmount   = baseOverrideAmount ?? legacyOverrideAmount ?? null
  const overrideCurrency = baseOverrideCurrency ?? legacyOverrideCurrency ?? null

  if (overrideAmount !== null && overrideAmount !== undefined) {
    const cur = assertSupportedCurrency(overrideCurrency ?? baseCurrency ?? legacyCurrency ?? 'USD', `${label}.overrideCurrency`)
    return { amount: overrideAmount, currency: cur }
  }

  const amount = baseAmount ?? legacyAmount
  const cur = baseCurrency ?? legacyCurrency
  if (amount === null || amount === undefined || cur === null || cur === undefined) {
    throw new AppError(`${label} has no pricing configured.`, 500)
  }
  return { amount, currency: assertSupportedCurrency(cur, `${label}.currency`) }
}
