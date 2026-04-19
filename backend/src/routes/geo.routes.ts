/**
 * backend/src/routes/geo.routes.ts
 *
 * Phase 6 — UX + Growth Layer.
 *
 * Lightweight geo hint. Reads country from free CDN / platform headers
 * (`CF-IPCountry`, `X-Vercel-IP-Country`) and returns the suggested
 * default language + currency. NEVER writes to the DB. This is an
 * INITIAL suggestion only — user preference must override everything
 * after first selection.
 *
 * Deliberately keep it header-only so we don't introduce a paid IP-geo
 * service.
 */

import { Router, Request, Response } from 'express'
import { ok } from '../utils/response'

const router = Router()

function readCountry(req: Request): string | null {
  const h =
    (req.headers['cf-ipcountry']        as string) ??
    (req.headers['x-vercel-ip-country'] as string) ??
    (req.headers['x-country']           as string) ??
    null
  if (!h) return null
  const code = String(h).trim().toUpperCase()
  if (!/^[A-Z]{2}$/.test(code)) return null
  return code
}

router.get('/hint', (req: Request, res: Response) => {
  const country = readCountry(req)
  const isMongolia = country === 'MN'
  // MVP fix: when no CDN country header is present, do NOT claim EN+USD
  // as a suggestion. The frontend falls back to `navigator.language`
  // which is more accurate than an empty-guess from the server (which
  // would otherwise overwrite a correct browser-derived MN+MNT hint).
  return ok(res, {
    country,                               // may be null if no header
    suggestedLanguage: country ? (isMongolia ? 'mn' : 'en') : null,
    suggestedCurrency: country ? (isMongolia ? 'MNT' : 'USD') : null,
    /**
     * `source` tells the frontend how confident this is:
     *   - 'cdn-header'  : we read CF/Vercel country header — trusted
     *   - 'fallback'    : no header was present → suggestions are null;
     *                     client should use its own browser-language
     *                     heuristic instead of trusting this.
     */
    source: country ? 'cdn-header' : 'fallback',
  })
})

export default router
