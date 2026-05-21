import { Router } from 'express'
import { listGuidesHandler, getGuideHandler } from '../controllers/guide.controller'

const router = Router()

router.get('/',      listGuidesHandler)
router.get('/:slug', getGuideHandler)

export default router
