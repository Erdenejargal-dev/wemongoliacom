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
  // ── FX Rates (Phase 2 Option B) ───────────────────────────────────────────────
  adminListFxRates,
  adminCreateFxRate,
  fxRateListQuerySchema,
  fxRateCreateSchema,
  // ── Pricing health (Phase 3) ──────────────────────────────────────────
  adminGetPricingHealth,
  adminGetFxRateHealth,
  adminGetCurrencyDistribution,
  adminGetListingsMissingNormalization,
  adminListBackfillReports,
  adminGetPaymentBlockedBookings,
  adminGetBackfillReport,
  adminResolveBackfillReport,
  backfillReportQuerySchema,
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

// ── FX Rates (Phase 2 Option B) ────────────────────────────────────────────
// Rates are immutable once written — corrections POST a new row with a
// later effectiveFrom. There is deliberately no PUT/DELETE here.
router.get ('/fx-rates', validate(fxRateListQuerySchema, 'query'), adminListFxRates)
router.post('/fx-rates', validate(fxRateCreateSchema),             adminCreateFxRate)

// ── Pricing health (Phase 3) ───────────────────────────────────────────
// All read-only diagnostics. No repair mutations live on this router.
router.get('/pricing-health',                              adminGetPricingHealth)
router.get('/pricing-health/fx-rates',                     adminGetFxRateHealth)
router.get('/pricing-health/currency-distribution',        adminGetCurrencyDistribution)
router.get('/pricing-health/missing-normalization',        adminGetListingsMissingNormalization)
router.get('/pricing-health/backfill-reports',             validate(backfillReportQuerySchema, 'query'), adminListBackfillReports)
router.get('/pricing-health/backfill-reports/:reportId',   adminGetBackfillReport)
// Explicit, guarded write: closes the report only. Does NOT mutate the flagged entity.
router.post('/pricing-health/backfill-reports/:reportId/resolve', adminResolveBackfillReport)
router.get('/pricing-health/payment-blocked-bookings',     adminGetPaymentBlockedBookings)

export default router
