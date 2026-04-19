/**
 * backend/src/utils/fx.ts
 *
 * Phase 2 (Option B) — single source of truth for currency conversion.
 *
 * CONTRACT:
 *   - Same-currency conversion is a no-op that returns {rate: 1, source: 'same_currency'}
 *     WITHOUT a DB lookup. This is the hot path on Phase 1 data.
 *   - Cross-currency conversion looks up the most recent `FxRate` row with
 *     `effectiveFrom <= at` for the requested (from, to) pair. Corrections
 *     never mutate rows — a new row with a later effectiveFrom is the
 *     correction mechanism.
 *   - Missing rate throws AppError(503) with an explicit message. This is
 *     intentionally loud: Bonum bookings cannot be priced without it.
 *   - We NEVER invent rates here and we NEVER hardcode fallback rates in
 *     business logic.
 *   - Rounding is currency-aware via `roundMoney` from `currency.ts`
 *     (0 decimals for MNT, 2 for USD).
 *
 * Pluggable providers: future automation (Bank of Mongolia scraper, any
 * REST provider) implements `FxRateProvider` and writes rows into `fx_rates`.
 * Services never call providers directly — they always read via `getActiveRate`.
 */

import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'
import { assertSupportedCurrency, roundMoney, type Currency } from './currency'

// ─────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────

export interface FxRateSnapshot {
  fromCurrency: Currency
  toCurrency:   Currency
  rate:         number    // 1 fromCurrency === rate * toCurrency
  capturedAt:   Date
  source:       string    // 'same_currency' | 'manual' | 'bank_of_mongolia' | ...
}

export interface FxRateProvider {
  readonly source: string
  fetchRate(from: Currency, to: Currency, at?: Date): Promise<Omit<FxRateSnapshot, 'toCurrency' | 'fromCurrency'>>
}

// ─────────────────────────────────────────────────────────────────────────
// getActiveRate — resolves the canonical rate for (from, to) at time `at`.
// ─────────────────────────────────────────────────────────────────────────

export async function getActiveRate(
  from: Currency,
  to:   Currency,
  at:   Date = new Date(),
): Promise<FxRateSnapshot> {
  assertSupportedCurrency(from, 'from')
  assertSupportedCurrency(to,   'to')

  if (from === to) {
    return {
      fromCurrency: from,
      toCurrency:   to,
      rate:         1,
      capturedAt:   at,
      source:       'same_currency',
    }
  }

  const row = await prisma.fxRate.findFirst({
    where: {
      fromCurrency:  from,
      toCurrency:    to,
      effectiveFrom: { lte: at },
    },
    orderBy: { effectiveFrom: 'desc' },
  })

  if (!row) {
    throw new AppError(
      `FX rate unavailable for ${from}→${to} at ${at.toISOString()}. ` +
      'An administrator must add an active rate from the admin dashboard ' +
      '(Admin → Pricing & FX → FX rates).',
      503,
    )
  }

  return {
    fromCurrency: from,
    toCurrency:   to,
    rate:         row.rate,
    capturedAt:   row.effectiveFrom,
    source:       row.source,
  }
}

// ─────────────────────────────────────────────────────────────────────────
// convert — pure math, uses a caller-supplied snapshot so the same rate is
// applied consistently across subtotal / serviceFee / total.
//
// `snapshot.toCurrency` MUST match `targetCurrency`. The extra argument is
// there so callers can express intent explicitly and catch mismatches.
// ─────────────────────────────────────────────────────────────────────────

export function convert(
  amount:         number,
  snapshot:       FxRateSnapshot,
  targetCurrency: Currency,
): number {
  if (snapshot.toCurrency !== targetCurrency) {
    throw new AppError(
      `FX snapshot targets ${snapshot.toCurrency} but caller asked for ${targetCurrency}.`,
      500,
    )
  }
  if (snapshot.fromCurrency === targetCurrency) {
    return roundMoney(amount, targetCurrency)
  }
  return roundMoney(amount * snapshot.rate, targetCurrency)
}

// ─────────────────────────────────────────────────────────────────────────
// convertWithSnapshot — convenience wrapper: resolve rate and convert in
// one call. Returns both the converted amount and the snapshot so the
// caller can persist the snapshot on the booking row.
// ─────────────────────────────────────────────────────────────────────────

export async function convertWithSnapshot(
  amount: number,
  from:   Currency,
  to:     Currency,
  at?:    Date,
): Promise<{ amount: number; snapshot: FxRateSnapshot }> {
  const snapshot = await getActiveRate(from, to, at)
  return { amount: convert(amount, snapshot, to), snapshot }
}

// ─────────────────────────────────────────────────────────────────────────
// Admin CRUD helpers (used by admin.service). Enforces currency validation
// and refuses to mutate existing rows — corrections create a new row.
// ─────────────────────────────────────────────────────────────────────────

export interface CreateFxRateInput {
  fromCurrency:   string
  toCurrency:     string
  rate:           number
  effectiveFrom?: string | Date
  source?:        string
  note?:          string | null
}

export async function createFxRate(input: CreateFxRateInput, createdById?: string) {
  const from = assertSupportedCurrency(input.fromCurrency, 'fromCurrency')
  const to   = assertSupportedCurrency(input.toCurrency,   'toCurrency')
  if (from === to) {
    throw new AppError('fromCurrency and toCurrency must differ.', 400)
  }
  if (!Number.isFinite(input.rate) || input.rate <= 0) {
    throw new AppError('rate must be a positive, finite number.', 400)
  }

  const effectiveFrom = input.effectiveFrom
    ? new Date(input.effectiveFrom)
    : new Date()

  if (isNaN(effectiveFrom.getTime())) {
    throw new AppError('effectiveFrom must be a valid ISO date.', 400)
  }

  return prisma.fxRate.create({
    data: {
      fromCurrency:  from,
      toCurrency:    to,
      rate:          input.rate,
      effectiveFrom,
      source:        input.source?.trim() || 'manual',
      note:          input.note ?? null,
      createdById:   createdById ?? null,
    },
  })
}

export interface ListFxRatesQuery {
  fromCurrency?: string
  toCurrency?:   string
  page?:         number
  limit?:        number
}

export async function listFxRates(query: ListFxRatesQuery = {}) {
  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(200, query.limit ?? 50)
  const skip  = (page - 1) * limit

  const where: { fromCurrency?: string; toCurrency?: string } = {}
  if (query.fromCurrency) where.fromCurrency = assertSupportedCurrency(query.fromCurrency, 'fromCurrency')
  if (query.toCurrency)   where.toCurrency   = assertSupportedCurrency(query.toCurrency,   'toCurrency')

  const [data, total] = await Promise.all([
    prisma.fxRate.findMany({
      where,
      orderBy: { effectiveFrom: 'desc' },
      skip,
      take: limit,
    }),
    prisma.fxRate.count({ where }),
  ])

  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
}
