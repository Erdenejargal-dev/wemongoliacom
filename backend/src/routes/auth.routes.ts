import { Router } from 'express'
import { validate } from '../middleware/validate'
import { authenticate } from '../middleware/auth'
import {
  register,
  login,
  refresh,
  getMe,
  forgotPassword,
  resetPassword,
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '../controllers/auth.controller'

const router = Router()

// POST /auth/register
router.post('/register', validate(registerSchema), register)

// POST /auth/login
router.post('/login', validate(loginSchema), login)

// Password reset (public)
router.post('/forgot-password', validate(forgotPasswordSchema), forgotPassword)
router.post('/reset-password', validate(resetPasswordSchema), resetPassword)

// GET /auth/me  (protected)
router.get('/me', authenticate, getMe)

// POST /auth/refresh
router.post('/refresh', validate(refreshSchema), refresh)

export default router
