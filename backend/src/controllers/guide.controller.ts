import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import { listGuides, getGuideBySlug } from '../services/guide.service'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'

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
    const guide = await getGuideBySlug(req.params.slug as string)
    res.json(guide)
  } catch (err) {
    next(err)
  }
}

const inquirySchema = z.object({
  travelerName:    z.string().min(1).max(100),
  travelerEmail:   z.string().email(),
  travelerCountry: z.string().optional(),
  message:         z.string().min(10),
  tripType:        z.string().optional(),
  daysRequested:   z.coerce.number().int().positive().optional(),
  preferredStart:  z.coerce.date().optional(),
})

export async function createInquiryHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const guide = await prisma.guide.findUnique({
      where: { slug: req.params.slug as string },
      select: { id: true, status: true },
    })
    if (!guide || guide.status === 'archived') throw new AppError('Guide not found', 404)

    const data    = inquirySchema.parse(req.body)
    const inquiry = await prisma.guideInquiry.create({
      data: { guideId: guide.id, ...data },
    })
    res.status(201).json({ id: inquiry.id })
  } catch (err) {
    next(err)
  }
}
