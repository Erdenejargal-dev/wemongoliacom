# WeMongolia — Full Authentication Architecture Audit

**Date:** 2026-03-13  
**Method:** Direct source-file analysis of every auth-related file. No assumptions.

---

## Part 1 — All Auth Paths

### File Inventory

| File | Purpose | Database |
|------|---------|----------|
| `lib/auth.ts` | NextAuth config — `authorize()`, JWT/session callbacks | PostgreSQL (primary) + MongoDB (fallback) |
| `lib/mongodb.ts` | Mongoose connection to MongoDB Atlas `wemongolia` | MongoDB Atlas |
| `lib/models/User.ts` | Mongoose User schema | MongoDB Atlas |
| `app/api/auth/register/route.ts` | Legacy Next.js registration endpoint | MongoDB Atlas |
| `components/login-form.tsx` | Login UI — calls `signIn("credentials", ...)` | — |
| `components/register-form.tsx` | Register UI — calls `POST /api/auth/register` | — |
| `middleware.ts` | Route protection — **currently does nothing** | — |
| `types/next-auth.d.ts` | Augments `Session.user` with `id, role, avatar, accessToken` | — |
| `backend/src/routes/auth.routes.ts` | Express auth routes (register, login, me) | PostgreSQL |
| `backend/src/controllers/auth.controller.ts` | Express auth handlers | PostgreSQL |
| `backend/src/services/auth.service.ts` | register / login / getMe business logic | PostgreSQL (Prisma) |
| `backend/src/middleware/auth.ts` | Bearer JWT verification (`authenticate`, `optionalAuth`) | PostgreSQL (Prisma) |
| `backend/src/middleware/role.ts` | Role-based access (`requireRole`, `attachProvider`) | PostgreSQL (Prisma) |
| `backend/src/utils/jwt.ts` | sign/verify JWT (`JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`) | — |
| `backend/src/lib/prisma.ts` | PrismaClient singleton | PostgreSQL |
| `backend/prisma/schema.prisma` | Full PostgreSQL schema | PostgreSQL |

---

### Auth Path A — Registration via Register Form (MongoDB)

- **Trigger:** User submits `components/register-form.tsx`
- **Calls:** `POST /api/auth/register` (Next.js API route)
- **File:** `app/api/auth/register/route.ts`
- **Database:** MongoDB Atlas, collection `wemongolia/users`
- **Schema written:** `{ name, email, password (bcrypt, 12 rounds), phone?, role: 'customer' }`
- **Produces backend JWT:** ❌ NO
- **After success:** Redirects to `/auth/login?registered=true` — user is NOT logged in
- **Password validation:** minimum 6 characters
- **Email check:** regex `/^\S+@\S+\.\S+$/`

---

### Auth Path B — Login via Express Backend (PostgreSQL)

- **Trigger:** `components/login-form.tsx` → `signIn("credentials", { email, password, redirect: false })`
- **Calls:** NextAuth `authorize()` → `fetch POST http://localhost:4000/api/v1/auth/login`
- **File:** `lib/auth.ts` → Express `backend/src/services/auth.service.ts`
- **Database:** PostgreSQL via Prisma
- **Schema read:** `{ id (cuid), firstName, lastName, email, passwordHash (bcrypt), role: traveler|provider_owner|admin, avatarUrl }`
- **JWT signed:** `jwt.sign({ userId, role }, JWT_ACCESS_SECRET, { expiresIn: JWT_ACCESS_EXPIRES_IN })`
- **JWT expiry:** `15m` (from `backend/.env.example`)
- **Produces backend JWT:** ✅ YES — `accessToken` + `refreshToken`
- **Session result:** `session.user = { id, email, name, role, avatar, accessToken: "<15min JWT>" }`
- **Name construction:** `[user.firstName, user.lastName].filter(Boolean).join(" ")`

---

### Auth Path C — Login via MongoDB Fallback

