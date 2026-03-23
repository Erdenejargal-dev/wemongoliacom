# Tour Availability Accuracy – Implementation Summary

## 1. Root cause / current limitation

**Root cause:** Search and tour list/detail used `availableSeats >= guests` to filter departures. They did not subtract `bookedSeats`, which can overcount availability (e.g. 10 total seats, 8 booked → 2 remaining, but the old logic treated it as 10 available).

**Technical constraint:** Prisma `where` cannot express `(availableSeats - bookedSeats) >= N`. We work around this using raw SQL to precompute tour IDs that have qualifying departures.

---

## 2. Backend fields / endpoints / services changed

### Schema (unchanged)
- `TourDeparture.availableSeats` – total capacity
- `TourDeparture.bookedSeats` – seats taken by non-cancelled bookings

### Services

| File | Change |
|------|--------|
| `backend/src/services/search.service.ts` | Added `getTourIdsWithRemainingSeats()` raw SQL helper. Replaced `departures.some(availableSeats >= guests)` with `id IN (tour IDs from raw query)`. Uses `(available_seats - booked_seats) >= max(1, guests)`. |
| `backend/src/services/tour.service.ts` | Added same raw SQL helper for `listTours`. When `startDate` or `guests` is set, filters tours by `id IN (tour IDs with enough remaining seats)`. `getTourBySlug` / `getTourDepartures` now only return departures with `(availableSeats - bookedSeats) >= 1`. |
| `backend/src/services/booking.service.ts` | Added documentation comment on which booking statuses count against capacity. Logic unchanged (already used `remaining = availableSeats - bookedSeats`). |

### Endpoints
- **GET /search?type=tour** – Uses remaining seats for guest/date filters.
- **GET /tours** – Uses remaining seats when `startDate` or `guests` query params are present.
- **GET /tours/:slug** – Departures filtered to those with at least 1 remaining seat; response includes `bookedSeats` per departure.
- **GET /tours/:id/departures** – Same filtering, only departures with remaining >= 1.

---

## 3. Frontend files changed

| File | Change |
|------|--------|
| `components/tours/TourBookingCard.tsx` | Computes `remainingSeats = availableSeats - bookedSeats` per departure. Caps guest picker at `min(maxGuests, remainingSeats)`. Disables Reserve when no valid departure or when `guests > remainingSeats`. Shows "X seats left for this date", "Selling out" when remaining < 5. Restricts date input to scheduled departure dates. Clamps guests when switching to a date with fewer seats. |

---

## 4. Remaining-seat rule

```
remainingSeats = availableSeats - bookedSeats

- Search: Tour appears only if it has ≥1 scheduled future departure with remainingSeats ≥ max(1, guests filter)
- Detail: Only departures with remainingSeats ≥ 1 are returned
- Booking: checkTourDeparture enforces remainingSeats ≥ guests before creating a booking
```

---

## 5. Booking statuses that affect seat usage

| Status | Counts toward seats? |
|--------|----------------------|
| **pending** | Yes (incremented on create) |
| **confirmed** | Yes (no change from pending) |
| **completed** | Yes (trip happened) |
| **cancelled** | No (decremented on cancel) |

`bookedSeats` is updated as follows:
- **Increment** on `createBooking` (tour bookings start as pending)
- **Decrement** on `cancelBooking`

---

## 6. Remaining limitations

1. **listTours without filters:** When `startDate` and `guests` are both omitted, `GET /tours` does not filter by departures. Tours with no future availability can still appear. Search (`/search?type=tour`) always uses the remaining-seats filter.
2. **Race condition:** A concurrent booking between search/detail and checkout can still overbook by one. Mitigation would require optimistic locking or a dedicated inventory reservation step.
3. **No “holding” seats:** Pending bookings occupy seats until confirmed or cancelled. No temporary hold expiry.
