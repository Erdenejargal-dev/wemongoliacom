import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as destinationService from '../services/destination.service'
import { ok } from '../utils/response'

export const listQuerySchema = z.object({
  featured: z.enum(['true', 'false']).optional().transform(v => v === 'true' ? true : v === 'false' ? false : undefined),
  page:     z.coerce.number().int().positive().optional(),
  limit:    z.coerce.number().int().positive().max(50).optional(),
})

export async function listDestinations(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await destinationService.listDestinations(req.query as any)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function getDestination(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await destinationService.getDestinationBySlug(String(req.params.slug))
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}
