/**
 * Internal job routes — for scheduled/cron triggers.
 * Protected by CRON_SECRET (X-Cron-Secret header or Authorization: Bearer <secret>).
 * Does not use JWT auth.
 */

import { Router, Request, Response } from 'express'
import { env } from '../config/env'
import { expireStalePendingTourBookings } from '../services/booking.service'

const router = Router()

function validateCronSecret(req: Request, res: Response, next: () => void) {
  const secret = env.CRON_SECRET
  if (!secret || secret.length < 16) {
    res.status(503).json({
      success: false,
      error: 'Cron jobs not configured (CRON_SECRET missing or too short).',
    })
    return
  }
  const provided =
    req.headers['x-cron-secret'] ??
    (req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.slice(7)
      : null)
  if (provided !== secret) {
    res.status(401).json({ success: false, error: 'Unauthorized.' })
    return
  }
  next()
}

/**
 * POST /internal/jobs/expire-stale-bookings
 * Expires stale pending tour bookings. Call via cron or scheduler.
 * Requires: X-Cron-Secret or Authorization: Bearer <CRON_SECRET>
 */
router.post('/jobs/expire-stale-bookings', validateCronSecret, async (_req, res) => {
  try {
    const expired = await expireStalePendingTourBookings(env.PENDING_EXPIRY_MINUTES)
    if (expired > 0) {
      console.log(`[expiry-job] Expired ${expired} stale pending tour booking(s)`)
    }
    res.json({ success: true, expired })
  } catch (err) {
    console.error('[expiry-job] Error:', err)
    res.status(500).json({ success: false, error: 'Expiry job failed.' })
  }
})

export default router
