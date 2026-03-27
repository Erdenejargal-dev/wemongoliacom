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
