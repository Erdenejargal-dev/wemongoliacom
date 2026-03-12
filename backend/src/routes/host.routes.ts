import { Router } from 'express'
import { validate } from '../middleware/validate'
import {
  listHosts,
  getHost,
  listQuerySchema,
} from '../controllers/host.controller'

const router = Router()

// GET /hosts
router.get('/', validate(listQuerySchema, 'query'), listHosts)

// GET /hosts/:slug
router.get('/:slug', getHost)

export default router
