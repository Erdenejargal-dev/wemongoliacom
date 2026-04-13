# Provider Limits System Audit

> **Status:** Design-only. No implementation. Goal: understand the current architecture so limits can be added correctly without technical debt.
>
> **Date:** April 2026

---

## 1. Current Provider Architecture

### 1.1 User Roles

Three roles exist, defined as a Prisma enum (`UserRole`):

| Role | Default | Who |
|---|---|---|
| `traveler` | ✅ Yes | All newly registered users |
| `provider_owner` | No | Automatically promoted when a Provider record is created |
| `admin` | No | Manually assigned by another admin |

A user starts as `traveler`. When they complete onboarding and a `Provider` is created, the system auto-promotes them to `provider_owner` inside a DB transaction (`account.service.ts → registerProvider`).

**Key fact:** A user can have at most **one** Provider record (enforced by `@unique` on `Provider.ownerUserId`). There is no team/staff model. It is strictly 1 User ↔ 1 Provider.

---

### 1.2 Provider Model

The `Provider` table is the business entity. It sits between the User and all listings:

```
User (1) ──── (1) Provider ──── (*) Tour
                             ──── (*) Vehicle
                             ──── (*) Accommodation
                             ──── (*) Booking
```

Relevant fields on `Provider`:

| Field | Type | Notes |
|---|---|---|
| `ownerUserId` | String @unique | 1:1 with User |
| `providerTypes` | `ProviderType[]` | Array — can hold multiple |
| `status` | `ListingStatus` | draft / active / paused / archived |
| `verificationStatus` | `VerificationStatus` | unverified / pending_review / verified / rejected |
| `isVerified` | Boolean | Derived from verificationStatus === 'verified' |

**There is no `plan`, `tier`, or `subscription` field on `Provider` yet.** All providers are implicitly on a single (free) tier.

---

### 1.3 ProviderType Enum (Database)

```prisma
enum ProviderType {
  tour_operator
  car_rental
  accommodation
}
```

Provider stores an **array** (`ProviderType[]`), so one Provider can have multiple types simultaneously.

---

### 1.4 Business Types — UI Layer vs DB Layer

The onboarding wizard (`/onboarding`) presents 4 choices:

| UI Selection | DB value (`providerTypes[]`) |
|---|---|
| `tour_operator` | `['tour_operator']` |
| `hotel` | `['accommodation']` |
| `car_rental` | `['car_rental']` |
| `multiple` | `['tour_operator', 'car_rental', 'accommodation']` |

**`multiple` is NOT a DB enum value.** It is purely a UI concept. In the database, a "multiple" provider simply has all three ProviderType values in the array. This is important: there is no single flag you can query to identify "multiple" businesses — you must check the array length.

---

### 1.5 ProviderOnboarding Model — Dead Code Risk

The schema has a `ProviderOnboarding` model with its own `status: OnboardingStatus` (draft / submitted / approved). **However**, the actual onboarding flow (`app/onboarding/page.tsx`) does NOT use this model. It calls `POST /account/provider` which creates a `Provider` record directly.

`ProviderOnboarding` is either legacy code or a planned feature that was never wired up. No service or controller writes to it in the current flow. **This creates a consistency risk:** the schema implies a multi-stage approval process (draft → submitted → approved), but the real flow skips straight to creating an active Provider record.

---

### 1.6 Verification vs Operational Status

Two independent axes:

| Axis | Field | Values | Who controls |
|---|---|---|---|
| Legitimacy review | `verificationStatus` | unverified → pending_review → verified / rejected | Admin |
| Operational | `status` | draft → active / paused / archived | Admin (can also be auto-paused on rejection) |

These are deliberately decoupled — admins control each independently. Verification approval does NOT automatically activate the Provider. This is a clean design.

---

## 2. Listing Types and Flows

### 2.1 Tours

**Model:** `Tour`

**Statuses:** `draft` | `active` | `paused` | `archived` (from `ListingStatus`)

**Create flow:**
1. Provider opens `/dashboard/business/services/tours`
2. Clicks "Add Tour" → side-panel opens (minimal form: title + price + optional destination)
3. Calls `POST /provider/tours` → creates with `status: 'draft'`
4. Redirect to full edit page (`/dashboard/business/services/tours/:id`)
5. Provider adds: description, images, difficulty, guests, cancellation policy, departures

**Publish readiness gates** (enforced by backend):
- Title ≥ 2 characters
- Description ≥ 50 characters
- Price > 0
- At least 1 image uploaded
- At least 1 upcoming `TourDeparture` with status `scheduled`

**Edit flow:** `PUT /provider/tours/:tourId` — patch any subset of fields

