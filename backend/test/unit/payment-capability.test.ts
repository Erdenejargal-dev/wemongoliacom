/**
 * backend/test/unit/payment-capability.test.ts
 *
 * Phase 3 — pure tests for the payment capability registry. These protect
 * the contract the entire traveler UX + admin visibility now depends on:
 *
 *   - MNT bookings are always payable today (via Bonum)
 *   - USD bookings are refused with a user-friendly message (not a 400
 *     Internal-Server-Error-looking string)
 *   - The reason codes are stable — consumers branch on them
 *   - bonumCanCharge agrees with the registry
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

test('MNT booking is payable and reports ok', () => {
  const cap = describeBookingPaymentCapability('MNT')
  assert.equal(cap.payable, true)
  assert.equal(cap.reasonCode, 'ok')
  assert.equal(cap.userMessage, null)
  assert.ok(cap.supportingProcessors.includes('bonum') || cap.supportingProcessors.includes('bonum_stub'))
})

test('USD booking is NOT payable today and names Bonum MNT-only constraint', () => {
  const cap = describeBookingPaymentCapability('USD')
  assert.equal(cap.payable, false)
  assert.equal(cap.reasonCode, 'bonum_mnt_only')
  assert.notEqual(cap.userMessage, null)
  assert.match(cap.userMessage as string, /MNT/i)
  assert.deepEqual(cap.supportingProcessors, [])
})

test('bonumCanCharge reflects the registry and refuses USD', () => {
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
  const badCap = describeBookingPaymentCapability('USD')
  assert.ok(['ok', 'bonum_mnt_only', 'unsupported_currency'].includes(okCap.reasonCode))
  assert.ok(['ok', 'bonum_mnt_only', 'unsupported_currency'].includes(badCap.reasonCode))
})
