# Room Images Audit & Architecture Recommendation

> **Status:** Audit-only. No implementation. Goal: understand what exists before adding room-level image support.
>
> **Date:** April 2026

---

## 1. Current Room Image Support Status

**Room images do not exist anywhere in the current system.**

| Layer | Status |
|---|---|
| Prisma schema (`RoomType` model) | ❌ No `images` relation |
| `RoomTypeImage` model | ❌ Does not exist |
| Backend service (provider-accommodation) | ❌ No room image methods |
| Backend routes | ❌ No `/rooms/:id/images` routes |
| Provider dashboard (room slide-over) | ❌ No image section |
| Public stay detail page | ❌ Room cards are text-only |
| Frontend API types (`RoomTypeItem`, `BackendStayRoomType`) | ❌ No `images` field |

The accommodation-level gallery (`AccommodationImage` model) exists and is complete. Room images are a separate concept that does not exist at all.

---

## 2. Backend / Data Model Findings

### What exists

**`AccommodationImage`** (well-structured, complete):
```prisma
model AccommodationImage {
  id              String  @id @default(cuid())
  accommodationId String
  imageUrl        String
  publicId        String?
  altText         String?
  width           Int?
  height          Int?
  format          String?
  bytes           Int?
  sortOrder       Int     @default(0)

  accommodation Accommodation @relation(...)

  @@index([accommodationId])
  @@map("accommodation_images")
}
```

**`RoomType`** (no images):
```prisma
model RoomType {
  id                String   @id @default(cuid())
  accommodationId   String
  name              String
  description       String?
  maxGuests         Int      @default(2)
  bedType           String?
  quantity          Int      @default(1)
  basePricePerNight Float
  currency          String   @default("USD")
  amenities         String[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  accommodation Accommodation     @relation(...)
  availability  RoomAvailability[]
  bookings      Booking[]

  // ← No images relation
}
```

### What's missing

- `RoomTypeImage` model (does not exist)
- `images` relation on `RoomType`
- A `Prisma migrate` to add both
- Backend service methods: `addRoomTypeImages`, `removeRoomTypeImage`
- Backend routes: `POST /provider/accommodations/:accId/rooms/:roomId/images`, `DELETE /provider/accommodations/:accId/rooms/:roomId/images/:imgId`
- Public `getAccommodationBySlug` currently does NOT include room images even if they existed

### `TourImage` as the pattern to follow

`TourImage` mirrors `AccommodationImage` exactly and is the correct template:

```prisma
model TourImage {
  id        String  @id @default(cuid())
  tourId    String
  imageUrl  String
  publicId  String?
  altText   String?
  width     Int?
  height    Int?
  format    String?
  bytes     Int?
  sortOrder Int     @default(0)
  tour      Tour    @relation(...)
  @@index([tourId])
  @@map("tour_images")
}
```

`RoomTypeImage` should follow this exact structure, referencing `roomTypeId` instead of `tourId`. This is a deliberate architectural pattern — not coincidence. Follow it precisely.

---

## 3. Provider Dashboard UX Findings

### Tab structure (existing)

The accommodation detail page has 4 tabs:
1. **Overview** — property-level fields (name, type, description, location, amenities, status)
2. **Room Types** — list of room types; each opens a slide-over (`RoomSlideOver`) for edit
3. **Calendar** — stub (Phase 2, not implemented)
4. **Images** — accommodation-level photos only (`MultiImageUpload` component)

### Room slide-over (current fields)

The `RoomSlideOver` is a right-panel modal with these fields:
- Name (required)
- Description (textarea)
- Max guests, Bed type (grid row)
- Quantity, Price/night (grid row)
- Room amenities (tag picker)

**No image section exists. There is no placeholder, no stub, no UI hint that images are coming.**

### Key UX constraint: the room ID problem

When creating a **new** room type, no `roomId` exists until the room is created. Images require a `roomId` to associate with. This means:

- You cannot upload images during room creation — there is no ID to attach them to yet
- Images must be managed in an **edit-only** context (after the room already exists)

This is the same pattern as the accommodation and tour galleries — the property/tour is created first (as draft), then images are added in a separate step.

### RoomTypesTab UX assessment

The room list in `RoomTypesTab` shows each room as a simple row card:
```
[name]   [guests · bed · quantity · amenities]   [price/night]   [edit] [delete]
```

This is compact and not fragile. Adding image management does **not** need to go inside the slide-over list view. A better approach is a dedicated section inside the slide-over after saving.

### Reusable image infrastructure

`MultiImageUpload` component already:
- Handles Cloudinary uploads via backend (batch upload)
- Works with entity-agnostic `EntityType`
- Shows thumbnails with remove buttons
- Is already used for accommodation-level images in the `ImagesTab`

**Gap:** `EntityType` in `lib/api/media.ts` does not include `'room'`. It currently supports:
```typescript
export type EntityType =
  | 'provider' | 'tour' | 'destination'
  | 'user' | 'accommodation' | 'vehicle' | 'gallery'
```

`'room'` must be added. This controls which Cloudinary folder images are placed in.

---

