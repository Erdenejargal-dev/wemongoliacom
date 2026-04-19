/**
 * backend/src/routes/booking-request.routes.ts
 *
 * Phase 6 — UX + Growth Layer. Booking request (lead) endpoints.
 */

import { Router } from 'express'
import { authenticate, optionalAuth } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  createBookingRequest,
  listMyBookingRequests,
  listProviderBookingRequests,
  getProviderBookingRequest,
  updateProviderBookingRequest,
  createBookingRequestSchema,
  updateBookingRequestSchema,
  listBookingRequestsQuerySchema,
} from '../controllers/booking-request.controller'

const router = Router()

// ── Public (optional auth): traveler submits a lead ────────────────────
// Anonymous is intentionally allowed — see controller comment.
router.post('/', optionalAuth, validate(createBookingRequestSchema), createBookingRequest)

// ── Traveler (auth required): list my own leads ───────────────────────
router.get('/mine', authenticate, listMyBookingRequests)

// ── Provider inbox (auth required; scoped by ownerUserId → provider) ──
router.get('/provider',               authenticate, validate(listBookingRequestsQuerySchema, 'query'), listProviderBookingRequests)
router.get('/provider/:requestId',    authenticate, getProviderBookingRequest)
router.patch('/provider/:requestId',  authenticate, validate(updateBookingRequestSchema), updateProviderBookingRequest)

export default router
