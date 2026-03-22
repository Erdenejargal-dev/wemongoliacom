import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as accountService from '../services/account.service'
import { ok, noContent, created } from '../utils/response'
import { ProviderType } from '@prisma/client'

// ─── Schemas ──────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName:  z.string().min(1).max(100).optional(),
  phone:     z.string().max(30).optional(),
  avatarUrl: z.string().url().optional(),
  country:   z.string().max(100).optional(),
  bio:       z.string().max(2000).optional(),
  language:  z.string().max(10).optional(),
  currency:  z.string().max(10).optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword:     z.string().min(8),
})

export const changeEmailSchema = z.object({
  password: z.string().min(1),
  newEmail: z.string().email(),
})

export const deactivateSchema = z.object({
  password: z.string().min(1),
})

export const registerProviderSchema = z.object({
  businessName: z.string().min(2).max(200),
  businessType: z.enum(['hotel', 'tour_operator', 'car_rental', 'multiple']),
  description:  z.string().max(5000).optional(),
  contactEmail: z.string().email().optional(),
  contactPhone: z.string().max(30).optional(),
  address:      z.string().max(300).optional(),
  city:         z.string().max(100).optional(),
  country:      z.string().max(100).optional(),
  websiteUrl:   z.string().url().optional(),
})

// ─── Handlers ─────────────────────────────────────────────────────────────

export async function getProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accountService.getMyProfile(req.user!.userId)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accountService.updateMyProfile(req.user!.userId, req.body)
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction) {
  try {
    await accountService.changePassword(
      req.user!.userId,
      req.body.currentPassword,
      req.body.newPassword,
    )
    return noContent(res)
  } catch (err) {
    next(err)
  }
}

export async function changeEmail(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await accountService.changeEmail(
      req.user!.userId,
      req.body.password,
      req.body.newEmail,
    )
    return ok(res, result)
  } catch (err) {
    next(err)
  }
}

export async function deactivateAccount(req: Request, res: Response, next: NextFunction) {
  try {
    await accountService.deactivateAccount(req.user!.userId, req.body.password)
    return noContent(res)
  } catch (err) {
    next(err)
  }
}

export async function registerProvider(req: Request, res: Response, next: NextFunction) {
  try {
    const businessType = req.body.businessType as 'hotel' | 'tour_operator' | 'car_rental' | 'multiple'
    const businessTypes: ProviderType[] =
      businessType === 'multiple'
        ? ['tour_operator', 'car_rental', 'accommodation']
        : businessType === 'hotel'
          ? ['accommodation']
          : [businessType]

    const result = await accountService.registerProvider(req.user!.userId, {
      businessName:  req.body.businessName,
      businessTypes,
      description:   req.body.description,
      contactEmail:  req.body.contactEmail,
      contactPhone:  req.body.contactPhone,
      address:       req.body.address,
      city:          req.body.city,
      country:       req.body.country,
      websiteUrl:    req.body.websiteUrl,
    })

    return created(res, result, 'Business registered successfully.')
  } catch (err) {
    next(err)
  }
}
