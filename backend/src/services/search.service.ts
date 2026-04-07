import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'

// ─────────────────────────────────────────────────────────────────────────────
// Shared query options
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchQuery {
  q?:           string
  type?:        'tour' | 'vehicle' | 'accommodation' | 'destination'
  destination?: string  // destination name / country / region
  region?:      string  // destination.region (e.g. "Gobi", "Northern Mongolia")
  minPrice?:    number
  maxPrice?:    number
  minRating?:   number
  minDays?:     number  // duration filter
  maxDays?:     number
  guests?:      number  // min party size — filters tours with departures that have (availableSeats - bookedSeats) >= guests
  minDate?:     string  // ISO date — earliest departure date (tours with departures on or after this date)
  maxDate?:     string  // ISO date — latest departure date (tours with departures on or before this date)
  sortBy?:      'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular'
  page?:        number
  limit?:       number
}

/** Returns tour IDs that have at least one departure with remainingSeats >= minRequired. */
async function getTourIdsWithRemainingSeats(
  minRequired: number,
  minDate: Date | null,
  maxDate: Date | null,
): Promise<string[]> {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  const startFrom = minDate && minDate > now ? minDate : now

  /**
   * Column names use camelCase in this Prisma schema (no @map annotations).
   * PostgreSQL requires quoted identifiers to preserve case: "tourId", not tour_id.
   */
  const rows = await prisma.$queryRaw<{ tour_id: string }[]>`
    SELECT DISTINCT t.id as tour_id
    FROM tours t
    INNER JOIN tour_departures d ON d."tourId" = t.id
    WHERE t.status = 'active'
      AND d.status = 'scheduled'
      AND d."startDate" >= ${startFrom}
      AND (d."availableSeats" - d."bookedSeats") >= ${minRequired}
      ${maxDate ? Prisma.sql`AND d."startDate" <= ${maxDate}` : Prisma.empty}
  `
  return rows.map((r) => r.tour_id)
}

function paging(query: SearchQuery) {
  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(50, query.limit ?? 12)
  return { page, limit, skip: (page - 1) * limit }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tours
// ─────────────────────────────────────────────────────────────────────────────

async function searchTours(query: SearchQuery) {
  const { page, limit, skip } = paging(query)

  const where: any = { status: 'active' }
  if (query.q) {
    where.OR = [
      { title:            { contains: query.q, mode: 'insensitive' } },
      { description:      { contains: query.q, mode: 'insensitive' } },
      { shortDescription: { contains: query.q, mode: 'insensitive' } },
    ]
  }
  if (query.destination) {
    where.destination = {
      ...(where.destination as object || {}),
      OR: [
        { name:    { contains: query.destination, mode: 'insensitive' } },
        { country: { contains: query.destination, mode: 'insensitive' } },
        { region:  { contains: query.destination, mode: 'insensitive' } },
      ],
    }
  }
  if (query.region) {
    where.destination = {
      ...(where.destination as object || {}),
      region: { contains: query.region, mode: 'insensitive' as const },
    }
  }
  if (query.minPrice)  where.basePrice = { ...where.basePrice, gte: query.minPrice }
  if (query.maxPrice)  where.basePrice = { ...where.basePrice, lte: query.maxPrice }
  if (query.minRating) where.ratingAverage = { gte: query.minRating }
  if (query.minDays !== undefined || query.maxDays !== undefined) {
    where.durationDays = {}
    if (query.minDays !== undefined) (where.durationDays as any).gte = query.minDays
    if (query.maxDays !== undefined) (where.durationDays as any).lte = query.maxDays
  }
  // Require at least one departure with remainingSeats >= max(1, guests)
  // Prisma cannot express (availableSeats - bookedSeats), so we use raw SQL
  const minRequired = Math.max(1, query.guests ?? 0)
  const minDate = query.minDate ? (() => {
    const d = new Date(query.minDate)
    d.setHours(0, 0, 0, 0)
    return d
  })() : null
  const maxDate = query.maxDate ? (() => {
    const d = new Date(query.maxDate)
    d.setHours(23, 59, 59, 999)
    return d
  })() : null
  const tourIdsWithSeats = await getTourIdsWithRemainingSeats(minRequired, minDate, maxDate)
  where.id = { in: tourIdsWithSeats }

  let orderBy: any = { createdAt: 'desc' }
  if (query.sortBy === 'price_asc')  orderBy = { basePrice: 'asc' }
  if (query.sortBy === 'price_desc') orderBy = { basePrice: 'desc' }
  if (query.sortBy === 'rating')     orderBy = { ratingAverage: 'desc' }
  if (query.sortBy === 'newest')     orderBy = { createdAt: 'desc' }
  if (query.sortBy === 'popular')    orderBy = { reviewsCount: 'desc' }

  const [data, total] = await Promise.all([
    prisma.tour.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id:             true,
        slug:           true,
        title:          true,
        shortDescription: true,
        basePrice:      true,
        currency:       true,
        durationDays:   true,
        maxGuests:      true,
        ratingAverage:  true,
        reviewsCount:   true,
        images:  { take: 1, select: { imageUrl: true }, orderBy: { sortOrder: 'asc' } },
        provider: { select: { id: true, name: true, slug: true } },
        destination: { select: { id: true, name: true, slug: true, country: true, region: true } },
      },
    }),
    prisma.tour.count({ where }),
  ])

  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
}

// ─────────────────────────────────────────────────────────────────────────────
// Vehicles
// ─────────────────────────────────────────────────────────────────────────────

