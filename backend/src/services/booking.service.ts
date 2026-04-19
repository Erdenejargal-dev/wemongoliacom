import { prisma } from '../lib/prisma'
import { env } from '../config/env'
import { AppError } from '../middleware/error'
import { generateBookingCode, countNights, eachNight } from '../utils/booking'
import { assertSupportedCurrency, type Currency } from '../utils/currency'
import { calcBookingPricing, resolveListingBasePricePerUnit, type BookingPricing } from '../utils/pricing'

// ─────────────────────────────────────────────────────────────────────────────
// Input types
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateBookingInput {
  userId:           string
  listingType:      'tour' | 'vehicle' | 'accommodation'
  listingId:        string
  // Tour-specific
  tourDepartureId?: string
  // Vehicle-specific
  startDate?:       string
  endDate?:         string
  // Accommodation-specific
  roomTypeId?:      string
  checkIn?:         string
  checkOut?:        string
  // Shared
  guests:           number
  adults?:          number
  children?:        number
  specialRequests?: string
  travelerFullName?: string
  travelerEmail?:    string
  travelerPhone?:    string
  travelerCountry?:  string
  /**
   * Phase 2 Option B — currency the traveler is charged in (what lands on
   * booking.currency and the payment gateway). If omitted we default to the
   * listing's baseCurrency, which preserves Phase 1 behavior for MNT-only
   * Bonum flows. Must be one of the platform's supported currencies.
   */
  bookingCurrency?: 'MNT' | 'USD'
}

// ─────────────────────────────────────────────────────────────────────────────
// Availability checkers
// ─────────────────────────────────────────────────────────────────────────────
//
// Booking statuses that count against departure capacity (bookedSeats):
//   - pending:   counts (incremented on create)
//   - confirmed: counts (no change from pending)
//   - completed: counts (trip happened; seats were used)
//   - cancelled: does NOT count (decremented on cancel)
//
// remainingSeats = availableSeats - bookedSeats (used in search, detail, booking)
//
// Pending expiry: unpaid/authorized pending tour bookings older than maxAgeMinutes
// are auto-cancelled to prevent seats from being held indefinitely.
// Callers pass env.PENDING_EXPIRY_MINUTES (or config equivalent).
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Expires stale pending tour bookings (unpaid or authorized, never confirmed).
 * Releases seats so capacity stays accurate. Safe to call repeatedly.
 */
export async function expireStalePendingBookings(maxAgeMinutes: number = 15): Promise<number> {
  const cutoff = new Date(Date.now() - maxAgeMinutes * 60 * 1000)
  const stale = await prisma.booking.findMany({
    where: {
      bookingStatus: 'pending',
      paymentStatus: { in: ['unpaid', 'authorized'] },
      AND: [
        {
          OR: [
            { holdExpiresAt: { lt: new Date() } },
            { AND: [{ holdExpiresAt: null }, { createdAt: { lt: cutoff } }] },
          ],
        },
      ],
    },
    select: { id: true, bookingCode: true, listingType: true, tourDepartureId: true, roomTypeId: true, startDate: true, endDate: true, guests: true },
  })

  let expired = 0
  for (const b of stale) {
    try {
      await prisma.$transaction(async (tx) => {
        const pay = await tx.payment.findUnique({ where: { bookingId: b.id } })
        if (pay) {
          await tx.payment.update({
            where: { id: pay.id },
            data:  {
              status:         'failed',
              failedAt:       new Date(),
              failureMessage: 'Hold expired before payment',
            },
          })
        }
        await tx.booking.update({
          where: { id: b.id },
          data:  {
            bookingStatus: 'cancelled',
            cancelledAt:   new Date(),
            cancelReason:  'Expired: booking was not confirmed within the time limit.',
            paymentStatus: 'failed',
          },
        })
        if (b.listingType === 'tour' && b.tourDepartureId && b.guests > 0) {
          await tx.tourDeparture.update({
            where: { id: b.tourDepartureId },
            data:  { bookedSeats: { decrement: b.guests } },
          })
        }
        if (b.listingType === 'accommodation' && b.roomTypeId && b.startDate && b.endDate) {
          await releaseRoomAvailability(tx, b.roomTypeId, b.startDate, b.endDate)
        }
      })
      expired++
    } catch {
      // Best-effort; skip failed rows
    }
  }
  return expired
}

