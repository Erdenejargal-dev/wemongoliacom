import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as adminService from '../services/admin.service'
import { ok } from '../utils/response'

// ─── Schemas ──────────────────────────────────────────────────────────────

export const userListQuerySchema = z.object({
  search: z.string().optional(),
  role:   z.enum(['traveler', 'provider_owner', 'admin']).optional(),
  page:   z.coerce.number().int().positive().optional(),
  limit:  z.coerce.number().int().positive().max(100).optional(),
})

export const setRoleSchema = z.object({
  role: z.enum(['traveler', 'provider_owner', 'admin']),
})

export const providerListQuerySchema = z.object({
  search:             z.string().optional(),
  verificationStatus: z.enum(['unverified', 'pending_review', 'verified', 'rejected']).optional(),
  page:               z.coerce.number().int().positive().optional(),
  limit:              z.coerce.number().int().positive().max(100).optional(),
})

export const setProviderStatusSchema = z.object({
  status: z.enum(['draft', 'active', 'paused', 'archived']),
})

export const setProviderPlanSchema = z.object({
  plan: z.enum(['FREE', 'PRO']),
})

export const setVerificationStatusSchema = z.object({
  verificationStatus: z.enum(['unverified', 'pending_review', 'verified', 'rejected']),
  rejectionReason:    z.string().max(1000).trim().optional(),
}).superRefine((data, ctx) => {
  if (data.verificationStatus === 'rejected' && !data.rejectionReason?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Rejection reason is required when rejecting a provider.',
      path: ['rejectionReason'],
    })
  }
})

export const bookingListQuerySchema = z.object({
  search:      z.string().optional(),
  status:      z.enum(['pending', 'confirmed', 'cancelled', 'completed']).optional(),
  listingType: z.enum(['tour', 'vehicle', 'accommodation']).optional(),
  page:        z.coerce.number().int().positive().optional(),
  limit:       z.coerce.number().int().positive().max(100).optional(),
})

// ─── User handlers ────────────────────────────────────────────────────────

export async function listUsers(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.listUsers(req.query as any)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function getUser(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getUser(String(req.params.userId))
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function setUserRole(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.setUserRole(String(req.params.userId), req.body.role)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

// ─── Provider handlers ────────────────────────────────────────────────────

export async function listProviders(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.listProviders(req.query as any)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function getProvider(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getProvider(String(req.params.providerId))
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function setProviderStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.setProviderStatus(String(req.params.providerId), req.body.status)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function setProviderPlan(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.setProviderPlan(String(req.params.providerId), req.body.plan)
    return ok(res, result, `Provider plan updated to ${req.body.plan}.`)
  } catch (err) {
    next(err)
  }
}

export async function setProviderVerificationStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.setProviderVerificationStatus(
      String(req.params.providerId),
      req.body.verificationStatus,
      req.body.rejectionReason ?? null,
    )
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

// ─── Booking handlers ─────────────────────────────────────────────────────

export async function listBookings(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.listBookings(req.query as any)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function getBooking(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getAdminBooking(String(req.params.bookingId))
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

// ─── Analytics handler ────────────────────────────────────────────────────

export async function getPlatformAnalytics(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await adminService.getPlatformAnalytics()
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

// ─── Destination schemas ──────────────────────────────────────────────────

export const destinationCreateSchema = z.object({
  name:             z.string().min(1).max(120).trim(),
  slug:             z.string().min(1).max(120).trim().optional(),
  country:          z.string().max(80).trim().optional(),
  region:           z.string().max(120).trim().nullable().optional(),
  shortDescription: z.string().max(500).trim().nullable().optional(),
  description:      z.string().max(5000).trim().nullable().optional(),
  heroImageUrl:     z.string().url().nullable().optional(),
  gallery:          z.array(z.string().url()).max(20).optional(),
  highlights:       z.array(z.string().max(500)).max(20).optional(),
  activities:       z.array(z.string().max(300)).max(30).optional(),
  tips:             z.array(z.string().max(500)).max(20).optional(),
  bestTimeToVisit:  z.string().max(300).trim().nullable().optional(),
  weatherInfo:      z.string().max(300).trim().nullable().optional(),
  featured:         z.boolean().optional(),
})

export const destinationUpdateSchema = destinationCreateSchema.partial()

// ─── Destination handlers ─────────────────────────────────────────────────

import * as destinationService from '../services/destination.service'

export async function adminListDestinations(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await destinationService.adminListDestinations()
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function adminGetDestination(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await destinationService.adminGetDestination(String(req.params.id))
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function adminCreateDestination(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await destinationService.adminCreateDestination(req.body)
    res.status(201)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function adminUpdateDestination(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await destinationService.adminUpdateDestination(String(req.params.id), req.body)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function adminDeleteDestination(req: Request, res: Response, next: NextFunction) {
  try {
    await destinationService.adminDeleteDestination(String(req.params.id))
    return ok(res, { deleted: true })
  } catch (err) {
    next(err)
  }
}

export async function adminToggleDestinationFeatured(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await destinationService.adminToggleDestinationFeatured(String(req.params.id))
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}
