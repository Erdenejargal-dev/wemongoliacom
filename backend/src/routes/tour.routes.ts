import { Router } from 'express'
import { validate } from '../middleware/validate'
import {
  listTours,
  getTour,
  getTourDepartures,
  listQuerySchema,
} from '../controllers/tour.controller'

const router = Router()

// GET /tours
router.get('/', validate(listQuerySchema, 'query'), listTours)

// GET /tours/:slug
router.get('/:slug([a-z0-9-]+)', getTour)

// GET /tours/:id/departures
router.get('/:id/departures', getTourDepartures)

export default router
