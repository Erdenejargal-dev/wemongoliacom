# Accommodation Readiness Audit

**Date:** March 23, 2026
**Scope:** Full audit of provider listing / add service / accommodation-related implementation

---

## 1. Current Provider Flow Map

**How a provider moves through the system today:**

1. Clicks "Become a Host" → `/onboarding`
2. 3-step wizard: Business Type → Basic Info → Review & Submit
3. Submit calls `POST /account/provider` → creates `Provider` record, upgrades user role to `provider_owner`
4. Redirect to `/dashboard/business`
5. Server-side layout (`(portal)/layout.tsx`) checks for provider profile via `GET /provider/profile`; if 404 → redirect back to `/onboarding`
6. Dashboard shell renders sidebar + header + page content

### Current routes and pages

| Route | What it does | Real or mock? |
|-------|-------------|---------------|
| `/onboarding` | 3-step provider registration wizard | Real |
| `/dashboard/business` | Overview — stats, bookings, quick actions | Real |
| `/dashboard/business/services` | List and create **tours only** | Real (but tour-only) |
| `/dashboard/business/bookings` | Provider bookings with confirm/complete/cancel | Real |
| `/dashboard/business/messages` | Provider conversations with travelers | Real |
| `/dashboard/business/reviews` | Reviews with reply capability | Real |
| `/dashboard/business/analytics` | Revenue + booking stats | Real |
| `/dashboard/business/settings` | Business profile edit + logo/cover image upload | Real |
| `/dashboard/business/register` | Redirect to `/onboarding` | Redirect only |

---

## 2. Files Involved

### Frontend pages (11 files)

```
app/onboarding/page.tsx                                    — 487 lines, onboarding wizard
app/dashboard/business/layout.tsx                          —   8 lines, passthrough wrapper
app/dashboard/business/register/page.tsx                   —  10 lines, redirect to /onboarding
app/dashboard/business/(portal)/layout.tsx                 —  35 lines, server auth + provider check
app/dashboard/business/(portal)/shell.tsx                  —  23 lines, sidebar + header shell
app/dashboard/business/(portal)/page.tsx                   — 132 lines, overview
app/dashboard/business/(portal)/services/page.tsx          — 422 lines, tour list + create
app/dashboard/business/(portal)/bookings/page.tsx          — 314 lines
app/dashboard/business/(portal)/messages/page.tsx          — 447 lines
app/dashboard/business/(portal)/reviews/page.tsx           — 237 lines
app/dashboard/business/(portal)/analytics/page.tsx         — 170 lines
app/dashboard/business/(portal)/settings/page.tsx          — 335 lines
```

### Frontend components and helpers

```
components/provider-dashboard/DashboardSidebar.tsx         — 195 lines, sidebar nav
components/provider-dashboard/DashboardHeader.tsx          — header bar
components/provider-dashboard/DashboardOverview.tsx        — overview widget
components/dashboard/forms/ServiceForm.tsx                 — 143 lines, DEAD MOCK (unused)
components/dashboard/forms/BusinessProfileForm.tsx         — 117 lines, DEAD MOCK (unused)
components/ui/ImageUpload.tsx                              — single image upload (Cloudinary)
components/ui/MultiImageUpload.tsx                         — gallery upload (Cloudinary)
lib/provider-menu.ts                                       —  51 lines, sidebar menu config
lib/api/provider.ts                                        — 312 lines, frontend API helpers
lib/api/media.ts                                           — media upload client
```

### Backend files

