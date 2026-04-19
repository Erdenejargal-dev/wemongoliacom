/**
 * backend/src/services/pricing-health.service.ts
 *
 * Phase 3 — admin/operator visibility into pricing and FX integrity.
 *
 * This service exposes READ-ONLY diagnostics so ops can answer questions
 * like "are any listings missing normalization?", "which bookings are
 * blocked from payment because the processor can't settle their currency?",
 * and "when did the USD→MNT rate last refresh?". It NEVER mutates data.
 *
 * Repair actions for flagged rows are deliberately kept out of scope for
 * this file — the audit prompt requires any mutation to be explicit, guarded
 * and separately authored.
 */

import { prisma } from '../lib/prisma'
import { Prisma } from '@prisma/client'
import { getActiveRate } from '../utils/fx'
import {
  describeBookingPaymentCapability,
  listPaymentProcessors,
} from '../utils/payment-capability'
import { assertSupportedCurrency, SUPPORTED_CURRENCIES, type Currency } from '../utils/currency'

// ─── FX rate freshness ──────────────────────────────────────────────────

export interface FxRateHealth {
  fromCurrency:        Currency
  toCurrency:          Currency
  rate:                number | null
  source:              string | null
  effectiveFrom:       Date | null
  /** Seconds since the rate was recorded. Null if no rate exists. */
  ageSeconds:          number | null
  /**
   *   - ok          : rate exists and was updated within `staleAfterSeconds`
   *   - stale       : rate exists but is older than `staleAfterSeconds`
   *   - missing     : no rate has ever been recorded for this pair
   */
  status:              'ok' | 'stale' | 'missing'
}

/**
 * Health of all required non-trivial FX pairs. We only probe cross-currency
 * pairs (MNT↔USD today) because same-currency is a no-op and handled
 * without an FX lookup in `utils/fx.ts`.
 *
 * `staleAfterSeconds` defaults to 48h — long enough to absorb a weekend
 * without alarms, short enough that an abandoned rate feed is noticed.
 */
export async function getFxRateHealth(staleAfterSeconds = 48 * 60 * 60): Promise<FxRateHealth[]> {
  const pairs: Array<[Currency, Currency]> = []
  for (const from of SUPPORTED_CURRENCIES) {
    for (const to of SUPPORTED_CURRENCIES) {
      if (from !== to) pairs.push([from, to])
    }
  }
  const out: FxRateHealth[] = []
  for (const [from, to] of pairs) {
    try {
      const snap = await getActiveRate(from, to)
      const ageSeconds = Math.floor((Date.now() - new Date(snap.capturedAt).getTime()) / 1000)
      out.push({
        fromCurrency:  from,
        toCurrency:    to,
        rate:          snap.rate,
        source:        snap.source,
        effectiveFrom: snap.capturedAt,
        ageSeconds,
        // same_currency is always fresh and has no meaningful age
        status:        snap.source === 'same_currency'
          ? 'ok'
          : (ageSeconds > staleAfterSeconds ? 'stale' : 'ok'),
      })
    } catch {
      out.push({
        fromCurrency:  from,
        toCurrency:    to,
        rate:          null,
        source:        null,
        effectiveFrom: null,
        ageSeconds:    null,
        status:        'missing',
      })
    }
  }
  return out
}

// ─── Currency distribution across listings and bookings ─────────────────

export interface CurrencyDistribution {
  listings: {
    tours:  Record<string, number>
    rooms:  Record<string, number>
    vehicles: Record<string, number>
  }
  bookings: {
    byChargeCurrency: Record<string, { count: number; totalAmount: number }>
    byBaseCurrency:   Record<string, { count: number; totalAmount: number }>
  }
}

function bucket<T extends { currency: string | null; _count?: { currency: number } }>(rows: T[]) {
  const out: Record<string, number> = {}
  for (const r of rows) {
    const key = (r.currency ?? 'UNKNOWN') as string
    const count = (r as any)._count?.currency ?? 1
    out[key] = (out[key] ?? 0) + count
  }
  return out
}

export async function getCurrencyDistribution(): Promise<CurrencyDistribution> {
  const [tourRows, roomRows, vehRows, bookByCharge, bookByBase] = await Promise.all([
    prisma.tour.groupBy({ by: ['currency'], _count: { currency: true } }),
    prisma.roomType.groupBy({ by: ['currency'], _count: { currency: true } }),
    prisma.vehicle.groupBy({ by: ['currency'], _count: { currency: true } }),
    prisma.booking.groupBy({
      by: ['currency'],
      _count: { currency: true },
      _sum:   { totalAmount: true },
    }),
    prisma.booking.groupBy({
      by: ['baseCurrency'],
      _count: { baseCurrency: true },
      _sum:   { totalAmount: true },
    }),
  ])

  const byChargeCurrency: CurrencyDistribution['bookings']['byChargeCurrency'] = {}
  for (const r of bookByCharge) {
    byChargeCurrency[r.currency ?? 'UNKNOWN'] = {
      count:       r._count.currency,
      totalAmount: r._sum.totalAmount ?? 0,
    }
  }
  const byBaseCurrency: CurrencyDistribution['bookings']['byBaseCurrency'] = {}
  for (const r of bookByBase) {
    byBaseCurrency[r.baseCurrency ?? 'UNKNOWN'] = {
      count:       r._count.baseCurrency,
      totalAmount: r._sum.totalAmount ?? 0,
    }
  }

  return {
    listings: {
      tours:    bucket(tourRows),
      rooms:    bucket(roomRows),
      vehicles: bucket(vehRows),
    },
    bookings: {
      byChargeCurrency,
      byBaseCurrency,
    },
  }
}

