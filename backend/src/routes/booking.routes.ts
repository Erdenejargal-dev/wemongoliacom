import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/role'
import { validate } from '../middleware/validate'
import {
  createBooking,
  getBooking,
  listMyBookings,
  cancelBooking,
  createBookingSchema,
  cancelSchema,
  listQuerySchema,
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
