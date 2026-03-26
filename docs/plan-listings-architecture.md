# Provider Listings Architecture Plan

**Date:** March 23, 2026
**Prerequisite:** [Accommodation Readiness Audit](./audit-accommodation-readiness.md)

---

## 1. Immediate Cleanup Actions (Done)

### Files deleted

| File | Reason |
|------|--------|
| `components/dashboard/forms/ServiceForm.tsx` | Dead mock. Used fake `Service` type from mock data. Never imported by any page. |
| `components/dashboard/forms/BusinessProfileForm.tsx` | Dead mock. Hardcoded "We Mongolia Tours" data. Replaced by real `settings/page.tsx`. |
| `components/dashboard/domain/ServiceCard.tsx` | Dead mock. Depended on deleted `Service` type. Never imported by any page. |
| `lib/mock-data/services.ts` | Dead data. Only imported by the deleted mock components above. |

### Menu/nav fixes

| Change | Detail |
|--------|--------|
| Sidebar label renamed | "Services" → "Listings" in `lib/provider-menu.ts` to accurately reflect the page purpose |
| `buildProviderMenu()` | Cleaned up to prepare for future type-aware sub-navigation. Currently returns core items for all providers. When sub-routes are added, this function will filter by `providerTypes`. |

### Services page honesty fixes

| Change | Detail |
|--------|--------|
| Page title | "Services" → "Listings" |
| Scope notice | Added visible banner: "Tours — Currently showing tour listings. Accommodation and vehicle management coming soon." |
| Empty state copy | Updated to be clearer about creating a tour specifically |
| Overview quick action | "Add Listing" → "Add Tour" to match what it actually does |

---

## 2. Proposed Listings Route Architecture

### Design decision: type-specific sub-routes

The listings area should use **type-specific management areas**, not one flat universal page. Each listing type (tours, accommodations, vehicles) has fundamentally different data shapes, creation flows, and management needs.

### Route structure

```
/dashboard/business/services                   → Listings hub (type selector + summary)
/dashboard/business/services/tours             → Tour list + create/edit
/dashboard/business/services/tours/[id]        → Tour detail/edit (future)
/dashboard/business/services/accommodations    → Accommodation list + create
/dashboard/business/services/accommodations/[id]          → Property detail/edit
/dashboard/business/services/accommodations/[id]/rooms    → Room type management
/dashboard/business/services/vehicles          → Vehicle list + create (future)
```

### Hub page (`/dashboard/business/services`)

This page acts as a **listing type router**. It should:

1. Show the provider's business types (from `provider.providerTypes`)
2. Display a card/tile for each supported type with:
   - Type name and icon
   - Count of existing listings of that type
   - Status summary (e.g., "3 active, 1 draft")
   - "Manage" button linking to the sub-route
3. For types the provider hasn't registered for, show a disabled card with "Not part of your business type" or a way to add it
4. Never show a creation form directly — it links to the type-specific sub-route

**Example layout:**

```
┌──────────────────────────────────────────────────┐
│  Listings                                        │
│  Manage everything travelers can discover         │
│                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────┐ │
│  │ 🗺️ Tours    │  │ 🏕️ Stays   │  │ 🚐 Cars  │ │
│  │ 4 listings  │  │ 0 listings  │  │ —        │ │
│  │ 3 active    │  │ Get started │  │ (not set │ │
│  │ [Manage →]  │  │ [Create →]  │  │  up)     │ │
│  └─────────────┘  └─────────────┘  └──────────┘ │
└──────────────────────────────────────────────────┘
```

### What each sub-route owns

| Route | Owns |
|-------|------|
| `/services/tours` | Tour list, create panel, (future: edit, delete, image management, departure management) |
| `/services/accommodations` | Property list, create wizard, property detail, room type CRUD, (future: availability calendar) |
| `/services/vehicles` | Vehicle list, create form (future phase) |

### Migration path

1. Current `services/page.tsx` becomes the tours sub-route content (move existing tour code to `/services/tours/page.tsx`)
2. New `services/page.tsx` becomes the hub page
3. Add `/services/accommodations/page.tsx` when accommodation CRUD is built
4. Vehicles deferred to a later phase

---

## 3. Tour Completion Roadmap

Before building accommodations, tours need to become fully operational. A provider must be able to create a complete, bookable tour.

### Missing pieces

