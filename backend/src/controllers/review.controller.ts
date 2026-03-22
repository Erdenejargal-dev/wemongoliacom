import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as reviewService from '../services/review.service'
import { ok, created } from '../utils/response'

export const listQuerySchema = z.object({
  listingId:   z.string().cuid(),
  listingType: z.enum(['tour', 'vehicle', 'accommodation']),
  page:        z.coerce.number().int().positive().optional(),
  limit:       z.coerce.number().int().positive().max(50).optional(),
})

export const createSchema = z.object({
  bookingId: z.string().cuid(),
  rating:    z.number().int().min(1).max(5),
  title:     z.string().max(200).optional(),
  comment:   z.string().max(2000).optional(),
})

export const replySchema = z.object({
  reply: z.string().min(1).max(2000),
})

export const myReviewsQuerySchema = z.object({
  page:  z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
})

export const updateMyReviewSchema = z.object({
  rating:  z.number().int().min(1).max(5),
  title:   z.string().max(200).optional(),
  comment: z.string().max(2000).optional(),
})

export async function listReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reviewService.listReviews(req.query as any)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function createReview(req: Request, res: Response, next: NextFunction) {
  try {
    const review = await reviewService.createReview({
      userId: req.user!.userId,
      ...req.body,
    })
    return created(res, review)
  } catch (err) {
    next(err)
  }
}

export async function replyToReview(req: Request, res: Response, next: NextFunction) {
  try {
    const review = await reviewService.replyToReview(
      String(req.params.id),
      req.user!.userId,
      req.body.reply,
    )
    return ok(res, review)
  } catch (err) {
    next(err)
  }
}

// GET /reviews/me — traveler written reviews
export async function listMyReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reviewService.listMyReviews({
      userId: req.user!.userId,
      ...(req.query as any),
    })
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

// PATCH /reviews/:id — traveler update own review
export async function updateMyReview(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await reviewService.updateMyReview({
      userId: req.user!.userId,
      reviewId: String(req.params.id),
      ...req.body,
    })
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

// DELETE /reviews/:id — traveler delete own review
export async function deleteMyReview(req: Request, res: Response, next: NextFunction) {
  try {
    await reviewService.deleteMyReview(req.user!.userId, String(req.params.id))
    return ok(res, { ok: true })
  } catch (err) {
    next(err)
  }
}
