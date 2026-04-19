/**
 * lib/money.ts
 *
 * Phase 1 (Stabilization) — single, centralized currency formatter.
 *
 * Every "$" that used to appear directly in JSX has been replaced with a
 * call to formatMoney(amount, currency). This keeps listing currency,
 * booking currency, and payment currency visually consistent everywhere.
 *
 * Phase 2 (multi-currency) will introduce baseAmount/baseCurrency and the
 * need to display both amounts side-by-side; this file is the extension
 * point for that change.
 */

export const SUPPORTED_CURRENCIES = ['MNT', 'USD'] as const
export type Currency = (typeof SUPPORTED_CURRENCIES)[number]

export function isSupportedCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && (SUPPORTED_CURRENCIES as readonly string[]).includes(value)
}

/**
 * Currency-native precision:
 *   - MNT: no decimals (tugrik has no commonly-used subunit; Bonum wants integer MNT)
 *   - USD: two decimals (cents)
 */
function decimalsFor(currency: Currency): 0 | 2 {
  return currency === 'MNT' ? 0 : 2
}

/**
 * Format a money amount using Intl.NumberFormat.
 *
 * - Unknown/missing currency falls back to USD (safer than showing a bare number),
 *   but callers should always pass the currency returned by the backend.
 * - Rounding matches backend calcPricing so UI totals line up with persisted totals.
 */
export function formatMoney(amount: number | null | undefined, currency: string | null | undefined): string {
  const safeAmount = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0
  const safeCurrency: Currency = isSupportedCurrency(currency) ? currency : 'USD'
  const decimals = decimalsFor(safeCurrency)
  const locale = safeCurrency === 'MNT' ? 'mn-MN' : 'en-US'
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: safeCurrency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safeAmount)
}

/**
 * Compact variant: just the number with thousands separator, no currency symbol.
 * Use when the currency is shown separately (e.g. inside a label "per person").
 */
export function formatMoneyCompact(amount: number | null | undefined, currency: string | null | undefined): string {
  const safeAmount = typeof amount === 'number' && Number.isFinite(amount) ? amount : 0
  const safeCurrency: Currency = isSupportedCurrency(currency) ? currency : 'USD'
  const decimals = decimalsFor(safeCurrency)
  const locale = safeCurrency === 'MNT' ? 'mn-MN' : 'en-US'
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(safeAmount)
}
