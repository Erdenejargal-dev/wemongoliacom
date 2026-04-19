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
    base:       { amount, currency },
    normalized: null,
    legacy:     { amount, currency },
  }
}

// ─── Display helpers ───────────────────────────────────────────────────────

/**
 * Primary price string for listing cards / detail pages:
 *   - Prefers the display currency when the backend has a normalized figure.
 *   - Otherwise shows the base amount in its native currency.
 *
 * `displayCurrency` is the user's preferred currency (passed through via
 * X-Display-Currency). When it's the same as `pricing.base.currency`, this
 * is effectively a passthrough with locale-correct formatting.
 */
export function formatPricing(pricing: Pricing | null, displayCurrency?: Currency): string {
  if (!pricing) return ''
  if (!displayCurrency || displayCurrency === pricing.base.currency) {
    return formatMoney(pricing.base.amount, pricing.base.currency)
  }
  if (displayCurrency === 'MNT' && pricing.normalized) {
    return formatMoney(pricing.normalized.amount, 'MNT')
  }
  return formatMoney(pricing.base.amount, pricing.base.currency)
}

/**
 * When a card wants to show something like "$420 (≈₮1,470,000)", this
 * returns the secondary label. Returns null when no conversion is needed or
 * no rate is available.
 *
 * Phase 6 — also supports an explicit `secondaryRate` hint (MNT→USD)
 * resolved from `GET /fx/rate`, so MNT-base listings viewed by a USD
 * traveler can still show a "≈ $X" hint without the frontend inventing
 * a rate. When `secondaryRate` is null/omitted the helper falls back to
 * the Phase 2 behavior.
 */
export function formatSecondaryPricing(
  pricing: Pricing | null,
  displayCurrency?: Currency,
  secondaryRate?: { fromMnt: number } | null,
): string | null {
  if (!pricing) return null
  // Same currency → no secondary needed.
  if (displayCurrency && displayCurrency === pricing.base.currency) return null

  // Case A: display == MNT and listing base != MNT → primary already uses MNT
  // normalized, no secondary needed.
  if (pricing.normalized && displayCurrency === 'MNT' && pricing.base.currency !== 'MNT') {
    return null
  }

  // Case B: listing base != MNT → always surface the MNT equivalent as a
  // secondary hint (e.g. primary "$420" + secondary "≈ ₮1,470,000").
  if (pricing.normalized && pricing.base.currency !== 'MNT') {
    return formatMoney(pricing.normalized.amount, 'MNT')
  }

  // Case C (Phase 6): listing base == MNT and display == USD → use the
  // MNT→USD rate the caller resolved from /fx/rate. Purely a display hint;
  // the authoritative price is still the MNT base.
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
