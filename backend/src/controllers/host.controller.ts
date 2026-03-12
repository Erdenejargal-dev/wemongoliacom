import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as hostService from '../services/host.service'
import { ok } from '../utils/response'

export const listQuerySchema = z.object({
  providerType: z.enum(['tour_operator', 'car_rental', 'accommodation']).optional(),
  page:         z.coerce.number().int().positive().optional(),
  limit:        z.coerce.number().int().positive().max(50).optional(),
})

export async function listHosts(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await hostService.listHosts(req.query as any)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function getHost(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await hostService.getHostBySlug(String(req.params.slug))
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}
