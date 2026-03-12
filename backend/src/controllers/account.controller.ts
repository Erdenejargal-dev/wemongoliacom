import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as accountService from '../services/account.service'
import { ok, noContent } from '../utils/response'

// ─── Schemas ──────────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  firstName: z.string().min(1).max(100).optional(),
  lastName:  z.string().min(1).max(100).optional(),
  phone:     z.string().max(30).optional(),
  avatarUrl: z.string().url().optional(),
  country:   z.string().max(100).optional(),
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
