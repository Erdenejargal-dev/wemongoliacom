# Accommodation Implementation Plan

**Date:** March 23, 2026  
**Revised:** March 23, 2026 (UX-safe refinement pass)  
**Prerequisite:** [Accommodation Readiness Audit](./audit-accommodation-readiness.md), [Listings Architecture Plan](./plan-listings-architecture.md)

---

## 1. Accommodation Product Model

### What an accommodation is

An **accommodation** is a property (ger camp, hotel, lodge, guesthouse, resort) that a provider lists on WeMongolia. Unlike tours (which are event-based with departure dates), accommodations are **inventory-based**: travelers pick dates and the system checks if a room is available for every night of their stay.

### Core entities

```
Provider
  └── Accommodation (the property)
        ├── AccommodationImage[] (property-level gallery)
        ├── amenities: ["wifi", "parking", "restaurant"]        ← PROPERTY-level
        ├── RoomType[] (e.g., "Standard Ger", "Deluxe Room")
        │     ├── quantity: 5
        │     ├── basePricePerNight: 80
        │     ├── maxGuests: 2
        │     ├── amenities: ["heating", "private_bathroom"]    ← ROOM-level
        │     └── RoomAvailability[] (per-date overrides)
        │           ├── date: 2026-07-15
        │           ├── availableUnits: 3 (of 5 remaining)
        │           ├── bookedUnits: 2
        │           ├── priceOverride: 120 (high season)
        │           └── status: available | sold_out | blocked
        └── (future: Reviews, Policies)
```

### Amenity separation (strict rule)

Property amenities and room amenities serve different purposes and must never be mixed in UI or data handling.

**Property-level amenities** describe the facility:
`wifi`, `parking`, `restaurant`, `bar`, `laundry`, `airport_shuttle`, `24h_reception`, `luggage_storage`, `garden`, `terrace`, `campfire_area`, `horse_stable`

**Room-level amenities** describe what's inside the room:
`heating`, `air_conditioning`, `private_bathroom`, `shared_bathroom`, `hot_water`, `tv`, `minibar`, `safe`, `hair_dryer`, `extra_bedding`, `balcony`, `mountain_view`, `river_view`

Both are stored as `String[]` on their respective models (`Accommodation.amenities` and `RoomType.amenities`). The frontend must present them in separate labeled sections with distinct preset lists. A shared constants file (`lib/constants/amenities.ts`) will define both lists so they stay synchronized between forms and display.

### Inventory model: room-type-based, not room-number

For MVP, we track **how many units of each room type are available on each date**, not individual room numbers. This is the same model Booking.com and Airbnb use for multi-unit properties.

**Why this is correct for WeMongolia:**
- Ger camps often have 10–30 identical gers — tracking individual ger numbers adds complexity with no traveler value
- Hotels have room types (Standard, Deluxe, Suite), not individually named rooms
- The schema already models this correctly with `RoomType.quantity` and `RoomAvailability`

### How availability works

For any given night:
1. If a `RoomAvailability` record exists for that `(roomTypeId, date)`: use its `availableUnits` and `bookedUnits`
2. If no record exists: assume all units are available at base price — `availableUnits = roomType.quantity`, `bookedUnits = 0`, `price = roomType.basePricePerNight`

This means:
- **By default, all rooms are available** — no need to populate 365 rows per room type
- Providers only create `RoomAvailability` records when they need to override: raise prices for high season, block dates for maintenance, mark as sold out
- The booking system `upsertRoomAvailability` handles incrementing `bookedUnits` atomically

---

## 2. Provider Workflow

### 2a. Creating an accommodation (multi-step wizard)

The wizard is the core UX. It should feel like a guided flow, not a flat form.

#### Step 1: Property basics
- Property name (required)
- Accommodation type (ger_camp, hotel, lodge, guesthouse, resort, hostel, homestay)
- Destination (dropdown, optional but recommended)
- Short description

**Why first:** Identity. The provider names their property and picks a type. This drives the rest of the experience.

#### Step 2: Details & policies
- Full description (min 50 chars for publish)
- Check-in time (e.g., "14:00")
- Check-out time (e.g., "12:00")
- Cancellation policy (free text for MVP)
- Star rating (optional, 1–5)
- **Property-level amenities** (multi-select from `PROPERTY_AMENITIES` preset list)

