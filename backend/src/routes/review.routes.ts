import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  listReviews,
  createReview,
  replyToReview,
  listQuerySchema,
  createSchema,
  replySchema,
} from '../controllers/review.controller'

const router = Router()

// GET /reviews?listingId=&listingType=  — public
router.get('/', validate(listQuerySchema, 'query'), listReviews)

// POST /reviews — traveler (auth required)
router.post('/', authenticate, validate(createSchema), createReview)

// PATCH /reviews/:id/reply — provider replies (auth required)
router.patch('/:id/reply', authenticate, validate(replySchema), replyToReview)

export default router
