# Listings / Services Management — Audit & Plan

**Scope:** Provider dashboard ability to manage tours, vehicles, accommodations  
**Date:** Based on current codebase inspection

---

## 1. Current Backend Support

### Tours

| Capability | Status | Evidence |
|------------|--------|----------|
| Create tours | **Missing** | No POST /tours or /provider/tours. Tours created only via `prisma/seed.ts`. |
| Edit tours | **Missing** | No PUT/PATCH for tours. |
| Delete tours | **Missing** | No DELETE. |
| List provider's own tours | **Missing** | No `GET /provider/tours`. Public `GET /tours` lists active tours site-wide by destination/filters, not by provider. |
| Manage tour images | **Missing** | TourImage model exists; images set in seed. No upload or CRUD API. |
| Manage tour departures | **Missing** | TourDeparture created in seed; booking service updates bookedSeats. No provider endpoint to create/edit departures. |

### Vehicles

| Capability | Status | Evidence |
|------------|--------|----------|
| Create vehicles | **Missing** | No POST. Created only via seed. |
| Edit vehicles | **Missing** | No PUT/PATCH. |
| Delete vehicles | **Missing** | No DELETE. |
| List provider's own vehicles | **Missing** | No `GET /provider/vehicles`. Public `GET /vehicles` filters by availability/destination, not provider. |
| Manage vehicle images | **Missing** | VehicleImage exists; no API. |
| Manage vehicle availability | **Missing** | VehicleAvailability created by booking service when booking. No provider endpoint. |

### Accommodations

| Capability | Status | Evidence |
|------------|--------|----------|
| Create accommodations | **Missing** | No POST. Created only via seed. |
| Edit accommodations | **Missing** | No PUT/PATCH. |
| Delete accommodations | **Missing** | No DELETE. |
| List provider's own accommodations | **Missing** | No `GET /provider/stays` (provider-scoped). Public `GET /stays` lists by destination. |
| Manage accommodation images | **Missing** | AccommodationImage exists; no API. |
| Manage room types | **Missing** | RoomType created in seed. No provider CRUD. |

### Provider-scoped listing summary

| Area | Supported | Partial | Missing |
|------|-----------|---------|---------|
| List own listings | — | — | ✅ All three types |
| Create tour | — | — | ✅ |
| Create vehicle | — | — | ✅ |
| Create accommodation | — | — | ✅ |
| Edit any listing | — | — | ✅ |
| Delete any listing | — | — | ✅ |
| Image upload | — | — | ✅ (Cloudinary env vars exist, not wired) |
| Tour departures | — | — | ✅ Provider management |
| Vehicle availability | — | — | ✅ Provider management |

### What does exist

- **`GET /provider/profile`** — Returns provider with `_count: { tours, vehicles, accommodations, bookings }`. So we know counts but cannot list or manage items.
- **Public listing routes** — `GET /tours`, `GET /vehicles`, `GET /stays` — Read-only, filter by destination/availability, return active listings site-wide.
- **`GET /hosts/:slug`** — Public host page; fetches provider's tours, vehicles, accommodations for display. Not provider-facing management.
- **Destinations** — `GET /destinations` and `GET /destinations/:slug`. Read-only. Tours/vehicles/accommodations reference `destinationId`.
- **Booking flow** — Uses existing tours/vehicles/accommodations from DB. No creation path for new listings.

---

## 2. Current Frontend Support

### Provider-facing pages

| Route | Status | Notes |
|-------|--------|-------|
| `/dashboard/business/services` | **404** | Removed in Phase 1 (was dead link). |
| `/dashboard/business` (Overview) | Exists | No listing management. Shows counts from analytics. |
| `/create-business` | Exists | Marketing/landing only. Links to onboarding. |
| `/onboarding` | Exists | Creates Provider only via `POST /account/provider`. Promises "add tours, rooms, or vehicles" in dashboard — **no UI exists**. |

### Reusable components

| Component | Location | Status |
|------------|----------|--------|
| `ServiceForm` | `components/dashboard/forms/ServiceForm.tsx` | Uses mock `Service` type. Title, description, price, duration, location, groupSize, category, includedItems, availability. Image upload UI is placeholder (no API). **Not used by any page.** |
| `ServiceCard` | `components/dashboard/domain/ServiceCard.tsx` | Uses mock `Service`. Has Edit/Delete callbacks. **Not used by any page.** |