**Important:** This step shows ONLY property-level amenities. The label must say "Property amenities" or "Facility amenities" — never just "Amenities." Room amenities are added per room type in Step 3.

**Why second:** Once the property is named, the provider fills in operational details they already know.

#### Step 3: Room types — "Room type builder"

This step must NOT become a giant nested form. It is a **list-based builder** pattern:

**Initial state (no room types yet):**
```
┌──────────────────────────────────────────────┐
│  🛏  Add your first room type                │
│                                              │
│  Define the types of rooms or gers           │
│  available at your property.                 │
│                                              │
│  [ + Add room type ]                         │
└──────────────────────────────────────────────┘
```

**After adding one or more room types:**
```
┌──────────────────────────────────────────────┐
│  Room types (2)                              │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Standard Ger                    [Edit] │  │
│  │ 👥 2 guests · 🛏 Double · 20 units   │  │
│  │ $80 / night                  [Remove] │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │ Deluxe Suite                    [Edit] │  │
│  │ 👥 4 guests · 🛏 Family · 5 units    │  │
│  │ $220 / night                 [Remove] │  │
│  └────────────────────────────────────────┘  │
│                                              │
│  [ + Add another room type ]                 │
└──────────────────────────────────────────────┘
```

**"Add room type" opens a focused slide-over panel** (not inline expansion):
- Room type name (required)
- Description (optional, short)
- Max guests (number input, default 2)
- Bed type (select: Single, Double, Twin, Family, Bunk)
- Quantity — how many of this type (number input, default 1)
- Base price per night (required)
- Currency (default USD)
- **Room-level amenities** (multi-select from `ROOM_AMENITIES` preset list)

The slide-over has "Save room type" and "Cancel" buttons. On save, the room type appears in the list. On cancel, nothing is saved.

**Edit** reopens the same slide-over pre-filled. **Remove** shows a confirmation prompt.

**Why a slide-over, not inline:** Inline nested forms create deep vertical scrolling and make the step feel overwhelming. A slide-over keeps the main step clean, lets the provider focus on one room type at a time, and scales to 10+ room types without layout degradation.

**Data during wizard:** Room types are held in local state as an array. They are saved to the backend either when the wizard completes (Step 5) or after the property is created (each room type via `POST /provider/accommodations/:id/rooms`). Recommended approach: create the accommodation in draft on Step 5, then immediately batch-create room types via API. This avoids complex client-side orchestration.

#### Step 4: Images
- Property gallery (MultiImageUpload, min 1 required for publish)
- Future: per-room-type images (not in MVP)

**Why last before review:** Images are the most effort-intensive step. By this point the provider has committed to the listing.

#### Step 5: Review & save
- Summary of all entered data grouped by step
- Readiness checklist (green check / red x for each requirement)
- "Save as draft" (always available) or "Publish" (only if all readiness rules pass)
- If readiness fails, show which items need attention with links back to the relevant step

### 2b. Managing an existing accommodation — unified tabbed page

After creation, the provider manages the property from a **single page with tabs**:

```
/dashboard/business/services/accommodations/[id]

┌─────────────────────────────────────────────────────────┐
│  ← Back to Accommodations                               │
│                                                         │
│  Three Camel Lodge - Gobi          [Draft ▾] [Archive]  │
│  Ger camp · South Gobi                                  │
│                                                         │
│  ┌─────────┬────────────┬──────────┬────────┐          │
│  │Overview │ Room Types │ Calendar │ Images │          │
│  └─────────┴────────────┴──────────┴────────┘          │
│                                                         │
│  [ ... active tab content ... ]                         │
└─────────────────────────────────────────────────────────┘
```