- **Trigger:** `lib/auth.ts` `authorize()` when `fetch` throws `TypeError` or `ECONNREFUSED`
- **Calls:** `mongoFallback(email, password)` inside `lib/auth.ts`
- **Database:** MongoDB Atlas via Mongoose
- **Schema read:** `{ name, email, password (bcrypt), role: customer|business_owner|admin, avatar }`
- **Password check:** `bcrypt.compare(password, user.password)`
- **Produces backend JWT:** ❌ NO — `accessToken: undefined`
- **Session result:** `session.user = { id, email, name, role, avatar, accessToken: undefined }`
- **Trigger condition:** Only fires when the Express backend is unreachable (network error)

---

### Auth Path D — Backend JWT Verification (Express Middleware)

- **Trigger:** Any request to Express API with `Authorization: Bearer <token>`
- **File:** `backend/src/middleware/auth.ts` → `authenticate()`
- **Process:** `verifyAccessToken(token)` → `jwt.verify(token, JWT_ACCESS_SECRET)`
- **Attaches to request:** `req.user = { userId: string, role: UserRole }`
- **Optional variant:** `optionalAuth()` — attaches user if token present, continues regardless
- **Role check:** `requireRole(...roles)` checks `req.user.role` against `UserRole` Prisma enum

---

### Auth Path E — Next.js Middleware (Route Protection)

- **File:** `middleware.ts`
- **Current state:** `return NextResponse.next()` — **allows ALL requests through unconditionally**
- **Matcher:** `/dashboard/:path*`, `/auth/:path*`
- **Risk:** Dashboard routes have zero server-side protection

---

## Part 2 — Login Flow Traces

### Scenario 1: Express Backend is Running

```
User fills login-form.tsx (email + password)
          │
          ▼
signIn("credentials", { email, password, redirect: false })
          │
          ▼
NextAuth authorize() in lib/auth.ts
          │
          ▼
fetch POST http://localhost:4000/api/v1/auth/login
{ "email": "...", "password": "..." }
          │
          ▼
Express: validate → auth.service.login()
  → prisma.user.findUnique({ where: { email } })
  → verifyPassword(password, user.passwordHash)  [bcrypt]
  → signAccessToken({ userId: user.id, role: user.role })
          │
          ▼
Express returns HTTP 200:
{ success: true, data: { user: { id, firstName, lastName, email, role, avatarUrl },
                          accessToken, refreshToken } }
          │
          ▼
authorize() returns:
{ id, email, name: "John Doe", role: "traveler", avatar, accessToken }
          │
          ▼
NextAuth JWT callback stores:
{ id, role, avatar, accessToken }
          │
          ▼
session.user = { id, email, name, role, avatar, accessToken: "<valid 15min JWT>" }
          │
          ▼
LoginForm: result.error = null → router.push("/dashboard")
          │
          ▼
✅ Fully authenticated. All Express API calls work.
```

---

### Scenario 2: Express Backend is Offline

```
User fills login-form.tsx (email + password)
          │
          ▼
signIn("credentials", { email, password, redirect: false })
          │
          ▼
NextAuth authorize() in lib/auth.ts
          │
          ▼
fetch POST http://localhost:4000/api/v1/auth/login
          │
          ▼
⚠️ TypeError: fetch failed (ECONNREFUSED)
          │
          ▼
caught: backendUnreachable = true
console.warn("[auth] Express backend unreachable — falling back to MongoDB.")
          │
          ▼
mongoFallback(email, password)
  → import "@/lib/mongodb" → connect MongoDB Atlas
  → User.findOne({ email })
  → bcrypt.compare(password, user.password)
          │
     ┌────┴────┐
     │         │
  Found     Not found
     │         │
     ▼         ▼
Returns:   throws "Invalid email or password."
{ id, email, name, role,    │
  avatar,                   ▼
  accessToken: undefined } LoginForm: result.error → "Invalid email or password"
     │
     ▼
session.user = { id, email, name, role, avatar, accessToken: undefined }
     │
     ▼
LoginForm: result.error = null → router.push("/dashboard")
     │
     ▼
⚠️ Appears logged in. Dashboard renders.
   BUT: session.user.accessToken = undefined
   ALL Express API calls silently fail or return empty data.
```

