# Expiry Scheduler – Production Implementation

## Approach chosen

**Primary: In-process setInterval** — The backend runs as a long-lived Express process. A `setInterval` runs the expiry job every `EXPIRY_JOB_INTERVAL_MINUTES` (default 10). This works out of the box with no external setup.

**Optional: Protected API endpoint** — For deployments that prefer external cron (Vercel Cron, GitHub Actions, uptime monitors), or for serverless backends where in-process intervals do not run, the endpoint `POST /api/v1/internal/jobs/expire-stale-bookings` can be called. It is protected by `CRON_SECRET`.

**Rationale:** The in-process scheduler is the most realistic default for a typical Express deployment. The internal endpoint is available for flexibility and serverless environments.

---

## Backend files changed

| File | Change |
|------|--------|
| `backend/src/config/env.ts` | Added `PENDING_EXPIRY_MINUTES` (15), `EXPIRY_JOB_INTERVAL_MINUTES` (10), `CRON_SECRET` (optional) |
| `backend/src/server.ts` | Runs expiry on startup; starts `setInterval` every `EXPIRY_JOB_INTERVAL_MINUTES`; `runExpiryJob()` helper with logging |
| `backend/src/routes/internal.routes.ts` | **New** — `POST /internal/jobs/expire-stale-bookings` with `validateCronSecret` middleware |
| `backend/src/routes/index.ts` | Mounts `/internal` under API prefix |
| `backend/src/services/booking.service.ts` | `createBooking` passes `env.PENDING_EXPIRY_MINUTES` to `expireStalePendingTourBookings` |

---

## Environment config

```bash
# Optional — defaults shown
PENDING_EXPIRY_MINUTES=15          # Age after which pending bookings expire
EXPIRY_JOB_INTERVAL_MINUTES=10     # In-process interval (0 = disable)
CRON_SECRET=                       # Required for internal endpoint; min 16 chars
```

---

## How expiry runs in production

1. **Startup** — One run after DB connect
2. **Every 10 minutes** — `setInterval` calls `expireStalePendingTourBookings(env.PENDING_EXPIRY_MINUTES)`
3. **On createBooking** — Before allocating seats (tour only)
4. **External cron (optional)** — `POST /api/v1/internal/jobs/expire-stale-bookings` with `X-Cron-Secret: <CRON_SECRET>` or `Authorization: Bearer <CRON_SECRET>`

---

## Observability

- Logs `[expiry] Expired N stale pending tour booking(s)` when N > 0
- Endpoint logs `[expiry-job] Expired N...` on success
- On endpoint error: `[expiry-job] Error: ...`

---

## Deployment

No frontend changes. For external cron (e.g. Vercel Cron):

1. Set `CRON_SECRET` in production env
2. Configure cron to `POST` the internal URL with the secret header every 5–15 minutes

---

## Remaining limitations

- **Serverless:** In-process interval does not run. Use the protected endpoint with external cron.
- **Single replica:** With multiple backend instances, each runs its own interval; the job is idempotent, so overlapping runs are safe.
- **Tour only:** Vehicle/accommodation pending expiry not implemented.
