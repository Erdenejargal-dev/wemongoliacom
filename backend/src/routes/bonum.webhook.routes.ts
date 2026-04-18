import { Router } from 'express'
import express from 'express'
import { handleBonumWebhook } from '../controllers/bonum.webhook.controller'

const router = Router()

router.post(
  '/bonum',
  express.raw({ type: '*/*', limit: '512kb' }),
  handleBonumWebhook,
)

export default router
