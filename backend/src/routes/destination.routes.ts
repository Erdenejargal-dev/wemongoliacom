import { Router } from 'express'
import { validate } from '../middleware/validate'
import {
  listDestinations,
  getDestination,
  listQuerySchema,
} from '../controllers/destination.controller'

const router = Router()

// GET /destinations
router.get('/', validate(listQuerySchema, 'query'), listDestinations)

// GET /destinations/:slug
router.get('/:slug', getDestination)

export default router
