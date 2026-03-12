import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  listConversations,
  startConversation,
  getMessages,
  sendMessage,
  markAsRead,
  startSchema,
  sendMessageSchema,
  messagesQuerySchema,
} from '../controllers/conversation.controller'

const router = Router()

// All conversation routes require auth
router.use(authenticate)

// GET /conversations — list all for current user
router.get('/', listConversations)

// POST /conversations — start/get conversation + send first message
router.post('/', validate(startSchema), startConversation)

// GET /conversations/:id/messages — paginated messages
router.get('/:id/messages', validate(messagesQuerySchema, 'query'), getMessages)

// POST /conversations/:id/messages — send a message
router.post('/:id/messages', validate(sendMessageSchema), sendMessage)

// POST /conversations/:id/read — mark as read
router.post('/:id/read', markAsRead)

export default router