**Why a unified tabbed page instead of separate sub-routes:**
- The provider manages ONE property. Fragmenting into `/rooms`, `/calendar`, `/images` as separate pages creates unnecessary navigation and loses context (the provider forgets which property they're editing).
- Tabs keep all management in one place, matching how providers think: "I'm working on my property."
- The URL stays at `/accommodations/[id]` with optional `?tab=rooms` query params or hash-based tab state. This means one page component with tab switching — simpler to build, simpler to maintain.
- For the calendar tab specifically, it may be heavy enough to warrant lazy-loading its content, but it still belongs as a tab on this page.

**Separate sub-routes would only make sense** if the calendar or room type UIs became so complex they needed their own full-page layout. For MVP, tabs are better.

**Overview tab:**
- Edit all property fields from wizard steps 1–2
- Status controls (draft / active / paused / archived)
- Readiness banner showing missing requirements
- Property-level amenities editor (same preset multi-select)

**Room Types tab:**
- Same list-based builder pattern as wizard Step 3
- Room type cards with Edit (slide-over) and Remove
- "+ Add room type" button
- Each card shows: name, capacity, bed type, quantity, price, room amenities count
- Delete is guarded: if any active bookings reference this room type, show warning and block deletion

**Calendar tab:**
- Month view calendar grid
- Rows = room types, columns = dates
- Each cell shows: `available/total` and price (if overridden)
- Click a cell or select a date range to set price override, block, or unblock
- Color-coded: green (available), amber (low), red (sold out), gray (blocked)
- This is the most complex UI piece and is built in Phase 2

**Images tab:**
- Property gallery with MultiImageUpload
- Drag to reorder (sortOrder)
- Remove individual images

### 2c. Publish readiness rules

A property can only be set to `active` if ALL of:
- Name is set (≥ 2 chars)
- Description is set (≥ 50 chars)
- Accommodation type is set
- Check-in time and check-out time are set
- At least 1 room type exists with `basePricePerNight > 0` and `maxGuests ≥ 1`
- At least 1 image exists

**Readiness is checked:**
- On the review step of the wizard
- On the overview tab of the management page
- Server-side when attempting to set `status: 'active'`

---

## 3. Traveler Workflow

### 3a. Search & discovery

Travelers find accommodations through:
1. **Explore page** — browse stays filtered by destination, type, dates, guests, price
2. **Search** — `GET /search?type=accommodation` or `GET /stays`
3. **Destination page** — accommodations in a specific region

The list card shows: cover image, property name, type badge, star rating, review score, "from $X / night" starting price, destination name.

### 3b. Property detail page (`/stays/[slug]`)

Layout: left content + right booking card (same two-column pattern as tour detail).

**Left column:**
- Image gallery (property images, swipeable on mobile)
- Property name, type badge, destination, star rating, review count
- Description
- **Property amenities** section (labeled "Property amenities" or "What this place offers")
- Check-in / check-out times
- Cancellation policy
- **Room types section** — scrollable list of room cards (always visible, not gated by date selection):

  Each room card in the left column shows:
  ```
  ┌────────────────────────────────────────────────────────┐
  │  Standard Ger                                          │
  │  👥 Up to 2 guests  ·  🛏 Double bed                  │
  │                                                        │
  │  Room amenities: Heating · Hot water · Private bathroom│
  │                                                        │
  │  From $80 / night                                      │
  └────────────────────────────────────────────────────────┘
  ```

  These are informational only — the actual booking happens through the right-column booking card.

**Right column (sticky booking card):**

The booking card is the core booking UX. It has 3 progressive states:

**State 1 — No dates selected:**
```
┌──────────────────────────────────┐
│  Check-in        Check-out       │
│  [Add date]      [Add date]      │
│                                  │
│  Guests                          │
│  [2 guests         ▾]           │
│                                  │
│  Select dates to see             │
│  available rooms and pricing.    │
└──────────────────────────────────┘
```

**State 2 — Dates selected, choose a room:**
```
┌──────────────────────────────────┐
│  Jul 1 → Jul 5    (4 nights)    │
│  [Change dates]                  │
│                                  │
│  2 guests                        │
│                                  │
│  ── Available rooms ──           │
│                                  │
│  ┌──────────────────────────┐   │
│  │ Standard Ger             │   │
│  │ 👥 2 guests · 🛏 Double │   │
│  │ Heating · Hot water      │   │
│  │                          │   │
│  │ $80 avg/night            │   │
│  │ $320 total for 4 nights  │   │
│  │                          │   │
│  │ 🔥 Only 2 left           │   │
│  │                          │   │
│  │      [ Select ]          │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ Deluxe Suite             │   │
│  │ 👥 4 guests · 🛏 Family │   │
│  │ AC · Minibar · Balcony   │   │
│  │                          │   │
│  │ $220 avg/night           │   │
│  │ $880 total for 4 nights  │   │
│  │                          │   │
│  │      [ Select ]          │   │
│  └──────────────────────────┘   │
│                                  │
│  ┌──────────────────────────┐   │
│  │ Family Ger          SOLD │   │
│  │ No availability for      │   │
│  │ selected dates           │   │
│  └──────────────────────────┘   │
└──────────────────────────────────┘
```

**State 3 — Room selected, confirm booking:**
```
┌──────────────────────────────────┐
│  Jul 1 → Jul 5    (4 nights)    │
│  2 guests                        │
│                                  │
│  Standard Ger         [Change]   │
│                                  │
│  ── Price breakdown ──           │
│  $80 × 4 nights         $320    │
│  Service fee              $16    │
│  ─────────────────────────────   │
│  Total                   $336    │
│                                  │
│  [ Reserve ]                     │
└──────────────────────────────────┘
```

**Room card UX rules (booking card, State 2):**
- Cards are vertically stacked, not a table or a raw list
- Each card is a self-contained unit with clear visual boundaries (border, rounded corners, padding)
- Show room name prominently, then capacity + bed type on one line
- Show up to 3 room-level amenities inline (overflow as "+N more")
- Price display: if all nights are the same price → "$80 / night"; if prices vary across the stay → "$110 avg / night" with the total below
- Total always shown as "$X total for N nights"
- Low-availability cue: if `remainingUnits ≤ 3` → show "Only N left" in amber/red text
- Sold-out rooms: show the card grayed out with "No availability for selected dates" — don't hide them entirely (it shows the property has more to offer and creates urgency)
- "Select" button is a contained primary-style button within each card
- After selection, the card list collapses and the selected room is shown as a summary with a "Change" link

### 3c. Checkout flow

Same checkout page as tours, with accommodation-specific URL params:
- `listingType=accommodation`
- `listingId=<accommodation.id>`
- `roomTypeId=<selected room type id>`
- `checkIn=2026-07-01`
- `checkOut=2026-07-05`
- `guests=2`

The booking service already handles this — `checkRoomAvailability` validates every night, `upsertRoomAvailability` atomically decrements units inside a transaction.

### 3d. Availability display logic

For the traveler booking card, when dates are selected:

```
For each room type where maxGuests >= requested guests:
  For each night in [checkIn, checkOut):
    1. Look up RoomAvailability(roomTypeId, date)
    2. If exists: remaining = availableUnits - bookedUnits
    3. If not exists: remaining = roomType.quantity (all available)
    4. If remaining < 1 on ANY night → room type is unavailable (sold out)
    5. Price for that night = priceOverride ?? roomType.basePricePerNight
  
  minRemaining = minimum remaining across all nights (drives "Only N left")
  Total = sum of nightly prices
  AvgPerNight = Total / nightCount
  
  Sort: available rooms first (by price asc), then sold-out rooms
```

---

## 4. Calendar / Availability Design

### 4a. Provider calendar UX

The calendar is the most complex piece. It should feel like a real property management tool.

**Layout:** Monthly grid view.
- Top: month navigation (← prev / next →), today button
- Left column: room type names (sticky)
- Grid: one column per day, one row per room type
- Each cell shows: `available/total` and price (if overridden)

**Interactions:**
- **Click a single cell:** open a popover to set price override or block/unblock
- **Drag to select a range:** apply an action to multiple dates at once
- **Bulk actions:** "Set price for July 1–15" or "Block August 3–10"

**Color coding:**
- Green: fully available (remaining = total)
- Amber: partially booked (0 < remaining < total)
- Red: sold out (remaining = 0)
- Gray: blocked by provider

**Data flow:**
- Load: `GET /provider/accommodations/:id/calendar?from=2026-07-01&to=2026-07-31`
- Returns: room types array + availability records for the date range
- For dates with no explicit `RoomAvailability` record, the frontend fills in defaults from `roomType.quantity` and `roomType.basePricePerNight`

**Write operations:**
- `PUT /provider/accommodations/:id/calendar` with body:
  ```json
  {
    "roomTypeId": "...",
    "dates": ["2026-07-01", "2026-07-02", "2026-07-03"],
    "action": "set_price" | "block" | "unblock" | "set_available_units",
    "value": 120
  }
  ```
  This bulk-upserts `RoomAvailability` records.

**Guard:** `set_available_units` must never set `availableUnits` below `bookedUnits` for any date. The backend rejects this with a 400 error, same as the tour departure seat guard.

### 4b. Traveler availability API

For the traveler booking card:
- `GET /stays/:slug/availability?checkIn=2026-07-01&checkOut=2026-07-05&guests=2`
- Returns: array of room types with per-night availability and pricing
  ```json
  [
    {
      "roomType": {
        "id": "...",
        "name": "Standard Ger",
        "maxGuests": 2,
        "bedType": "Double",
        "amenities": ["heating", "hot_water", "private_bathroom"]
      },
      "available": true,
      "minRemaining": 2,
      "nights": [
        { "date": "2026-07-01", "price": 80, "remaining": 3 },
        { "date": "2026-07-02", "price": 120, "remaining": 2 },
        { "date": "2026-07-03", "price": 120, "remaining": 2 },
        { "date": "2026-07-04", "price": 80, "remaining": 4 }
      ],
      "totalPrice": 400,
      "avgPricePerNight": 100
    },
    {
      "roomType": { "id": "...", "name": "Family Ger", "maxGuests": 4, "bedType": "Family", "amenities": [] },
      "available": false,
      "minRemaining": 0,
      "nights": [],
      "totalPrice": 0,
      "avgPricePerNight": 0
    }
  ]
  ```

This endpoint computes availability from `RoomAvailability` records + defaults, filtered to room types that fit the guest count. Unavailable room types are included with `available: false` so the frontend can render sold-out cards.

### 4c. Why not individual room numbers?

Individual rooms (Room 101, Ger #7) add complexity:
- Assignment logic (which specific room?)
- Room-level status tracking
- Housekeeping/maintenance per room
- No traveler value (travelers don't care about room numbers)

For MVP, **room-type-based inventory is correct**. If needed later, individual room assignment can be layered on top (the `quantity` field becomes "how many rooms of this type exist" and a separate `Room` model can track assignments).

---

## 5. Route / Page Architecture

### Provider routes

```
/dashboard/business/services                              → Listings hub (type cards: Tours, Accommodations, Vehicles)
/dashboard/business/services/tours                        → Tour list (existing)
/dashboard/business/services/tours/[id]                   → Tour detail (existing)
/dashboard/business/services/accommodations               → Accommodation list
/dashboard/business/services/accommodations/new           → Create wizard (steps 1–5)
/dashboard/business/services/accommodations/[id]          → Unified management page (tabs: Overview, Room Types, Calendar, Images)
```

**No separate sub-routes** for `/[id]/rooms`, `/[id]/calendar`, `/[id]/images`. All management happens within the single `[id]` page via client-side tabs. Tab state is preserved in the URL as `?tab=rooms` for shareability and back-button support.

### Provider API routes

```
# Property CRUD
GET    /provider/accommodations                    → list provider's properties
POST   /provider/accommodations                    → create property (draft)
GET    /provider/accommodations/:id                → get property detail + readiness + room types
PUT    /provider/accommodations/:id                → update property fields
DELETE /provider/accommodations/:id                → archive (status → archived)

# Property images
POST   /provider/accommodations/:id/images         → add images (batch metadata)
DELETE /provider/accommodations/:id/images/:imgId   → remove image

# Room type CRUD
GET    /provider/accommodations/:id/rooms          → list room types (with booking counts)
POST   /provider/accommodations/:id/rooms          → create room type
PUT    /provider/accommodations/:id/rooms/:roomId  → update room type
DELETE /provider/accommodations/:id/rooms/:roomId  → delete room type (guard: no active bookings)

# Calendar / availability (Phase 2)
GET    /provider/accommodations/:id/calendar       → get availability grid (date range)
PUT    /provider/accommodations/:id/calendar       → bulk-set availability (price/block/unblock)
```

### Public (traveler) routes

```
/stays                         → Accommodation list page (browse/filter)
/stays/[slug]                  → Property detail page
/checkout                      → Same checkout page (already supports accommodation)
```

### Public API routes

```
GET /stays                                                 → list accommodations (existing)
GET /stays/:slug                                           → property detail (existing)
GET /stays/:slug/availability?checkIn=&checkOut=&guests=   → room availability (new)
```

---

## 6. Existing Schema Support

### What already exists and works

| Component | Status | Notes |
|-----------|--------|-------|
| `Accommodation` model | ✅ Complete | name, slug, type, description, amenities, checkIn/Out, cancellation, starRating, status, destination FK |
| `AccommodationImage` model | ✅ Complete | Cloudinary-ready (publicId, width, height, format, bytes), sortOrder |
| `RoomType` model | ✅ Complete | name, description, maxGuests, bedType, quantity, basePricePerNight, currency, amenities |
| `RoomAvailability` model | ✅ Complete | roomTypeId+date unique, availableUnits, bookedUnits, priceOverride, status |
| `AccommodationType` enum | ✅ | ger_camp, hotel, lodge, guesthouse, resort |
| `RoomAvailabilityStatus` enum | ✅ | available, sold_out, blocked |
| `ListingStatus` enum | ✅ | draft, active, paused, archived |
| `Booking` model | ✅ | roomTypeId FK, listingType='accommodation', startDate/endDate/nights/guests |
| Public list endpoint | ✅ | `GET /stays` with date/guest/amenity filtering |
| Public detail endpoint | ✅ | `GET /stays/:slug` includes room types + 60-day availability |
| Booking creation | ✅ | `checkRoomAvailability` validates all nights, `upsertRoomAvailability` atomically books |
| Booking cancellation | **🔴 BROKEN** | Cancels booking but does NOT release `RoomAvailability.bookedUnits` — **P0 blocker** |

### What is well-structured

The existing `RoomAvailability` design with `@@unique([roomTypeId, date])` is exactly right for a room-type-based inventory model. The "no record = fully available at base price" default is also correct and keeps the table small.

---

## 7. Missing Schema / Backend Pieces

### Schema additions needed

| Model | Field | Type | Purpose |
|-------|-------|------|---------|
| `Accommodation` | `address` | `String?` | Street address for map display |
| `Accommodation` | `city` | `String?` | City name |
| `Accommodation` | `region` | `String?` | Region/province |
| `Accommodation` | `latitude` | `Float?` | Map marker |
| `Accommodation` | `longitude` | `Float?` | Map marker |
| `AccommodationType` enum | `hostel` | new value | Common accommodation type missing |
| `AccommodationType` enum | `homestay` | new value | Common for Mongolia |

### Backend services needed

**Provider accommodation service** (entirely new):

| Function | Purpose |
|----------|---------|
| `listProviderAccommodations(ownerUserId)` | List this provider's properties |
| `createProviderAccommodation(ownerUserId, input)` | Create property + slug |
| `getProviderAccommodationDetail(ownerUserId, accId)` | Detail + readiness + room types |
| `updateProviderAccommodation(ownerUserId, accId, input)` | Update property fields |
| `archiveProviderAccommodation(ownerUserId, accId)` | Soft-delete |
| `addAccommodationImages(ownerUserId, accId, images)` | Add images to gallery |
| `removeAccommodationImage(ownerUserId, accId, imageId)` | Remove image |
| `listRoomTypes(ownerUserId, accId)` | List room types with active booking counts |
| `createRoomType(ownerUserId, accId, input)` | Create room type |
| `updateRoomType(ownerUserId, accId, roomId, input)` | Update room type |
| `deleteRoomType(ownerUserId, accId, roomId)` | Delete room type (guard: no active bookings) |
| `getCalendar(ownerUserId, accId, from, to)` | Get availability grid (Phase 2) |
| `bulkSetAvailability(ownerUserId, accId, input)` | Bulk update availability (Phase 2) |
| `checkAccommodationReadiness(accId)` | Readiness check |

**Public availability endpoint** (new):

| Function | Purpose |
|----------|---------|
| `getAvailability(slug, checkIn, checkOut, guests)` | Compute per-room-type availability for dates |

### P0 booking service fix — accommodation cancellation

**The bug:** `cancelBooking` (line 496–517 of `booking.service.ts`) only handles tour departure seat release. For accommodation bookings, it does NOT decrement `RoomAvailability.bookedUnits` for the booked nights. This means cancelled accommodation bookings permanently reduce available inventory — rooms that should become free again remain "booked" in the availability system.

**The fix:** Inside the `cancelBooking` transaction, after the tour departure branch, add:

```
if (booking.listingType === 'accommodation' && booking.roomTypeId && booking.startDate && booking.endDate) {
  for each night in [booking.startDate, booking.endDate):
    upsert RoomAvailability(roomTypeId, date) → decrement bookedUnits by 1 (floor at 0)
}
```

**This must be fixed BEFORE any traveler-facing accommodation UI ships.** It is moved to Phase 0 in the build order below.

---

## 8. Recommended MVP Scope — Updated Build Order

### Phase 0: Booking integrity fix (build FIRST, before anything else)

| Item | Effort | Priority |
|------|--------|----------|
| Fix `cancelBooking` to release `RoomAvailability.bookedUnits` for accommodation cancellations | Small | **P0 BLOCKER** |

This is a 20-line fix inside an existing transaction. It must ship before any new accommodation UI to prevent inventory corruption from day one.

### Phase 1: Provider CRUD (build second)

| Item | Effort | Priority |
|------|--------|----------|
| Schema migration (address/location fields, enum additions) | Small | P0 |
| Amenity constants file (`lib/constants/amenities.ts`) | Small | P0 |
| Provider accommodation CRUD endpoints (service + controller + routes) | Medium | P0 |
| Accommodation image endpoints (reuse tour pattern) | Small | P0 |
| Room type CRUD endpoints | Medium | P0 |
| Publish readiness validation | Small | P0 |
| Frontend: Listings hub page (type selector cards) | Medium | P0 |
| Frontend: Accommodation list page | Medium | P0 |
| Frontend: Create wizard (5 steps with room-type builder slide-over) | Large | P0 |
| Frontend: Unified management page (4 tabs — calendar tab stubbed for Phase 2) | Large | P0 |

### Phase 2: Calendar / availability (build third)

| Item | Effort | Priority |
|------|--------|----------|
| Calendar API endpoints (get + bulk-set) | Medium | P0 |
| Provider calendar grid UI (monthly view, per-room-type rows) | Large | P0 |
| Bulk date-range price/block actions | Medium | P1 |

### Phase 3: Traveler booking flow (build fourth)

| Item | Effort | Priority |
|------|--------|----------|
| Public availability endpoint (`GET /stays/:slug/availability`) | Medium | P0 |
| Property detail page (`/stays/[slug]`) with gallery + room cards | Large | P0 |
| Booking card with date picker → room selection → price breakdown | Large | P0 |
| Wire checkout for accommodation flow | Medium | P0 |
| Search integration updates (if needed) | Small | P1 |

---

## 9. What Should Be Postponed

| Item | Reason |
|------|--------|
| Per-room-type images | Property-level gallery is sufficient for MVP. Room types have text descriptions. |
| Individual room number tracking | Room-type inventory covers 99% of cases. Room assignment is an operational feature. |
| Dynamic/seasonal pricing engine | Manual `priceOverride` per date covers MVP needs. Automated rules are Phase 4+. |
| Map view for properties | Lat/lng schema fields are added but map UI is deferred. |
| Review system for accommodations | Reviews work for tours. Connecting to accommodations is a small add-on later. |
| Multi-property provider dashboard | Summary across properties only matters at scale. |
| Minimum stay requirements | Can be added later as `RoomType.minNights`. |
| Guest pricing tiers | Base price covers the room for MVP. Extra-guest fees come later. |
| Channel manager integration | External booking sync. Way too early. |
| Automated notifications | Depends on email infrastructure not yet built. |
| Date picker library decision | For Phase 3, evaluate `react-day-picker` vs `react-dates` at build time. |

---

## Build Order Summary

```
Phase 0  Booking Fix             → Fix cancellation to release room inventory (P0 BLOCKER)
Phase 1  Provider CRUD           → Create/edit properties + room types + images (wizard + management page)
Phase 2  Calendar/Availability   → Provider calendar management (monthly grid + bulk actions)
Phase 3  Traveler Booking        → Public detail page + date-aware booking card + checkout
```

Each phase is audited before proceeding to the next.
Phase 0 ships independently as a backend-only fix.
Phase 1 is the largest and most UX-intensive — the wizard and management page are the bulk of the work.
Phase 3 cannot ship until Phase 2 is complete (travelers need availability data to book).