```
backend/src/routes/provider.routes.ts                      — auth'd provider routes
backend/src/controllers/provider.controller.ts             — validation + handlers
backend/src/services/provider.service.ts                   — 464 lines, core provider logic

backend/src/routes/tour.routes.ts                          — PUBLIC tour routes
backend/src/controllers/tour.controller.ts                 — PUBLIC tour handlers
backend/src/services/tour.service.ts                       — PUBLIC tour service

backend/src/routes/accommodation.routes.ts                 — PUBLIC accommodation routes
backend/src/controllers/accommodation.controller.ts        — PUBLIC accommodation handlers
backend/src/services/accommodation.service.ts              — PUBLIC accommodation service

backend/src/routes/vehicle.routes.ts                       — PUBLIC vehicle routes
backend/src/controllers/vehicle.controller.ts              — PUBLIC vehicle handlers
backend/src/services/vehicle.service.ts                    — PUBLIC vehicle service

backend/src/routes/host.routes.ts                          — PUBLIC host/provider listing
backend/src/controllers/host.controller.ts                 — PUBLIC host handlers
backend/src/services/host.service.ts                       — PUBLIC host service

backend/prisma/schema.prisma                               — 845 lines, full data model
```

---

## 3. What Is Currently Implemented

### Dashboard — REAL

Overview fetches real provider profile, analytics, and bookings. Shows welcome banner, stat cards, action alerts, quick action grid, recent bookings. Fully wired.

### Services/Listings — TOURS ONLY

The services page calls `fetchProviderTours` and `createProviderTour`. The `CreateTourPanel` is a slide-over with 6 fields: title, shortDescription, description, durationDays, basePrice, destinationId, status. No accommodation or vehicle creation. No edit or delete for any listing type.

### Bookings — REAL

Lists provider bookings with status filtering. Supports confirm, complete, cancel actions. Displays traveler info, booking code, dates, amount.

### Messages — REAL

Conversation list + thread view + reply. Uses real backend conversations API.

### Reviews — REAL

Shows reviews with rating, comment, listing name. Supports provider replies.

### Analytics — REAL

Shows total bookings, revenue, this month vs last month, review stats. All from backend.

### Settings — REAL

Real profile editor: name, description, phone, email, website, address, city, country. Logo and cover image uploads via Cloudinary. Saves to `PUT /provider/profile`.

### Onboarding — REAL

3-step wizard in Mongolian (for host intent). Step 1 selects business types (tour_operator, car_rental, accommodation). Step 2 collects basic info. Step 3 reviews and submits. Creates provider and redirects to dashboard.

### Public APIs

| API | Status |
|-----|--------|
| `GET /tours`, `GET /tours/:slug`, `GET /tours/:id/departures` | Fully built — list, detail, departure search |
| `GET /stays`, `GET /stays/:slug` | Fully built — list with room type + date search, detail with availability |
| `GET /vehicles`, `GET /vehicles/:slug` | Fully built — list with date range search, detail with availability |
| `GET /hosts`, `GET /hosts/:slug` | Fully built — lists active/verified providers, detail shows all their listings |

### Provider-scoped APIs

| API | Status |
|-----|--------|
| `GET/PUT /provider/profile` | ✅ |
| `GET /provider/bookings`, confirm/complete/cancel | ✅ |
| `GET /provider/analytics` | ✅ |
| `GET /provider/reviews`, reply | ✅ |
| `GET /provider/tours`, `POST /provider/tours` | ✅ List + Create only |
| `PUT/DELETE /provider/tours/:id` | ❌ Missing |
| `POST /provider/tours/:id/images` | ❌ Missing |
| Any `/provider/accommodations/*` | ❌ Missing entirely |
| Any `/provider/vehicles/*` | ❌ Missing entirely |
| Any `/provider/rooms/*` or availability management | ❌ Missing entirely |

---

## 4. What Assumptions the Current Architecture Makes

### About listings

- A "service" is assumed to be a **tour**. The services page is hardcoded to `fetchProviderTours`/`createProviderTour`. The button says "Add Tour", the empty state says "No tours yet", the card component is `TourCard`.
- There is no listing type selector. A provider who only does accommodations sees a tour-creation interface.

### About pricing