// ─── Listings missing normalization ─────────────────────────────────────

export interface MissingNormalizationSummary {
  tours:    number
  rooms:    number
  vehicles: number
  /** First 20 IDs in each bucket so ops can spot-check quickly. */
  samples: {
    tours:    string[]
    rooms:    string[]
    vehicles: string[]
  }
}

export async function getListingsMissingNormalization(): Promise<MissingNormalizationSummary> {
  const where = { normalizedAmountMnt: null } as const
  const [
    toursCount,   roomsCount,   vehCount,
    tourSamples, roomSamples, vehSamples,
  ] = await Promise.all([
    prisma.tour.count({ where }),
    prisma.roomType.count({ where }),
    prisma.vehicle.count({ where }),
    prisma.tour.findMany({ where, select: { id: true }, take: 20 }),
    prisma.roomType.findMany({ where, select: { id: true }, take: 20 }),
    prisma.vehicle.findMany({ where, select: { id: true }, take: 20 }),
  ])
  return {
    tours:    toursCount,
    rooms:    roomsCount,
    vehicles: vehCount,
    samples: {
      tours:    tourSamples.map((r) => r.id),
      rooms:    roomSamples.map((r) => r.id),
      vehicles: vehSamples.map((r) => r.id),
    },
  }
}

// ─── Backfill report visibility ─────────────────────────────────────────

export interface BackfillReportListQuery {
  resolved?:     boolean
  entityType?:   string
  issue?:        string
  page?:         number
  limit?:        number
}

/**
 * Categorization of the freeform `issue` string written by the backfill
 * migration. The buckets are the exact ones named in the Phase 3 prompt:
 * missing FX rate, unknown units, legacy currency anomalies, and
 * "other / manual review".
 */
export function categorizeBackfillIssue(issue: string): 'missing_fx_rate' | 'unknown_units' | 'legacy_currency' | 'other' {
  const lc = issue.toLowerCase()
  if (lc.includes('fx') || lc.includes('rate')) return 'missing_fx_rate'
  if (lc.includes('unit') || lc.includes('quantity') || lc.includes('nights')) return 'unknown_units'
  if (lc.includes('currency') || lc.includes('mismatch') || lc.includes('override')) return 'legacy_currency'
  return 'other'
}

export async function listBackfillReports(query: BackfillReportListQuery = {}) {
  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(200, query.limit ?? 50)
  const skip  = (page - 1) * limit

  const where: Prisma.FxBackfillReportWhereInput = {}
  if (query.resolved === true)  where.resolvedAt = { not: null }
  if (query.resolved === false) where.resolvedAt = null
  if (query.entityType)         where.entityType = query.entityType
  if (query.issue)              where.issue      = { contains: query.issue, mode: 'insensitive' }

  const [rows, total, countsByCat] = await Promise.all([
    prisma.fxBackfillReport.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.fxBackfillReport.count({ where }),
    prisma.fxBackfillReport.findMany({ select: { issue: true, resolvedAt: true } }),
  ])

  const categoryCounts: Record<string, { total: number; unresolved: number }> = {
    missing_fx_rate:   { total: 0, unresolved: 0 },
    unknown_units:     { total: 0, unresolved: 0 },
    legacy_currency:   { total: 0, unresolved: 0 },
    other:             { total: 0, unresolved: 0 },
  }
  for (const r of countsByCat) {
    const cat = categorizeBackfillIssue(r.issue)
    categoryCounts[cat].total += 1
    if (!r.resolvedAt) categoryCounts[cat].unresolved += 1
  }

  return {
    data: rows.map((r) => ({ ...r, category: categorizeBackfillIssue(r.issue) })),
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
    categoryCounts,
  }
}

// ─── Backfill report: inspect one + mark resolved ───────────────────────

/**
 * Fetch one backfill report and, where possible, the current state of the
 * row it flagged. This is STRICTLY READ-ONLY: it does not mutate the
 * flagged entity. Intended for ops spot-checks before deciding whether to
 * hand-edit a row outside this service.
 */
