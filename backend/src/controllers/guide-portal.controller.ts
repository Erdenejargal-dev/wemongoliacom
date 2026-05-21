import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { GuideSpecialty, GuideInquiryStatus } from '@prisma/client'
import {
  getMyGuideProfile,
  updateMyGuideProfile,
  setGuideStatus,
  listInquiries,
  replyToInquiry,
  listMyReviews,
  replyToReview,
  getAnalytics,
} from '../services/guide-portal.service'
import { ok } from '../utils/response'

const updateProfileSchema = z.object({
  bio:           z.string().min(5).max(500).optional(),
  about:         z.string().min(5).optional(),
  photo:         z.string().url().optional(),
  coverImage:    z.string().url().optional(),
  location:      z.string().min(2).max(100).optional(),
  region:        z.string().optional(),
  specialties:   z.array(z.nativeEnum(GuideSpecialty)).optional(),
  languages:     z.array(z.string()).optional(),
  dailyRate:     z.number().positive().nullable().optional(),
  dailyCurrency: z.string().length(3).optional(),
  contactEmail:  z.string().email().optional(),
  contactPhone:  z.string().nullable().optional(),
  website:       z.string().url().nullable().optional(),
})

const setStatusSchema = z.object({
  status: z.enum(['active', 'paused']),
})

const inquiryQuerySchema = z.object({
  status: z.nativeEnum(GuideInquiryStatus).optional(),
  page:   z.coerce.number().int().positive().optional(),
  limit:  z.coerce.number().int().positive().max(50).optional(),
})

const replyInquirySchema = z.object({
  reply:  z.string().min(1),
  status: z.nativeEnum(GuideInquiryStatus).default('replied'),
})

const reviewQuerySchema = z.object({
  page:  z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(50).optional(),
})

const replyReviewSchema = z.object({
  reply: z.string().min(1),
})

export async function getProfileHandler(req: Request, res: Response, next: NextFunction) {
  try { return ok(res, await getMyGuideProfile(req.user!.userId)) } catch (err) { next(err) }
}

export async function updateProfileHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = updateProfileSchema.parse(req.body)
    return ok(res, await updateMyGuideProfile(req.user!.userId, data))
  } catch (err) { next(err) }
}

export async function setStatusHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = setStatusSchema.parse(req.body)
    return ok(res, await setGuideStatus(req.user!.userId, status))
  } catch (err) { next(err) }
}

export async function listInquiriesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const params = inquiryQuerySchema.parse(req.query)
    return ok(res, await listInquiries(req.user!.userId, params))
  } catch (err) { next(err) }
}

export async function replyInquiryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { reply, status } = replyInquirySchema.parse(req.body)
    return ok(res, await replyToInquiry(req.user!.userId, req.params.id as string, reply, status))
  } catch (err) { next(err) }
}

export async function listReviewsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const params = reviewQuerySchema.parse(req.query)
    return ok(res, await listMyReviews(req.user!.userId, params))
  } catch (err) { next(err) }
}

export async function replyReviewHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { reply } = replyReviewSchema.parse(req.body)
    return ok(res, await replyToReview(req.user!.userId, req.params.id as string, reply))
  } catch (err) { next(err) }
}

export async function analyticsHandler(req: Request, res: Response, next: NextFunction) {
  try { return ok(res, await getAnalytics(req.user!.userId)) } catch (err) { next(err) }
}
