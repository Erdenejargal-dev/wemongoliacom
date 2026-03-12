import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as searchService from '../services/search.service'
import { ok } from '../utils/response'

// ─── Schema ───────────────────────────────────────────────────────────────

export const searchQuerySchema = z.object({
  q:           z.string().min(1).max(200).optional(),
  type:        z.enum(['tour', 'vehicle', 'accommodation', 'destination']).optional(),
  destination: z.string().max(200).optional(),
  minPrice:    z.coerce.number().nonnegative().optional(),
  maxPrice:    z.coerce.number().nonnegative().optional(),
  minRating:   z.coerce.number().min(0).max(5).optional(),
  sortBy:      z.enum(['price_asc', 'price_desc', 'rating', 'newest']).optional(),
  page:        z.coerce.number().int().positive().optional(),
  limit:       z.coerce.number().int().positive().max(50).optional(),
})

// ─── Handler ──────────────────────────────────────────────────────────────

export async function searchAll(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await searchService.search(req.query as any)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}