**Archive/delete:** `DELETE /provider/tours/:tourId` → soft-delete, sets `status: 'archived'`. Hard deletion does NOT exist. Archived tours cascade-delete when the Provider is deleted.

**Sub-resources:** `TourImage`, `TourItineraryDay`, `TourIncludedItem`, `TourExcludedItem`, `TourDeparture`

---

### 2.2 Accommodations

**Model:** `Accommodation`

**Statuses:** `draft` | `active` | `paused` | `archived` (from `ListingStatus`)

**Accommodation sub-types** (`AccommodationType` enum):
`ger_camp` | `hotel` | `lodge` | `guesthouse` | `resort` | `hostel` | `homestay`

**Create flow:**
1. Provider opens `/dashboard/business/services/accommodations`
2. Clicks "Add Property" → navigates to `/dashboard/business/services/accommodations/new`
3. Calls `POST /provider/accommodations` → creates with `status: 'draft'`
4. Full detail page: add description, images, location (lat/lng), check-in/check-out times, amenities, room types

**Publish readiness gates** (enforced by backend):
- Name ≥ 2 characters
- Description ≥ 50 characters
- `accommodationType` set
- `checkInTime` and `checkOutTime` set
- At least 1 `RoomType` with `basePricePerNight > 0` and `maxGuests >= 1`
- At least 1 image uploaded

**Edit flow:** `PUT /provider/accommodations/:accId`

**Archive/delete:** `DELETE /provider/accommodations/:accId` → soft-delete, sets `status: 'archived'`

**Sub-resources:** `AccommodationImage`, `RoomType`, `RoomAvailability`

---

### 2.3 Vehicles — Schema Exists, Management Does NOT

**Model:** `Vehicle`

**Statuses:** `draft` | `active` | `paused` | `maintenance` | `archived` (from `VehicleStatus` — note: **different enum from `ListingStatus`**)

**Critical finding:** Vehicles exist fully in the Prisma schema (Vehicle, VehicleImage, VehicleAvailability) but there is **zero provider-side management API or UI**:

- `vehicle.controller.ts` only has `listVehicles` and `getVehicle` (public endpoints)
- `vehicle.service.ts` only has `listVehicles` and `getVehicleBySlug` (public only)
- No routes like `POST /provider/vehicles`
- The services hub (`/dashboard/business/services`) shows **only Tours and Accommodations** — no Vehicles section
- A `car_rental` or `multiple` provider has **no way** to create or manage vehicles through the dashboard

**Implication for limits:** Do NOT include vehicles in any counting or limit logic until provider-side vehicle management is built.

---

### 2.4 Listing Summary Table

| Listing Type | DB Model | Status Enum | Provider API | Provider UI | Bookable |
|---|---|---|---|---|---|
| Tour | `Tour` | `ListingStatus` | ✅ Full CRUD | ✅ Full | ✅ |
| Accommodation | `Accommodation` | `ListingStatus` | ✅ Full CRUD | ✅ Full | ✅ |
| Vehicle | `Vehicle` | `VehicleStatus` | ❌ None | ❌ None | ✅ (public) |

---

## 3. Risks and Issues with Naive Limits

### Risk 1 — No Plan Field Exists
The schema has no `plan`, `tier`, or `subscription` concept. Hardcoding limits in business logic (e.g., `const MAX_TOURS = 3`) creates technical debt the moment a second tier is introduced. Every limit check would need to be updated in multiple places.

### Risk 2 — What Counts Against the Limit?
`archived` is a soft-delete — the row remains in the database. A naive `prisma.tour.count({ where: { providerId } })` would count archived tours, incorrectly blocking providers who cleaned up old listings.

Conversely, if you exclude drafts from the count, providers could game the system by creating unlimited drafts and only "publishing" (activating) them up to the limit.

### Risk 3 — "Multiple" Providers Need Both Budgets
A `multiple` business (all 3 types) should be allowed to create tours **and** accommodations. A combined limit of "5 listings total" would be unfair. Separate per-type limits are required.

### Risk 4 — Race Conditions at Limit Boundary
The create flow does a count check then a create — two separate DB operations. Under concurrent requests (provider double-clicks "Create"), both could pass the count check simultaneously and both proceed to create, ending up with `limit + 1` listings. This must be handled in a database transaction.

### Risk 5 — Vehicle Management Is Incomplete
The schema has vehicles but no management UI or API. If limits are applied globally across all listing types today, the vehicle management system — when eventually built — will need to retrofit limits, which could create inconsistency or require a second migration.

