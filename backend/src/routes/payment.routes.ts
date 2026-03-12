import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  initiatePayment,
  confirmPayment,
  getPayment,
  listMyPayments,
  requestRefund,
  refundSchema,
  paginationSchema,
} from '../controllers/payment.controller'

const router = Router()

// All payment routes require auth
router.use(authenticate)

// Traveler payment history
router.get('/my', validate(paginationSchema, 'query'), listMyPayments)

// Initiate payment for a booking
router.post('/initiate/:bookingId', initiatePayment)

// Confirm (mock capture) a payment
router.post('/:paymentId/confirm', confirmPayment)

// View a payment
router.get('/:paymentId', getPayment)

// Request refund
router.post('/:paymentId/refund', validate(refundSchema), requestRefund)

export default router