## 4. Public Stays Page Findings

### Current room card structure

Each room type card in the "Available Rooms" section renders as:
```
┌─────────────────────────────────────────────┐
│ [Name]                          [$XX / night] │
│ [Description if any]                          │
│ [Users icon] X guests · [Bed] · N units       │
│ [Available dates] or "Contact for availability"│
│ [Amenity pills]                               │
└─────────────────────────────────────────────┘
```

This is a plain rectangular card with no image slot at all.

### Layout flexibility

The current layout supports two clean image additions:
1. **Thumbnail left** — hotel/Airbnb style: a fixed-width image on the left side of the card, text content on the right
2. **Image header** — full-width image at the top of each card (like a mini gallery item)

Option 1 (thumbnail left) is cleaner for a list context. Option 2 is better when rooms have multiple photos.

### Fallback logic (currently none)

The current system has no fallback logic for room images because room images don't exist. The accommodation gallery (property-level) exists, but is never referenced inside room cards.

### What should happen with no room images?

Correct behavior options:
1. **No image shown** — clean, no blank placeholders. Honest.
2. **First accommodation image used** — misleading. A photo of the lobby should not appear on a ger room card.
3. **Generic room icon** — acceptable neutral fallback.

**Recommendation:** Show no thumbnail if room has no images. Don't pull from the property gallery — they are semantically distinct.

### Are room images optional or mandatory?

Room images should be **optional** — they improve UX but the system should not gate publishing on them. The current publish readiness checklist requires:
- Name
- Description (≥50 chars)
- AccommodationType
- CheckIn + CheckOut times
- At least 1 room type with price > 0 and maxGuests ≥ 1
- At least 1 **accommodation-level** image

Room images should never be added to the publish readiness check. They are supplemental.

---

## 5. Recommended Implementation Approach

### 5.1 Backend model (follow the TourImage pattern exactly)

```prisma
// Add to schema.prisma

model RoomTypeImage {
  id         String  @id @default(cuid())
  roomTypeId String
  imageUrl   String
  publicId   String?
  altText    String?
  width      Int?
  height     Int?
  format     String?
  bytes      Int?
  sortOrder  Int     @default(0)

  roomType RoomType @relation(fields: [roomTypeId], references: [id], onDelete: Cascade)

  @@index([roomTypeId])
  @@map("room_type_images")
}

// Also add to RoomType model:
// images RoomTypeImage[]
```

**OnDelete: Cascade** is correct — when a room type is deleted, its images go with it.

### 5.2 Backend routes (follow the tour images pattern)

Add to `provider-accommodation.routes.ts`:
```
POST   /provider/accommodations/:accId/rooms/:roomId/images
DELETE /provider/accommodations/:accId/rooms/:roomId/images/:imgId
```

The handlers must verify:
1. The accommodation belongs to the authenticated provider
2. The room belongs to that accommodation

### 5.3 Public API changes

`getAccommodationBySlug` in `accommodation.service.ts` must include room images:
```typescript
roomTypes: {
  include: {
    images: {
      orderBy: { sortOrder: 'asc' },
      take: 5,   // first 5 images per room (enough for a small gallery)
    },
    availability: { ... },
  },
},
```

### 5.4 Provider dashboard UX

**Where to place room image management:**

Do NOT add image upload inside `RoomSlideOver`. The slide-over is already dense, and upload requires an existing roomId which isn't available during create.

**Recommended approach:** After the room types list, each room row card should have a small image management section accessible from a dedicated **"Manage images"** button on the room card — separate from the edit pencil icon.

```
[Room card row]
 ├── [Pencil icon] Edit metadata
 └── [Camera icon] Images (2)   ← new
```

Clicking the camera opens a **separate panel or inline section** with `MultiImageUpload`.

Alternatively (simpler but less elegant): add an "Images" tab at the bottom of the existing `RoomSlideOver` that only appears when editing (not when creating new). On creation, the image tab is absent. This mirrors the tour flow (create tour → then go to tour edit page → upload images there).

**Simplest clean approach:** Add an **"Images" section** inside the room slide-over, but only when `!isNew`. This requires no new modal/panel, reuses the existing slide-over, and is consistent with the mental model (edit room → see all room attributes including images).

### 5.5 Separation between accommodation gallery and room gallery

| | Accommodation Images | Room Type Images |
|---|---|---|
| **What they show** | Property overview, exterior, lobby, common areas | Specific room/ger/suite interior |
| **Where managed** | "Images" tab on accommodation detail page | "Room Types" tab → room edit slide-over |
| **Where displayed publicly** | Top gallery carousel on stay detail page | Inside each room type card |
| **Model** | `AccommodationImage` | `RoomTypeImage` (new) |
| **Prisma cascade** | On `Accommodation` delete | On `RoomType` delete |
| **Required to publish** | Yes (≥1) | No |
| **Cloudinary entity tag** | `accommodation` | `room` |

**Never reuse accommodation images in room cards** even as fallback. They represent fundamentally different content.

### 5.6 Frontend type updates