### Mock data

- `lib/mock-data/services.ts` — Mock `Service` array. Shape differs from Tour/Vehicle/Accommodation (e.g. `duration` string vs `durationDays` int, `location` vs `destinationId`).
- `lib/mock-data/tourDetails.ts`, `lib/mock-data/tours.ts` — Used by traveler-facing tour pages, not provider dashboard.

### Summary

- **No provider-facing listing list page** — Services route was 404 and pointed to non-existent page.
- **No create listing flow** — Onboarding creates Provider only.
- **No edit/delete flow** — None.
- **ServiceForm / ServiceCard** — Orphaned; use mock shape. Could be adapted for Tour form if backend exists.
- **Image upload** — Placeholder UI only; no backend.

---

## 3. Recommended Product Structure

### Option A: Unified Services page (recommended)

```
/dashboard/business/services
├── List view (tabs or filters: All | Tours | Vehicles | Stays)
├── Empty state: "Add your first tour/vehicle/stay"
├── "Add Tour" / "Add Vehicle" / "Add Stay" CTA
├── Create flow: /dashboard/business/services/new/tour (or modal)
├── Edit flow: /dashboard/business/services/[id]/edit (or modal)
```

**Rationale:** One place for all offerings. Simpler nav. Matches current provider types (tour_operator, car_rental, accommodation).

### Option B: Separate sections

```
/dashboard/business/tours
/dashboard/business/vehicles
/dashboard/business/stays
```

**Rationale:** Clear separation. More nav items. Better if each type has many fields and complex flows.

### Recommendation

**Use Option A** for Phase 3: single `/dashboard/business/services` with:

1. **List** — Show provider's tours, vehicles, accommodations (once backend supports `GET /provider/tours`, etc.).
2. **Filter by type** — Tabs: All | Tours | Vehicles | Stays.
3. **Create** — One primary type first (Tours). "Add Tour" CTA.
4. **Edit** — Inline or separate page when backend supports it.

---

## 4. Phase Plan

### Phase 3A — Smallest real listings management

**Goal:** Provider can see and create tours. No edit/delete, no vehicles/accommodations yet.

1. **Backend**
   - `GET /provider/tours` — List tours for authenticated provider (any status).
   - `POST /provider/tours` — Create tour. Minimal fields: title, shortDescription, description, durationDays, basePrice, destinationId (optional), status (default draft). Slug auto-generated from title.
   - Provider ownership: all operations scoped to `providerId` from owner.

2. **Frontend**
   - `/dashboard/business/services` — Real page.
   - List tours (from `GET /provider/tours`). Empty state if none.
   - "Add your first tour" CTA → Create form.
   - Create form: title, description, duration, price, destination (dropdown from `GET /destinations`).
   - Add Services back to sidebar (no longer 404).

3. **Scope**
   - Tours only.
   - No edit, no delete.
   - No images (use placeholder or single URL field if needed).
   - No departures — provider adds tour; departures come in Phase 3C.

### Phase 3B — Richer editing and more types

- PATCH /provider/tours/:id — Edit tour.
- DELETE or archive (status → paused) for tours.
- Same pattern for vehicles and accommodations.
- Wire ServiceForm-like UI to real Tour/Vehicle/Accommodation APIs.
- Image handling: URL input first, or wire Cloudinary signed upload later.

### Phase 3C — Later

- Tour departures: `POST /provider/tours/:id/departures`.
- Vehicle availability: `POST /provider/vehicles/:id/availability`.
- Accommodation room types and availability.
- Media: multiple images, reorder, Cloudinary upload.

---

## 5. Key Blockers

| Blocker | Severity | Notes |
|---------|----------|-------|
| No provider listing CRUD | **Critical** | Must add `GET/POST /provider/tours` (and equivalent for vehicles/stays) before any provider UI. |
| No provider ownership checks | N/A | Will be implemented with new routes; filter by `provider.id` from `ownerUserId`. |
| No image upload | High | Cloudinary env vars exist; upload not wired. Phase 3A can use URL field or placeholder. |
| No destination CRUD | Low | Destinations are read-only; provider picks from existing. Sufficient for Phase 3A. |
| Slug generation | Medium | Tours need unique slug. `uniqueSlug` util exists in backend. Use for create. |
| Validation/schemas | Medium | Need Zod schemas for create/update. Tour model has many optional fields; start minimal. |
| Route guards | Low | Provider routes already use `authenticate` + `requireRole('provider_owner', 'admin')`. |

