import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { validate } from '../middleware/validate'
import {
  initiatePayment,
  confirmPayment,
  getPayment,
  getPaymentStatus,
  retryPayment,
  listMyPayments,
  requestRefund,
  refundSchema,
  paginationSchema,
  getPaymentCapability,
  getPaymentProcessors,
} from '../controllers/payment.controller'

const router = Router()

router.use(authenticate)

router.get('/my', validate(paginationSchema, 'query'), listMyPayments)

// Phase 3: pre-flight capability + processor registry (non-mutating)
router.get('/capability',  getPaymentCapability)
router.get('/processors',  getPaymentProcessors)

router.post('/initiate/:bookingId', initiatePayment)

router.get('/:paymentId/status', getPaymentStatus)
router.post('/:paymentId/retry', retryPayment)

router.post('/:paymentId/confirm', confirmPayment)

router.post('/:paymentId/refund', validate(refundSchema), requestRefund)

router.get('/:paymentId', getPayment)

export default router