/** @deprecated Use expireStalePendingBookings instead */
export const expireStalePendingTourBookings = expireStalePendingBookings

async function checkTourDeparture(departureId: string, guests: number) {
  const dep = await prisma.tourDeparture.findUnique({ where: { id: departureId } })
  if (!dep)                    throw new AppError('Tour departure not found.', 404)
  if (dep.status !== 'scheduled') throw new AppError('This departure is no longer available.', 409)
  const remaining = dep.availableSeats - dep.bookedSeats
  if (remaining < guests) throw new AppError(`Only ${remaining} seat(s) remaining for this departure.`, 409)
  return dep
}

async function checkVehicleAvailability(vehicleId: string, start: Date, end: Date) {
  const conflict = await prisma.vehicleAvailability.findFirst({
    where: {
      vehicleId,
      status: { in: ['booked', 'blocked', 'maintenance'] },
      AND: [
        { startDate: { lte: end } },
        { endDate:   { gte: start } },
      ],
    },
  })
  if (conflict) throw new AppError('Vehicle is not available for the selected dates.', 409)
}

async function checkRoomAvailability(roomTypeId: string, checkIn: Date, checkOut: Date, guests: number) {
  const rt = await prisma.roomType.findUnique({ where: { id: roomTypeId } })
  if (!rt) throw new AppError('Room type not found.', 404)
  if (rt.maxGuests < guests) throw new AppError(`This room fits up to ${rt.maxGuests} guests.`, 400)

  const nights = eachNight(checkIn, checkOut)
  for (const night of nights) {
    const avail = await prisma.roomAvailability.findUnique({
      where: { roomTypeId_date: { roomTypeId, date: night } },
    })
    const units = avail?.availableUnits ?? rt.quantity
    const booked = avail?.bookedUnits ?? 0
    if (units - booked < 1) {
      throw new AppError(`No availability on ${night.toISOString().split('T')[0]}.`, 409)
    }
  }

  return { roomType: rt, nights }
}

// ─────────────────────────────────────────────────────────────────────────────
// Inventory updaters (run inside transaction)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Atomically allocates seats if capacity allows. Fails if it would oversell.
 * Must run inside a transaction. Returns true if allocation succeeded.
 */
async function allocateDepartureSeats(tx: any, departureId: string, guests: number): Promise<boolean> {
  /**
   * Column names use camelCase in this Prisma schema.
   * PostgreSQL requires quoted identifiers: "bookedSeats", not booked_seats.
   */
  const rows = await tx.$executeRaw`
    UPDATE tour_departures
    SET "bookedSeats" = "bookedSeats" + ${guests}
    WHERE id = ${departureId}
      AND status = 'scheduled'
      AND ("availableSeats" - "bookedSeats") >= ${guests}
  `
  return Number(rows) > 0
}

async function createVehicleBlock(tx: any, vehicleId: string, bookingId: string, start: Date, end: Date) {
  return tx.vehicleAvailability.create({
    data: {
      vehicleId,
      startDate: start,
      endDate:   end,
      status:    'booked',
      note:      `Booking ${bookingId}`,
    },
  })
}

/**
 * Releases 1 booked unit per night when an accommodation booking is cancelled.
 * Decrements bookedUnits (floor at 0) and re-increments availableUnits.
 * Only touches existing RoomAvailability records (if no record exists the
 * night was never explicitly tracked, so no adjustment is needed).
 */
export async function releaseRoomAvailabilityForCancel(tx: any, roomTypeId: string, checkIn: Date, checkOut: Date) {
  return releaseRoomAvailability(tx, roomTypeId, checkIn, checkOut)
}