async function searchVehicles(query: SearchQuery) {
  const { page, limit, skip } = paging(query)

  const where: any = { status: { not: 'draft' } }
  if (query.q) {
    where.OR = [
      { title:       { contains: query.q, mode: 'insensitive' } },
      { make:        { contains: query.q, mode: 'insensitive' } },
      { model:       { contains: query.q, mode: 'insensitive' } },
      { description: { contains: query.q, mode: 'insensitive' } },
    ]
  }
  if (query.destination) {
    where.destination = {
      OR: [
        { name:    { contains: query.destination, mode: 'insensitive' } },
        { country: { contains: query.destination, mode: 'insensitive' } },
        { region:  { contains: query.destination, mode: 'insensitive' } },
      ],
    }
  }
  if (query.minPrice)  where.pricePerDay = { ...where.pricePerDay, gte: query.minPrice }
  if (query.maxPrice)  where.pricePerDay = { ...where.pricePerDay, lte: query.maxPrice }
  if (query.minRating) where.ratingAverage = { gte: query.minRating }

  let orderBy: any = { createdAt: 'desc' }
  if (query.sortBy === 'price_asc')  orderBy = { pricePerDay: 'asc' }
  if (query.sortBy === 'price_desc') orderBy = { pricePerDay: 'desc' }
  if (query.sortBy === 'rating')     orderBy = { ratingAverage: 'desc' }

  const [data, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id:           true,
        slug:         true,
        title:        true,
        make:         true,
        model:        true,
        year:         true,
        pricePerDay:  true,
        currency:     true,
        seats:        true,
        vehicleType:  true,
        ratingAverage: true,
        reviewsCount:  true,
        images: { take: 1, select: { imageUrl: true }, orderBy: { sortOrder: 'asc' } },
        provider: { select: { id: true, name: true, slug: true } },
        destination: { select: { id: true, name: true, country: true } },
      },
    }),
    prisma.vehicle.count({ where }),
  ])

  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
}

// ─────────────────────────────────────────────────────────────────────────────
// Accommodations
// ─────────────────────────────────────────────────────────────────────────────

async function searchAccommodations(query: SearchQuery) {
  const { page, limit, skip } = paging(query)

  const where: any = { status: 'active' }
  if (query.q) {
    where.OR = [
      { name:        { contains: query.q, mode: 'insensitive' } },
      { description: { contains: query.q, mode: 'insensitive' } },
    ]
  }
  if (query.destination) {
    where.destination = {
      OR: [
        { name:    { contains: query.destination, mode: 'insensitive' } },
        { country: { contains: query.destination, mode: 'insensitive' } },
        { region:  { contains: query.destination, mode: 'insensitive' } },
      ],
    }
  }
  if (query.minRating) where.ratingAverage = { gte: query.minRating }

  let orderBy: any = { createdAt: 'desc' }
  if (query.sortBy === 'rating') orderBy = { ratingAverage: 'desc' }

  const [data, total] = await Promise.all([
    prisma.accommodation.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select: {
        id:               true,
        slug:             true,
        name:             true,
        accommodationType: true,
        ratingAverage:    true,
        reviewsCount:     true,
        starRating:       true,
        images: { take: 1, select: { imageUrl: true }, orderBy: { sortOrder: 'asc' } },
        provider:    { select: { id: true, name: true, slug: true } },
        destination: { select: { id: true, name: true, country: true } },
        roomTypes: { take: 1, orderBy: { basePricePerNight: 'asc' }, select: { basePricePerNight: true, currency: true } },
      },
    }),
    prisma.accommodation.count({ where }),
  ])

  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
}

// ─────────────────────────────────────────────────────────────────────────────
// Destinations
// ─────────────────────────────────────────────────────────────────────────────

async function searchDestinations(query: SearchQuery) {
  const { page, limit, skip } = paging(query)

  const where: any = {}
  if (query.q) {
    where.OR = [
      { name:             { contains: query.q, mode: 'insensitive' } },
      { description:      { contains: query.q, mode: 'insensitive' } },
      { shortDescription: { contains: query.q, mode: 'insensitive' } },
      { country:          { contains: query.q, mode: 'insensitive' } },
      { region:           { contains: query.q, mode: 'insensitive' } },
    ]
  }

  const [data, total] = await Promise.all([
    prisma.destination.findMany({
      where,
      orderBy: { name: 'asc' },
      skip,
      take: limit,
      select: {
        id:           true,
        slug:         true,
        name:         true,
        country:      true,
        region:       true,
        heroImageUrl: true,
        featured:     true,
        _count: { select: { tours: true, accommodations: true, vehicles: true } },
      },
    }),
    prisma.destination.count({ where }),
  ])

  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
}

// ─────────────────────────────────────────────────────────────────────────────
// Main dispatcher
// ─────────────────────────────────────────────────────────────────────────────

export async function search(query: SearchQuery) {
  switch (query.type) {
    case 'tour':          return { type: 'tour',          ...(await searchTours(query)) }
    case 'vehicle':       return { type: 'vehicle',       ...(await searchVehicles(query)) }
    case 'accommodation': return { type: 'accommodation', ...(await searchAccommodations(query)) }
    case 'destination':   return { type: 'destination',   ...(await searchDestinations(query)) }
    default: {
      const [tours, vehicles, accommodations, destinations] = await Promise.all([
        searchTours(query),
        searchVehicles(query),
        searchAccommodations(query),
        searchDestinations(query),
      ])
      return { tours, vehicles, accommodations, destinations }
    }
  }
}
