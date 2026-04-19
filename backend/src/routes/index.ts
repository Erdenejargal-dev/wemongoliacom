import { Router } from 'express'
import authRoutes          from './auth.routes'
import destinationRoutes   from './destination.routes'
import tourRoutes          from './tour.routes'
import vehicleRoutes       from './vehicle.routes'
import accommodationRoutes from './accommodation.routes'
import hostRoutes          from './host.routes'
import bookingRoutes       from './booking.routes'
import bookingRequestRoutes from './booking-request.routes'
import reviewRoutes        from './review.routes'
import wishlistRoutes      from './wishlist.routes'
import notificationRoutes  from './notification.routes'
import conversationRoutes  from './conversation.routes'
import providerRoutes      from './provider.routes'
import accountRoutes       from './account.routes'
import adminRoutes         from './admin.routes'
import searchRoutes        from './search.routes'
import paymentRoutes       from './payment.routes'
import internalRoutes      from './internal.routes'
import mediaRoutes         from './media.routes'
import geoRoutes           from './geo.routes'
import fxRoutes            from './fx.routes'

const router = Router()

// ── Part 1: Auth ───────────────────────────────────────────────────────────
router.use('/auth', authRoutes)

// ── Part 2: Public listings ────────────────────────────────────────────────
router.use('/destinations', destinationRoutes)
router.use('/tours',        tourRoutes)
router.use('/vehicles',     vehicleRoutes)
router.use('/stays',        accommodationRoutes)

// ── Part 3: Hosts + Bookings ───────────────────────────────────────────────
router.use('/hosts',    hostRoutes)
router.use('/bookings', bookingRoutes)
// Phase 6 — lead flow for listings that aren't directly payable today.
router.use('/booking-requests', bookingRequestRoutes)

// ── Part 4: Reviews + Wishlist + Notifications ────────────────────────────
router.use('/reviews',       reviewRoutes)
router.use('/wishlist',      wishlistRoutes)
router.use('/notifications', notificationRoutes)

// ── Part 5: Messaging ─────────────────────────────────────────────────────
router.use('/conversations', conversationRoutes)

// ── Part 6: Provider Dashboard ────────────────────────────────────────────
router.use('/provider', providerRoutes)

// ── Part 7: Traveler Account ──────────────────────────────────────────────
router.use('/account', accountRoutes)

// ── Part 8: Admin ─────────────────────────────────────────────────────────
router.use('/admin', adminRoutes)

// ── Part 9: Search ────────────────────────────────────────────────────────
router.use('/search', searchRoutes)

// ── Part 10: Payments ─────────────────────────────────────────────────────
router.use('/payments', paymentRoutes)

// ── Part 11: Media / Uploads ────────────────────────────────────────────
router.use('/media', mediaRoutes)

// ── Part 12: Geo hint (Phase 6) ──────────────────────────────────────────
router.use('/geo', geoRoutes)

// ── Part 13: FX display hint (Phase 6) ──────────────────────────────────
// Public read-only endpoint used ONLY for "≈$X" secondary-currency hints.
// Pricing/booking calculations continue to use the existing backend paths.
router.use('/fx', fxRoutes)

// ── Internal jobs (cron/scheduler triggers, CRON_SECRET protected)
router.use('/internal', internalRoutes)

export default router
