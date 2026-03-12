# Frontend ↔ Backend Integration Audit

**Date:** 2026-03-12  
**Method:** Source-to-source verification of every frontend API call against the actual Express backend controller/service code.

---

## Response Envelope

All backend responses use:
```json
{ "success": true, "data": <payload>, "message": "..." }
```
`apiClient.get/post/patch/delete` in `lib/api/client.ts` unwraps `json.data` and returns it directly as `T`. Every type annotation must therefore describe the **inner `data` value**, not the outer envelope.

---

## Endpoint Audit

### 1. Login — `POST /api/v1/auth/login`

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| URL | `POST /auth/login` | `POST ${API_URL}/auth/login` | ✅ |
| Body | `{ email, password }` | `{ email, password }` | ✅ |
| Response `data` shape | `{ user: { id, firstName, lastName, email, role, avatarUrl }, accessToken, refreshToken }` | Reads `json.data.user` and `json.data.accessToken` | ✅ |
| Name construction | `firstName + lastName` | `[user.firstName, user.lastName].filter(Boolean).join(" ")` | ✅ |
| Error handling | `json.error ?? "Invalid email or password."` | Throws with backend `error` field | ✅ |
| Token storage | NextAuth JWT → `session.user.accessToken` | Stored via JWT callback | ✅ |

**Verdict: ✅ FULLY INTEGRATED**

---

### 2. Register — `POST /api/v1/auth/register`

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| URL | `POST /api/v1/auth/register` | `POST /api/auth/register` (Next.js MongoDB route) | ❌ |
| Body | `{ firstName, lastName, email, password, role? }` | Unknown (old route) | ❌ |
| Auto-login after register | Should call backend login and store accessToken | Never stores accessToken | ❌ |

**Verdict: ❌ NOT INTEGRATED**  
**Root cause:** `components/register-form.tsx` posts to `/api/auth/register` — the old Next.js Mongoose route — not to the Express backend.  
**Required fix:** Update the register form to `POST NEXT_PUBLIC_API_URL/auth/register`, then auto-sign-in via `signIn("credentials", ...)` with the returned credentials.

---

### 3. Auth/Me — `GET /api/v1/auth/me`

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Called on page load | Yes, to refresh stale session data | Never called | ❌ |
| Session refresh on profile update | Should call `/auth/me` and update session | Not implemented | ❌ |

**Verdict: ❌ NOT INTEGRATED**  
**Impact:** Session data (name, avatar, role) can be stale after a profile edit without re-login.  
**Required fix:** Add `lib/api/account.ts` with `fetchMe(token)` → `GET /auth/me`; call it in the account page / layout on mount.

---

### 4. Tours List — `GET /api/v1/tours`

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| URL | `GET /tours?...` | `GET /tours?...` | ✅ |
| Sort param | `sort=price_asc\|price_desc\|rating\|newest\|popular` | Was `sortBy`, **fixed to `sort`** | ✅ (fixed) |
| Response shape | `{ data: Tour[], pagination: {...} }` | Typed as `Paginated<BackendTour>` | ✅ |
| Used by tours page | `lib/search/searchService.ts` calls `/search?type=tour` (not `/tours`) | Only `/search` is called; `/tours` endpoint unused by UI | ⚠️ |

**Verdict: ✅ API layer correct. UI uses `/search` (also correct). `/tours` endpoint available for future direct use.**

---

### 5. Tours Search — `GET /api/v1/search?type=tour`

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| URL | `GET /search?type=tour&...` | `GET /search?type=tour&...` | ✅ |
| `destination` param | Filters by destination name/country/region | Sends `query.destination` as `destination` | ✅ |
| `minPrice`/`maxPrice` | Number filters | Sent correctly | ✅ |
| `minRating` | Number filter | Sent correctly | ✅ |
| `sortBy` mapping | `top_rated→rating`, `popular→newest` | Mapped correctly | ✅ |
| Response unwrap | `data.data: Tour[]`, `data.pagination.total` | `result.data.map(mapTour)`, `result.pagination.total` | ✅ |
| Fallback | Falls back to mock data if backend unreachable | `catch {}` → mock filter | ✅ |

