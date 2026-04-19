/**
 * backend/src/routes/fx.routes.ts
 *
 * Phase 6 — UX + Growth Layer.
 *
 * Read-only FX rate endpoint for FRONTEND DISPLAY HINTS only.
 *
 * This endpoint:
 *   - Reads the authoritative `fxRate` table via `getActiveRate`.
 *   - Never computes or stores money.
 *   - Never invents a rate — if no seeded rate exists, it returns null
 *     and the frontend gracefully hides the secondary-currency hint.
 *
 * It is DELIBERATELY not used in any pricing calculation — those go
 * through the existing pricing path (which also uses `getActiveRate`
 * with a snapshot captured at booking time).
 */

import { Router, Request, Response } from 'express'
import { getActiveRate } from '../utils/fx'
import { isSupportedCurrency, type Currency } from '../utils/currency'
import { ok } from '../utils/response'

const router = Router()

router.get('/rate', async (req: Request, res: Response) => {
  const from = String(req.query.from ?? '').toUpperCase()
  const to   = String(req.query.to   ?? '').toUpperCase()

  if (!isSupportedCurrency(from) || !isSupportedCurrency(to)) {
    return res.status(400).json({
      success: false,
      error:   'from and to must be supported currencies',
    })
  }

  try {
    const snap = await getActiveRate(from as Currency, to as Currency)
    return ok(res, {
      from:       snap.fromCurrency,
      to:         snap.toCurrency,
      rate:       snap.rate,
      capturedAt: snap.capturedAt,
      source:     snap.source,
    })
  } catch {
    // No rate seeded → tell the client so it can hide the hint cleanly
    // (we deliberately don't surface a 503 here; this endpoint is a hint).
    return ok(res, { from, to, rate: null })
  }
})

export default router