**`BackendStayRoomType`** in `lib/api/stays.ts`:
```typescript
export interface BackendStayRoomType {
  // ... existing fields ...
  images: { imageUrl: string; sortOrder: number }[]   // new
}
```

**`RoomTypeItem`** in `lib/api/provider-accommodations.ts`:
```typescript
export interface RoomTypeItem {
  // ... existing fields ...
  images?: { id: string; imageUrl: string; publicId: string | null; sortOrder: number }[]  // new
}
```

**`EntityType`** in `lib/api/media.ts`:
```typescript
export type EntityType =
  | 'provider' | 'tour' | 'destination'
  | 'user' | 'accommodation' | 'vehicle'
  | 'gallery' | 'room'    // ← add 'room'
```

---

## 6. Files Likely to Change

| File | Change needed |
|---|---|
| `backend/prisma/schema.prisma` | Add `RoomTypeImage` model; add `images RoomTypeImage[]` to `RoomType` |
| `backend/src/services/provider-accommodation.service.ts` | Add `addRoomTypeImages`, `removeRoomTypeImage` |
| `backend/src/controllers/provider-accommodation.controller.ts` | Add `addRoomImages`, `removeRoomImage` handlers |
| `backend/src/routes/provider-accommodation.routes.ts` | Add image routes for rooms |
| `backend/src/services/accommodation.service.ts` | Include `images` in `roomTypes` of `getAccommodationBySlug` |
| `lib/api/stays.ts` | Add `images` to `BackendStayRoomType` |
| `lib/api/provider-accommodations.ts` | Add `images` to `RoomTypeItem`; add `addRoomTypeImages`, `removeRoomTypeImage` API functions |
| `lib/api/media.ts` | Add `'room'` to `EntityType` |
| `app/dashboard/business/(portal)/services/accommodations/[id]/page.tsx` | Add image section in `RoomSlideOver` (edit mode only) |
| `app/stays/[slug]/page.tsx` | Add image thumbnail to room type cards |

---

## 7. Risks and Edge Cases

### Risk 1 — New room has no ID at creation time
Images cannot be uploaded during room creation. The image section in the slide-over must only appear in edit mode. If a provider creates a room and immediately wants to add images, they must: create → save → edit the same room → upload images. This is acceptable — it's the same pattern as tour creation.

### Risk 2 — Room deletion cascades to images
When a room type is deleted, all its images must be deleted from Cloudinary too. The current `deleteRoomType` service does not touch Cloudinary. This is already the same gap that exists for accommodation image deletion — it's a deferred cleanup concern. Cloudinary unused assets are orphaned (not billed by count, only by storage). Acceptable short-term risk.

### Risk 3 — Public query performance
Including room images in `getAccommodationBySlug` adds one join per room type. For a property with 10 room types and 5 images each, this is 50 extra rows. With `take: 5` and an index on `roomTypeId`, this is negligible. Not a concern.

### Risk 4 — The `roomTypes` field in `AccommodationDetail` (provider-side)
The provider detail endpoint (`getProviderAccommodationDetail`) includes room types but currently without images. After adding `RoomTypeImage`, the room detail select in `provider-accommodation.service.ts` must be updated to include images, otherwise the provider dashboard won't see them.

### Risk 5 — Mixing images in the public carousel
There is a risk that a future developer might try to merge room images into the accommodation gallery carousel (shown at the top of the stay detail page). This would be wrong — they are architecturally distinct. The separation must be documented in code comments.

---

## 8. Deferred Items

| Item | Why deferred |
|---|---|
| Room image reordering (sortOrder UI) | Current `MultiImageUpload` doesn't expose drag-to-reorder. The `AccommodationImage.sortOrder` field exists but isn't surfaced in the UI either. Defer to a later pass. |
| Room image lightbox/carousel on public page | If rooms have multiple images, a carousel per room card would be nice. Start with a single thumbnail. |
| Cloudinary folder structure for room images | Currently entity tags control the Cloudinary folder. Adding `'room'` to EntityType and using it as the entity param routes uploads to the correct folder automatically. |
| Alt text management for room images | `RoomTypeImage.altText` field should exist in the model for SEO, but the UI to edit it is deferred. |
| Mandatory room images in publish readiness | Should never be added. Room images are supplemental. Do not gate publishing on them. |

---

## Summary

| Question | Answer |
|---|---|
| Does `RoomType` support images today? | ❌ No. Not in schema, not in API, not in UI. |
| Is there any partial/indirect support? | ❌ No. Room cards show zero images. |
| Are rooms forced to use acc-level images? | Not forced, but there is no alternative — it's a gap. |
| Does the stay detail API include room images? | ❌ No. `getAccommodationBySlug` includes availability but not images per room. |
| Is the image upload infrastructure reusable? | ✅ Yes. `MultiImageUpload` is entity-agnostic. Just needs `'room'` added to `EntityType`. |
| Is the provider room UX fragile? | Not fragile, but dense. Image section must be edit-mode only due to the roomId creation problem. |
| Is room image mandatory to publish? | No. Must remain optional. Property-level image is the publishing gate. |
| What should the fallback be? | No image shown. Do not reuse accommodation gallery images in room cards. |
