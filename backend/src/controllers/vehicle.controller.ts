import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as vehicleService from '../services/vehicle.service'
import { ok } from '../utils/response'

export const listQuerySchema = z.object({
  destinationId: z.string().cuid().optional(),
  vehicleType:   z.enum(['SUV', 'Van', 'Minibus', 'Sedan', 'FourByFour']).optional(),
  withDriver:    z.enum(['true', 'false']).optional().transform(v => v === 'true'),
  transmission:  z.enum(['Manual', 'Automatic']).optional(),
  minSeats:      z.coerce.number().int().positive().optional(),
  minPrice:      z.coerce.number().nonnegative().optional(),
  maxPrice:      z.coerce.number().nonnegative().optional(),
  priceCurrency: z.enum(['MNT', 'USD']).optional(),
  startDate:     z.string().optional(),
  endDate:       z.string().optional(),
  page:          z.coerce.number().int().positive().optional(),
  limit:         z.coerce.number().int().positive().max(50).optional(),
  sort:          z.enum(['price_asc', 'price_desc', 'rating', 'newest']).optional(),
})

export async function listVehicles(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await vehicleService.listVehicles(req.query as any)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function getVehicle(req: Request, res: Response, next: NextFunction) {
  try {
    const vehicle = await vehicleService.getVehicleBySlug(String(req.params.slug))
    return ok(res, vehicle)
  } catch (err) {
    next(err)
  }
}