**Verdict: ✅ FULLY INTEGRATED with safe fallback**

---

### 6. Tour Detail — `GET /api/v1/tours/:slug`

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| URL | `GET /tours/:slug` | `fetchTourBySlug(slug)` exists in `lib/api/tours.ts` | ❌ |
| Called by UI | `app/tours/[slug]/page.tsx` should call it | Page calls `getTourBySlug()` from **mock data only** | ❌ |
| Fallback | Mock data | Entire page is mock data | — |

**Verdict: ❌ NOT INTEGRATED (page is 100% mock)**  
**Required fix:** In `app/tours/[slug]/page.tsx`, call `fetchTourBySlug(slug)` first; fall back to `getTourBySlug(slug)` if null. Map backend fields to the component props expected by `TourGallery`, `TourItinerary`, `TourBookingCard`.

---

### 7. Booking Create — `POST /api/v1/bookings`

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| URL | `POST /bookings` | `POST /bookings` | ✅ |
| Auth | Bearer token required | Uses `session?.user?.accessToken` | ✅ |
| `listingId` validation | Must be a Prisma CUID (`z.string().cuid()`) | Reads `tourId` from URL param — currently a mock string like `"tour-1"` | ⚠️ |
| Body fields | `listingType, listingId, tourDepartureId?, startDate?, guests, adults, children, travelerFullName, travelerEmail, travelerPhone, travelerCountry, specialRequests?` | All sent correctly | ✅ |
| Response `data` | `{ id, bookingCode, bookingStatus, paymentStatus, subtotal, serviceFee, totalAmount, ... }` | Mapped to `BackendBooking` type | ✅ |
| Fallback | localStorage-only if no token | Implemented | ✅ |
| Error banner | Shows `apiError` if backend rejects | Implemented | ✅ |

**Verdict: ✅ Code correct, but will get 400 until tour detail page passes real backend IDs.**  
**Root cause of CUID failure:** `app/tours/[slug]/page.tsx` is mock-only, so `TourBookingCard` never receives a real backend tour ID. Fix requires integrating tour detail first.

---

### 8. My Bookings — `GET /api/v1/bookings/me`

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| URL | `GET /bookings/me` | `GET /bookings/me` | ✅ |
| Auth | Bearer required | Uses token | ✅ |
| Response unwrap | `data` is the array directly (`BackendBooking[]`) | Was `result.data` — **fixed to `result` directly** | ✅ (fixed) |
| Used by UI | `app/account/trips/page.tsx` should call it | Page still uses `lib/mock-data/trips.ts` | ❌ |

**Verdict: ✅ API layer fixed. UI page not yet wired.**

---

### 9. Provider Bookings — `GET /api/v1/provider/bookings`

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| URL | `GET /provider/bookings` | `GET /provider/bookings` | ✅ |
| Auth | Bearer + `provider_owner` role | Uses session token | ✅ |
| Status filter param | `bookingStatus=pending\|confirmed\|...` | Was `status=...` — **fixed to `bookingStatus`** | ✅ (fixed) |
| Response shape | `{ data: booking[], pagination: {...} }` | `result.data`, `result.pagination.total` | ✅ |
| Customer name | In `booking.user.firstName + booking.user.lastName` | Was `travelerFullName` flat field — **fixed to `r.user.firstName/lastName`** | ✅ (fixed) |
| Customer email | In `booking.user.email` | Was `travelerEmail` flat — **fixed to `r.user.email`** | ✅ (fixed) |

**Verdict: ✅ FULLY INTEGRATED (after fixes)**

---

### 10. Provider Booking Actions — PATCH confirm/complete/cancel

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| Confirm URL | `PATCH /provider/bookings/:bookingCode/confirm` | ✅ | ✅ |
| Complete URL | `PATCH /provider/bookings/:bookingCode/complete` | ✅ | ✅ |
| Cancel URL | `PATCH /provider/bookings/:bookingCode/cancel` | ✅ | ✅ |
| Cancel body | `{ reason?: string }` | `{ reason }` | ✅ |
| Auth | Bearer + `provider_owner` | Uses session token | ✅ |
| Identifier | Uses `bookingCode` (not `id`) | ✅ | ✅ |