async function releaseRoomAvailability(tx: any, roomTypeId: string, checkIn: Date, checkOut: Date) {
  const nights = eachNight(checkIn, checkOut)
  for (const night of nights) {
    const avail = await tx.roomAvailability.findUnique({
      where: { roomTypeId_date: { roomTypeId, date: night } },
    })
    if (avail && avail.bookedUnits > 0) {
      await tx.roomAvailability.update({
        where: { id: avail.id },
        data: {
          bookedUnits:    { decrement: 1 },
          availableUnits: { increment: 1 },
          status: avail.bookedUnits - 1 === 0 && avail.status === 'sold_out' ? 'available' : undefined,
        },
      })
    }
  }
}

async function upsertRoomAvailability(tx: any, roomTypeId: string, roomType: any, checkIn: Date, checkOut: Date) {
  const nights = eachNight(checkIn, checkOut)
  for (const night of nights) {
    await tx.roomAvailability.upsert({
      where:  { roomTypeId_date: { roomTypeId, date: night } },
      update: {
        bookedUnits:    { increment: 1 },
        availableUnits: { decrement: 1 },
      },
      create: {
        roomTypeId,
        date:           night,
        availableUnits: roomType.quantity - 1,
        bookedUnits:    1,
        status:         roomType.quantity - 1 === 0 ? 'sold_out' : 'available',
      },
    })
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main service: createBooking
// ─────────────────────────────────────────────────────────────────────────────

export async function createBooking(input: CreateBookingInput) {
  const { userId, listingType, listingId, guests } = input

  // Free seats from stale pending bookings before allocating
  if (listingType === 'tour') {
    await expireStalePendingTourBookings(env.PENDING_EXPIRY_MINUTES)
  }

  let providerId!:              string
  let baseAmount!:              number
  let baseCurrency!:            Currency
  let units =                   1
  let startDate!:               Date
  let endDate:                  Date | undefined
  let nights:                   number | undefined
  let tourDepartureId:          string | undefined
  let vehicleAvailabilityId:    string | undefined
  let roomTypeId:               string | undefined
  let listingSnapshot:          Record<string, unknown>

  // ── Validate listing + compute pricing ──────────────────────────────────
  if (listingType === 'tour') {
    if (!input.tourDepartureId) throw new AppError('tourDepartureId is required for tour bookings.', 400)

    const tour = await prisma.tour.findUnique({ where: { id: listingId } })
    if (!tour || tour.status !== 'active') throw new AppError('Tour not found.', 404)

    const dep = await checkTourDeparture(input.tourDepartureId, guests)

    providerId      = tour.providerId
    const resolved = resolveListingBasePricePerUnit({
      baseAmount:           tour.baseAmount,
      baseCurrency:         tour.baseCurrency,
      baseOverrideAmount:   dep.baseOverrideAmount,
      baseOverrideCurrency: dep.baseOverrideCurrency,
      legacyAmount:         tour.basePrice,
      legacyCurrency:       tour.currency,
      legacyOverrideAmount: dep.priceOverride,
      legacyOverrideCurrency: dep.currency,
      label:                'tour',
    })
    baseAmount      = resolved.amount
    baseCurrency    = resolved.currency
    units           = guests
    startDate       = dep.startDate
    endDate         = dep.endDate
    tourDepartureId = dep.id
    const destination = tour.destinationId
      ? await prisma.destination.findUnique({ where: { id: tour.destinationId }, select: { name: true, slug: true } })
      : null

    listingSnapshot = {
      type:          'tour',
      title:         tour.title,
      slug:          tour.slug,
      price:         baseAmount,
      currency:      baseCurrency,
      baseAmount,
      baseCurrency,
      startDate:     dep.startDate.toISOString(),
      endDate:       dep.endDate.toISOString(),
      guests,
      destination:   destination?.name ?? null,
      durationDays:  tour.durationDays,
    }

  } else if (listingType === 'vehicle') {
    if (!input.startDate || !input.endDate)
      throw new AppError('startDate and endDate are required for vehicle bookings.', 400)

    const vehicle = await prisma.vehicle.findUnique({ where: { id: listingId } })
    if (!vehicle || vehicle.status !== 'active') throw new AppError('Vehicle not found.', 404)

    startDate = new Date(input.startDate)
    endDate   = new Date(input.endDate)
    if (endDate <= startDate) throw new AppError('endDate must be after startDate.', 400)

    await checkVehicleAvailability(listingId, startDate, endDate)

    const days = Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000)
    const resolved = resolveListingBasePricePerUnit({
      baseAmount:     vehicle.baseAmount,
      baseCurrency:   vehicle.baseCurrency,
      legacyAmount:   vehicle.pricePerDay,
      legacyCurrency: vehicle.currency,
      label:          'vehicle',
    })
    baseAmount   = resolved.amount
    baseCurrency = resolved.currency
    units        = days
    providerId   = vehicle.providerId
    listingSnapshot = {
      type:       'vehicle',
      title:      vehicle.title,
      slug:       vehicle.slug,
      price:      baseAmount,
      currency:   baseCurrency,
      baseAmount,
      baseCurrency,
      startDate:  startDate.toISOString(),
      endDate:    endDate.toISOString(),
      days,
    }

  } else {
    // accommodation
    if (!input.roomTypeId || !input.checkIn || !input.checkOut)
      throw new AppError('roomTypeId, checkIn, and checkOut are required for accommodation bookings.', 400)

    const checkIn  = new Date(input.checkIn)
    const checkOut = new Date(input.checkOut)
    if (checkOut <= checkIn) throw new AppError('checkOut must be after checkIn.', 400)

    const { roomType } = await checkRoomAvailability(input.roomTypeId, checkIn, checkOut, guests)

    const acc = await prisma.accommodation.findUnique({ where: { id: listingId } })
    if (!acc || acc.status !== 'active') throw new AppError('Accommodation not found.', 404)

    const nightCount = countNights(checkIn, checkOut)
    const resolved = resolveListingBasePricePerUnit({
      baseAmount:     roomType.baseAmount,
      baseCurrency:   roomType.baseCurrency,
      legacyAmount:   roomType.basePricePerNight,
      legacyCurrency: roomType.currency,
      label:          'roomType',
    })
    baseAmount   = resolved.amount
    baseCurrency = resolved.currency
    units        = nightCount
    nights       = nightCount
    startDate    = checkIn
    endDate      = checkOut
    roomTypeId   = roomType.id
    providerId   = acc.providerId
    listingSnapshot = {
      type:          'accommodation',
      name:          acc.name,
      slug:          acc.slug,
      roomType:      roomType.name,
      price:         baseAmount,
      currency:      baseCurrency,
      baseAmount,
      baseCurrency,
      checkIn:       checkIn.toISOString(),
      checkOut:      checkOut.toISOString(),
      nights:        nightCount,
    }
  }

  // Booking currency default: listing's base currency. This keeps MNT-only
  // Bonum flows unchanged (MNT listing → MNT booking) while allowing
  // future-proof USD quoting for international Visa payments.
  const bookingCurrency: Currency = input.bookingCurrency
    ? assertSupportedCurrency(input.bookingCurrency, 'bookingCurrency')
    : baseCurrency

  const pricing: BookingPricing = await calcBookingPricing({
    basePricePerUnit: baseAmount,
    baseCurrency,
    units,
    bookingCurrency,
  })
  const currency = pricing.bookingCurrency

  const createdAt = new Date()
  const holdExpiresAt = new Date(createdAt.getTime() + env.PENDING_EXPIRY_MINUTES * 60 * 1000)
  const maxHoldUntil = new Date(createdAt.getTime() + env.MAX_HOLD_MINUTES_FROM_BOOKING * 60 * 1000)

  // ── Transactional booking creation ──────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const booking = await prisma.$transaction(async (tx: any) => {
    // Atomically allocate seats inside transaction (prevents overselling under concurrency)
    if (listingType === 'tour') {
      const allocated = await allocateDepartureSeats(tx, tourDepartureId!, guests)
      if (!allocated) {
        throw new AppError(
          'Availability has changed. This departure no longer has enough seats. Please select a different date or reduce your party size.',
          409,
        )
      }
    }

    const b = await tx.booking.create({
      data: {
        bookingCode:   generateBookingCode(),
        userId,
        providerId,
        listingType:   listingType as any,
        listingId,
        tourDepartureId,
        roomTypeId,
        startDate,
        endDate,
        nights,
        guests,
        adults:        input.adults  ?? guests,
        children:      input.children ?? 0,
        // Booking-currency snapshot (what the traveler pays)
        subtotal:       pricing.subtotal,
        serviceFee:     pricing.serviceFee,
        taxes:          pricing.taxes,
        discountAmount: pricing.discountAmount,
        totalAmount:    pricing.totalAmount,
        currency,
        // Phase 2 Option B — unit + base-currency snapshot + FX rate.
        pricePerUnitAmount: pricing.pricePerUnit,
        units:              pricing.units,
        baseCurrency:       pricing.baseCurrency,
        baseSubtotal:       pricing.baseSubtotal,
        baseServiceFee:     pricing.baseServiceFee,
        baseTotalAmount:    pricing.baseTotalAmount,
        fxRate:             pricing.fxRate,
        fxRateCapturedAt:   pricing.fxRateCapturedAt,
        fxRateSource:       pricing.fxRateSource,
        bookingStatus:  'pending',
        paymentStatus:  'unpaid',
        holdExpiresAt,
        maxHoldUntil,
        travelerFullName: input.travelerFullName,
        travelerEmail:    input.travelerEmail,
        travelerPhone:    input.travelerPhone,
        travelerCountry:  input.travelerCountry,
        specialRequests:  input.specialRequests,
        listingSnapshot,
      },
    })

    if (listingType === 'vehicle') {
      const block = await createVehicleBlock(tx, listingId, b.id, startDate, endDate!)
      await tx.booking.update({
        where: { id: b.id },
        data:  { vehicleAvailabilityId: block.id },
      })
    }

    if (listingType === 'accommodation') {
      const roomType = await tx.roomType.findUnique({ where: { id: roomTypeId! } })
      await upsertRoomAvailability(tx, roomTypeId!, roomType, startDate, endDate!)
    }

    return b
  })

  void import('./email.service')
    .then(({ notifyBookingCreated }) => notifyBookingCreated(booking.bookingCode))
    .catch((err) => console.error('[email] notifyBookingCreated schedule failed:', err))

  return booking
}

