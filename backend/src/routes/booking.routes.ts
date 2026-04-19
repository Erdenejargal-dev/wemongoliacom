import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/role'
import { validate } from '../middleware/validate'
import {
  createBooking,
  getBooking,
  listMyBookings,
  cancelBooking,
  quoteBooking,
  createBookingSchema,
  cancelSchema,
  listQuerySchema,
  quoteBookingSchema,
} from '../controllers/booking.controller'

const router = Router()

// All booking routes require authentication
router.use(authenticate)

// POST /bookings — traveler creates booking
router.post(
  '/',
  requireRole('traveler', 'provider_owner', 'admin'),
  validate(createBookingSchema),
  createBooking,
)

/**
 * POST /bookings/quote — non-persisting pricing quote.
 *
 * Returns the authoritative subtotal / serviceFee / totalAmount computed by
 * calcPricing so the frontend never has to replicate pricing rules. Safe to
 * call as often as the user changes dates / guests. Requires auth to match
 * the rest of the booking API surface and to allow future per-user pricing
 * (promo codes, loyalty) without breaking the contract.
 */
router.post(
  '/quote',
  requireRole('traveler', 'provider_owner', 'admin'),
  validate(quoteBookingSchema),
  quoteBooking,
)

// GET /bookings/me — traveler trips list
router.get(
  '/me',
  validate(listQuerySchema, 'query'),
  listMyBookings,
)

// GET /bookings/:bookingCode — get single booking
router.get('/:bookingCode', getBooking)

// PATCH /bookings/:bookingCode/cancel — cancel booking
router.patch(
  '/:bookingCode/cancel',
  validate(cancelSchema),
  cancelBooking,
)

export default router