---

### Scenario 3: Wrong Credentials

```
Express is running:
  → Express returns 401: { success: false, error: "Invalid email or password." }
  → authorize() throws new Error("Invalid email or password.")
  → NextAuth catches it, wraps as CallbackRouteError in server logs
  → Client: result.error = "CredentialsSignin"
  → LoginForm: setError("Invalid email or password") ✅

Express is offline:
  → mongoFallback() → User not found
  → mongoFallback() throws "Invalid email or password."
  → NextAuth wraps as CallbackRouteError
  → Client: result.error = "CredentialsSignin"
  → LoginForm: setError("Invalid email or password") ✅
```

---

### Scenario 4: MongoDB Login Succeeds, No accessToken

```
session.user.accessToken = undefined
          │
          ▼
lib/api/client.ts apiClient.get(url, undefined):
  headers: { Authorization: undefined }  ← no header sent
          │
          ▼
Express: authenticate() middleware
  → "Authorization" header missing
  → throws AppError("Authentication required.", 401)
          │
          ▼
lib/api/* catch block → return [] or null
          │
          ▼
UI effects:
  - /dashboard/business/bookings → "Sign in as a provider" notice (empty)
  - /checkout → falls back to localStorage-only booking (no backend confirmation)
  - /provider/analytics → fetchProviderAnalytics returns null
  - /bookings/me → fetchMyBookings returns []
  - /account/trips → still showing mock data (not yet wired)
```

---

## Part 3 — Problems Caused by Dual Auth

### Problem 1: Registration creates MongoDB users; login tries PostgreSQL first

The **entire registration flow writes to MongoDB** (`app/api/auth/register/route.ts`).  
The Express backend has `POST /api/v1/auth/register` pointing to PostgreSQL, but **no UI calls it**.

Result:
- User registers → written to MongoDB with `{ name: "John Doe", role: "customer" }`
- User logs in → `authorize()` tries Express backend (`POST /api/v1/auth/login`) → user not in PostgreSQL → **401 "Invalid email or password"**
- Fallback to MongoDB → finds user → login "succeeds" → `accessToken = undefined`
- User is stuck in "half-authenticated" state forever

---

### Problem 2: Role mismatch between databases

| MongoDB roles | PostgreSQL roles | Equivalent |
|---------------|-----------------|------------|
| `customer` | `traveler` | same concept |
| `business_owner` | `provider_owner` | same concept |
| `admin` | `admin` | ✅ matches |

`backend/src/middleware/role.ts` uses `UserRole` from `@prisma/client`:
```typescript
requireRole('traveler', 'provider_owner', 'admin')
```

A MongoDB user with `role: "customer"` who somehow gets an accessToken would be **rejected** by the backend's `requireRole('traveler')` guard. The role string doesn't match.

---

### Problem 3: Sessions without backend JWT — features that break

When `session.user.accessToken` is `undefined`, these features are completely non-functional:

| Feature | Endpoint | Failure mode |
|---------|---------|-------------|
| Create booking | `POST /bookings` | 401 → silently falls back to localStorage |
| My bookings / trips | `GET /bookings/me` | 401 → returns `[]` |
| Cancel booking | `PATCH /bookings/:code/cancel` | 401 |
| Provider booking list | `GET /provider/bookings` | 401 → empty state |
| Provider confirm booking | `PATCH /provider/bookings/:code/confirm` | 401 |
| Provider complete booking | `PATCH /provider/bookings/:code/complete` | 401 |
| Provider cancel booking | `PATCH /provider/bookings/:code/cancel` | 401 |
| Provider analytics | `GET /provider/analytics` | 401 → null |
| Auth/Me | `GET /auth/me` | 401 |
| Account profile update | (any account PUT) | 401 |

