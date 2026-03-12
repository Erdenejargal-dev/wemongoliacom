# WeMongolia Backend — Complete API Reference & Testing Guide

> **Base URL:** `http://localhost:4000/api/v1`  
> **Health check:** `GET http://localhost:4000/health`  
> **TypeScript verified:** ✅ 0 errors across Parts 1–10

---

## Table of Contents

1. [Platform Overview](#1-platform-overview)
2. [Complete Endpoint List](#2-complete-endpoint-list)
3. [Endpoint Documentation](#3-endpoint-documentation)
4. [API Flow Diagrams](#4-api-flow-diagrams)
5. [Testing Instructions](#5-testing-instructions)
6. [curl / Postman Examples](#6-curl--postman-examples)
7. [Architecture Verification](#7-architecture-verification)
8. [Suggested Improvements](#8-suggested-improvements)

---

## 1. Platform Overview

WeMongolia is a travel marketplace connecting **travelers** with Mongolian **tour providers**. The backend is a Node.js + Express + Prisma (PostgreSQL) REST API.

### User Roles

| Role             | Description                                    |
|------------------|------------------------------------------------|
| `traveler`       | Default role. Can book, review, message.       |
| `provider_owner` | Can manage listings, confirm/complete bookings.|
| `admin`          | Full access to all endpoints.                  |

### Authentication

All protected routes require a JWT Bearer token in the `Authorization` header:

```
Authorization: Bearer <access_token>
```

Tokens are issued on `POST /auth/login` and are valid for **15 minutes** by default.

### Response Envelope

All responses follow:

```json
{ "success": true, "data": { ... } }          // 200/201
{ "success": false, "error": "message" }      // 4xx/5xx
```

---

## 2. Complete Endpoint List

### Auth  (`/api/v1/auth`)

| Method | Path              | Auth     | Description                  |
|--------|-------------------|----------|------------------------------|
| POST   | `/auth/register`  | Public   | Register new user            |
| POST   | `/auth/login`     | Public   | Login, returns JWT           |
| GET    | `/auth/me`        | Any auth | Get current user profile     |

---

### Destinations  (`/api/v1/destinations`)

| Method | Path                    | Auth   | Description                        |
|--------|-------------------------|--------|------------------------------------|
| GET    | `/destinations`         | Public | Paginated list with filters        |
| GET    | `/destinations/:slug`   | Public | Single destination by slug         |

---

### Tours  (`/api/v1/tours`)

| Method | Path                      | Auth   | Description                     |
|--------|---------------------------|--------|---------------------------------|
| GET    | `/tours`                  | Public | Paginated list with filters     |
| GET    | `/tours/:slug`            | Public | Single tour detail by slug      |
| GET    | `/tours/:id/departures`   | Public | Available departure dates       |

---

### Vehicles  (`/api/v1/vehicles`)

| Method | Path                 | Auth   | Description                     |
|--------|----------------------|--------|---------------------------------|
| GET    | `/vehicles`          | Public | Paginated list with filters     |
| GET    | `/vehicles/:slug`    | Public | Single vehicle detail           |

---

### Accommodations  (`/api/v1/stays`)

| Method | Path             | Auth   | Description                      |
|--------|------------------|--------|----------------------------------|
| GET    | `/stays`         | Public | Paginated list with filters      |
| GET    | `/stays/:slug`   | Public | Single accommodation detail      |

---

### Hosts  (`/api/v1/hosts`)

| Method | Path              | Auth   | Description                |
|--------|-------------------|--------|----------------------------|
| GET    | `/hosts`          | Public | Paginated provider list    |
| GET    | `/hosts/:slug`    | Public | Single provider profile    |

---

### Search  (`/api/v1/search`)

| Method | Path       | Auth   | Description                                   |
|--------|------------|--------|-----------------------------------------------|
| GET    | `/search`  | Public | Cross-resource search (tours/vehicles/stays/destinations) |

---

### Bookings  (`/api/v1/bookings`)

| Method | Path                             | Auth     | Description               |
|--------|----------------------------------|----------|---------------------------|
| POST   | `/bookings`                      | Traveler | Create a booking          |
| GET    | `/bookings/me`                   | Traveler | My bookings list          |
| GET    | `/bookings/:bookingCode`         | Traveler | Get single booking        |
| PATCH  | `/bookings/:bookingCode/cancel`  | Traveler | Cancel a booking          |

---

### Payments  (`/api/v1/payments`)

| Method | Path                           | Auth     | Description                    |
|--------|--------------------------------|----------|--------------------------------|
| GET    | `/payments/my`                 | Traveler | My payment history             |
| POST   | `/payments/initiate/:bookingId`| Traveler | Initiate payment (mock)        |
| POST   | `/payments/:paymentId/confirm` | Traveler | Confirm / capture payment      |
| GET    | `/payments/:paymentId`         | Traveler | View a payment                 |
| POST   | `/payments/:paymentId/refund`  | Traveler | Request refund                 |

---

### Reviews  (`/api/v1/reviews`)

| Method | Path                   | Auth     | Description              |
|--------|------------------------|----------|--------------------------|
| GET    | `/reviews`             | Public   | Paginated reviews list   |
| POST   | `/reviews`             | Traveler | Create a review          |
| PATCH  | `/reviews/:id/reply`   | Provider | Reply to a review        |

---

### Wishlist  (`/api/v1/wishlist`)

| Method | Path               | Auth     | Description             |
|--------|--------------------|----------|-------------------------|
| GET    | `/wishlist`        | Traveler | Get my wishlist         |
| POST   | `/wishlist`        | Traveler | Add item to wishlist    |
| DELETE | `/wishlist/:id`    | Traveler | Remove from wishlist    |

---

### Notifications  (`/api/v1/notifications`)

| Method | Path                      | Auth     | Description              |
|--------|---------------------------|----------|--------------------------|
| GET    | `/notifications`          | Any auth | Get my notifications     |
| POST   | `/notifications/read-all` | Any auth | Mark all as read         |
| PATCH  | `/notifications/:id/read` | Any auth | Mark one as read         |

---

### Messaging  (`/api/v1/conversations`)

| Method | Path                              | Auth     | Description                  |
|--------|-----------------------------------|----------|------------------------------|
| GET    | `/conversations`                  | Any auth | List my conversations        |
| POST   | `/conversations`                  | Any auth | Start a new conversation     |
| GET    | `/conversations/:id/messages`     | Any auth | Get messages in conversation |
| POST   | `/conversations/:id/messages`     | Any auth | Send a message               |
| POST   | `/conversations/:id/read`         | Any auth | Mark conversation as read    |

---

### Provider Dashboard  (`/api/v1/provider`)

| Method | Path                                         | Auth     | Description                  |
|--------|----------------------------------------------|----------|------------------------------|
| GET    | `/provider/profile`                          | Provider | Get own provider profile     |
| PUT    | `/provider/profile`                          | Provider | Update provider profile      |
| GET    | `/provider/bookings`                         | Provider | List bookings for my listings|
| PATCH  | `/provider/bookings/:bookingCode/confirm`    | Provider | Confirm a booking            |
| PATCH  | `/provider/bookings/:bookingCode/complete`   | Provider | Mark booking as completed    |
| PATCH  | `/provider/bookings/:bookingCode/cancel`     | Provider | Cancel a booking             |
| GET    | `/provider/analytics`                        | Provider | Revenue & booking analytics  |

---

### Traveler Account  (`/api/v1/account`)

| Method | Path                        | Auth     | Description               |
|--------|-----------------------------|----------|---------------------------|
| GET    | `/account`                  | Traveler | Get my profile            |
| PUT    | `/account`                  | Traveler | Update profile            |
| POST   | `/account/change-password`  | Traveler | Change password           |
| POST   | `/account/change-email`     | Traveler | Change email              |
| POST   | `/account/deactivate`       | Traveler | Deactivate account        |

---

### Admin  (`/api/v1/admin`)

| Method | Path                                     | Auth  | Description                   |
|--------|------------------------------------------|-------|-------------------------------|
| GET    | `/admin/analytics`                       | Admin | Platform-wide analytics       |
| GET    | `/admin/users`                           | Admin | Paginated user list           |
| GET    | `/admin/users/:userId`                   | Admin | Get single user               |
| PATCH  | `/admin/users/:userId/role`              | Admin | Change user role              |
| GET    | `/admin/providers`                       | Admin | Paginated provider list       |
| GET    | `/admin/providers/:providerId`           | Admin | Get single provider           |
| PATCH  | `/admin/providers/:providerId/status`    | Admin | Approve / suspend provider    |

---

## 3. Endpoint Documentation

### POST `/auth/register`

**Description:** Register a new traveler account.

**Body:**
```json
{
  "email": "traveler@example.com",
  "password": "SecurePass123!",
  "firstName": "Bat",
  "lastName": "Erdene"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "clx...", "email": "traveler@example.com", "role": "traveler" },
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### POST `/auth/login`

**Body:**
```json
{ "email": "traveler@example.com", "password": "SecurePass123!" }
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "user": { "id": "clx...", "email": "traveler@example.com", "role": "traveler" },
    "accessToken": "eyJ..."
  }
}
```

---

### GET `/tours`

**Query Parameters:**

| Param          | Type    | Description                               |
|----------------|---------|-------------------------------------------|
| `q`            | string  | Keyword search in title/description       |
| `destinationId`| string  | Filter by destination ID                  |
| `minPrice`     | number  | Minimum base price                        |
| `maxPrice`     | number  | Maximum base price                        |
| `difficulty`   | string  | `easy` \| `moderate` \| `hard`            |
| `minDays`      | number  | Minimum duration days                     |
| `maxDays`      | number  | Maximum duration days                     |
| `sortBy`       | string  | `price_asc` \| `price_desc` \| `rating` \| `newest` |
| `page`         | number  | Page number (default: 1)                  |
| `limit`        | number  | Per page (default: 12, max: 50)           |

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "data": [
      {
        "id": "clx...",
        "slug": "gobi-discovery-8d",
        "title": "Gobi Discovery 8 Days",
        "basePrice": 890,
        "currency": "USD",
        "durationDays": 8,
        "ratingAverage": 4.8,
        "reviewsCount": 24,
        "images": [{ "imageUrl": "https://..." }],
        "destination": { "name": "Gobi Desert", "country": "Mongolia" }
      }
    ],
    "pagination": { "page": 1, "limit": 12, "total": 48, "pages": 4 }
  }
}
```

---

### GET `/tours/:slug`

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "slug": "gobi-discovery-8d",
    "title": "Gobi Discovery 8 Days",
    "description": "...",
    "basePrice": 890,
    "durationDays": 8,
    "difficulty": "moderate",
    "maxGuests": 12,
    "includes": ["...", "..."],
    "excludes": ["...", "..."],
    "images": [{ "imageUrl": "https://..." }],
    "departures": [
      { "id": "dep1", "departureDate": "2026-06-15", "availableSpots": 8, "price": 890 }
    ],
    "provider": { "id": "p1", "name": "Nomad Expeditions", "slug": "nomad-expeditions" }
  }
}
```

---

### GET `/search`

**Query Parameters:**

| Param         | Type    | Description                                              |
|---------------|---------|----------------------------------------------------------|
| `q`           | string  | Full-text keyword search                                 |
| `type`        | string  | `tour` \| `vehicle` \| `accommodation` \| `destination` |
| `destination` | string  | Filter by destination name/country/region                |
| `minPrice`    | number  | Minimum price                                            |
| `maxPrice`    | number  | Maximum price                                            |
| `minRating`   | number  | Minimum rating (0–5)                                     |
| `sortBy`      | string  | `price_asc` \| `price_desc` \| `rating` \| `newest`     |
| `page`        | number  | Page number                                              |
| `limit`       | number  | Per page (max: 50)                                       |

When `type` is omitted, returns all four buckets in parallel.

**Response `200` (all types):**
```json
{
  "success": true,
  "data": {
    "tours":          { "data": [...], "pagination": {...} },
    "vehicles":       { "data": [...], "pagination": {...} },
    "accommodations": { "data": [...], "pagination": {...} },
    "destinations":   { "data": [...], "pagination": {...} }
  }
}
```

---

### POST `/bookings`

**Auth:** Traveler / Provider / Admin

**Body:**
```json
{
  "listingType": "tour",
  "listingId": "clx_tour_id",
  "tourDepartureId": "clx_departure_id",
  "guests": 2,
  "adults": 2,
  "children": 0,
  "startDate": "2026-06-15",
  "travelerFullName": "Bat Erdene",
  "travelerEmail": "bat@example.com",
  "travelerPhone": "+976 99001234",
  "travelerCountry": "Mongolia",
  "specialRequests": "Vegetarian meals"
}
```

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "clx...",
    "bookingCode": "WM-83421",
    "bookingStatus": "pending",
    "paymentStatus": "unpaid",
    "subtotal": 1780,
    "serviceFee": 89,
    "totalAmount": 1869,
    "currency": "USD"
  }
}
```

---

### POST `/payments/initiate/:bookingId`

**Auth:** Traveler (booking owner)

**Response `201`:**
```json
{
  "success": true,
  "data": {
    "id": "pay_clx...",
    "bookingId": "clx...",
    "amount": 1869,
    "currency": "USD",
    "status": "authorized",
    "paymentReference": "MOCK-1710000000000"
  }
}
```

---

### POST `/payments/:paymentId/confirm`

**Auth:** Traveler (payment owner)

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "pay_clx...",
    "status": "paid",
    "paidAt": "2026-03-12T10:15:00.000Z"
  }
}
```

---

### POST `/payments/:paymentId/refund`

**Body:**
```json
{
  "reason": "Trip cancelled due to weather",
  "amount": 1869
}
```

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "id": "pay_clx...",
    "status": "refunded",
    "refundAmount": 1869,
    "refundReason": "Trip cancelled due to weather"
  }
}
```

---

### POST `/conversations`

**Body:**
```json
{
  "participantId": "clx_provider_user_id",
  "listingType": "tour",
  "listingId": "clx_tour_id",
  "message": "Hi, is the Gobi tour available in July?"
}
```

---

### POST `/conversations/:id/messages`

**Body:**
```json
{ "content": "Yes, we have spots available in July!" }
```

---

### POST `/reviews`

**Body:**
```json
{
  "listingType": "tour",
  "listingId": "clx_tour_id",
  "bookingId": "clx_booking_id",
  "rating": 5,
  "title": "Incredible experience",
  "body": "The Gobi tour exceeded all expectations..."
}
```

---

### POST `/wishlist`

**Body:**
```json
{
  "listingType": "tour",
  "listingId": "clx_tour_id"
}
```

---

### GET `/provider/analytics`

**Auth:** Provider

**Response `200`:**
```json
{
  "success": true,
  "data": {
    "totalRevenue": 48500,
    "totalBookings": 62,
    "confirmedBookings": 55,
    "cancelledBookings": 7,
    "averageRating": 4.7,
    "monthlyRevenue": [
      { "month": "2026-01", "revenue": 8200 },
      { "month": "2026-02", "revenue": 9100 }
    ]
  }
}
```

---

### PATCH `/admin/providers/:providerId/status`

**Body:**
```json
{ "status": "active" }
```

Valid values: `pending_review` | `active` | `suspended`

---

## 4. API Flow Diagrams

### Traveler Booking Flow

```
[1] POST /auth/register          → get accessToken
        ↓
[2] GET /search?q=Gobi&type=tour → browse results
        ↓
[3] GET /tours/:slug             → view tour detail + departures
        ↓
[4] POST /bookings               → create booking (status: pending)
        ↓
[5] POST /payments/initiate/:id  → authorize payment (status: authorized)
        ↓
[6] POST /payments/:id/confirm   → capture payment
        │                          → booking.bookingStatus = confirmed
        │                          → booking.paymentStatus = paid
        ↓
[7] GET /bookings/:bookingCode   → view confirmed booking
        ↓
[8] POST /reviews                → after trip, leave review
```

---

### Provider Booking Management Flow

```
[1] POST /auth/login (provider_owner)   → get accessToken
        ↓
[2] GET /provider/bookings              → see pending bookings
        ↓
[3] PATCH /provider/bookings/:code/confirm   → confirm booking
        ↓
[4] PATCH /provider/bookings/:code/complete  → mark completed
        ↓
[5] PATCH /reviews/:id/reply            → reply to traveler review
        ↓
[6] GET /provider/analytics             → revenue dashboard
```

---

### Messaging Flow

```
[1] POST /conversations                 → start conversation
        │  { participantId, message }
        ↓
[2] GET /conversations                  → list all conversations
        ↓
[3] GET /conversations/:id/messages     → load message history
        ↓
[4] POST /conversations/:id/messages    → send new message
        ↓
[5] POST /conversations/:id/read        → mark all messages read
```

---

### Review Flow

```
[1] Trip completed → booking.bookingStatus = "completed"
        ↓
[2] POST /reviews
        │  { listingType, listingId, bookingId, rating, title, body }
        ↓
[3] Review visible on GET /reviews?listingId=xxx
        ↓
[4] Provider replies via PATCH /reviews/:id/reply
```

---

### Payment State Machine

```
unpaid
  → [initiate] → authorized
      → [confirm] → paid
          → [refund] → refunded
  → [failed] → failed  (gateway error, not yet implemented)
```

---

## 5. Testing Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- npm

### Setup

```bash
# 1. Install dependencies
cd backend
npm install

# 2. Copy env file
cp .env.example .env
# Edit .env with your DATABASE_URL and JWT secrets

# 3. Run migrations
npx prisma migrate dev --name init

# 4. Generate Prisma client
npx prisma generate

# 5. Seed initial data
npx ts-node prisma/seed.ts

# 6. Start dev server
npm run dev
# → Server running on http://localhost:4000
```

### Environment Variables

| Variable              | Required | Description                            |
|-----------------------|----------|----------------------------------------|
| `DATABASE_URL`        | ✅        | PostgreSQL connection string           |
| `JWT_ACCESS_SECRET`   | ✅        | Min 32 chars, used to sign access JWTs |
| `JWT_REFRESH_SECRET`  | ✅        | Min 32 chars, used to sign refresh JWTs|
| `JWT_ACCESS_EXPIRES_IN` | ✅      | e.g. `15m`                            |
| `JWT_REFRESH_EXPIRES_IN`| ✅      | e.g. `7d`                             |
| `PORT`                | ✅        | Default `4000`                        |
| `API_PREFIX`          | ✅        | Default `/api/v1`                     |
| `CORS_ORIGIN`         | ✅        | Frontend URL e.g. `http://localhost:3000` |
| `BCRYPT_ROUNDS`       | Optional | Default `10`                          |
| `PLATFORM_FEE_PERCENT`| Optional | Default `5` (5%)                      |
| `CLOUDINARY_*`        | Optional | For image upload (not yet wired)       |

---

## 6. curl / Postman Examples

> Replace `TOKEN` with the `accessToken` from login.

### Register

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "traveler@wemongolia.com",
    "password": "Mongolia2026!",
    "firstName": "Bat",
    "lastName": "Erdene"
  }'
```

### Login

```bash
curl -X POST http://localhost:4000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"traveler@wemongolia.com","password":"Mongolia2026!"}'
```

### List Tours

```bash
curl "http://localhost:4000/api/v1/tours?q=gobi&sortBy=rating&limit=5"
```

### Get Tour Detail

```bash
curl "http://localhost:4000/api/v1/tours/gobi-discovery-8d"
```

### Search (all types)

```bash
curl "http://localhost:4000/api/v1/search?q=Gobi&minRating=4"
```

### Create Booking

```bash
curl -X POST http://localhost:4000/api/v1/bookings \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listingType": "tour",
    "listingId": "TOUR_ID",
    "tourDepartureId": "DEPARTURE_ID",
    "guests": 2,
    "adults": 2,
    "children": 0,
    "startDate": "2026-06-15",
    "travelerFullName": "Bat Erdene",
    "travelerEmail": "bat@example.com",
    "travelerPhone": "+976 99001234",
    "travelerCountry": "Mongolia"
  }'