### Risk 6 — ProviderOnboarding Is Unused
The `ProviderOnboarding` model in the schema is not used by the actual onboarding flow. If limits are ever keyed off onboarding status, this silent inconsistency would cause bugs. Recommended: either use it or remove it. Do not design the limits system around it.

### Risk 7 — No UX for Limits Exists
Currently, the frontend shows no count indicators, no progress bars, and no soft warnings. Providers would hit a backend 4xx error with no context. This is a bad UX failure mode that should be designed out before limits go live.

---

## 4. Recommended Limit Model

### Decision: Per-Provider, Per-Listing-Type, Separate

**Why per-provider:**
- The Provider is the natural business entity (1 owner, 1 Provider record)
- All listing ownership is via `providerId`
- No "team" or "subsidiary" complication exists

**Why per-listing-type:**
- A tour operator and an accommodation operator have different use patterns
- Combined limits punish mixed businesses
- Separate limits are easier to reason about and explain to users

**Why separate (not combined):**
- "3 tours + 3 stays" is clearer than "6 listings (mix)"
- Allows independent plan upgrades per category in the future

### What Counts Against the Limit

Include: `draft`, `active`, `paused`  
Exclude: `archived`

Rationale:
- `draft` counts: prevents gaming (infinite drafts), encourages providers to clean up or publish
- `archived` does not count: it's soft-deleted, equivalent to gone
- `paused` counts: the listing is still live in the system, just temporarily hidden

### Listing Types Covered Now

| Type | Counted | Notes |
|---|---|---|
| `tours` | ✅ Yes | Full management exists |
| `accommodations` | ✅ Yes | Full management exists |
| `vehicles` | ❌ No | No management UI/API yet — skip entirely |

---

## 5. Plan System Design

### 5.1 Centralized Config (Not Hardcoded)

Create a single source of truth for plan limits:

```typescript
// lib/limits.ts  (or backend/src/config/limits.ts — shared or mirrored)

export const LISTING_LIMITS = {
  FREE: {
    tours:          3,
    accommodations: 3,
    // vehicles: 0  — not applicable until management is built
  },
  PRO: {
    tours:          Infinity,
    accommodations: Infinity,
  },
} as const

export type PlanType = keyof typeof LISTING_LIMITS
export type ListingLimitKey = keyof (typeof LISTING_LIMITS)['FREE']

export function getLimit(plan: PlanType, key: ListingLimitKey): number {
  return LISTING_LIMITS[plan][key]
}
```

**Never scatter magic numbers** (`if (count >= 3)`) in service files. Always call `getLimit(plan, 'tours')`. This means changing the limit is a one-line config edit.

### 5.2 Adding the Plan Field to Provider

When you are ready to implement:

```prisma
// In schema.prisma

enum PlanType {
  FREE
  PRO
}

model Provider {
  // ... existing fields ...
  plan  PlanType  @default(FREE)
}
```

**Before the migration:** treat all providers as `FREE` — use `provider.plan ?? 'FREE'` defensively.  
**After the migration:** read `provider.plan` directly.

This is a non-breaking additive migration. No existing data is affected.

### 5.3 Limit Check Logic (Service Layer)

The enforcement must be **in the service layer**, not the controller, not the route, not the frontend.

Pseudocode for `createProviderTour`:

```typescript
export async function createProviderTour(ownerUserId: string, input: CreateTourInput) {
  const provider = await prisma.provider.findUnique({ 
    where: { ownerUserId }, 
    select: { id: true, plan: true }  // plan field added later
  })
  if (!provider) throw new AppError('Provider not found.', 404)

  // Centralized limit lookup
  const plan = provider.plan ?? 'FREE'  // safe fallback
  const limit = getLimit(plan, 'tours')

  if (limit !== Infinity) {
    const currentCount = await prisma.tour.count({
      where: {
        providerId: provider.id,
        status: { not: 'archived' },  // only count live listings
      },
    })
    if (currentCount >= limit) {
      throw new AppError(
        `You have reached the maximum of ${limit} tours on the ${plan} plan. ` +
        `Archive unused tours or upgrade your plan.`,
        403,  // or 429 — "limit exceeded"
      )
    }
  }

  // ... existing create logic
}
```

**Race condition mitigation:** wrap the count + create in a `prisma.$transaction` with serializable isolation, or use a DB-level constraint (a partial unique index on active tour count is not trivially possible in Postgres, so a transaction with re-count inside is the safest approach).

---

## 6. Enforcement Points

