import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/role'
import {
  getProfileHandler,
  updateProfileHandler,
  setStatusHandler,
  listInquiriesHandler,
  replyInquiryHandler,
  listReviewsHandler,
  replyReviewHandler,
  analyticsHandler,
} from '../controllers/guide-portal.controller'

const router = Router()

router.use(authenticate, requireRole('guide_owner', 'admin'))

router.get('/profile',                   getProfileHandler)
router.put('/profile',                   updateProfileHandler)
router.patch('/profile/status',          setStatusHandler)

router.get('/inquiries',                 listInquiriesHandler)
router.post('/inquiries/:id/reply',      replyInquiryHandler)

router.get('/reviews',                   listReviewsHandler)
router.patch('/reviews/:id/reply',       replyReviewHandler)

router.get('/analytics',                 analyticsHandler)

export default router
