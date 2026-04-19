/**
 * backend/test/unit/pricing.test.ts
 *
 * Phase 3 — tests for the pure pieces of the pricing contract. We cover the
 * functions that do NOT require a live Prisma connection:
 *
 *   - toPricingDTO (pure)
 *   - resolveListingBasePricePerUnit (pure)
 *
 * The DB-touching pricing helpers (resolveBasePricing, calcBookingPricing)
 * are best covered in integration tests with a test DB; this file is
 * intentionally a fast, Prisma-free unit suite.
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  toPricingDTO,
  resolveListingBasePricePerUnit,
} from '../../src/utils/pricing'

test('toPricingDTO returns null when there is nothing to price', () => {
  assert.equal(toPricingDTO({}), null)
})

test('toPricingDTO prefers baseAmount/baseCurrency and exposes legacy mirrors', () => {
  const dto = toPricingDTO({
    baseAmount:   420000,
    baseCurrency: 'MNT',
  })
  assert.ok(dto)
  assert.equal(dto!.base.amount, 420000)
  assert.equal(dto!.base.currency, 'MNT')
  assert.equal(dto!.legacy.amount, 420000)
  assert.equal(dto!.normalized, null)
})

test('toPricingDTO falls back to legacy pricing when new fields are absent', () => {
  const dto = toPricingDTO({
    legacyAmount:   420,
    legacyCurrency: 'USD',
  })
  assert.ok(dto)
  assert.equal(dto!.base.currency, 'USD')
  assert.equal(dto!.base.amount, 420)
  assert.equal(dto!.normalized, null)
})

test('toPricingDTO surfaces normalized MNT figure when FX metadata is present', () => {
  const dto = toPricingDTO({
    baseAmount:          100,
    baseCurrency:        'USD',
    normalizedAmountMnt: 350000,
    normalizedFxRate:    3500,
    normalizedFxRateAt:  new Date('2026-04-19T00:00:00Z'),
  })
  assert.ok(dto)
  assert.equal(dto!.normalized?.amount, 350000)
  assert.equal(dto!.normalized?.currency, 'MNT')
  assert.equal(dto!.normalized?.fxRate, 3500)
  assert.equal(typeof dto!.normalized?.fxRateAt, 'string')
})

test('resolveListingBasePricePerUnit prefers override when present', () => {
  const out = resolveListingBasePricePerUnit({
    baseAmount:            420000,
    baseCurrency:          'MNT',
    baseOverrideAmount:    500000,
    baseOverrideCurrency:  'MNT',
    label:                 'tourDeparture',
  })
  assert.equal(out.amount, 500000)
  assert.equal(out.currency, 'MNT')
})

test('resolveListingBasePricePerUnit falls back to base if no override is set', () => {
  const out = resolveListingBasePricePerUnit({
    baseAmount:   420000,
    baseCurrency: 'MNT',
    label:        'tour',
  })
  assert.equal(out.amount, 420000)
  assert.equal(out.currency, 'MNT')
})

test('resolveListingBasePricePerUnit reads legacy fields when new fields are absent', () => {
  const out = resolveListingBasePricePerUnit({
    legacyAmount:   420,
    legacyCurrency: 'USD',
    label:          'roomType',
  })
  assert.equal(out.amount, 420)
  assert.equal(out.currency, 'USD')
})

test('resolveListingBasePricePerUnit rejects unknown currency loudly', () => {
  assert.throws(
    () =>
      resolveListingBasePricePerUnit({
        legacyAmount:   420,
        legacyCurrency: 'EUR',
        label:          'tour',
      }),
    /Unsupported/i,
  )
})