// ─────────────────────────────────────────────────────────────────────────────
// Get booking by code
// ─────────────────────────────────────────────────────────────────────────────

export async function getBookingByCode(bookingCode: string, userId: string) {
  const booking = await prisma.booking.findUnique({
    where: { bookingCode },
    include: {
      provider:      { select: { name: true, slug: true, logoUrl: true, phone: true, email: true } },
      tourDeparture: { select: { startDate: true, endDate: true } },
      roomType:      { select: { name: true, bedType: true } },
      payment:       { select: { status: true, paidAt: true } },
    },
  })

  if (!booking) throw new AppError('Booking not found.', 404)
  if (booking.userId !== userId) throw new AppError('Forbidden.', 403)

  return booking
}

// ─────────────────────────────────────────────────────────────────────────────
// List traveler's own bookings
// ─────────────────────────────────────────────────────────────────────────────

export async function listMyBookings(userId: string, status?: string) {
  const where: any = { userId }
  if (status) where.bookingStatus = status

  const bookings = await prisma.booking.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    select: {
      id:            true,
      bookingCode:   true,
      listingType:   true,
      listingId:     true,
      startDate:     true,
      endDate:       true,
      guests:        true,
      subtotal:      true,
      serviceFee:    true,
      totalAmount:   true,
      currency:      true,
      bookingStatus: true,
      paymentStatus: true,
      cancelReason:   true,
      listingSnapshot: true,
      createdAt:     true,
      /** id is included so the frontend can start a conversation via POST /conversations */
      provider:      { select: { id: true, name: true, slug: true, logoUrl: true } },

      // Tour-specific fields needed by traveler trip cards.
      // For non-tour bookings this will be null.
      tourDeparture: {
        select: {
          tour: {
            select: {
              slug:         true,
              title:        true,
              durationDays: true,
              destination:  { select: { name: true, slug: true } },
              images: {
                orderBy: { sortOrder: 'asc' },
                take: 1,
                select: { imageUrl: true },
              },
            },
          },
        },
      },

      // Vehicle-specific fields (primary image + destination) for non-tour bookings.
      vehicleAvailability: {
        select: {
          vehicle: {
            select: {
              slug:  true,
              title: true,
              destination: { select: { name: true, slug: true } },
              images: {
                orderBy: { sortOrder: 'asc' },
                take: 1,
                select: { imageUrl: true },
              },
            },
          },
        },
      },

      // Accommodation-specific fields (primary image + destination).
      roomType: {
        select: {
          accommodation: {
            select: {
              slug:  true,
              name:  true,
              destination: { select: { name: true, slug: true } },
              images: {
                orderBy: { sortOrder: 'asc' },
                take: 1,
                select: { imageUrl: true },
              },
            },
          },
        },
      },
    },
  })

  return bookings
}

