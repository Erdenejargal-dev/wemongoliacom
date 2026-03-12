import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'

export interface AccommodationListQuery {
  destinationId?:      string
  accommodationType?:  string
  minPrice?:           number
  maxPrice?:           number
  guests?:             number
  checkIn?:            string
  checkOut?:           string
  amenities?:          string[]
  page?:               number
  limit?:              number
  sort?:               'price_asc' | 'price_desc' | 'rating' | 'newest'
}

function buildOrderBy(sort?: AccommodationListQuery['sort']): Prisma.AccommodationOrderByWithRelationInput[] {
  switch (sort) {
    case 'price_asc':  return [{ ratingAverage: 'asc' }]
    case 'price_desc': return [{ ratingAverage: 'desc' }]
    case 'rating':     return [{ ratingAverage: 'desc' }]
    case 'newest':     return [{ createdAt: 'desc' }]
    default:           return [{ ratingAverage: 'desc' }]
  }
}

export async function listAccommodations(query: AccommodationListQuery = {}) {
  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(50, query.limit ?? 12)
  const skip  = (page - 1) * limit

  const where: Prisma.AccommodationWhereInput = { status: 'active' }

  if (query.destinationId)     where.destinationId     = query.destinationId
  if (query.accommodationType) where.accommodationType = query.accommodationType as any
  if (query.amenities?.length) where.amenities         = { hasEvery: query.amenities }

  // Check room availability if dates provided
  if (query.checkIn && query.checkOut) {
    const checkIn  = new Date(query.checkIn)
    const checkOut = new Date(query.checkOut)

    // Must have at least one room type with available units on all requested dates
    where.roomTypes = {
      some: {
        ...(query.guests ? { maxGuests: { gte: query.guests } } : {}),
        ...(query.minPrice || query.maxPrice ? {
          basePricePerNight: {
            ...(query.minPrice ? { gte: query.minPrice } : {}),
            ...(query.maxPrice ? { lte: query.maxPrice } : {}),
          },
        } : {}),
        availability: {
          every: {
            date:           { gte: checkIn, lt: checkOut },
            availableUnits: { gt: 0 },
            status:         'available',
          },
        },
      },
    }
  }

  const [accommodations, total] = await Promise.all([
    prisma.accommodation.findMany({
      where,
      orderBy: buildOrderBy(query.sort),
      skip,
      take: limit,
      select: {
        id:                true,
        slug:              true,
        name:              true,
        description:       true,
        accommodationType: true,
        checkInTime:       true,
        checkOutTime:      true,
        amenities:         true,
        starRating:        true,
        ratingAverage:     true,
        reviewsCount:      true,
        images: {
          orderBy: { sortOrder: 'asc' as const },
          take:    1,
          select:  { imageUrl: true },
        },
        provider: {
          select: { name: true, slug: true, logoUrl: true, city: true },
        },
        destination: {
          select: { name: true, slug: true },
        },
        roomTypes: {
          select: { id: true, name: true, maxGuests: true, basePricePerNight: true, currency: true },
          take: 3,
        },
      },
    }),
    prisma.accommodation.count({ where }),
  ])

  return {
    data:       accommodations,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }
}

export async function getAccommodationBySlug(slug: string) {
  const acc = await prisma.accommodation.findUnique({
    where:   { slug },
    include: {
      provider:    { select: { id: true, name: true, slug: true, logoUrl: true, city: true, ratingAverage: true, reviewsCount: true } },
      destination: { select: { id: true, name: true, slug: true } },
      images:      { orderBy: { sortOrder: 'asc' } },
      roomTypes: {
        include: {
          availability: {
            where:   { date: { gte: new Date() }, status: 'available' },
            orderBy: { date: 'asc' },
            take:    60,
          },
        },
      },
    },
  })

  if (!acc || acc.status !== 'active') throw new AppError('Accommodation not found.', 404)

  return acc
}