**Conclusion:** MongoDB-authenticated sessions can browse the site but cannot perform any transactional action.

---

### Problem 4: Token expiry not handled

- Backend access tokens expire in **15 minutes** (`JWT_ACCESS_EXPIRES_IN=15m`)
- NextAuth session maxAge is **30 days**
- After 15 minutes, all Express API calls return 401
- There is **no token refresh mechanism in the frontend**
- `refreshToken` is returned by the backend but never stored or used
- Result: After 15 minutes of inactivity, authenticated users silently lose all backend access

---

### Problem 5: Middleware does nothing

`middleware.ts`:
```typescript
export function middleware(request: NextRequest) {
  return NextResponse.next();  // ← always passes through
}
```

Dashboard routes at `/dashboard/*` are **completely unprotected at the edge**. Any unauthenticated user can navigate to `/dashboard/business/bookings` directly. The only protection is at the page-component level (if any).

---

### Problem 6: No auto-login after registration

`components/register-form.tsx` after successful registration:
```typescript
router.push("/auth/login?registered=true");
```

User must manually log in after registering. More importantly, since the registration goes to MongoDB and login tries PostgreSQL first, the user will always hit the MongoDB fallback path — meaning they **can never get an `accessToken`** through the normal UI flow.

---

### Problem 7: Backend JWT secret not in frontend .env.local

