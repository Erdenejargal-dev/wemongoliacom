/**
 * backend/src/utils/currency.ts
 *
 * Phase 1 (Stabilization) — strict currency helpers.
 *
 * Phase 1 intentionally does NOT introduce multi-currency semantics
 * (no baseAmount/baseCurrency, no FX). It only:
 *   - defines the supported enum ("MNT" | "USD")
 *   - provides runtime validation used by listing services to reject junk
 *   - provides consistent rounding per currency
 *   - provides a server-side formatter that matches the frontend formatter
 */

import { AppError } from '../middleware/error'

export const SUPPORTED_CURRENCIES = ['MNT', 'USD'] as const
export type Currency = (typeof SUPPORTED_CURRENCIES)[number]

export function isSupportedCurrency(value: unknown): value is Currency {
  return typeof value === 'string' && (SUPPORTED_CURRENCIES as readonly string[]).includes(value)
}

/**
 * Throws a 400 AppError if the value is not a supported currency.
 * Use at service boundaries (create/update listing) to prevent persisting
 * free-form currency strings like "eur" or "usdt".
 */
export function assertSupportedCurrency(value: unknown, field = 'currency'): Currency {
  if (!isSupportedCurrency(value)) {
    throw new AppError(
      `Unsupported ${field}. Allowed values: ${SUPPORTED_CURRENCIES.join(', ')}.`,
      400,
    )
  }
  return value
}

/**
 * Number of decimal places used for storage/rounding per currency.
 * Bonum expects integer MNT; USD uses 2-decimal accounting.
 */
export function decimalsFor(currency: Currency): 0 | 2 {
  return currency === 'MNT' ? 0 : 2
}

/**
 * Round an amount to the currency's native precision.
 * Uses "half away from zero" rounding (same as Math.round for positives).
 */
export function roundMoney(amount: number, currency: Currency): number {
  const factor = Math.pow(10, decimalsFor(currency))
  return Math.round(amount * factor) / factor
}

/**
 * Server-side formatter mirroring lib/money.ts on the frontend.
 * Intended for emails, logs, admin CSV exports — never for persisting.
 */
export function formatMoney(amount: number, currency: Currency): string {
  const locale = currency === 'MNT' ? 'mn-MN' : 'en-US'
  const decimals = decimalsFor(currency)
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount)
}
