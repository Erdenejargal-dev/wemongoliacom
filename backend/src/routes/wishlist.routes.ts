import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
  addSchema,
} from '../controllers/wishlist.controller'

const router = Router()

// All wishlist routes require auth
router.use(authenticate)

router.get('/',     getWishlist)
router.post('/',    validate(addSchema), addToWishlist)
router.delete('/:id', removeFromWishlist)

export default router