**Verdict: ✅ FULLY INTEGRATED**

---

### 11. Provider Analytics — `GET /api/v1/provider/analytics`

| Check | Expected | Actual | Status |
|-------|----------|--------|--------|
| URL | `GET /provider/analytics` | `GET /provider/analytics` | ✅ |
| Auth | Bearer + `provider_owner` | Uses session token | ✅ |
| Response shape | `{ bookings: { total, pending, confirmed, completed, cancelled }, revenue: { total, thisMonth, lastMonth, thisMonthCount, lastMonthCount }, reviews: { total, avgRating } }` | Was wrong flat shape — **fixed `ProviderAnalytics` type** | ✅ (fixed) |
| Used by UI | `app/dashboard/business/analytics/page.tsx` | Page still uses `lib/mock-data/analytics.ts` | ❌ |

**Verdict: ✅ API layer correct. UI page not yet wired.**

---

## Integration Report Summary

### ✅ Fully Verified & Integrated
| Flow | File |
|------|------|
| Login (POST /auth/login) | `lib/auth.ts` |
| Tours search (GET /search?type=tour) | `lib/search/searchService.ts` + `lib/api/search.ts` |
| Provider bookings list | `app/dashboard/business/bookings/page.tsx` |
| Provider booking actions (confirm/complete/cancel) | `lib/api/provider.ts` |

### ⚠️ Partially Integrated (code correct, data dependency missing)
| Flow | File | Blocker |
|------|------|---------|
| Booking Create | `app/checkout/page.tsx` | `listingId` is mock string, not real CUID — requires tour detail integration |

### 📦 API Layer Ready but UI Not Wired
| Flow | API Layer | Missing UI Integration |
|------|-----------|----------------------|
| My Bookings (GET /bookings/me) | `lib/api/bookings.ts` ✅ | `app/account/trips/page.tsx` still uses mock |
| Provider Analytics | `lib/api/provider.ts` ✅ | `app/dashboard/business/analytics/page.tsx` still uses mock |
| Tour list (GET /tours) | `lib/api/tours.ts` ✅ | Not called by UI (search endpoint used instead) |
| Tour detail (GET /tours/:slug) | `lib/api/tours.ts` ✅ | `app/tours/[slug]/page.tsx` still uses mock |

### ❌ Not Integrated (requires new work)
| Flow | Current Behavior | Required Fix |
|------|-----------------|-------------|
| Register | Calls Next.js `/api/auth/register` (Mongoose) | Update form to call `POST /api/v1/auth/register`, then `signIn()` |
| Auth/Me | Session never refreshed after profile update | Add `GET /auth/me` call in account layout |
| Tour detail page | 100% mock data | Fetch from backend in `app/tours/[slug]/page.tsx`, map fields |
| Account/trips page | Mock data | Wire `fetchMyBookings()` in `app/account/trips/page.tsx` |
| Analytics dashboard | Mock data | Wire `fetchProviderAnalytics()` in analytics page |

---

## Bugs Fixed in This Session

| # | Bug | File Fixed | Description |
|---|-----|-----------|-------------|
| 1 | `fetchMyBookings` double-unwrap | `lib/api/bookings.ts` | `apiClient.get` already unwraps `json.data`; calling `.data` again always returned `undefined` |
| 2 | Provider bookings filter param | `lib/api/provider.ts` | `status=` renamed to `bookingStatus=` to match backend Zod schema |
| 3 | Provider booking customer names | `lib/api/provider.ts` + `bookings/page.tsx` | Backend returns `user: { firstName, lastName, email }` nested, not flat `travelerFullName`/`travelerEmail` |
| 4 | `ProviderAnalytics` type shape | `lib/api/provider.ts` | Completely wrong flat shape replaced with correct nested `{ bookings, revenue, reviews }` structure |
| 5 | Tour list sort param | `lib/api/tours.ts` | `/tours` endpoint uses `sort=`, not `sortBy=`; search endpoint uses `sortBy=` (both now correct) |
| 6 | Next.js 15 `params` type | `app/api/{cars,hotels,tours}/[id]/route.ts` | Updated `params` to `Promise<{ id: string }>` and `await params` |