| Layer | Action | Mechanism |
|---|---|---|
| **Database** | Schema truth | `plan` field on `Provider`, soft-delete pattern (`status: archived`) |
| **Backend Service** | Limit enforcement | Count check before create, throw `AppError` with plan context |
| **Backend Controller** | Pass-through | Controller calls service, service enforces — no controller-level logic needed |
| **Frontend Create Button** | Soft gate | Disable "Add Tour" / "Add Property" when at limit (based on count from API) |
| **Frontend List Page** | Count display | Show "2 / 3 Tours" indicator |
| **Frontend Error Handler** | Hard gate fallback | Catch the backend 403 → show upgrade message (not a generic error) |

### What NOT to Do

- ❌ Do not enforce limits only in the frontend (easily bypassed)
- ❌ Do not hardcode `3` in service files (use `getLimit()`)
- ❌ Do not count archived listings
- ❌ Do not apply limits to vehicles yet (management doesn't exist)
- ❌ Do not use ProviderOnboarding status for limit decisions (it's not used)

---

## 7. UX Recommendations

### 7.1 Where to Show Limits

**Services Hub (`/dashboard/business/services`):**
- Beneath each card: "2 / 3 Tours" progress bar or fraction
- If at limit: show amber/orange badge "At limit"

**Tour List Page (`/dashboard/business/services/tours`):**
- Below the page header: "You are using 3 of 3 tours on your Free plan."
- Disable the "Add Tour" button when at limit
- Replace it with: "Add Tour (Upgrade to unlock)" → links to upgrade page

**Accommodation List Page:** Same pattern as tours.

**Create Panel (slide-out):**
- If somehow reached at limit: show inline error with upgrade CTA, not a generic server error

### 7.2 Soft Warning Before Hard Limit

When a provider is at `limit - 1` (e.g., 2/3 tours):
- Show a subtle amber warning: "You have 1 tour slot remaining on your Free plan."
- This prevents surprise when they hit the wall

### 7.3 Error Message Quality

When the backend returns a 403 due to limit exceeded, the frontend must:
- NOT show "Something went wrong"
- MUST show: "You've reached the limit of 3 tours on the Free plan. Archive an existing tour or upgrade to Pro for unlimited listings."
- Include a direct "Upgrade" CTA button (even if it's just a mailto or contact form now)

### 7.4 Upgrade Path (Phased)

**Phase 1 (now):** "Contact us" link in the limit UI. No self-serve upgrade.  
**Phase 2:** Upgrade button → sends email to admin or opens a request form.  
**Phase 3:** Full Stripe subscription → plan field auto-updated on webhook → limits lifted immediately.

The plan field on `Provider` is the toggle. When `plan` is set to `PRO`, the `getLimit()` function returns `Infinity` and all limit checks are skipped. No other code changes needed.

---

## 8. Deferred Items

These are out of scope for the limits system but are surfaced here because they interact with it:

| Item | Status | Notes |
|---|---|---|
| **Vehicle provider management** | ❌ Not built | Schema exists, public API exists, but no provider CRUD. Do NOT add vehicle limits until this is built. |
| **`ProviderOnboarding` cleanup** | ❌ Unused | Model exists in schema, never written to by the actual flow. Should be removed or wired up to avoid future confusion. |
| **Team/staff accounts** | ❌ Not planned | Currently 1 user = 1 provider, strictly. Limits are naturally per-provider. If teams are added, revisit limit ownership. |
| **Per-listing-type plan customization** | ❌ Future | e.g., "PRO Tours + Free Accommodations". Not needed yet — the flat plan model is sufficient. |
| **Stripe subscription integration** | ❌ Future | The `plan` field should be the toggle; Stripe webhook sets it. Design limits system around the plan field, not payment logic. |
| **Listing drafts cleanup policy** | ❌ Future | Consider a "draft older than 90 days" auto-archive job to prevent stale draft accumulation. |

---

## Summary

| Question | Answer |
|---|---|
| What is the business entity? | `Provider` model — 1:1 with User |
| What roles exist? | traveler, provider_owner, admin |
| What listing types are fully built? | Tours ✅, Accommodations ✅, Vehicles ❌ (public only) |
| What "multiple" means in DB? | `providerTypes: ['tour_operator', 'car_rental', 'accommodation']` — not a separate enum |
| What statuses count against a limit? | draft, active, paused (NOT archived) |
| Where should limits be enforced? | Backend service layer, with a single centralized config |
| What plan field exists today? | None — add `plan: PlanType @default(FREE)` to `Provider` |
| How to handle "multiple" businesses? | Separate per-type limits (tours + accommodations independently) |
| What about vehicles? | Skip for now — no management API/UI exists |
| What UX failure to avoid? | Silent hard block with a generic error — always show limit context + upgrade CTA |
