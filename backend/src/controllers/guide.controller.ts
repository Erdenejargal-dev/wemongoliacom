import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { listGuides, getGuideBySlug } from '../services/guide.service'

const listSchema = z.object({
  specialty: z.string().optional(),
  language:  z.string().optional(),
  certified: z.enum(['true', 'false']).transform(v => v === 'true').optional(),
  location:  z.string().optional(),
  page:      z.coerce.number().int().positive().optional(),
  limit:     z.coerce.number().int().positive().max(48).optional(),
  sort:      z.enum(['rating', 'newest', 'experience']).optional(),
})

export async function listGuidesHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const query = listSchema.parse(req.query)
    const result = await listGuides(query)
    res.json(result)
  } catch (err) {
    next(err)
  }
}

export async function getGuideHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const guide = await getGuideBySlug(req.params.slug)
    res.json(guide)
  } catch (err) {
    next(err)
  }
}
