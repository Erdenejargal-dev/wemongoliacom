/**
 * backend/src/controllers/booking-request.controller.ts
 *
 * Phase 6 — UX + Growth Layer. HTTP surface for the BookingRequest lead flow.
 */

import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { ListingType, BookingRequestStatus } from '@prisma/client'
import * as svc from '../services/booking-request.service'
import { ok } from '../utils/response'

// ── Schemas ─────────────────────────────────────────────────────────────

export const createBookingRequestSchema = z.object({
  listingType: z.nativeEnum(ListingType),
  listingId:   z.string().min(1).max(200),

  name:    z.string().min(2).max(120).trim(),
  email:   z.string().email().max(200),
  phone:   z.string().max(60).trim().optional(),
  message: z.string().max(4000).trim().optional(),

  startDate: z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  endDate:   z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional(),
  guests:    z.coerce.number().int().positive().max(200).optional(),
  quantity:  z.coerce.number().int().positive().max(200).optional(),
})

export const updateBookingRequestSchema = z.object({
  status:       z.nativeEnum(BookingRequestStatus).optional(),
  providerNote: z.string().max(4000).trim().nullable().optional(),
})

export const listBookingRequestsQuerySchema = z.object({
  status: z.nativeEnum(BookingRequestStatus).optional(),
  page:   z.coerce.number().int().positive().optional(),
  limit:  z.coerce.number().int().positive().max(100).optional(),
})

// ── Handlers ────────────────────────────────────────────────────────────

/**
 * POST /booking-requests
 *
 * Auth is OPTIONAL. We deliberately allow anonymous leads — a foreign
 * visitor on a USD listing shouldn't need to create an account to ask the
 * provider for help. Authenticate middleware must therefore NOT be applied
 * to this route.
 */
export async function createBookingRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = (req as any).user?.userId ?? null
    const ip =
      (req.headers['cf-connecting-ip'] as string) ??
      (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() ??
      req.socket.remoteAddress ??
      null
    const userAgent = (req.headers['user-agent'] as string) ?? null

    const result = await svc.createBookingRequest({
      userId,
      input: {
        ...req.body,
        ipAddress: ip ?? undefined,
        userAgent: userAgent ?? undefined,
      },
    })
    return res.status(201).json({ success: true, data: result })
  } catch (err) {
    next(err)
  }
}

/** GET /account/booking-requests — traveler's own leads */
export async function listMyBookingRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const rows = await svc.listMyBookingRequests(req.user!.userId)
    return ok(res, { data: rows })
  } catch (err) {
    next(err)
  }
}

// ── Provider handlers (scoped to the signed-in provider owner) ─────────

async function getRequesterProviderId(req: Request): Promise<string | null> {
  // Lightweight lookup against the existing Provider.ownerUserId surface.
  const { prisma } = await import('../lib/prisma')
  const p = await prisma.provider.findUnique({
    where:  { ownerUserId: req.user!.userId },
    select: { id: true },
  })
  return p?.id ?? null
}

export async function listProviderBookingRequests(req: Request, res: Response, next: NextFunction) {
  try {
    const providerId = await getRequesterProviderId(req)
    if (!providerId) return res.status(403).json({ success: false, error: 'No provider profile.' })
    const result = await svc.listProviderBookingRequests(providerId, req.query as any)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function getProviderBookingRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const providerId = await getRequesterProviderId(req)
    if (!providerId) return res.status(403).json({ success: false, error: 'No provider profile.' })
    const row = await svc.getProviderBookingRequest(providerId, String(req.params.requestId))
    return ok(res, row)
  } catch (err) {
    next(err)
  }
}

export async function updateProviderBookingRequest(req: Request, res: Response, next: NextFunction) {
  try {
    const providerId = await getRequesterProviderId(req)
    if (!providerId) return res.status(403).json({ success: false, error: 'No provider profile.' })
    const row = await svc.updateProviderBookingRequest(
      providerId,
      String(req.params.requestId),
      req.body,
    )
    return ok(res, row)
  } catch (err) {
    next(err)
  }
}