- Tours: single `basePrice` field. The schema has `PriceType` (per_person, private_group, fixed) but the create form doesn't expose it — defaults to `per_person`.
- Accommodations: per-night pricing via `RoomType.basePricePerNight` — never exposed in provider UI.
- Vehicles: per-day pricing via `pricePerDay` — never exposed in provider UI.
- No seasonal pricing, no dynamic pricing, no add-ons.

### About availability

- Tours: `TourDeparture` model with startDate/endDate/availableSeats exists but the provider **cannot create departures** — no endpoint, no UI.
- Accommodations: `RoomAvailability` model with per-date-per-room-type availability exists but the provider **cannot manage it** — no endpoint, no UI.
- Vehicles: `VehicleAvailability` model exists but the provider **cannot manage it**.
- Net effect: providers can create listings that **cannot actually be booked** because inventory is empty.

### About business types

- Onboarding collects `providerTypes` (array of tour_operator/car_rental/accommodation).
- The sidebar shows type badges but renders **identical navigation** for all types.
- `buildProviderMenu()` in `lib/provider-menu.ts` ignores the `providerTypes` argument entirely — returns the same `SHARED_ITEMS` array every time.
- The services page is tour-only regardless of what business type the provider selected.

---

## 5. What Is Too Tour-Specific

| Area | Tour bias |
|------|-----------|
| `services/page.tsx` | Entire page: `fetchProviderTours`, `createProviderTour`, `TourCard`, "Add Tour" button, "No tours yet" empty state |
| `CreateTourPanel` | Fields: title, shortDescription, description, durationDays, basePrice, destinationId — all tour fields |
| `lib/api/provider.ts` | Only has `ProviderTour`, `CreateTourInput`, `fetchProviderTours`, `createProviderTour` — no accommodation/vehicle types or helpers |
| Provider routes | Only `GET/POST /provider/tours` — no accommodation or vehicle routes |
| Provider service | Only `listProviderTours` and `createProviderTour` — no accommodation or vehicle methods |
| Provider controller | Only `tourListQuerySchema` and `createTourSchema` — no accommodation validation |
| Overview dashboard | Shows "Add Listing" quick action that links to `/dashboard/business/services` which is tour-only |
| Sidebar label | "Services" label gives no indication it's tour-specific |

---

## 6. What Is Missing for Real Accommodation Support

### Already in the Prisma schema (surprisingly complete)

| Component | Status in schema |
|-----------|-----------------|
| `Accommodation` model | ✅ Has name, slug, description, type, check-in/out, amenities, cancellation policy, star rating, status |
| `AccommodationType` enum | ✅ `ger_camp`, `hotel`, `lodge`, `guesthouse`, `resort` |
| `AccommodationImage` | ✅ Has imageUrl, publicId, altText, width, height, format, bytes, sortOrder |
| `RoomType` model | ✅ Has name, description, maxGuests, bedType, quantity, basePricePerNight, currency, amenities |
| `RoomAvailability` model | ✅ Per-date per-room-type with availableUnits, bookedUnits, priceOverride, status |
| `Booking` linkage | ✅ `listingType='accommodation'`, `roomTypeId`, `roomAvailabilityId` fields |
| Public search | ✅ `listAccommodations` filters by dates, guest count, amenities, price range with room availability check |
| Public detail | ✅ `getAccommodationBySlug` returns room types with availability |

### Missing for provider-facing

| Component | What's needed |
|-----------|---------------|
| **Provider create accommodation** | `POST /provider/accommodations` endpoint — no backend code exists |
| **Provider list accommodations** | `GET /provider/accommodations` endpoint — doesn't exist |
| **Provider update accommodation** | `PUT /provider/accommodations/:id` — doesn't exist |
| **Provider delete/archive accommodation** | `DELETE /provider/accommodations/:id` — doesn't exist |
| **Room type CRUD** | `POST/PUT/DELETE /provider/accommodations/:id/rooms` — doesn't exist |
| **Room availability management** | Endpoints to set/update availability per room type per date — doesn't exist |
| **Room images** | Per-room-type photos — schema doesn't support this (images are accommodation-level only) |
| **Frontend: accommodation creation form** | Nothing exists |
| **Frontend: room type management** | Nothing exists |
| **Frontend: availability calendar** | Nothing exists |
| **Frontend: accommodation-type selector** | Nothing exists |
| **AccommodationType gaps** | Missing: `hostel`, `homestay` — only has ger_camp, hotel, lodge, guesthouse, resort |
| **Per-property address** | Accommodation has no `address`, `city`, `latitude`, `longitude` — relies on Provider-level address or Destination. A provider with properties in different locations cannot specify per-property addresses |

