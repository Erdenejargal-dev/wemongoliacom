import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  listReviews,
  listMyReviews,
  createReview,
  replyToReview,
  listQuerySchema,
  myReviewsQuerySchema,
  createSchema,
  replySchema,
  updateMyReviewSchema,
  updateMyReview,
  deleteMyReview,
} from '../controllers/review.controller'

const router = Router()

// GET /reviews?listingId=&listingType=  — public
router.get('/', validate(listQuerySchema, 'query'), listReviews)

// GET /reviews/me — traveler written reviews (auth required)
router.get('/me', authenticate, validate(myReviewsQuerySchema, 'query'), listMyReviews)

// POST /reviews — traveler (auth required)
router.post('/', authenticate, validate(createSchema), createReview)

// PATCH /reviews/:id/reply — provider replies (auth required)
router.patch('/:id/reply', authenticate, validate(replySchema), replyToReview)

// PATCH /reviews/:id — traveler update own review
router.patch('/:id', authenticate, validate(updateMyReviewSchema), updateMyReview)

// DELETE /reviews/:id — traveler delete own review
router.delete('/:id', authenticate, deleteMyReview)

export default router
