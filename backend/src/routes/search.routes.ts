import { Router } from 'express'
import { validate } from '../middleware/validate'
import { searchAll, searchQuerySchema } from '../controllers/search.controller'

const router = Router()

// Public — no auth required
router.get('/', validate(searchQuerySchema, 'query'), searchAll)

export default router