// ─────────────────────────────────────────────────────────────────────────────
// Cancel booking
// ─────────────────────────────────────────────────────────────────────────────

export async function cancelBooking(bookingCode: string, userId: string, reason?: string) {
  const booking = await prisma.booking.findUnique({ where: { bookingCode } })
  if (!booking) throw new AppError('Booking not found.', 404)
  if (booking.userId !== userId) throw new AppError('Forbidden.', 403)
  if (['cancelled', 'completed'].includes(booking.bookingStatus))
    throw new AppError(`Booking is already ${booking.bookingStatus}.`, 400)

  if (booking.paymentStatus === 'paid' && booking.bookingStatus === 'confirmed') {
    throw new AppError(
      'Paid bookings cannot be cancelled here. Request a refund from your trip details.',
      400,
    )
  }

  const updated = await prisma.$transaction(async (tx) => {
    const pay = await tx.payment.findUnique({ where: { bookingId: booking.id } })
    if (pay && (pay.status === 'authorized' || pay.status === 'unpaid')) {
      await tx.payment.update({
        where: { id: pay.id },
        data:  {
          status:         'failed',
          failedAt:       new Date(),
          failureMessage: 'Booking cancelled by traveler before payment',
        },
      })
    }

    const b = await tx.booking.update({
      where: { bookingCode },
      data: {
        bookingStatus: 'cancelled',
        cancelledAt:   new Date(),
        cancelReason:  reason,
        paymentStatus: 'failed',
      },
    })

    if (booking.tourDepartureId && booking.guests > 0) {
      await tx.tourDeparture.update({
        where: { id: booking.tourDepartureId },
        data:  { bookedSeats: { decrement: booking.guests } },
      })
    }

    if (booking.listingType === 'accommodation' && booking.roomTypeId && booking.startDate && booking.endDate) {
      await releaseRoomAvailability(tx, booking.roomTypeId, booking.startDate, booking.endDate)
    }

    return b
  })

  void import('./email.service')
    .then(({ notifyBookingCancelledByTraveler }) => notifyBookingCancelledByTraveler(bookingCode))
    .catch((err) => console.error('[email] notifyBookingCancelledByTraveler schedule failed:', err))

  return updated
}

