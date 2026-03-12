import { Router } from 'express'
import { validate } from '../middleware/validate'
import { authenticate } from '../middleware/auth'
import {
  register,
  login,
  getMe,
  registerSchema,
  loginSchema,
} from '../controllers/auth.controller'

const router = Router()

// POST /auth/register
router.post('/register', validate(registerSchema), register)

// POST /auth/login
router.post('/login', validate(loginSchema), login)

// GET /auth/me  (protected)
router.get('/me', authenticate, getMe)

export default router
