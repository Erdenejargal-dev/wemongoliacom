import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as authService from '../services/auth.service'
import * as passwordResetService from '../services/password-reset.service'
import { ok, created } from '../utils/response'

// ── Schemas ────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  firstName: z.string().min(1).max(80),
  lastName:  z.string().min(1).max(80),
  email:     z.string().email(),
  password:  z.string().min(8, 'Password must be at least 8 characters'),
  role:      z.enum(['traveler', 'provider_owner']).optional(),
})

export const loginSchema = z.object({
  email:    z.string().email(),
  password: z.string().min(1),
})

export const refreshSchema = z.object({
  refreshToken: z.string().min(1),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email(),
})

export const resetPasswordSchema = z.object({
  token:    z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
})

// ── Handlers ───────────────────────────────────────────────────────────────

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.register(req.body)
    return created(res, result, 'Account created successfully.')
  } catch (err) {
    next(err)
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.login(req.body)
    return ok(res, result, 'Logged in successfully.')
  } catch (err) {
    next(err)
  }
}

// POST /auth/refresh
export async function refresh(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await authService.refresh(req.body)
    return ok(res, result, 'Token refreshed successfully.')
  } catch (err) {
    next(err)
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction) {
  try {
    const user = await authService.getMe(req.user!.userId)
    return ok(res, user)
  } catch (err) {
    next(err)
  }
}

/** Neutral response — does not reveal whether the email exists. */
export async function forgotPassword(req: Request, res: Response, next: NextFunction) {
  try {
    await passwordResetService.requestPasswordReset(req.body.email)
    return ok(
      res,
      { ok: true },
      'If an account exists for that email, we sent instructions to reset your password.',
    )
  } catch (err) {
    next(err)
  }
}

export async function resetPassword(req: Request, res: Response, next: NextFunction) {
  try {
    await passwordResetService.resetPasswordWithToken(req.body.token, req.body.password)
    return ok(res, { ok: true }, 'Your password has been updated. You can sign in with your new password.')
  } catch (err) {
    next(err)
  }
}
