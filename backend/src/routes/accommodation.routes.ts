import { Router } from 'express'
import { validate } from '../middleware/validate'
import {
  listAccommodations,
  getAccommodation,
  listQuerySchema,
} from '../controllers/accommodation.controller'

const router = Router()

// GET /stays
router.get('/', validate(listQuerySchema, 'query'), listAccommodations)

// GET /stays/:slug
router.get('/:slug', getAccommodation)

export default router
