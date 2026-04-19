/**
 * backend/test/unit/payment-capability.test.ts
 *
 * Phase 3 + Phase 6.2 — pure tests for the payment capability registry.
 *
 *   - MNT bookings are payable directly via Bonum (no conversion).
 *   - Non-MNT bookings are payable via MNT conversion (MVP behavior).
 *   - Reason codes are a stable enum consumers can branch on.
 *   - `bonumCanCharge` still reflects direct-charge capability.
 *
 * No Prisma / no HTTP. This file can run via:
 *   npm --prefix backend run test:unit
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  describeBookingPaymentCapability,
  bonumCanCharge,
  listPaymentProcessors,
} from '../../src/utils/payment-capability'

const VALID_REASON_CODES = new Set(['ok', 'ok_via_mnt_conversion', 'unsupported_currency'])

test('MNT booking is payable directly (no conversion)', () => {
  const cap = describeBookingPaymentCapability('MNT')
  assert.equal(cap.payable, true)
  assert.equal(cap.reasonCode, 'ok')
  assert.equal(cap.conversionRequired, false)
  assert.equal(cap.payableCurrency, 'MNT')
  assert.equal(cap.userMessage, null)
  assert.ok(cap.supportingProcessors.includes('bonum') || cap.supportingProcessors.includes('bonum_stub'))
})

test('USD booking is payable via MNT conversion (MVP)', () => {
  const cap = describeBookingPaymentCapability('USD')
  assert.equal(cap.payable, true)
  assert.equal(cap.reasonCode, 'ok_via_mnt_conversion')
  assert.equal(cap.conversionRequired, true)
  assert.equal(cap.payableCurrency, 'MNT')
  assert.notEqual(cap.userMessage, null)
  assert.match(cap.userMessage as string, /MNT/i)
  // A Bonum-capable processor must be reported as supporting the payable
  // currency (MNT), so the UI can show who will charge the card/QR.
  assert.ok(
    cap.supportingProcessors.includes('bonum') || cap.supportingProcessors.includes('bonum_stub'),
  )
})

test('bonumCanCharge reflects DIRECT-charge capability (not conversion)', () => {
  // Conversion lives at the payment-service level; this helper stays narrow.
  assert.equal(bonumCanCharge('MNT'), true)
  assert.equal(bonumCanCharge('USD'), false)
})

test('listPaymentProcessors returns JSON-safe copies — mutating it does not affect registry', () => {
  const copy = listPaymentProcessors()
  const bonum = copy.find((p) => p.id === 'bonum')
  assert.ok(bonum, 'bonum must be registered')
  bonum!.supportedCurrencies.push('USD') // should NOT leak back
  const copy2 = listPaymentProcessors()
  const bonum2 = copy2.find((p) => p.id === 'bonum')!
  assert.deepEqual(bonum2.supportedCurrencies, ['MNT'])
})

test('reasonCode is a stable enum the UI can switch on', () => {
  const okCap  = describeBookingPaymentCapability('MNT')
  const conv   = describeBookingPaymentCapability('USD')
  assert.ok(VALID_REASON_CODES.has(okCap.reasonCode))
  assert.ok(VALID_REASON_CODES.has(conv.reasonCode))
})
