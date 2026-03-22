import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  getProfile,
  updateProfile,
  changePassword,
  changeEmail,
  deactivateAccount,
  registerProvider,
  updateProfileSchema,
  changePasswordSchema,
  changeEmailSchema,
  deactivateSchema,
  registerProviderSchema,
} from '../controllers/account.controller'

const router = Router()

// All account routes require auth
router.use(authenticate)

router.get('/',                  getProfile)
router.put('/',                  validate(updateProfileSchema), updateProfile)
router.post('/provider',         validate(registerProviderSchema), registerProvider)
router.post('/change-password',  validate(changePasswordSchema), changePassword)
router.post('/change-email',     validate(changeEmailSchema), changeEmail)
router.post('/deactivate',       validate(deactivateSchema), deactivateAccount)

export default router