```

### Initiate Payment

```bash
curl -X POST http://localhost:4000/api/v1/payments/initiate/BOOKING_ID \
  -H "Authorization: Bearer TOKEN"
```

### Confirm Payment

```bash
curl -X POST http://localhost:4000/api/v1/payments/PAYMENT_ID/confirm \
  -H "Authorization: Bearer TOKEN"
```

### Start Conversation

```bash
curl -X POST http://localhost:4000/api/v1/conversations \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "participantId": "PROVIDER_USER_ID",
    "listingType": "tour",
    "listingId": "TOUR_ID",
    "message": "Is the Gobi tour available in July?"
  }'
```

### Leave Review

```bash
curl -X POST http://localhost:4000/api/v1/reviews \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "listingType": "tour",
    "listingId": "TOUR_ID",
    "bookingId": "BOOKING_ID",
    "rating": 5,
    "title": "Incredible experience",
    "body": "The Gobi tour was absolutely breathtaking!"
  }'
```

### Provider — Confirm Booking

```bash
curl -X PATCH http://localhost:4000/api/v1/provider/bookings/WM-83421/confirm \
  -H "Authorization: Bearer PROVIDER_TOKEN"
```

### Admin — Approve Provider

```bash
curl -X PATCH http://localhost:4000/api/v1/admin/providers/PROVIDER_ID/status \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"status":"active"}'
```

---

## 7. Architecture Verification

### ✅ Implemented (matches BACKEND_ARCHITECTURE.md)

| Part | Module                  | Status |
|------|-------------------------|--------|
| 1    | Auth                    | ✅ Complete |
| 2    | Destinations            | ✅ Complete |
| 2    | Tours                   | ✅ Complete |
| 2    | Vehicles                | ✅ Complete |
| 2    | Accommodations / Stays  | ✅ Complete |
| 3    | Hosts (provider profiles)| ✅ Complete |
| 3    | Bookings                | ✅ Complete |
| 4    | Reviews                 | ✅ Complete |
| 4    | Wishlist                | ✅ Complete |
| 4    | Notifications           | ✅ Complete |
| 5    | Messaging               | ✅ Complete |
| 6    | Provider Dashboard      | ✅ Complete |
| 7    | Traveler Account        | ✅ Complete |
| 8    | Admin                   | ✅ Complete |
| 9    | Search                  | ✅ Complete |
| 10   | Payments (mock)         | ✅ Complete |

### ⚠️ Gaps / Deviations

| Area | Gap | Recommendation |
|------|-----|----------------|
| Auth | No refresh token endpoint (`POST /auth/refresh`) | Add refresh token rotation |
| Auth | No logout / token revocation | Add token blacklist or short TTL |
| Payments | Mock gateway only (`paymentGateway: "mock"`) | Wire Stripe or PayPal |
| Listings | Tour/Vehicle/Accommodation CRUD not exposed to providers via API | Add `POST/PUT/DELETE /provider/tours` etc. |
| Images | Cloudinary env vars exist but upload not wired | Add `POST /provider/upload` |
| Availability | Vehicle availability and tour departure creation not exposed | Add departure management endpoints |
| Notifications | Created manually; no real push / email | Wire email (Resend/SendGrid) |
| Admin | No listing management (approve, feature) | Add `PATCH /admin/listings/:id` |

---

## 8. Suggested Improvements

### Performance

| Improvement | Detail |
|-------------|--------|
| **Database indexes** | Already added via `@@index` in schema. Add composite indexes for common query combos (e.g. `status + createdAt`). |
| **Response caching** | Cache `GET /destinations`, `GET /tours` with Redis (TTL 5 min). |
| **Search indexing** | Replace Prisma `contains` search with PostgreSQL `tsvector` full-text search or Meilisearch. |
| **Pagination cursor** | Switch from offset to cursor-based pagination for large datasets. |
| **N+1 queries** | Already mitigated with Prisma `include/select`. Audit with `DEBUG=prisma:query`. |

### Security

| Improvement | Detail |
|-------------|--------|
| **Refresh tokens** | Issue opaque refresh tokens stored in HttpOnly cookies. |
| **Rate limiting** | Already implemented (300/15min global, 20/15min auth). Add per-user limits. |
| **Input sanitization** | Zod handles schema validation. Add `express-validator` for XSS on free-text fields. |
| **Helmet** | Already enabled. Add CSP headers for API. |
| **Audit logging** | Log sensitive operations (role changes, payments, cancellations) to a separate audit table. |
| **Stripe webhooks** | Verify `Stripe-Signature` header before processing payment events. |

### Scalability

| Improvement | Detail |
|-------------|--------|
| **API versioning** | Already namespaced as `/api/v1`. Plan `/api/v2` before breaking changes. |
| **Background jobs** | Use Bull/BullMQ for: email notifications, payment reconciliation, review aggregation. |
| **WebSockets** | Replace polling for notifications/messages with Socket.io on a dedicated server. |
| **Horizontal scaling** | Move session/cache state to Redis. Use PM2 cluster mode or deploy on Railway/Render. |
| **File uploads** | Offload directly to Cloudinary signed upload URLs (no file data through backend). |
| **Logging** | Replace morgan with Winston + Datadog/LogDNA for production. |
| **Health checks** | Extend `/health` to ping DB and return degraded status. |
| **OpenAPI spec** | Generate Swagger/OpenAPI 3.0 from Zod schemas using `zod-to-openapi`. |
