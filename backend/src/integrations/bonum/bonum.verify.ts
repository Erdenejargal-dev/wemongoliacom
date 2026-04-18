import crypto from 'crypto'
import type { Request } from 'express'
import { env } from '../../config/env'

/** Bonum merchant guide: webhook verification header */
export const BONUM_CHECKSUM_HEADER = 'x-checksum-v2'

/**
 * Read the `x-checksum-v2` header exactly as sent (Express stores header names lowercased).
 */
export function getBonumChecksumHeader(req: Request): string | undefined {
  const v = req.headers[BONUM_CHECKSUM_HEADER]
  if (typeof v === 'string') return v
  if (Array.isArray(v)) return v[0]
  return undefined
}

/**
 * Bonum webhook verification (merchant guide):
 * - HMAC-SHA256 over the **raw** request body bytes (the JSON octets as received; no re-serialize).
 * - Secret: `BONUM_MERCHANT_CHECKSUM_KEY`
 * - Digest: lowercase hex string
 * - Compare to `x-checksum-v2` with timing-safe equality on the 32-byte digest values.
 *
 * @returns true only if key and header present and digest matches.
 */
export function verifyBonumChecksumV2(rawBody: Buffer, checksumHeader: string | undefined): boolean {
  const secret = env.BONUM_MERCHANT_CHECKSUM_KEY?.trim()
  if (!secret) return false
  if (!checksumHeader?.trim()) return false

  const received = checksumHeader.trim().toLowerCase()
  if (!/^[0-9a-f]{64}$/.test(received)) {
    return false
  }

  const expectedHex = crypto
    .createHmac('sha256', secret)
    .update(rawBody)
    .digest('hex')
    .toLowerCase()

  if (expectedHex.length !== received.length) {
    return false
  }

  let expectedBuf: Buffer
  let receivedBuf: Buffer
  try {
    expectedBuf = Buffer.from(expectedHex, 'hex')
    receivedBuf = Buffer.from(received, 'hex')
  } catch {
    return false
  }

  if (expectedBuf.length !== receivedBuf.length) {
    return false
  }

  try {
    return crypto.timingSafeEqual(expectedBuf, receivedBuf)
  } catch {
    return false
  }
}

/** @deprecated use BONUM_CHECKSUM_HEADER */
export function bonumChecksumHeaderName(): string {
  return BONUM_CHECKSUM_HEADER
}
