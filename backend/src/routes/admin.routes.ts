import { Router } from 'express'
import { authenticate } from '../middleware/auth'
import { requireRole } from '../middleware/role'
import { validate } from '../middleware/validate'
import {
  listUsers,
  getUser,
  setUserRole,
  listProviders,
  getProvider,
  setProviderStatus,
  setProviderVerificationStatus,
  listBookings,
  getBooking,
  getPlatformAnalytics,
  userListQuerySchema,
  setRoleSchema,
  providerListQuerySchema,
  setProviderStatusSchema,
  setVerificationStatusSchema,
  bookingListQuerySchema,
} from '../controllers/admin.controller'

const router = Router()

// All admin routes require auth + admin role
router.use(authenticate, requireRole('admin'))

// ── Analytics ──────────────────────────────────────────────────────────────
router.get('/analytics', getPlatformAnalytics)

// ── Users ──────────────────────────────────────────────────────────────────
router.get('/users',                  validate(userListQuerySchema, 'query'), listUsers)
router.get('/users/:userId',          getUser)
router.patch('/users/:userId/role',   validate(setRoleSchema), setUserRole)

// ── Providers ──────────────────────────────────────────────────────────────
router.get('/providers',                            validate(providerListQuerySchema, 'query'), listProviders)
router.get('/providers/:providerId',                getProvider)
router.patch('/providers/:providerId/status',       validate(setProviderStatusSchema), setProviderStatus)
router.patch('/providers/:providerId/verify',       validate(setVerificationStatusSchema), setProviderVerificationStatus)

// ── Bookings ───────────────────────────────────────────────────────────────
router.get('/bookings',               validate(bookingListQuerySchema, 'query'), listBookings)
router.get('/bookings/:bookingId',    getBooking)

export default router