### Tour create minimal payload

For Phase 3A, minimal create could be:

- `title` (required)
- `shortDescription` (optional)
- `description` (optional)
- `durationDays` (optional, default 1)
- `basePrice` (required)
- `destinationId` (optional)
- `status` (optional, default `draft`)
- `currency` (optional, default USD)

Slug auto-generated from title. `providerId` from authenticated user's provider. `languages`, `maxGuests`, `minGuests`, `priceType` can have defaults.

---

## 6. StoryBrand / UX Angle

### Current gap

After onboarding, provider lands on dashboard. Copy says "you can add tours, rooms, or vehicles" — but there is no way to do so. **Promise without delivery.**

### Recommended flow

1. **Overview** — If `_count.tours === 0`, show clear CTA: "Add your first tour to start receiving bookings."
2. **Services page** — Primary CTA: "Add Tour" (or "Add Vehicle" / "Add Stay" when supported).
3. **Empty state** — "No tours yet. Add your first tour to get discovered by travelers."
4. **Momentum** — After creating one tour, show: "Your tour is saved. Add departures to make it bookable." (Phase 3C) or "Add another tour" (Phase 3B).

### Minimum UI for Phase 3A

- Services page with list of provider's tours.
- Prominent "Add tour" button.
- Simple create form (5–7 fields).
- Success: redirect to services list or show new tour in list.
- No fake completeness: if we can't edit or add images, don't show edit buttons or image UI.

---

## 7. Output Summary

### Route/file audit

| Area | Routes | Files | Status |
|------|--------|-------|--------|
| Provider tours | None | — | Missing |
| Provider vehicles | None | — | Missing |
| Provider accommodations | None | — | Missing |
| Public tours | GET /tours, /tours/:slug, /tours/:id/departures | tour.routes, tour.controller, tour.service | Read-only |
| Public vehicles | GET /vehicles, /vehicles/:slug | vehicle.routes, … | Read-only |
| Public stays | GET /stays, /stays/:slug | accommodation.routes, … | Read-only |
| ServiceForm | — | components/dashboard/forms/ServiceForm.tsx | Orphaned, mock |
| ServiceCard | — | components/dashboard/domain/ServiceCard.tsx | Orphaned, mock |
| /dashboard/business/services | 404 | — | Removed in Phase 1 |

### Backend support matrix

| Capability | Tours | Vehicles | Accommodations |
|------------|-------|----------|----------------|
| List (provider-scoped) | ❌ | ❌ | ❌ |
| Create | ❌ | ❌ | ❌ |
| Update | ❌ | ❌ | ❌ |
| Delete | ❌ | ❌ | ❌ |
| Images | ❌ | ❌ | ❌ |
| Departures/availability | ❌ | ❌ | ❌ |

### Frontend support matrix

| Capability | Status |
|------------|--------|
| Services list page | ❌ (404) |
| Create listing flow | ❌ |
| Edit listing flow | ❌ |
| Delete/archive | ❌ |
| ServiceForm component | Exists, mock only |
| ServiceCard component | Exists, mock only |
| Image upload UI | Placeholder only |

### Recommended structure

- **Single Services page:** `/dashboard/business/services`
- **Tabs/filters:** All | Tours | Vehicles | Stays
- **Primary CTA:** Add Tour (Phase 3A)
- **Create:** Modal or `/services/new/tour` page

### Phased implementation plan

| Phase | Scope | Backend | Frontend |
|-------|-------|---------|----------|
| **3A** | Tours: list + create | GET/POST /provider/tours | Services page, list, create form |
| **3B** | Edit, delete, vehicles, accommodations | PATCH/DELETE, full CRUD for vehicles/stays | Edit form, type tabs |
| **3C** | Departures, availability, media | Departure/availability endpoints, image upload | Calendar-like UI, image mgmt |

### Highest-priority next build step

1. **Add `GET /provider/tours`** — List tours for authenticated provider.
2. **Add `POST /provider/tours`** — Create tour with minimal fields.
3. **Add `/dashboard/business/services`** — Page that lists tours and has "Add tour" → create form.
4. **Add Services to sidebar** — Only after page is real.

Start with tours only. Vehicles and accommodations follow the same pattern once tours are working.
