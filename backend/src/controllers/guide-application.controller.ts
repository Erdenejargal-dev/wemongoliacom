import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import {
  submitApplication,
  getMyApplication,
  listApplications,
  getApplicationById,
  approveApplication,
  rejectApplication,
} from '../services/guide-application.service'
import { GuideSpecialty } from '@prisma/client'
import { ok, created } from '../utils/response'

const specialtyEnum = z.nativeEnum(GuideSpecialty)

const submitSchema = z.object({
  name:            z.string().min(2).max(100),
  bio:             z.string().min(10).max(500),
  about:           z.string().min(10),
  location:        z.string().min(2).max(100),
  specialties:     z.array(specialtyEnum).min(1),
  languages:       z.array(z.string()).min(1),
  yearsExperience: z.coerce.number().int().min(0).max(60),
  dailyRate:       z.coerce.number().positive().optional(),
  dailyCurrency:   z.string().length(3).optional(),
  contactEmail:    z.string().email(),
  contactPhone:    z.string().optional(),
  idPhotoUrl:      z.string().url(),
  photoUrl:        z.string().url().optional(),
})

const rejectSchema = z.object({
  reason: z.string().min(5),
})

const listQuerySchema = z.object({
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  page:   z.coerce.number().int().positive().optional(),
  limit:  z.coerce.number().int().positive().max(50).optional(),
})

export async function submitApplicationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const data = submitSchema.parse(req.body)
    const app  = await submitApplication(req.user!.userId, data)
    return created(res, app)
  } catch (err) {
    next(err)
  }
}

export async function getMyApplicationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const app = await getMyApplication(req.user!.userId)
    return ok(res, app ?? null)
  } catch (err) {
    next(err)
  }
}

export async function listApplicationsHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const params = listQuerySchema.parse(req.query)
    const result = await listApplications(params)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function getApplicationByIdHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const app = await getApplicationById(req.params.id as string)
    return ok(res, app)
  } catch (err) {
    next(err)
  }
}

export async function approveApplicationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    await approveApplication(req.params.id as string)
    return ok(res, { success: true })
  } catch (err) {
    next(err)
  }
}

export async function rejectApplicationHandler(req: Request, res: Response, next: NextFunction) {
  try {
    const { reason } = rejectSchema.parse(req.body)
    const app = await rejectApplication(req.params.id as string, reason)
    return ok(res, app)
  } catch (err) {
    next(err)
  }
}
