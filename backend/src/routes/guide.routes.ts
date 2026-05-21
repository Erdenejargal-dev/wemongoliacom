import { Router } from 'express'
import { listGuidesHandler, getGuideHandler, createInquiryHandler } from '../controllers/guide.controller'

const router = Router()

router.get('/',                        listGuidesHandler)
router.get('/:slug',                   getGuideHandler)
router.post('/:slug/inquiries',        createInquiryHandler)

export default router
