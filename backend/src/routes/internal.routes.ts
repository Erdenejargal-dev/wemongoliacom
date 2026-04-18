/**
 * Internal job routes — for scheduled/cron triggers.
 * Protected by CRON_SECRET (X-Cron-Secret header or Authorization: Bearer <secret>).
 * Does not use JWT auth.
 */

import { Router, Request, Response } from 'express'
import { env } from '../config/env'
import { sendSmtpTest } from '../services/email.service'
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

/**
 * POST /internal/dev/bonum-simulate-paid/:paymentId
 * Synthetic Bonum PAYMENT/SUCCESS webhook for local testing (requires CRON_SECRET).
 */
router.post('/dev/bonum-simulate-paid/:paymentId', validateCronSecret, async (req, res) => {
  try {
    const { ingestBonumWebhook } = await import('../services/bonumWebhook.service')
    const { prisma } = await import('../lib/prisma')
    const payment = await prisma.payment.findUnique({ where: { id: String(req.params.paymentId) } })
    if (!payment) {
      res.status(404).json({ success: false, error: 'Payment not found.' })
      return
    }
    const payload = {
      type:   'PAYMENT',
      status: 'SUCCESS',
      body: {
        transactionId: payment.id,
        invoiceId:     payment.providerOrderId ?? `dev-inv-${payment.id}`,
        status:        'PAID',
        completedAt:   new Date().toISOString(),
        paymentVendor: 'DEV_SIMULATE',
      },
    }
    const raw = Buffer.from(JSON.stringify(payload))
    const result = await ingestBonumWebhook(raw, undefined)
    res.status(result.status).json({ success: true, webhook: result.body })
  } catch (err) {
    console.error('[dev/bonum-simulate-paid]', err)
    res.status(500).json({ success: false, error: 'Simulate failed.' })
  }
})

/**
 * POST /internal/dev/test-email — optional SMTP test.
 */
router.post('/dev/test-email', validateCronSecret, async (req, res) => {
  try {
    const to = typeof req.body?.to === 'string' && req.body.to.trim()
      ? req.body.to.trim()
      : env.SMTP_USER?.trim()
    if (!to) {
      res.status(400).json({ success: false, error: 'No recipient (set body.to or SMTP_USER).' })
      return
    }
    await sendSmtpTest(to)
    res.json({ success: true, to })
  } catch (err) {
    console.error('[dev/test-email]', err)
    res.status(500).json({ success: false, error: 'Test email failed.' })
  }
})

export default router
