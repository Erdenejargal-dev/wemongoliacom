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
  getTour,
  updateTour,
  archiveTour,
  addTourImages,
  removeTourImage,
  listDepartures,
  createDeparture,
  updateDeparture,
  deleteDeparture,
  updateProfileSchema,
  bookingListQuerySchema,
  cancelSchema,
  reviewListQuerySchema,
  reviewReplySchema,
  tourListQuerySchema,
  createTourSchema,
  updateTourSchema,
  addTourImagesSchema,
  createDepartureSchema,
  updateDepartureSchema,
} from '../controllers/provider.controller'
import accommodationRoutes from './provider-accommodation.routes'

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
router.get('/tours',           validate(tourListQuerySchema, 'query'), listTours)
router.post('/tours',          validate(createTourSchema), createTour)
router.get('/tours/:tourId',   getTour)
router.put('/tours/:tourId',   validate(updateTourSchema), updateTour)
router.delete('/tours/:tourId', archiveTour)

// Tour images
router.post('/tours/:tourId/images',            validate(addTourImagesSchema), addTourImages)
router.delete('/tours/:tourId/images/:imageId', removeTourImage)

// Tour departures
router.get('/tours/:tourId/departures',                listDepartures)
router.post('/tours/:tourId/departures',               validate(createDepartureSchema), createDeparture)
router.put('/tours/:tourId/departures/:departureId',   validate(updateDepartureSchema), updateDeparture)
router.delete('/tours/:tourId/departures/:departureId', deleteDeparture)

// Accommodations (sub-router with own controller)
router.use('/accommodations', accommodationRoutes)

export default router
