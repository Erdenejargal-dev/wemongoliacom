import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as tourService from '../services/tour.service'
import { ok } from '../utils/response'

export const listQuerySchema = z.object({
  destinationId: z.string().cuid().optional(),
  category:      z.string().optional(),
  difficulty:    z.enum(['Easy', 'Moderate', 'Challenging']).optional(),
  minPrice:      z.coerce.number().nonnegative().optional(),
  maxPrice:      z.coerce.number().nonnegative().optional(),
  minDays:       z.coerce.number().int().positive().optional(),
  maxDays:       z.coerce.number().int().positive().optional(),
  guests:        z.coerce.number().int().positive().optional(),
  startDate:     z.string().optional(),
  featured:      z.enum(['true', 'false']).optional().transform(v => v === 'true'),
  page:          z.coerce.number().int().positive().optional(),
  limit:         z.coerce.number().int().positive().max(50).optional(),
  sort:          z.enum(['price_asc', 'price_desc', 'rating', 'newest', 'popular']).optional(),
})

export async function listTours(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await tourService.listTours(req.query as any)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function getTour(req: Request, res: Response, next: NextFunction) {
  try {
    const tour = await tourService.getTourBySlug(String(req.params.slug))
    return ok(res, tour)
  } catch (err) {
    next(err)
  }
}

export async function getTourDepartures(req: Request, res: Response, next: NextFunction) {
  try {
    const departures = await tourService.getTourDepartures(String(req.params.id))
    return ok(res, departures)
  } catch (err) {
    next(err)
  }
}