`backend/src/utils/jwt.ts` uses `env.JWT_ACCESS_SECRET`.  
`backend/.env.example` defines `JWT_ACCESS_SECRET`.  
The frontend `.env.local` does **not** have `JWT_ACCESS_SECRET`.  
The frontend cannot verify or decode backend JWTs independently (correct behavior, but means there's no way to detect expiry client-side without an API call).

---

## Part 4 — Where MongoDB Auth is Still Used

### 1. Registration form → `app/api/auth/register/route.ts`
- **Used by:** `components/register-form.tsx` (`POST /api/auth/register`)
- **What it does:** Creates user in MongoDB with `{ name, email, password (bcrypt), role: 'customer' }`
- **Action:** **MIGRATE** to Express `POST /api/v1/auth/register` (PostgreSQL)
- **Field mapping needed:** `name` → `firstName + lastName`, `role: 'customer'` → `role: 'traveler'`
- **After migration:** Delete `app/api/auth/register/route.ts`

### 2. Login fallback → `lib/auth.ts` `mongoFallback()`
- **Used by:** `authorize()` when Express is unreachable
- **What it does:** Authenticates against MongoDB, returns session without `accessToken`
- **Action:** **KEEP TEMPORARILY** during migration. **REMOVE** once all users are in PostgreSQL and the backend is always running.

### 3. Mongoose User model → `lib/models/User.ts`
- **Used by:** `app/api/auth/register/route.ts` + `lib/auth.ts` `mongoFallback()`
- **Action:** **REMOVE** after both usages are migrated

### 4. MongoDB connection → `lib/mongodb.ts`
- **Used by:** `app/api/auth/register/route.ts` + `lib/auth.ts` `mongoFallback()`
- **Action:** **REMOVE** after all MongoDB routes are migrated

### 5. Other Next.js API routes using MongoDB models
These exist at `app/api/business/`, `app/api/cars/`, `app/api/hotels/`, `app/api/tours/`, `app/api/content/`, `app/api/destinations/` — each likely uses its own Mongoose model.
- **Action:** **AUDIT EACH** — if the Express backend has an equivalent route, proxy or remove; otherwise migrate.

---

## Part 5 — Safe Migration Plan

### Phase 1: Audit & Add Logging (Zero code risk)
**Goal:** Understand usage without breaking anything.

1. Add `console.log("[auth-path]", backendUnreachable ? "mongodb" : "postgres")` to `lib/auth.ts` `authorize()` to log which path is used in production
2. Add `console.log("[register]", "mongodb")` to `app/api/auth/register/route.ts`
3. Monitor for 1–2 weeks to understand real user distribution
4. **Expected finding:** 100% of users are in MongoDB (since registration has never written to PostgreSQL)

---

### Phase 2: Fix Registration to Write to PostgreSQL
**Goal:** All new users go to PostgreSQL. Old users still work via MongoDB fallback.

**Files to change:**
- `components/register-form.tsx` — change `fetch` target
- Keep `app/api/auth/register/route.ts` as secondary fallback temporarily

**Changes:**

```typescript
// components/register-form.tsx — new submit handler
const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    firstName: formData.name.split(" ")[0] ?? formData.name,
    lastName:  formData.name.split(" ").slice(1).join(" ") || " ",
    email:     formData.email,
    password:  formData.password,
    role:      "traveler",
  }),
})
```

After successful registration, **auto-login**:
```typescript
await signIn("credentials", { email: formData.email, password: formData.password, redirect: false })
router.push("/dashboard")
```

**Validation:** Backend requires `password.length >= 8` (vs MongoDB's `>= 6`). Update form validation.

---

### Phase 3: Add Middleware Protection
**Goal:** Protect dashboard routes at the edge.

**File:** `middleware.ts`

```typescript
import { auth } from "@/lib/auth"

export default auth((req) => {
  const isLoggedIn = !!req.auth
  const isDashboard = req.nextUrl.pathname.startsWith("/dashboard")
  if (isDashboard && !isLoggedIn) {
    return Response.redirect(new URL("/auth/login", req.nextUrl))
  }
  return NextResponse.next()
})
```

---

### Phase 4: Handle Token Expiry
**Goal:** Prevent silent 401s after 15 minutes.

Two options:

**Option A (simple):** Increase `JWT_ACCESS_EXPIRES_IN` to `7d` in the backend `.env`. Matches the `JWT_REFRESH_EXPIRES_IN`. Reduces friction without code changes.

**Option B (proper):** Implement token refresh in `lib/auth.ts` JWT callback:
```typescript
async jwt({ token, user }) {
  if (user) { /* initial login — store accessToken and expiry */ }
  if (token.accessTokenExpires && Date.now() > token.accessTokenExpires) {
    // call POST /auth/refresh with refreshToken
  }
  return token
}
```

---

### Phase 5: Migrate Existing MongoDB Users to PostgreSQL
**Goal:** All existing users exist in PostgreSQL.

Write a one-time migration script:

```typescript
// scripts/migrate-users.ts
import dbConnect from "../lib/mongodb"
import User from "../lib/models/User"
import { prisma } from "../backend/src/lib/prisma"

await dbConnect()
const mongoUsers = await User.find({})

for (const u of mongoUsers) {
  const existing = await prisma.user.findUnique({ where: { email: u.email } })
  if (existing) continue  // already migrated

  await prisma.user.create({
    data: {
      firstName:    u.name.split(" ")[0] ?? u.name,
      lastName:     u.name.split(" ").slice(1).join(" ") || "-",
      email:        u.email,
      passwordHash: u.password,  // bcrypt hash is compatible
      role:         u.role === "business_owner" ? "provider_owner"
                  : u.role === "customer"       ? "traveler"
                  : "admin",
    },
  })
}
```

**Risk:** `bcryptjs` hashes are compatible with `bcrypt` library used by the backend (same algorithm). ✅

---

### Phase 6: Remove MongoDB Fallback
**Goal:** All logins go through PostgreSQL only.

1. In `lib/auth.ts`, remove the `mongoFallback()` function and the `backendUnreachable` logic
2. Replace with a clean error when backend is down:
   ```typescript
   } catch (err: any) {
     if (err?.message?.includes("fetch failed") || err instanceof TypeError) {
       throw new Error("Service temporarily unavailable. Please try again later.")
     }
     throw err
   }
   ```
3. This makes the backend a hard requirement — acceptable only after Phase 3 (production deployment)

---

### Phase 7: Delete Legacy MongoDB Routes and Models
**Goal:** No MongoDB code remains.

1. Delete `app/api/auth/register/route.ts`
2. Audit and delete or proxy: `app/api/business/`, `app/api/cars/`, `app/api/hotels/`, `app/api/tours/`, `app/api/content/`, `app/api/destinations/`
3. Delete `lib/models/` directory (all Mongoose models)
4. Delete `lib/mongodb.ts`
5. Remove from `package.json`: `mongoose`, `bcryptjs` (bcrypt already in backend)
6. Remove from `.env.local`: `MONGODB_URI`

---

## Part 6 — Current Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        NEXT.JS FRONTEND                                  │
│                                                                           │
│  components/register-form.tsx ──── POST /api/auth/register               │
│                                              │                            │
│                                              ▼                            │
│                              app/api/auth/register/route.ts              │
│                                              │                            │
│                                              ▼                            │
│                                    MongoDB Atlas                          │
│                                  "wemongolia/users"                      │
│                              { name, email, password,                    │
│                                role: customer|business_owner }           │
│                                                                           │
│  components/login-form.tsx ──── signIn("credentials", {email,password}) │
│                                              │                            │
│                                              ▼                            │
│                                  lib/auth.ts authorize()                  │
│                                    │              │                       │
│                              [try backend]   [if ECONNREFUSED]           │
│                                    │              │                       │
│                                    ▼              ▼                       │
│                         http://localhost:4000  mongoFallback()           │
│                         /api/v1/auth/login        │                       │
│                                                MongoDB Atlas             │
│                                                accessToken=undefined     │
│                                                                           │
│  lib/api/client.ts ──── Bearer: session.user.accessToken                │
│                                              │                            │
│                       [undefined if MongoDB path was used]               │
│                                                                           │
│  middleware.ts ──── return NextResponse.next()  ← DOES NOTHING          │
└─────────────────────────────────────────────────────────────────────────┘
              │ (when backend running)
              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        EXPRESS BACKEND (:4000)                           │
│                                                                           │
│  POST /api/v1/auth/register ──── prisma.user.create() ────► PostgreSQL  │
│  POST /api/v1/auth/login    ──── prisma.user.findUnique() ─► PostgreSQL  │
│                                  signJWT({ userId, role }) ─► accessToken│
│                                                                           │
│  authenticate() middleware ──── verifyJWT(Bearer token)                 │
│  requireRole() middleware  ──── check UserRole enum (Prisma)            │
│                                                                           │
│  All protected routes:                                                    │
│    /bookings, /bookings/me, /provider/bookings,                          │
│    /provider/analytics, /auth/me, etc.                                   │
│    ── ALL require valid accessToken ──────────────────────────────────── │
│                                                                           │
│  PostgreSQL                                                               │
│  { firstName, lastName, email, passwordHash,                             │
│    role: traveler|provider_owner|admin }                                 │
│  ── CURRENTLY EMPTY (no UI registration path writes here) ──────────────│
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Risks to Watch For

| Risk | Severity | Mitigation |
|------|---------|-----------|
| Registration writes to MongoDB; login tries PostgreSQL → user can never get accessToken | 🔴 Critical | Phase 2: fix registration to write to PostgreSQL |
| accessToken expires in 15 min; no refresh mechanism | 🔴 High | Phase 4: extend expiry or implement refresh |
| Middleware does nothing; dashboard unprotected | 🟠 Medium | Phase 3: implement middleware |
| MongoDB users have wrong role strings (`customer` vs `traveler`) | 🟠 Medium | Phase 5: migration script maps roles |
| User appears logged in but all backend calls fail (no token) | 🟠 Medium | Phase 6: remove fallback after migration |
| bcrypt hash compatibility between frontend and backend | 🟡 Low | Confirmed compatible (same algorithm) |
| Token contains role at sign-in time; role changes not reflected | 🟡 Low | Acceptable until role-change feature is needed |
| No email uniqueness check across both databases | 🟡 Low | Phase 5: deduplication in migration script |
