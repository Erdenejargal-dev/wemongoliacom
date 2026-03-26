# WeMongolia — Email Services

Backend-only transactional email using **Nodemailer** and **Zoho Mail** (or any SMTP). All sending goes through a small **mailer** layer and a central **`email.service`**. Controllers and routes do **not** call Nodemailer directly.

---

## Architecture

| Layer | Path | Responsibility |
|--------|------|------------------|
| Transport | `backend/src/lib/mailer.ts` | Create transporter, `verifyMailTransport()`, `sendMailMessage()` |
| Templates | `backend/src/templates/email-layout.ts` | Shared HTML shell + plain-text footer (support: `info@wemongolia.com`) |
| Templates | `backend/src/templates/booking-transactional.ts` | Booking created / cancelled (traveler + provider) |
| Templates | `backend/src/templates/account-emails.ts` | Password reset, welcome |
| Orchestration | `backend/src/services/email.service.ts` | `safeSend`, booking `notify*`, account emails, SMTP test |
| Password reset | `backend/src/services/password-reset.service.ts` | Token lifecycle (hash-only storage); calls `email.service` for the mail |
| Formatting | `backend/src/utils/email-format.ts` | `escapeHtml`, money, dates, listing-type labels |

**Rules**

- Secrets and SMTP credentials stay in **environment variables** only; never log passwords or raw reset tokens.
- **Dynamic content** in HTML is passed through **`escapeHtml`** where appropriate.
- **After successful DB work**, callers schedule email via **dynamic `import('./email.service')`** so booking/register flows are not blocked and email failures do not fail the API response (see [Failure handling](#failure-handling)).

---

## Environment variables

| Variable | Purpose |
|----------|---------|
| `SMTP_HOST` | Default `smtp.zoho.com` |
| `SMTP_PORT` | Default `465` |
| `SMTP_SECURE` | Default `true`; use `false` with port `587` (STARTTLS) |
| `SMTP_USER` | SMTP login (full email). Empty = **email disabled** |
| `SMTP_PASS` | App password or account password |
| `EMAIL_FROM` | Default `WeMongolia <info@wemongolia.com>` |
| `CORS_ORIGIN` | Frontend origin; used as fallback for public links |
| `PUBLIC_APP_URL` | Optional canonical site URL for links in emails; if unset, **`CORS_ORIGIN`** is used |
| `PASSWORD_RESET_EXPIRES_MINUTES` | Reset link lifetime (default `60`) |
| `CRON_SECRET` | Protects internal routes including SMTP test (min 16 chars when set) |

See `backend/.env.example` for a starter block.

---

## Startup

In non-`test` environments, `backend/src/server.ts` calls **`verifyMailTransport()`** after DB connect and logs whether SMTP verification succeeded or email is disabled.

---

## Transactional emails

### Booking lifecycle

Triggered **only after** the relevant Prisma transaction commits.

| Event | Orchestrator | Recipients |
|--------|----------------|------------|
| Booking created | `notifyBookingCreated(bookingCode)` | Traveler (user email), provider (`provider.email` or owner user email) |
| Traveler cancelled | `notifyBookingCancelledByTraveler(bookingCode)` | Traveler + provider |
| Provider cancelled | `notifyBookingCancelledByProvider(bookingCode)` | Traveler + provider |

**Wiring** (scheduling only; not awaited on critical path):

- `backend/src/services/booking.service.ts` — `createBooking`, `cancelBooking`
- `backend/src/services/provider.service.ts` — `cancelBookingByProvider`

**Payload** is built from the booking row, including **`listingSnapshot`** and **`dateSummaryFromBooking`**, so **tours**, **accommodations**, and **vehicles** share one pipeline without extra controller logic.

**Subject line convention:** `[WeMongolia] …` with booking code and short context.

### Registration welcome

After **`auth.service.register`** creates the user, **`notifyWelcomeAfterRegistration(email, firstName)`** is scheduled. Links point to `/tours`, `/account/trips`, and `/onboarding`.

### Password reset

- **Request:** `password-reset.service.requestPasswordReset` creates a **SHA-256 hash** of a random token, stores it in **`PasswordResetToken`**, emails a link to `{PUBLIC_APP_URL}/auth/reset-password?token=…`.
- **Complete:** `resetPasswordWithToken` validates hash + expiry + not used, updates password, deletes all reset tokens for that user.
- **Email:** `email.service.sendPasswordResetEmail` (via `safeSend`).

**Auth routes**

- `POST /api/v1/auth/forgot-password` — `{ "email": "…" }` — neutral success message (no user enumeration).
- `POST /api/v1/auth/reset-password` — `{ "token": "…", "password": "…" }` (min 8 characters).

### Reserved / not wired

- **`sendProviderOnboardingApproved`** — logs only; no send until product wires approval.

---

## Internal / ops

| Method | Path | Auth |
|--------|------|------|
| `POST` | `/api/v1/internal/dev/test-email` | `X-Cron-Secret` or `Authorization: Bearer <CRON_SECRET>` |

Body optional: `{ "to": "recipient@example.com" }`. Defaults to `SMTP_USER`.

**Local script:** `backend/scripts/test-smtp.ts` — `npx ts-node --transpile-only scripts/test-smtp.ts` (loads `.env`, verifies SMTP, sends test to `SMTP_USER`).

---

## Failure handling

- **`safeSend`:** If SMTP is not configured or recipient is missing → skip + info log. On send error → **`console.error`** with message only (no secrets); **does not throw** to callers that must stay non-blocking.
- **Booking / register / forgot-password request:** API success is **not** tied to email delivery; forgot-password always returns the same neutral message when the handler completes.
- **Reset password:** Invalid/expired/unknown token → **400** with a generic error (no enumeration).
- **`sendSmtpTest`:** Used by the internal endpoint; **throws** on failure so the HTTP handler can return 500.

---

## Frontend (reference)

| Page / API helper | Purpose |
|-------------------|---------|
| `lib/api/auth-password.ts` | `requestForgotPassword`, `confirmPasswordReset` |
| `app/auth/forgot-password/page.tsx` | Request form |
| `app/auth/reset-password/page.tsx` | New password + `token` query param |

Login surfaces link to forgot password: `components/login-form.tsx`, `components/AuthModal.tsx`.

---

## Database

**`PasswordResetToken`** (`password_reset_tokens`): `userId`, **`tokenHash` (unique)**, `expiresAt`, `usedAt`, relation to `User` with cascade delete.

---

## Production checklist

- Set **`PUBLIC_APP_URL`** to the live marketing/app origin if it differs from **`CORS_ORIGIN`**.
- Configure **SPF / DKIM / DMARC** for the sending domain (Zoho docs).
- Consider **rate limiting** on `POST /auth/forgot-password`.
- Remove or further lock down **`/internal/dev/test-email`** when no longer needed.
- **Password reset** does not invalidate existing JWTs/sessions; users may stay signed in elsewhere until tokens expire (optional future improvement).

---

## File index

```
backend/src/lib/mailer.ts
backend/src/utils/email-format.ts
backend/src/templates/email-layout.ts
backend/src/templates/booking-transactional.ts
backend/src/templates/account-emails.ts
backend/src/services/email.service.ts
backend/src/services/password-reset.service.ts
backend/scripts/test-smtp.ts
```

Related: `auth.service.ts`, `auth.controller.ts`, `auth.routes.ts`, `booking.service.ts`, `provider.service.ts`, `server.ts`, `internal.routes.ts`, `prisma/schema.prisma` (`PasswordResetToken`).
