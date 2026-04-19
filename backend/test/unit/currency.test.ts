/**
 * backend/test/unit/currency.test.ts
 *
 * Phase 1/3 — invariants around the currency enum & rounding.
 *
 * Protects:
 *   - rejecting junk currency strings
 *   - MNT is integer-rounded (Bonum expects minor-unit-free integers)
 *   - USD keeps 2 decimals
 *   - the enum stays MNT|USD — anyone adding EUR breaks the test deliberately
 */

import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  assertSupportedCurrency,
  isSupportedCurrency,
  roundMoney,
  decimalsFor,
  SUPPORTED_CURRENCIES,
} from '../../src/utils/currency'

test('currency enum is exactly MNT and USD', () => {
  assert.deepEqual([...SUPPORTED_CURRENCIES], ['MNT', 'USD'])
})

test('isSupportedCurrency rejects junk and accepts enum values', () => {
  assert.equal(isSupportedCurrency('MNT'), true)
  assert.equal(isSupportedCurrency('USD'), true)
  assert.equal(isSupportedCurrency('mnt'), false) // case sensitive on purpose
  assert.equal(isSupportedCurrency('EUR'), false)
  assert.equal(isSupportedCurrency(null), false)
  assert.equal(isSupportedCurrency(undefined), false)
  assert.equal(isSupportedCurrency(123), false)
})

test('assertSupportedCurrency throws a 400-style AppError on junk', () => {
  assert.throws(() => assertSupportedCurrency('EUR'), /Unsupported/)
  assert.doesNotThrow(() => assertSupportedCurrency('MNT'))
})

test('MNT rounding is integer (Bonum requires no minor units)', () => {
  assert.equal(decimalsFor('MNT'), 0)
  assert.equal(roundMoney(120.6, 'MNT'), 121)
  assert.equal(roundMoney(120.4, 'MNT'), 120)
})

test('USD rounding is 2 decimals', () => {
  assert.equal(decimalsFor('USD'), 2)
  assert.equal(roundMoney(120.005, 'USD'), 120.01)
  assert.equal(roundMoney(120.004, 'USD'), 120)
})
