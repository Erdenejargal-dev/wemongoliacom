/**
 * lib/pricing.ts
 *
 * Phase 2 (Option B) — single frontend pricing contract.
 *
 * WHY:
 *   Phase 1 pages read `basePrice` / `pricePerDay` / `basePricePerNight` +
 *   `currency` directly off the listing payload. Phase 2 introduces
 *   `baseAmount` + `baseCurrency` + `normalizedAmountMnt` so listings in
 *   MNT and USD can live side by side.
 *
 *   Rather than have every card, detail page, and booking card know about
 *   both the new and the legacy fields, the backend now returns a
 *   `pricing: Pricing | null` field on every listing and room type. This
 *   file is the mirror on the frontend: the exported `Pricing` type and the
 *   helpers to render it.
 *
 * GUARANTEES:
 *   - `Pricing.base`   is always in the listing's native currency (MNT or USD).
 *   - `Pricing.normalized` is in MNT and exists when the backend has a
 *     current FX seed; it's null for listings that predate the backfill.
 *   - We never invent a rate on the client. If we need to display USD to an
 *     MNT-base listing (or vice versa) and the backend didn't provide it,
 *     we fall back to the base amount and let the price filter live with it.
 *
 * DISPLAY CURRENCY HEADER:
 *   The `X-Display-Currency` header documented here is the contract for
 *   future personalization (MN user → MNT, non-MN user → USD). The backend
 *   quote/create endpoints already accept `bookingCurrency`; this client
 *   helper threads the user's preference through fetch so the checkout
 *   card shows the same currency the payment will charge.
 */

import { formatMoney, isSupportedCurrency, type Currency } from './money'

// ─── Pricing contract (mirrors backend/src/utils/pricing.ts toPricingDTO) ──

export interface Pricing {
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
  /**
   * Phase 6.3 — symmetric USD display hint for MNT-base listings. Populated
   * by the backend at request time from the active MNT→USD FX snapshot.
   * Purely a display value; booking math still goes through
   * `calcBookingPricing` and the persisted FX snapshot. Null when:
   *   - the listing is USD-base (no conversion needed — `base` is authoritative), or
   *   - no active FX rate was available server-side.
   */
  normalizedUsd: {
    amount:   number
    currency: 'USD'
    fxRate:   number
    fxRateAt: string
  } | null
  /**
   * Phase 2 transition: mirrors `base` so templates that still read legacy
   * fields on the listing keep working. Removed one release after the
   * frontend Pricing contract lands on every page.
   */
  legacy: {
    amount:   number
    currency: Currency
  }
}

// ─── Fallback: build a Pricing from legacy listing fields ──────────────────

/**
 * Accepts a listing-ish object that MAY carry Phase 2 `pricing` already OR
 * only the Phase 1 legacy fields (`basePrice`, `pricePerDay`,
 * `basePricePerNight`, `currency`). Returns a `Pricing` or null if no price
 * info is available.
 *
 * This lets the frontend migrate one surface at a time without breaking
 * Phase 1 pages that haven't switched to read `pricing` yet.
 */
type LegacyPriceFields = {
  pricing?:           Pricing | null
  basePrice?:         number | null
  basePricePerNight?: number | null
  pricePerDay?:       number | null
  currency?:          string | null
}

export function readPricing(listing: LegacyPriceFields): Pricing | null {
  if (listing.pricing) return listing.pricing

  const amount =
    listing.basePrice ??
    listing.basePricePerNight ??
    listing.pricePerDay ??
    null
  const currency = isSupportedCurrency(listing.currency) ? listing.currency : null

  if (amount === null || amount === undefined || currency === null) return null

  return {
    base:          { amount, currency },
    normalized:    null,
    normalizedUsd: null,
    legacy:        { amount, currency },
  }
}

// ─── Display helpers ───────────────────────────────────────────────────────

/**
 * Primary price string for PUBLIC LISTING surfaces (cards, detail headline,
 * stays / tours / destination listings). Honours the user's display
 * currency via the pre-computed backend DTO — never invents a rate.
 *
 * Symmetry rules (Phase 6.3):
 *   - displayCurrency === base.currency        → base (no conversion needed).
 *   - displayCurrency === 'MNT' + normalized   → persisted MNT normalization.
 *   - displayCurrency === 'USD' + normalizedUsd → live MNT→USD normalization.
 *   - otherwise                                 → EXPLICIT base fallback
 *     ("$X (base)") so the missing conversion is visible instead of silent.
 *
 * This helper is display-only. Booking totals and payment amounts must
 * continue to flow through the booking/payment services, which own the
 * authoritative FX snapshot at the moment of commit.
 */
