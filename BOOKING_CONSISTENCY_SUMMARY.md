# Booking Consistency – Concurrency & Overselling Prevention

## 1. Root cause / risk found

**Race condition in booking creation:** `checkTourDeparture` ran outside the transaction; `incrementDepartureSeats` ran inside. Between the check and the increment, another concurrent booking could pass the same check. Both could succeed → overselling.

**Incomplete seat release on cancel:** Only `booking.service.cancelBooking` (traveler cancel) released tour departure seats, and it did so in a fire-and-forget way (outside a transaction). `provider.service.cancelBookingByProvider` and `payment.service.requestRefund` did not release seats at all.

---

## 2. Files changed

| File | Change |
|------|--------|
| `backend/src/services/booking.service.ts` | Replaced `incrementDepartureSeats` with `allocateDepartureSeats` – atomic `UPDATE ... WHERE (available_seats - booked_seats) >= guests`. Throws 409 if allocation fails. Made `cancelBooking` transactional (booking update + seat release in one tx). |
| `backend/src/services/provider.service.ts` | Made `cancelBookingByProvider` transactional; added tour departure seat release when cancelling a tour booking. |
| `backend/src/services/payment.service.ts` | Made `requestRefund` transactional; added tour departure seat release when refunding a tour booking. |
| `app/checkout/page.tsx` | Handles 409 with availability-focused message; shows "Go back to tour" link when error mentions availability/seats. Prefers `depId` from URL when resolving departure. |

---

## 3. Transaction / concurrency fix

**Atomic seat allocation**

Seat allocation now uses a single conditional SQL update inside the booking transaction:

```sql
UPDATE tour_departures
SET booked_seats = booked_seats + :guests
WHERE id = :departureId
  AND status = 'scheduled'
  AND (available_seats - booked_seats) >= :guests
```

- If no row is updated (capacity exceeded or wrong id), allocation fails and the transaction rolls back.
- No successful booking without a successful seat allocation.
- Check-before-increment race is removed.

**Transactional cancel**

All cancellation paths run the booking update and seat release in one transaction:

- Traveler cancel (`cancelBooking`)
- Provider cancel (`cancelBookingByProvider`)
- Refund (`requestRefund`)

Seat release is no longer fire-and-forget; it is part of the same transaction as the status update.

---

## 4. Server-side booking validation rule

1. **Pre-transaction (fast fail):**  
   - Departure exists  
   - `status === 'scheduled'`  
   - `remainingSeats >= guests` (informational only; not race-safe)

2. **Inside transaction (enforced):**  
   - Execute atomic `UPDATE` with `(available_seats - booked_seats) >= guests`  
   - If `affectedRows === 0` → throw 409, rollback  
   - If allocation succeeds → create booking record

---

## 5. Audit: places that expose departure availability

| Place | Rule used |
|-------|-----------|
| Search (`search.service`) | Raw SQL `(available_seats - booked_seats) >= guests` |
| Tour list (`tour.service.listTours`) | Same raw SQL when `startDate`/`guests` filters are set |
| Tour detail (`tour.service.getTourBySlug`) | Only departures with `(availableSeats - bookedSeats) >= 1` |
| Tour departures API (`getTourDepartures`) | Same filter |
| TourBookingCard | Uses `remainingSeats = availableSeats - bookedSeats` from backend |
| Checkout | Uses `depId` / date from departures API; backend enforces capacity |

---

## 6. Remaining limitations

1. **Optimistic locking:** Capacity is enforced by a conditional `UPDATE`, not explicit row versioning. For tour departures this is sufficient; more complex inventory may need version fields later.

2. **Refund path scope:** `requestRefund` releases tour seats; vehicle/accommodation refund handling may need similar review if those flows exist.

3. **Booking status transitions:**  
   - pending → confirmed: no change to seats  
   - pending/confirmed → cancelled: seats released (all cancel paths fixed)  
   - confirmed → completed: seats remain allocated
