import { Router } from 'express'
import { validate } from '../middleware/validate'
import {
  listVehicles,
  getVehicle,
  listQuerySchema,
} from '../controllers/vehicle.controller'

const router = Router()

// GET /vehicles
router.get('/', validate(listQuerySchema, 'query'), listVehicles)

// GET /vehicles/:slug
router.get('/:slug', getVehicle)

export default router
