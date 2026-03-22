import { Router } from 'express'
import { validate } from '../middleware/validate'
import { authenticate } from '../middleware/auth'
import {
  register,
  login,
  refresh,
  getMe,
  registerSchema,
  loginSchema,
  refreshSchema,
} from '../controllers/auth.controller'

const router = Router()

// POST /auth/register
router.post('/register', validate(registerSchema), register)

// POST /auth/login
router.post('/login', validate(loginSchema), login)

// GET /auth/me  (protected)
router.get('/me', authenticate, getMe)

// POST /auth/refresh
router.post('/refresh', validate(refreshSchema), refresh)

export default router
