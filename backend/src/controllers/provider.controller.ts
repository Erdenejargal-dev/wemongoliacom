import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as providerService from '../services/provider.service'
import { ok } from '../utils/response'

// ─── Schemas ──────────────────────────────────────────────────────────────

export const reviewListQuerySchema = z.object({
  page:  z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
})

export const reviewReplySchema = z.object({
  reply: z.string().min(1).max(2000),
})

export const updateProfileSchema = z.object({
  name:         z.string().min(2).max(200).optional(),
  tagline:      z.string().max(300).optional(),
  description:  z.string().max(5000).optional(),
  logoUrl:      z.string().url().optional(),
  coverUrl:     z.string().url().optional(),
  phone:        z.string().max(30).optional(),
  email:        z.string().email().optional(),
  websiteUrl:   z.string().url().optional(),
  address:      z.string().max(300).optional(),
  city:         z.string().max(100).optional(),
  country:      z.string().max(100).optional(),
  socialLinks:  z.record(z.string(), z.string().url()).optional(),
})

export const bookingListQuerySchema = z.object({
  bookingStatus: z.enum(['pending', 'confirmed', 'completed', 'cancelled']).optional(),
  listingType:   z.enum(['tour', 'vehicle', 'accommodation']).optional(),
  page:          z.coerce.number().int().positive().optional(),
  limit:         z.coerce.number().int().positive().max(50).optional(),
})

export const cancelSchema = z.object({
  reason: z.string().max(500).optional(),
})

// ─── Handlers ─────────────────────────────────────────────────────────────

export async function getMyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.getMyProvider(req.user!.userId)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function updateMyProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.updateMyProvider(req.user!.userId, req.body)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function listBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.listProviderBookings(req.user!.userId, req.query as any)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function confirmBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.confirmBooking(
      String(req.params.bookingCode),
      req.user!.userId,
    )
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function completeBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.completeBooking(
      String(req.params.bookingCode),
      req.user!.userId,
    )
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function cancelBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.cancelBookingByProvider(
      String(req.params.bookingCode),
      req.user!.userId,
      req.body?.reason,
    )
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function getAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.getProviderAnalytics(req.user!.userId)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function listReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.listProviderReviews(req.user!.userId, req.query as any)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function replyToReview(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.replyToReviewByOwner(
      req.user!.userId,
      String(req.params.id),
      req.body.reply,
    )
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}