| Feature | Priority | Backend | Frontend |
|---------|----------|---------|----------|
| **Edit tour** | P0 | `PUT /provider/tours/:id` with validation | Edit form (reuse CreateTourPanel with pre-filled values) |
| **Delete/archive tour** | P0 | `DELETE /provider/tours/:id` (soft-delete: set status → `archived`) | Confirmation dialog + remove from list |
| **Tour images** | P0 | `POST/DELETE /provider/tours/:id/images` (uses Cloudinary media API) | Wire `MultiImageUpload` into create/edit flow |
| **Tour departures** | P1 | `GET/POST/PUT/DELETE /provider/tours/:id/departures` | Departure list + create form (date, seats, price override) |
| **Publish readiness** | P1 | Validation function: tour must have title, description ≥ 50 chars, ≥ 1 image, basePrice > 0 to be "active" | Warning banner on tours missing requirements |
| **Itinerary** | P2 | `POST/PUT/DELETE /provider/tours/:id/itinerary` (day-by-day) | Day editor UI |
| **Included/excluded items** | P2 | `POST/DELETE /provider/tours/:id/includes`, `/excludes` | Tag-style editor |

### Tour publish readiness rules

A tour should only be allowed to go "active" if:

- `title` is set and ≥ 2 characters
- `description` is set and ≥ 50 characters
- `basePrice` > 0
- At least 1 image exists
- At least 1 scheduled departure exists (P1 — enforce after departures are built)

If a provider tries to set status to "active" without meeting these, the backend should return a 400 with a clear message listing what's missing.

### Recommended build order for tours

1. Edit tour endpoint + frontend form
2. Archive/delete tour
3. Tour image management (connect `MultiImageUpload`)
4. Tour departure CRUD
5. Publish readiness enforcement
6. Itinerary and includes/excludes (lower priority)

---

## 4. Accommodation Wizard Architecture

### Overview

Accommodation creation is a **multi-step wizard**, not a flat form. A property has nested entities (room types, availability) that require dedicated management after initial creation.

### Creation flow (multi-step wizard)

```
Step 1: Property basics
  → name, accommodationType, description, destination
  → address, city, region (NEW fields — need schema migration)

Step 2: Amenities & policies
  → property-level amenities (multi-select tags)
  → check-in time, check-out time
  → cancellation policy (text)
  → star rating (optional, 1–5)

Step 3: Room types
  → add at least 1 room type
  → per room: name, description, maxGuests, bedType, quantity, basePricePerNight, amenities
  → can add multiple room types
  → each room type gets its own card

Step 4: Images
  → property-level images (MultiImageUpload, min 1 required)
  → (future: per-room-type images)

Step 5: Review & save
  → summary of all entered data
  → readiness checklist showing what's complete/missing
  → save as draft or publish
```

### After creation: property management

Once a property is created, the provider manages it from `/services/accommodations/[id]` which shows:

1. **Property overview** — name, type, status, image, description
2. **Room types tab** — list of rooms, add/edit/delete
3. **Availability tab** — calendar grid showing room availability per date (future phase)
4. **Images tab** — manage property gallery
5. **Settings** — edit property details, policies, amenities

### Room type management flow

From the property detail page, providers can:

- **Add room type**: name, description, max guests, bed type, quantity (how many of this room), price per night, room amenities
- **Edit room type**: same form, pre-filled
- **Delete room type**: confirmation dialog, only if no active bookings reference it
- **Set room availability** (future): calendar UI showing available/blocked dates per room type

### Availability/calendar flow (future phase)

This is the most complex piece and should be deferred until property + room CRUD is solid.

When built, it should:

- Show a calendar grid with dates as columns and room types as rows
- Each cell shows: available units, booked units, price override (if any)
- Provider can bulk-set availability for date ranges
- Provider can block dates (maintenance, seasonal closure)
- Default: all units available at base price

**Data flow:**
- `RoomAvailability` stores per-date records
- If no record exists for a date, the system assumes the room type's `quantity` units are all available at `basePricePerNight`
- Explicit records only needed for overrides (price changes, blocks, sold-out)

### Accommodation publish readiness rules

A property should only go "active" if:

- `name` is set and ≥ 2 characters
- `description` is set and ≥ 50 characters
- `accommodationType` is set
- At least 1 room type exists with `basePricePerNight` > 0
- At least 1 image exists
- `checkInTime` and `checkOutTime` are set

### Backend API surface for accommodations

