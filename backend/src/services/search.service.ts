import { prisma } from '../lib/prisma'

// ─────────────────────────────────────────────────────────────────────────────
// Shared query options
// ─────────────────────────────────────────────────────────────────────────────

export interface SearchQuery {
  q?:           string
  type?:        'tour' | 'vehicle' | 'accommodation' | 'destination'
  destination?: string  // destination name / country / region
  minPrice?:    number
  maxPrice?:    number
  minRating?:   number
  sortBy?:      'price_asc' | 'price_desc' | 'rating' | 'newest'
  page?:        number
  limit?:       number
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
      OR: [
        { name:    { contains: query.destination, mode: 'insensitive' } },
        { country: { contains: query.destination, mode: 'insensitive' } },
        { region:  { contains: query.destination, mode: 'insensitive' } },
      ],
    }
  }
  if (query.minPrice)  where.basePrice = { ...where.basePrice, gte: query.minPrice }
  if (query.maxPrice)  where.basePrice = { ...where.basePrice, lte: query.maxPrice }
  if (query.minRating) where.ratingAverage = { gte: query.minRating }

  let orderBy: any = { createdAt: 'desc' }
  if (query.sortBy === 'price_asc')  orderBy = { basePrice: 'asc' }
  if (query.sortBy === 'price_desc') orderBy = { basePrice: 'desc' }
  if (query.sortBy === 'rating')     orderBy = { ratingAverage: 'desc' }
  if (query.sortBy === 'newest')     orderBy = { createdAt: 'desc' }

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
        ratingAverage:  true,
        reviewsCount:   true,
        images:  { take: 1, select: { imageUrl: true }, orderBy: { sortOrder: 'asc' } },
        provider: { select: { id: true, name: true, slug: true } },
        destination: { select: { id: true, name: true, country: true } },
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
