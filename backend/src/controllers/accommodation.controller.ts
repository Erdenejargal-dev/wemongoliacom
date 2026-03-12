import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as accommodationService from '../services/accommodation.service'
import { ok } from '../utils/response'

export const listQuerySchema = z.object({
  destinationId:     z.string().cuid().optional(),
  accommodationType: z.enum(['ger_camp', 'hotel', 'lodge', 'guesthouse', 'resort']).optional(),
  minPrice:          z.coerce.number().nonnegative().optional(),
  maxPrice:          z.coerce.number().nonnegative().optional(),
  guests:            z.coerce.number().int().positive().optional(),
  checkIn:           z.string().optional(),
  checkOut:          z.string().optional(),
  amenities:         z.union([z.string(), z.array(z.string())]).optional()
                       .transform(v => typeof v === 'string' ? [v] : v),
  page:              z.coerce.number().int().positive().optional(),
  limit:             z.coerce.number().int().positive().max(50).optional(),
  sort:              z.enum(['price_asc', 'price_desc', 'rating', 'newest']).optional(),
})

export async function listAccommodations(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accommodationService.listAccommodations(req.query as any)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function getAccommodation(req: Request, res: Response, next: NextFunction) {
  try {
    const acc = await accommodationService.getAccommodationBySlug(String(req.params.slug))
    return ok(res, acc)
  } catch (err) {
    next(err)
  }
}