```
# Property CRUD
GET    /provider/accommodations                    → list provider's properties
POST   /provider/accommodations                    → create property
GET    /provider/accommodations/:id                → get property detail
PUT    /provider/accommodations/:id                → update property
DELETE /provider/accommodations/:id                → archive property (status → archived)

# Property images
POST   /provider/accommodations/:id/images         → add images
DELETE /provider/accommodations/:id/images/:imageId → remove image

# Room type CRUD
GET    /provider/accommodations/:id/rooms          → list room types
POST   /provider/accommodations/:id/rooms          → create room type
PUT    /provider/accommodations/:id/rooms/:roomId  → update room type
DELETE /provider/accommodations/:id/rooms/:roomId  → delete room type

# Room availability (future phase)
GET    /provider/accommodations/:id/rooms/:roomId/availability?from=&to= → get availability
PUT    /provider/accommodations/:id/rooms/:roomId/availability           → bulk set availability
```

---

## 5. Schema Changes Still Needed

### Must do before accommodation CRUD

| Model | Change | Reason |
|-------|--------|--------|
| `Accommodation` | Add `address String?` | Per-property address (provider may have multiple locations) |
| `Accommodation` | Add `city String?` | Per-property city |
| `Accommodation` | Add `region String?` | Per-property region |
| `Accommodation` | Add `latitude Float?` | Map positioning |
| `Accommodation` | Add `longitude Float?` | Map positioning |
| `AccommodationType` enum | Add `hostel`, `homestay` | Real accommodation types missing from current enum |

### Should do (but not blocking)

| Model | Change | Reason |
|-------|--------|--------|
| `RoomTypeImage` (new model) | `id`, `roomTypeId`, `imageUrl`, `publicId`, `altText`, `sortOrder` | Per-room-type photos. Currently images are property-level only. Can defer to a later phase. |
| `Tour` | Add `publishedAt DateTime?` | Track when a tour was first published. Useful for readiness flow. |
| `Accommodation` | Add `publishedAt DateTime?` | Same as above. |

### Not needed yet

- Seasonal pricing model — can be done via `RoomAvailability.priceOverride` for now
- Dynamic pricing engine — way too early
- Multi-currency per room — `RoomType.currency` already exists

---

## 6. What Should Be Built First vs Postponed

### Phase A — Tour CRUD completion (build now)

| Item | Effort |
|------|--------|
| `PUT /provider/tours/:id` (edit) | Small |
| `DELETE /provider/tours/:id` (archive) | Small |
| Tour image endpoints + wire `MultiImageUpload` | Medium |
| Edit tour frontend (reuse create panel) | Medium |
| Tour departure CRUD (backend + simple frontend) | Medium |
| Publish readiness validation | Small |
| Refactor services page → hub + `/services/tours` sub-route | Medium |

**Total: ~1 focused sprint**

### Phase B — Accommodation CRUD (build next)

| Item | Effort |
|------|--------|
| Schema migration (address fields + enum extension) | Small |
| Accommodation CRUD endpoints (backend) | Medium |
| Room type CRUD endpoints (backend) | Medium |
| Accommodation image endpoints | Small (reuse tour pattern) |
| Hub page (`/services` with type cards) | Medium |
| Accommodation list page (`/services/accommodations`) | Medium |
| Accommodation create wizard (5-step) | Large |
| Property detail/edit page | Medium |
| Room type management UI | Medium |
| Publish readiness validation | Small |

**Total: ~2 focused sprints**

### Phase C — Availability & calendar (build later)

| Item | Effort |
|------|--------|
| Room availability endpoints | Medium |
| Calendar grid UI component | Large |
| Bulk availability setting | Medium |
| Date-based pricing overrides | Medium |

**Total: ~1 focused sprint**

### Deferred (not now)

| Item | Reason |
|------|--------|
| Vehicle provider CRUD | Lower priority — fewer providers, simpler model, do after accommodations |
| Itinerary editor for tours | Nice-to-have, tours work without it |
| Room-type-level images | Property-level images are sufficient for MVP |
| Seasonal pricing engine | `priceOverride` on availability records covers this for now |
| Multi-property provider dashboard | Only matters if providers have 5+ properties — defer until needed |

---

## Summary

The recommended build order is:

1. **Phase A:** Complete tour CRUD → make tours fully operational and bookable
2. **Phase B:** Build accommodation CRUD → property + room types + images
3. **Phase C:** Add availability calendar → make accommodations bookable
4. **Later:** Vehicle management, itinerary editor, advanced pricing

Each phase should be audited before proceeding to the next.
