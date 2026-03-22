import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'
import * as authService from '../services/auth.service'
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
