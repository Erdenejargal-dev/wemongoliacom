import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import {
  submitApplicationHandler,
  getMyApplicationHandler,
} from '../controllers/guide-application.controller'

const router = Router()

router.use(authenticate)

router.post('/',      submitApplicationHandler)
router.get('/mine',   getMyApplicationHandler)

export default router
