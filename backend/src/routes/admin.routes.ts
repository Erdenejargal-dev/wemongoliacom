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
  setProviderPlan,
  setProviderVerificationStatus,
  listBookings,
  getBooking,
  getPlatformAnalytics,
  userListQuerySchema,
  setRoleSchema,
  providerListQuerySchema,
  setProviderStatusSchema,
  setProviderPlanSchema,
  setVerificationStatusSchema,
  bookingListQuerySchema,
  // ── Destinations ──────────────────────────────────────────────────────────────
  adminListDestinations,
  adminGetDestination,
  adminCreateDestination,
  adminUpdateDestination,
  adminDeleteDestination,
  adminToggleDestinationFeatured,
  destinationCreateSchema,
  destinationUpdateSchema,
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
router.patch('/providers/:providerId/plan',         validate(setProviderPlanSchema),   setProviderPlan)
router.patch('/providers/:providerId/verify',       validate(setVerificationStatusSchema), setProviderVerificationStatus)

// ── Bookings ───────────────────────────────────────────────────────────────
router.get('/bookings',               validate(bookingListQuerySchema, 'query'), listBookings)
router.get('/bookings/:bookingId',    getBooking)

// ── Destinations ───────────────────────────────────────────────────────────
router.get('/destinations',                               adminListDestinations)
router.get('/destinations/:id',                           adminGetDestination)
router.post('/destinations',                              validate(destinationCreateSchema), adminCreateDestination)
router.put('/destinations/:id',                           validate(destinationUpdateSchema), adminUpdateDestination)
router.delete('/destinations/:id',                        adminDeleteDestination)
router.patch('/destinations/:id/featured',                adminToggleDestinationFeatured)

export default router
