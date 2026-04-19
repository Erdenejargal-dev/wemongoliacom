import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as adminService from '../services/admin.service'
import * as fx from '../utils/fx'
import * as pricingHealth from '../services/pricing-health.service'
import { ok } from '../utils/response'
import { SUPPORTED_CURRENCIES } from '../utils/currency'

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

// ─── FX Rate schemas (Phase 2 Option B) ──────────────────────────────────

const currencyEnum = z.enum(SUPPORTED_CURRENCIES)

export const fxRateListQuerySchema = z.object({
  fromCurrency: currencyEnum.optional(),
  toCurrency:   currencyEnum.optional(),
  page:         z.coerce.number().int().positive().optional(),
  limit:        z.coerce.number().int().positive().max(200).optional(),
})

export const fxRateCreateSchema = z.object({
  fromCurrency:  currencyEnum,
  toCurrency:    currencyEnum,
  rate:          z.number().positive().finite(),
  effectiveFrom: z.string().datetime().optional(),
  source:        z.string().trim().min(1).max(80).optional(),
  note:          z.string().trim().max(500).nullable().optional(),
}).superRefine((d, ctx) => {
  if (d.fromCurrency === d.toCurrency) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'fromCurrency and toCurrency must differ.',
      path: ['toCurrency'],
    })
  }
})

// ─── FX Rate handlers ────────────────────────────────────────────────────

export async function adminListFxRates(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await fx.listFxRates(req.query as fx.ListFxRatesQuery)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function adminCreateFxRate(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await fx.createFxRate(req.body, req.user!.userId)
    res.status(201)
    return ok(res, result, 'Exchange rate recorded.')
  } catch (err) {
    next(err)
  }
}

// ─── Pricing health (Phase 3) ────────────────────────────────────────────
//
// Read-only ops surface: FX freshness, currency distribution, listings
// missing normalization, backfill reports, and payment-blocked bookings.
// All diagnostics are non-mutating; repair flows are explicit elsewhere.

export const backfillReportQuerySchema = z.object({
  resolved:   z.coerce.boolean().optional(),
  entityType: z.string().max(50).optional(),
  issue:      z.string().max(200).optional(),
  page:       z.coerce.number().int().positive().optional(),
  limit:      z.coerce.number().int().positive().max(200).optional(),
})

export async function adminGetPricingHealth(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pricingHealth.getPricingHealthOverview()
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function adminGetFxRateHealth(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pricingHealth.getFxRateHealth()
    return ok(res, { rates: result })
  } catch (err) {
    next(err)
  }
}

export async function adminGetCurrencyDistribution(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pricingHealth.getCurrencyDistribution()
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function adminGetListingsMissingNormalization(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pricingHealth.getListingsMissingNormalization()
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function adminListBackfillReports(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pricingHealth.listBackfillReports(req.query as any)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function adminGetPaymentBlockedBookings(_req: Request, res: Response, next: NextFunction) {
  try {
    const result = await pricingHealth.getPaymentBlockedBookings(100)
    return ok(res, { bookings: result })
  } catch (err) {
    next(err)
  }
}

// ─── Backfill inspect / resolve (Phase 3, Task 7) ──────────────────────

/**
 * Inspect one backfill report. Read-only: returns the report plus the live
 * state of the flagged entity so ops can decide what to do next. NEVER
 * mutates the flagged entity.
 */
export async function adminGetBackfillReport(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.reportId)
    const result = await pricingHealth.getBackfillReportDetail(id)
    if (!result) return res.status(404).json({ success: false, error: 'Backfill report not found.' })
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

/**
 * Close a backfill report by marking it resolved. Deliberately scoped: the
 * admin can only change the REPORT state here — any fix to the underlying
 * data must be a separate, explicit action. This keeps the audit surface
 * safe ("inspect, don't blindly mutate") while still letting ops clear a
 * reviewed ticket.
 */
export async function adminResolveBackfillReport(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.reportId)
    const userId = (req as any).user?.userId ?? 'unknown-admin'
    const result = await pricingHealth.markBackfillReportResolved(id, { resolvedBy: String(userId) })
    if (!result) return res.status(404).json({ success: false, error: 'Backfill report not found.' })
    return ok(res, { report: result })
  } catch (err) {
    next(err)
  }
}
