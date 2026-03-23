# Pending Booking Lifecycle – Expiry & Cleanup

## Expiry trigger strategy (production)

**Primary: In-process setInterval** — runs every `EXPIRY_JOB_INTERVAL_MINUTES` (default 10). No external setup; reliable for long-lived Node processes.

**Optional: Protected API endpoint** — `POST /api/v1/internal/jobs/expire-stale-bookings` for external cron (Vercel Cron, GitHub Actions, etc.). Requires `X-Cron-Secret` or `Authorization: Bearer <CRON_SECRET>`.

**Config:**

| Env var | Default | Description |
|---------|---------|-------------|
| `PENDING_EXPIRY_MINUTES` | 15 | Age (minutes) after which pending bookings expire |
| `EXPIRY_JOB_INTERVAL_MINUTES` | 10 | Interval for in-process scheduler (0 = disable) |
| `CRON_SECRET` | — | Required for the internal endpoint; min 16 chars |

---

## 1. Current risk found

**Pending bookings could block seats indefinitely:**
- User creates booking (pending, unpaid) → seats allocated
- User never pays, provider never confirms
- No expiry or cleanup → seats held forever
- Same risk for pending + authorized (payment initiated but never confirmed)

**Payment paths audited:**
- `initiatePayment`: Creates Payment (authorized), no seat change. Blocks duplicate via `if (booking.payment)` 409.
- `confirmPayment`: Sets paid + confirmed. No seat change (already allocated).
- `requestRefund`: Cancels booking, releases seats (transactional). ✓
- Failed payment: Mock flow always succeeds; real gateway failure handling not in scope.

---

## 2. Lifecycle rule implemented

**Pending bookings now expire:**
- **Condition:** Tour bookings with `bookingStatus: pending` and `paymentStatus` in (`unpaid`, `authorized`)
- **Expiry:** Older than **15 minutes** (configurable via `PENDING_EXPIRY_MINUTES`)
- **Action:** Auto-cancel and release seats transactionally

**Unchanged:**
- `pending` and `confirmed` both hold seats until cancelled or completed
- `cancelled` releases seats (all cancel paths fixed previously)
- Provider-review vs payment: both use the same pending state; no separate "payment-pending" vs "provider-review" timeout

---

## 3. Backend files changed

| File | Change |
|------|--------|
| `backend/src/config/env.ts` | Added `PENDING_EXPIRY_MINUTES`, `EXPIRY_JOB_INTERVAL_MINUTES`, `CRON_SECRET` |
| `backend/src/services/booking.service.ts` | `expireStalePendingTourBookings(maxAgeMinutes)` uses `env.PENDING_EXPIRY_MINUTES` when invoked from createBooking |
| `backend/src/services/booking.service.ts` | Added `cancelReason` to `listMyBookings` select |
| `backend/src/server.ts` | Runs expiry on startup; starts `setInterval` every `EXPIRY_JOB_INTERVAL_MINUTES`; logs `[expiry] Expired N stale...` |
| `backend/src/routes/internal.routes.ts` | New: `POST /internal/jobs/expire-stale-bookings` protected by `CRON_SECRET` |
| `backend/src/routes/index.ts` | Mounts `/internal` routes |

---

## 4. Frontend files changed

| File | Change |
|------|--------|
| `lib/api/bookings.ts` | Added `fetchBookingByCode()`, added `cancelReason` to `BackendBooking` |
| `lib/mock-data/trips.ts` | Added `cancelReason` to `Trip` interface |
| `lib/account/mapBookingToTrips.ts` | Passes through `cancelReason` from backend |
| `app/booking-success/page.tsx` | Fetches booking by code on load; shows "This booking has expired" when `bookingStatus === 'cancelled'`, with link to rebook |
| `components/trips/BookingDetails.tsx` | Shows `cancelReason` for cancelled trips when present |

---

## 5. Pending bookings now expire

**Yes.** Pending tour bookings (unpaid or authorized) older than `PENDING_EXPIRY_MINUTES` are auto-cancelled and seats are released.

**Trigger points:**
1. **Server startup:** Runs expiry once after DB connect
2. **In-process scheduler:** Runs every `EXPIRY_JOB_INTERVAL_MINUTES` (default 10)
3. **createBooking:** Runs expiry before allocating seats (frees capacity for the new request)
4. **Optional external cron:** `POST /api/v1/internal/jobs/expire-stale-bookings` with `X-Cron-Secret` or `Authorization: Bearer <CRON_SECRET>`

---

## 6. Remaining limitations

1. **Tour only:** Vehicle and accommodation pending bookings are not expired. Same pattern could be extended if needed.
2. **Payment failure:** Current mock payment does not fail. Real gateway failures would need webhook handling to release seats if payment never completes.
3. **Serverless:** In-process interval does not run on serverless (Lambda, etc.). Use the protected endpoint with external cron instead.
