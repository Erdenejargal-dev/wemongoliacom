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

export const tourListQuerySchema = z.object({
  status: z.enum(['draft', 'active', 'paused']).optional(),
  page:   z.coerce.number().int().positive().optional(),
  limit:  z.coerce.number().int().positive().max(50).optional(),
})

export const createTourSchema = z.object({
  title:            z.string().trim().min(2).max(300),
  shortDescription: z.string().trim().max(500).optional(),
  description:      z.string().trim().max(10000).optional(),
  durationDays:     z.number().int().positive().max(365).optional(),
  basePrice:        z.number().positive(),
  currency:         z.string().length(3).optional(),
  destinationId:    z.string().optional(),
  status:           z.enum(['draft', 'active', 'paused']).optional(),
})

export const updateTourSchema = z.object({
  title:            z.string().trim().min(2).max(300).optional(),
  shortDescription: z.string().trim().max(500).optional(),
  description:      z.string().trim().max(10000).optional(),
  durationDays:     z.number().int().positive().max(365).optional(),
  basePrice:        z.number().positive().optional(),
  currency:         z.string().length(3).optional(),
  destinationId:    z.string().nullable().optional(),
  status:           z.enum(['draft', 'active', 'paused']).optional(),
})

export const addTourImagesSchema = z.object({
  images: z.array(z.object({
    imageUrl:  z.string().url(),
    publicId:  z.string().optional(),
    altText:   z.string().max(300).optional(),
    width:     z.number().int().optional(),
    height:    z.number().int().optional(),
    format:    z.string().optional(),
    bytes:     z.number().int().optional(),
  })).min(1).max(10),
})

export const createDepartureSchema = z.object({
  startDate:      z.string(),
  endDate:        z.string(),
  availableSeats: z.number().int().positive().max(500),
  priceOverride:  z.number().positive().optional(),
  currency:       z.string().length(3).optional(),
})

export const updateDepartureSchema = z.object({
  startDate:      z.string().optional(),
  endDate:        z.string().optional(),
  availableSeats: z.number().int().positive().max(500).optional(),
  priceOverride:  z.number().positive().nullable().optional(),
  currency:       z.string().length(3).optional(),
  status:         z.enum(['scheduled', 'cancelled']).optional(),
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

// ─── Tours ────────────────────────────────────────────────────────────────

export async function listTours(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.listProviderTours(req.user!.userId, req.query as any)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function createTour(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.createProviderTour(req.user!.userId, req.body)
    return ok(res, result, 'Tour created successfully.')
  } catch (err) {
    next(err)
  }
}

export async function getTour(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.getProviderTourDetail(req.user!.userId, String(req.params.tourId))
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function updateTour(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.updateProviderTour(req.user!.userId, String(req.params.tourId), req.body)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function archiveTour(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.archiveProviderTour(req.user!.userId, String(req.params.tourId))
    return ok(res, result, 'Tour archived.')
  } catch (err) {
    next(err)
  }
}

// ─── Tour Images ─────────────────────────────────────────────────────────────

export async function addTourImages(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.addTourImages(req.user!.userId, String(req.params.tourId), req.body.images)
    return ok(res, result, 'Images added.')
  } catch (err) {
    next(err)
  }
}

export async function removeTourImage(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.removeTourImage(req.user!.userId, String(req.params.tourId), String(req.params.imageId))
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

// ─── Tour Departures ─────────────────────────────────────────────────────────

export async function listDepartures(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.listTourDepartures(req.user!.userId, String(req.params.tourId))
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function createDeparture(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.createTourDeparture(req.user!.userId, String(req.params.tourId), req.body)
    return ok(res, result, 'Departure created.')
  } catch (err) {
    next(err)
  }
}

export async function updateDeparture(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.updateTourDeparture(
      req.user!.userId, String(req.params.tourId), String(req.params.departureId), req.body,
    )
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function deleteDeparture(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await providerService.deleteTourDeparture(
      req.user!.userId, String(req.params.tourId), String(req.params.departureId),
    )
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}