---

## 7. What Is Salvageable vs What Needs Redesign

### Keep as-is (salvageable)

- **Dashboard shell** (shell.tsx, DashboardHeader, DashboardSidebar) — clean, extensible
- **Overview page** — real data, good UX
- **Bookings, Messages, Reviews, Analytics pages** — all wired to real backends, working
- **Settings page** — real profile editing with Cloudinary image upload
- **Onboarding wizard** — works, creates provider, redirects correctly
- **Prisma schema** — Accommodation/RoomType/RoomAvailability is well-designed and already used by public APIs
- **Public accommodation API** — `listAccommodations` and `getAccommodationBySlug` are complete with room type + availability search
- **Booking model** — polymorphic, already supports accommodation bookings
- **Cloudinary integration** — just built, ready to use
- **Provider menu system** (`lib/provider-menu.ts`) — clean, just needs the `buildProviderMenu` function to actually use `providerTypes` for filtering

### Needs refactoring

- **`services/page.tsx`** — must evolve from a tour-only page into a multi-type listing hub OR be replaced with type-specific sub-routes (e.g., `/services/tours`, `/services/accommodations`)
- **`lib/api/provider.ts`** — needs accommodation + vehicle types and API helpers added
- **Provider routes/controller/service** — needs accommodation CRUD, room type CRUD, availability management
- **`buildProviderMenu()`** — currently ignores `providerTypes` argument; should show type-relevant navigation

### Should be deleted (dead code)

- **`components/dashboard/forms/ServiceForm.tsx`** — mock component using `lib/mock-data/services`. Completely unused. Imports a non-existent `Service` type. Has fake categories (Adventure, Trekking, etc.) that don't match the schema.
- **`components/dashboard/forms/BusinessProfileForm.tsx`** — mock component with hardcoded "We Mongolia Tours" data. Completely replaced by the real `settings/page.tsx`. Upload UI is placeholder.

---

## 8. UX/Product Audit of the Add Service Flow

### What feels too generic

- The `CreateTourPanel` is a flat slide-over form with 6 fields. It has no images, no itinerary, no included items, no meeting point, no cancellation policy, no difficulty, no departure dates. It creates a **skeleton listing** that is not bookable.
- Page header says "Services" but only supports tours. An accommodation provider sees "No tours yet" — confusing and unhelpful.
- Empty state icon is `MapPin` (tour-oriented). Copy says "Add your first tour."

### What is missing

- **No listing type selector.** The form assumes tours. There's no "What are you listing?" first step.
- **No multi-step structure.** Accommodation creation needs: property info → room types → pricing → images → policies → availability → review/publish. A flat form cannot handle this.
- **No image upload in creation.** The `MultiImageUpload` component exists but is not wired into the tour creation panel.
- **No departure/availability creation.** A provider can create a tour but cannot add departures. The tour is dead on arrival — it will never appear in search results that filter by dates.
- **No edit flow.** Once created, a listing cannot be modified from the frontend. No `PUT` endpoint, no edit form.
- **No delete/archive flow.** A provider cannot remove a bad listing.
- **No business-type branching.** The same form appears whether the provider is a tour operator, hotel, or car rental company.
- **No draft → publish validation.** A provider can set status to "active" with zero images, zero departures, and a one-line description. This creates a misleading public listing.

### Why it doesn't fit a real marketplace workflow