// ─────────────────────────────────────────────────────────────────────────────
// Quote pricing (non-persisting) — Phase 1 single source of truth for UI totals
// ─────────────────────────────────────────────────────────────────────────────
//
// The frontend used to compute subtotal / serviceFee / total locally, using
// rules that drifted from the backend (notably a $5 minimum service fee).
// This endpoint returns authoritative numbers calculated by calcPricing so the
// booking cards and checkout pages display the exact values that will later be
// persisted on the Booking row.
//
// It does NOT allocate seats, block rooms, or create any DB row — it is safe
// to call repeatedly while the user adjusts dates or guest counts.

export interface QuoteBookingInput {
  listingType:      'tour' | 'vehicle' | 'accommodation'
  listingId:        string
  tourDepartureId?: string
  startDate?:       string
  endDate?:         string
  roomTypeId?:      string
  checkIn?:         string
  checkOut?:        string
  guests:           number
  /**
   * Phase 2 Option B — target (display/booking) currency. Defaults to the
   * listing's baseCurrency, which keeps Phase 1 quote responses stable for
   * MNT-only Bonum flows.
   */
  bookingCurrency?: 'MNT' | 'USD'
}

export async function quoteBooking(input: QuoteBookingInput): Promise<BookingPricing> {
  const { listingType, listingId, guests } = input
  if (guests < 1) throw new AppError('guests must be at least 1.', 400)

  let baseAmount!:  number
  let baseCurrency!: Currency
  let units = 1

  if (listingType === 'tour') {
    if (!input.tourDepartureId) throw new AppError('tourDepartureId is required for tour quotes.', 400)
    const tour = await prisma.tour.findUnique({ where: { id: listingId } })
    if (!tour || tour.status !== 'active') throw new AppError('Tour not found.', 404)
    const dep = await prisma.tourDeparture.findUnique({ where: { id: input.tourDepartureId } })
    if (!dep || dep.tourId !== listingId) throw new AppError('Tour departure not found.', 404)
    const resolved = resolveListingBasePricePerUnit({
      baseAmount:            tour.baseAmount,
      baseCurrency:          tour.baseCurrency,
      baseOverrideAmount:    dep.baseOverrideAmount,
      baseOverrideCurrency:  dep.baseOverrideCurrency,
      legacyAmount:          tour.basePrice,
      legacyCurrency:        tour.currency,
      legacyOverrideAmount:  dep.priceOverride,
      legacyOverrideCurrency: dep.currency,
      label:                 'tour',
    })
    baseAmount   = resolved.amount
    baseCurrency = resolved.currency
    units        = guests

  } else if (listingType === 'vehicle') {
    if (!input.startDate || !input.endDate) {
      throw new AppError('startDate and endDate are required for vehicle quotes.', 400)
    }
    const start = new Date(input.startDate)
    const end   = new Date(input.endDate)
    if (end <= start) throw new AppError('endDate must be after startDate.', 400)
    const vehicle = await prisma.vehicle.findUnique({ where: { id: listingId } })
    if (!vehicle || vehicle.status !== 'active') throw new AppError('Vehicle not found.', 404)
    const resolved = resolveListingBasePricePerUnit({
      baseAmount:     vehicle.baseAmount,
      baseCurrency:   vehicle.baseCurrency,
      legacyAmount:   vehicle.pricePerDay,
      legacyCurrency: vehicle.currency,
      label:          'vehicle',
    })
    baseAmount   = resolved.amount
    baseCurrency = resolved.currency
    units        = Math.ceil((end.getTime() - start.getTime()) / 86400000)

  } else {
    if (!input.roomTypeId || !input.checkIn || !input.checkOut) {
      throw new AppError('roomTypeId, checkIn, and checkOut are required for accommodation quotes.', 400)
    }
    const checkIn  = new Date(input.checkIn)
    const checkOut = new Date(input.checkOut)
    if (checkOut <= checkIn) throw new AppError('checkOut must be after checkIn.', 400)
    const rt = await prisma.roomType.findUnique({ where: { id: input.roomTypeId } })
    if (!rt || rt.accommodationId !== listingId) throw new AppError('Room type not found.', 404)
    const resolved = resolveListingBasePricePerUnit({
      baseAmount:     rt.baseAmount,
      baseCurrency:   rt.baseCurrency,
      legacyAmount:   rt.basePricePerNight,
      legacyCurrency: rt.currency,
      label:          'roomType',
    })
    baseAmount   = resolved.amount
    baseCurrency = resolved.currency
    units        = countNights(checkIn, checkOut)
  }

  const bookingCurrency: Currency = input.bookingCurrency
    ? assertSupportedCurrency(input.bookingCurrency, 'bookingCurrency')
    : baseCurrency

  return calcBookingPricing({
    basePricePerUnit: baseAmount,
    baseCurrency,
    units,
    bookingCurrency,
  })
}