export async function getBackfillReportDetail(id: string) {
  const report = await prisma.fxBackfillReport.findUnique({ where: { id } })
  if (!report) return null

  let target: unknown = null
  try {
    switch (report.entityType) {
      case 'tour':
        target = await prisma.tour.findUnique({
          where: { id: report.entityId },
          select: {
            id: true, slug: true, title: true,
            baseAmount: true, baseCurrency: true,
            normalizedAmountMnt: true, normalizedFxRate: true, normalizedFxRateAt: true,
            basePrice: true, currency: true,
          },
        })
        break
      case 'roomType':
        target = await prisma.roomType.findUnique({
          where: { id: report.entityId },
          select: {
            id: true, name: true,
            baseAmount: true, baseCurrency: true,
            normalizedAmountMnt: true, normalizedFxRate: true, normalizedFxRateAt: true,
            basePricePerNight: true, currency: true,
          },
        })
        break
      case 'vehicle':
        target = await prisma.vehicle.findUnique({
          where: { id: report.entityId },
          select: {
            id: true, title: true,
            baseAmount: true, baseCurrency: true,
            normalizedAmountMnt: true, normalizedFxRate: true, normalizedFxRateAt: true,
            pricePerDay: true, currency: true,
          },
        })
        break
      case 'booking':
        target = await prisma.booking.findUnique({
          where: { id: report.entityId },
          select: {
            id: true, bookingCode: true, listingType: true,
            currency: true, baseCurrency: true, totalAmount: true,
            baseSubtotal: true, baseServiceFee: true, baseTotalAmount: true,
            fxRateCapturedAt: true, fxRate: true, paymentStatus: true, bookingStatus: true,
          },
        })
        break
      default:
        target = null
    }
  } catch {
    // Keep inspect endpoint resilient — a missing/renamed entity shouldn't
    // crash the admin page.
    target = null
  }

  return {
    report:   { ...report, category: categorizeBackfillIssue(report.issue) },
    target,
  }
}

/**
 * Mark a backfill report resolved. This ONLY updates the report itself
 * (closes the ticket). It deliberately does NOT touch the flagged entity —
 * any data repair must be an explicit, separately-authored action taken
 * outside this audit surface.
 */
export async function markBackfillReportResolved(id: string, params: { resolvedBy: string }) {
  const existing = await prisma.fxBackfillReport.findUnique({ where: { id } })
  if (!existing) return null
  if (existing.resolvedAt) {
    // Idempotent — return what's already there.
    return { ...existing, category: categorizeBackfillIssue(existing.issue) }
  }

  const updated = await prisma.fxBackfillReport.update({
    where: { id },
    data: {
      resolvedAt: new Date(),
      resolvedBy: params.resolvedBy,
    },
  })
  return { ...updated, category: categorizeBackfillIssue(updated.issue) }
}

// ─── Payment-blocked bookings ───────────────────────────────────────────

export interface PaymentBlockedBooking {
  id:              string
  bookingCode:     string
  currency:        string
  baseCurrency:    string | null
  totalAmount:     number
  paymentStatus:   string
  bookingStatus:   string
  reasonCode:      string
  userMessage:     string
  createdAt:       Date
}

/**
 * Bookings the current processor cannot settle. Today this means "not MNT";
 * once Visa support goes live, adding the processor to the registry flips
 * these rows back to normal without touching this query.
 *
 * We include only unpaid/pending bookings — a paid non-MNT booking is a
 * historical artifact, not an operational blocker.
 */
export async function getPaymentBlockedBookings(limit = 100): Promise<PaymentBlockedBooking[]> {
  const rows = await prisma.booking.findMany({
    where: {
      paymentStatus: { in: ['unpaid', 'failed'] },
      bookingStatus: { notIn: ['cancelled', 'completed'] },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      id: true, bookingCode: true, currency: true, baseCurrency: true,
      totalAmount: true, paymentStatus: true, bookingStatus: true, createdAt: true,
    },
  })
  const out: PaymentBlockedBooking[] = []
  for (const r of rows) {
    let cur: Currency
    try { cur = assertSupportedCurrency(r.currency, 'booking.currency') } catch { continue }
    const cap = describeBookingPaymentCapability(cur)
    if (cap.payable) continue
    out.push({
      id:            r.id,
      bookingCode:   r.bookingCode,
      currency:      r.currency,
      baseCurrency:  r.baseCurrency,
      totalAmount:   r.totalAmount,
      paymentStatus: r.paymentStatus,
      bookingStatus: r.bookingStatus,
      reasonCode:    cap.reasonCode,
      userMessage:   cap.userMessage ?? '',
      createdAt:     r.createdAt,
    })
  }
  return out
}

// ─── Single aggregate ───────────────────────────────────────────────────

/**
 * One call for the admin pricing-health page. Returns every read-only
 * diagnostic in a single payload so the frontend can render with a single
 * fetch (matches the existing admin UX pattern).
 */
export async function getPricingHealthOverview() {
  const [fx, distribution, missing, blocked] = await Promise.all([
    getFxRateHealth(),
    getCurrencyDistribution(),
    getListingsMissingNormalization(),
    getPaymentBlockedBookings(50),
  ])
  return {
    generatedAt:        new Date().toISOString(),
    processors:         listPaymentProcessors(),
    fxRates:            fx,
    currencyDistribution: distribution,
    missingNormalization: missing,
    paymentBlockedBookings: blocked,
  }
}