A real marketplace listing flow should feel like **Airbnb's "Add a listing"**: a multi-step wizard that guides the provider through all required information, shows progress, validates completeness, and only allows publishing when readiness criteria are met. The current implementation feels like a developer test tool — it creates a database record with minimal fields but doesn't create a usable listing.

---

## 9. Risks If We Keep Building Without Planning

### Technical risks

- **Schema divergence.** If we start adding accommodation fields to the same flat form, we'll end up with conditional fields, union types, and a fragile mess. Different listing types need different form architectures.
- **Provider endpoint duplication.** Without a clear pattern, we'll end up with inconsistent CRUD endpoints for tours vs accommodations vs vehicles instead of a unified approach.
- **Availability model complexity.** Room availability is per-date-per-room-type. Building the calendar UI without a clear data flow plan will produce bugs around overbooking, date ranges, and timezone handling.

### UX risks

- **Accommodation providers abandon.** A provider who signed up as `accommodation` type sees a tour-only interface. They have no way to add their property. The product is effectively broken for them.
- **Unbookable listings multiply.** Tours created without departures appear as "real" in the dashboard but can never receive bookings. This erodes provider trust.
- **No publish readiness.** Allowing "active" status on incomplete listings creates low-quality public pages that hurt traveler trust.

### Data model risks

- **Missing per-property address.** The `Accommodation` model has no address or location fields. A ger camp in the Gobi and a hotel in Ulaanbaatar from the same provider would share the provider-level address. This needs to be fixed before building accommodation creation.
- **AccommodationType is incomplete.** Missing `hostel` and `homestay`. Extending the enum requires a migration.
- **No room-level photos.** `AccommodationImage` is property-level. If a provider has a "Deluxe Ger" and a "Standard Ger," they can't show room-specific photos. This may need a `RoomTypeImage` model.

---

## 10. Recommended Next Step

**Before writing any code**, design:

### 1. Listing creation architecture

Decide whether `/services` becomes a multi-type hub with type-specific sub-routes (recommended: `/services/tours`, `/services/accommodations`, `/services/vehicles`) or stays as one page with branching forms (not recommended for accommodations).

### 2. Accommodation creation wizard

Plan the steps:

- **Step 1:** Property basics (name, type, description, location/address, destination)
- **Step 2:** Amenities and policies (check-in/out, cancellation, star rating, property-level amenities)
- **Step 3:** Room types (add rooms with name, capacity, bed type, quantity, per-night price, room amenities)
- **Step 4:** Images (property images, potentially per-room-type images)
- **Step 5:** Review and publish (readiness checklist: has description, has at least 1 room type, has at least 1 image)

### 3. Schema adjustments needed before building

- Add `address`, `city`, `region`, `latitude`, `longitude` to `Accommodation` model
- Extend `AccommodationType` enum with `hostel` and `homestay`
- Consider `RoomTypeImage` model if room-level photos are needed
- Define publish readiness rules

### 4. Provider API pattern

Design the full CRUD surface:

- `GET/POST /provider/accommodations`
- `GET/PUT/DELETE /provider/accommodations/:id`
- `GET/POST/PUT/DELETE /provider/accommodations/:id/rooms`
- `POST /provider/accommodations/:id/images`
- Room availability management endpoints

### 5. Also fix tours first

Before accommodations, complete the tour CRUD gap:

- Add `PUT /provider/tours/:id` (edit)
- Add `DELETE /provider/tours/:id` (archive/delete)
- Add `POST /provider/tours/:id/images` (gallery management)
- Add departure creation endpoints
- Wire images into the create/edit flow

### 6. Clean up dead code

Delete `ServiceForm.tsx` and `BusinessProfileForm.tsx` now. They add confusion and will never be used.

### Recommended implementation order

1. Plan accommodation architecture
2. Fix tour CRUD gaps
3. Build accommodation CRUD
4. Build accommodation wizard UI
5. Build room management
6. Build availability calendar
