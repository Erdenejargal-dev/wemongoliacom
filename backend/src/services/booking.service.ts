import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'
import { generateBookingCode, calcPricing, countNights, eachNight } from '../utils/booking'

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
}

// ─────────────────────────────────────────────────────────────────────────────
// Availability checkers
// ─────────────────────────────────────────────────────────────────────────────

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

async function incrementDepartureSeats(tx: any, departureId: string, guests: number) {
  await tx.tourDeparture.update({
    where: { id: departureId },
    data:  { bookedSeats: { increment: guests } },
  })
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

  let providerId!:              string
  let pricePerUnit!:            number
  let currency =                'USD'
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
    pricePerUnit    = dep.priceOverride ?? tour.basePrice
    currency        = tour.currency
    units           = guests
    startDate       = dep.startDate
    endDate         = dep.endDate
    tourDepartureId = dep.id
    listingSnapshot = {
      type:        'tour',
      title:       tour.title,
      slug:        tour.slug,
      price:       pricePerUnit,
      currency:    tour.currency,
      startDate:   dep.startDate.toISOString(),
      endDate:     dep.endDate.toISOString(),
      guests,
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

    const days   = Math.ceil((endDate.getTime() - startDate.getTime()) / (86400000))
    pricePerUnit = vehicle.pricePerDay
    currency     = vehicle.currency
    units        = days
    providerId   = vehicle.providerId
    listingSnapshot = {
      type:       'vehicle',
      title:      vehicle.title,
      slug:       vehicle.slug,
      price:      pricePerUnit,
      currency:   vehicle.currency,
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
    pricePerUnit   = roomType.basePricePerNight
    currency       = roomType.currency
    units          = nightCount
    nights         = nightCount
    startDate      = checkIn
    endDate        = checkOut
    roomTypeId     = roomType.id
    providerId     = acc.providerId
    listingSnapshot = {
      type:          'accommodation',
      name:          acc.name,
      slug:          acc.slug,
      roomType:      roomType.name,
      price:         pricePerUnit,
      currency:      roomType.currency,
      checkIn:       checkIn.toISOString(),
      checkOut:      checkOut.toISOString(),
      nights:        nightCount,
    }
  }

  const pricing = calcPricing(pricePerUnit, units)

  // ── Transactional booking creation ──────────────────────────────────────
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const booking = await prisma.$transaction(async (tx: any) => {
    // Re-check + decrement inventory inside transaction
    if (listingType === 'tour') {
      await incrementDepartureSeats(tx, tourDepartureId!, guests)
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
        ...pricing,
        currency,
        bookingStatus:  'pending',
        paymentStatus:  'unpaid',
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
      totalAmount:   true,
      currency:      true,
      bookingStatus: true,
      paymentStatus: true,
      listingSnapshot: true,
      createdAt:     true,
      provider:      { select: { name: true, slug: true, logoUrl: true } },
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

  const updated = await prisma.booking.update({
    where: { bookingCode },
    data: {
      bookingStatus: 'cancelled',
      cancelledAt:   new Date(),
      cancelReason:  reason,
    },
  })

  // Release inventory (best-effort, non-blocking)
  if (booking.tourDepartureId) {
    prisma.tourDeparture.update({
      where: { id: booking.tourDepartureId },
      data:  { bookedSeats: { decrement: booking.guests } },
    }).catch(() => null)
  }

  return updated
}
