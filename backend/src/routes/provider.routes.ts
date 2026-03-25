import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/role'
import { validate } from '../middleware/validate'
import {
  getMyProfile,
  updateMyProfile,
  listBookings,
  confirmBooking,
  completeBooking,
  cancelBooking,
  getAnalytics,
  listReviews,
  replyToReview,
  listTours,
  createTour,
  updateProfileSchema,
  bookingListQuerySchema,
  cancelSchema,
  reviewListQuerySchema,
  reviewReplySchema,
  tourListQuerySchema,
  createTourSchema,
} from '../controllers/provider.controller'

const router = Router()

// All provider routes require auth + provider_owner role
router.use(authenticate, requireRole('provider_owner', 'admin'))

// Profile
router.get('/profile',   getMyProfile)
router.put('/profile',   validate(updateProfileSchema), updateMyProfile)

// Provider's bookings
router.get('/bookings',  validate(bookingListQuerySchema, 'query'), listBookings)
router.patch('/bookings/:bookingCode/confirm',  confirmBooking)
router.patch('/bookings/:bookingCode/complete', completeBooking)
router.patch('/bookings/:bookingCode/cancel',   validate(cancelSchema), cancelBooking)

// Analytics
router.get('/analytics', getAnalytics)

// Reviews
router.get('/reviews', validate(reviewListQuerySchema, 'query'), listReviews)
router.patch('/reviews/:id/reply', validate(reviewReplySchema), replyToReview)

// Tours
router.get('/tours',  validate(tourListQuerySchema, 'query'), listTours)
router.post('/tours', validate(createTourSchema), createTour)

export default router