export function formatPricing(pricing: Pricing | null, displayCurrency?: Currency): string {
  if (!pricing) return ''
  const baseStr = formatMoney(pricing.base.amount, pricing.base.currency)

  if (!displayCurrency || displayCurrency === pricing.base.currency) {
    return baseStr
  }
  if (displayCurrency === 'MNT' && pricing.normalized) {
    return formatMoney(pricing.normalized.amount, 'MNT')
  }
  if (displayCurrency === 'USD' && pricing.normalizedUsd) {
    return formatMoney(pricing.normalizedUsd.amount, 'USD')
  }

  // Explicit fallback — the user asked for a currency we can't honour
  // (no FX rate server-side, or legacy row without a normalized column).
  // Render the base amount with a visible marker so the gap is diagnosable
  // in the UI instead of silently showing the wrong currency.
  return `${baseStr} (base)`
}

/**
 * When a card wants to show "$420 (≈₮1,470,000)" style layout this returns
 * the secondary label. Returns null when no secondary is needed.
 *
 * Phase 6.3 — `formatPricing` now does the primary MNT↔USD switch directly
 * off the DTO (including the symmetric `normalizedUsd` field). The only
 * remaining role of this helper is to surface the "also-in" hint for
 * non-MNT base listings when the user is browsing in their native currency,
 * e.g. USD base + USD display → "≈ ₮X" underneath. Nothing here drives
 * booking math.
 */
export function formatSecondaryPricing(
  pricing: Pricing | null,
  displayCurrency?: Currency,
  secondaryRate?: { fromMnt: number } | null,
): string | null {
  if (!pricing) return null
  // Same currency → no secondary needed.
  if (displayCurrency && displayCurrency === pricing.base.currency) {
    // USD base + USD display → show "≈ ₮X" underneath if we have MNT normalization.
    if (displayCurrency === 'USD' && pricing.base.currency === 'USD' && pricing.normalized) {
      return formatMoney(pricing.normalized.amount, 'MNT')
    }
    // MNT base + MNT display → show "≈ $X" underneath if we have USD normalization.
    if (displayCurrency === 'MNT' && pricing.base.currency === 'MNT' && pricing.normalizedUsd) {
      return formatMoney(pricing.normalizedUsd.amount, 'USD')
    }
    return null
  }

  // Cross-currency rendering is handled by `formatPricing` as the primary
  // value via the DTO's normalized / normalizedUsd fields. No secondary
  // needed on top of it.
  if (pricing.normalized && displayCurrency === 'MNT' && pricing.base.currency !== 'MNT') {
    return null
  }
  if (pricing.normalizedUsd && displayCurrency === 'USD' && pricing.base.currency !== 'USD') {
    return null
  }

  // Legacy compatibility: caller resolved an MNT→USD rate off /fx/rate
  // before the DTO carried `normalizedUsd`. Still honoured so existing
  // booking-card code paths keep working.
  if (
    pricing.base.currency === 'MNT' &&
    displayCurrency === 'USD' &&
    secondaryRate &&
    secondaryRate.fromMnt > 0
  ) {
    const usd = pricing.base.amount * secondaryRate.fromMnt
    return formatMoney(usd, 'USD')
  }

  return null
}

// ─── Display currency persistence (client side only) ──────────────────────

const DISPLAY_CURRENCY_STORAGE_KEY = 'wm.displayCurrency'

/** Read the user's chosen display currency from localStorage (SSR-safe). */
export function readDisplayCurrency(): Currency | null {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem(DISPLAY_CURRENCY_STORAGE_KEY)
  return isSupportedCurrency(raw) ? raw : null
}

/** Write the user's chosen display currency (persists across reloads). */
export function writeDisplayCurrency(currency: Currency): void {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(DISPLAY_CURRENCY_STORAGE_KEY, currency)
}

/**
 * Decorates a `fetch` init with `X-Display-Currency: MNT|USD` so the backend
 * can (optionally) tailor `pricing.bookingCurrency` and quote totals. Safe
 * to call on every request — no-op when preference is not set.
 */
export function withDisplayCurrencyHeader(init: RequestInit = {}, explicit?: Currency): RequestInit {
  const preferred = explicit ?? readDisplayCurrency()
  if (!preferred) return init
  const headers = new Headers(init.headers ?? {})
  headers.set('X-Display-Currency', preferred)
  return { ...init, headers }
}
