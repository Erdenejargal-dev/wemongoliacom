/**
 * backend/src/middleware/display-currency.ts
 *
 * Phase 2 (Option B) — per-request display currency.
 *
 * WHAT:
 *   Reads the `X-Display-Currency` header (MNT | USD), validates it, and
 *   attaches it to `req.displayCurrency`. When the header is missing or
 *   invalid we leave the field undefined — services treat that as "use the
 *   listing's baseCurrency", preserving Phase 1 behavior.
 *
 * WHY SEPARATE FROM bookingCurrency INPUT:
 *   `bookingCurrency` is the payment currency and MUST come through the
 *   request body so it is explicitly captured in validation (and surfaced
 *   in logs / error responses). The header is advisory only — used by
 *   search results, listing cards, and anywhere we want to render prices
 *   in the user's preferred currency without mutating the contract.
 *
 * Services that need the display currency should read `req.displayCurrency`
 * AFTER calling `next()` in this middleware; controllers that build quote
 * or booking inputs should still pass `bookingCurrency` through the body.
 */

import type { NextFunction, Request, Response } from 'express'
import { isSupportedCurrency, type Currency } from '../utils/currency'

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      displayCurrency?: Currency
    }
  }
}

export function displayCurrencyMiddleware(req: Request, _res: Response, next: NextFunction) {
  const raw = req.header('X-Display-Currency')
  if (raw && isSupportedCurrency(raw)) {
    req.displayCurrency = raw
  }
  next()
}
