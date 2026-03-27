# Provider Verification Lifecycle

> **Last updated:** Phase 3A — Verification emails + rejection reasons

---

## Overview

Provider verification is a **two-party workflow** between the provider (who submits) and admin (who reviews and decides). It is entirely separate from the provider's operational status (`draft / active / paused / archived`).

---

## Fields

### `verificationStatus` (on Provider model)

Controls identity/legitimacy review.

| Value | Meaning |
|---|---|
| `unverified` | Default. Provider has not yet submitted for review. |
| `pending_review` | Provider submitted themselves. Awaiting admin review. |
| `verified` | Admin approved. Provider is legitimate. |
| `rejected` | Admin rejected. Provider sees reason and can resubmit. |

### `isVerified` (boolean)

Mirror of `verificationStatus === 'verified'`. Always kept in sync by `setProviderVerificationStatus`. Used by public host listing queries (`host.service.ts`) to gate who appears in search results.

### `rejectionReason` (String?, nullable)

Provider-facing explanation of why verification was not approved. Set by admin when rejecting. Cleared automatically when:
- Admin verifies the provider (`null`)
- Provider resubmits (`null` — fresh start)

### `reviewedAt` (DateTime?, nullable)

Timestamp of the last admin decision (verify or reject). Set to `new Date()` on any admin verify/reject action.

### `status` (operational, `ListingStatus`)

Controls operational state: `draft / active / paused / archived`. **Independent of verificationStatus.** Admin controls this separately via `PATCH /admin/providers/:id/status`.

---

## Who Can Change What

| Field | Changed by | Endpoint |
|---|---|---|
| `verificationStatus` | Admin only | `PATCH /admin/providers/:id/verify` |
| `verificationStatus` (to `pending_review`) | Provider (self-submit) | `POST /provider/verify/submit` |
| `rejectionReason` | Admin only (on rejection) | `PATCH /admin/providers/:id/verify` |
| `reviewedAt` | Automatically by service | Set on every admin verify/reject action |
| `isVerified` | Automatically by service | Sync'd on every verificationStatus write |
| `status` | Admin only | `PATCH /admin/providers/:id/status` |

> Providers **cannot** set `verificationStatus` to `verified` themselves — they can only move from `unverified` or `rejected` → `pending_review`.

---

## State Machine

```
unverified
    │
    │  Provider: POST /provider/verify/submit
    ▼
pending_review
    │
    ├─── Admin verifies ──▶  verified  (isVerified: true, rejectionReason: null, reviewedAt: now)
    │
    └─── Admin rejects  ──▶  rejected  (isVerified: false, rejectionReason: set, reviewedAt: now)
                                │         if was active → operational status downgraded to paused
                                │
                                │  Provider resubmits (POST /provider/verify/submit)
                                │  → rejectionReason cleared to null
                                ▼
                          pending_review
```

Admin can also:
- **Revoke verification:** `verified → rejected` (requires rejection reason, auto-pauses if active)
- **Reset:** set to `unverified` (clears reason)

---

## What `verify` Does (Admin action)

When admin sets `verificationStatus: 'verified'`:
1. `verificationStatus` = `'verified'`
2. `isVerified` = `true`
3. `rejectionReason` = `null` (cleared)
4. `reviewedAt` = `now`
5. **No automatic operational status change** — admin controls `status` separately
6. **Email sent** to provider: approval confirmation with link to Business Portal

When admin sets `verificationStatus: 'rejected'`:
1. `verificationStatus` = `'rejected'`
2. `isVerified` = `false`
3. `rejectionReason` = admin's written reason (required, sent to provider)
4. `reviewedAt` = `now`
5. If provider was `status: 'active'` → downgraded to `'paused'` automatically
6. **Email sent** to provider: rejection with reason + profile settings link

---

## What `submit` Does (Provider action)

When provider calls `POST /provider/verify/submit`:
1. Validates `verificationStatus` is `'unverified'` or `'rejected'` (resubmission allowed)
2. Sets `verificationStatus` = `'pending_review'`
3. **Clears `rejectionReason` to `null`** — fresh start for the new review cycle
4. **Two emails sent:**
   - Email 1 to provider: "We received your verification request"
   - Email 2 to `info@wemongolia.com`: "New verification submission" with admin panel link

---

## Email Behavior

### On Provider Submit

| Trigger | Recipient | Content |
|---|---|---|
| `POST /provider/verify/submit` | Provider email (or owner email as fallback) | Business name, type, status = Pending Review, expected timeline |
| `POST /provider/verify/submit` | `info@wemongolia.com` (admin) | Business name, owner name/email, type, link to `/admin/providers?verificationStatus=pending_review` |

### On Admin Approve

| Trigger | Recipient | Content |
|---|---|---|
| `PATCH /admin/providers/:id/verify` with `verified` | Provider | Business verified, portal link, note about operational status being separate |

### On Admin Reject

| Trigger | Recipient | Content |
|---|---|---|
| `PATCH /admin/providers/:id/verify` with `rejected` | Provider | Rejection reason in red box, instructions to update and resubmit, link to profile settings, support email |

### Email Rules

- All verification emails fire **after successful DB update** — email failure never blocks the API action
- Failures are logged to console but not thrown
- Emails skip silently if SMTP is not configured (`isSmtpConfigured()` returns false)
- Provider email is used first; falls back to owner (user) email if not set

---

## Rejection Reason Lifecycle

| Action | Effect on `rejectionReason` |
|---|---|
| Admin rejects | Set to the admin's written reason |
| Admin verifies | Cleared to `null` |
| Admin sets `unverified` | Cleared to `null` |
| Provider resubmits | Cleared to `null` (fresh review cycle) |

The reason is:
- Required when admin submits `verificationStatus: 'rejected'` (validated by Zod `superRefine`)
- Displayed to provider in the `VerificationBanner` component on their dashboard
- Sent to provider by email on rejection
- Visible to admin in the provider detail panel (`/admin/providers`) as a read-only "Rejection Reason" box

---

## Public Visibility Rules

| verificationStatus | isVerified | Appears in `/hosts` search? |
|---|---|---|
| unverified | false | ❌ No |
| pending_review | false | ❌ No |
| verified | true | ✅ Yes (if status = active) |
| rejected | false | ❌ No |

Both `status: 'active'` AND `isVerified: true` must be true to appear in public host listings.

---

## Support Contact

Centralized in `lib/constants/platform.ts` as `PLATFORM.supportEmail = 'info@wemongolia.com'`.

Used in:
- Rejection email template footer
- `VerificationBanner` — shown in rejected state
- Admin sidebar email link

---

## Migration Required

The following fields were added in Phase 1/3A:

```bash
# Development:
cd backend
npx prisma migrate dev --name add_provider_verification_status

# Production:
npx prisma migrate deploy
```

Migration adds to `providers` table:
- `verificationStatus VerificationStatus @default(unverified)`
- `rejectionReason String?`
- `reviewedAt DateTime?`

All existing providers receive `verificationStatus: 'unverified'` and `rejectionReason: null`.
