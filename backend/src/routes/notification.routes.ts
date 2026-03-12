import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
} from '../controllers/notification.controller'

const router = Router()

// All notification routes require auth
router.use(authenticate)

router.get('/',            listNotifications)
router.post('/read-all',   markAllAsRead)
router.patch('/:id/read',  markAsRead)

export default router
