import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'

export interface TourListQuery {
  destinationId?: string
  category?:      string
  difficulty?:    string
  minPrice?:      number
  maxPrice?:      number
  minDays?:       number
  maxDays?:       number
  guests?:        number
  startDate?:     string   // ISO date — filters departures
  featured?:      boolean
  page?:          number
  limit?:         number
  sort?:          'price_asc' | 'price_desc' | 'rating' | 'newest' | 'popular'
}

const tourCardSelect = {
  id:               true,
  slug:             true,
  title:            true,
  shortDescription: true,
  category:         true,
  durationDays:     true,
  difficulty:       true,
  basePrice:        true,
  currency:         true,
  ratingAverage:    true,
  reviewsCount:     true,
  featured:         true,
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
} satisfies Prisma.TourSelect

function buildOrderBy(sort?: TourListQuery['sort']): Prisma.TourOrderByWithRelationInput[] {
  switch (sort) {
    case 'price_asc':  return [{ basePrice: 'asc' }]
    case 'price_desc': return [{ basePrice: 'desc' }]
    case 'rating':     return [{ ratingAverage: 'desc' }]
    case 'newest':     return [{ createdAt: 'desc' }]
    case 'popular':    return [{ reviewsCount: 'desc' }]
    default:           return [{ featured: 'desc' }, { ratingAverage: 'desc' }]
  }
}

export async function listTours(query: TourListQuery = {}) {
  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(50, query.limit ?? 12)
  const skip  = (page - 1) * limit

  const where: Prisma.TourWhereInput = { status: 'active' }

  if (query.destinationId) where.destinationId = query.destinationId
  if (query.category)      where.category      = { contains: query.category, mode: 'insensitive' }
  if (query.difficulty)    where.difficulty    = query.difficulty as any
  if (query.featured)      where.featured      = true
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.basePrice = {}
    if (query.minPrice !== undefined) (where.basePrice as any).gte = query.minPrice
    if (query.maxPrice !== undefined) (where.basePrice as any).lte = query.maxPrice
  }
  if (query.minDays !== undefined || query.maxDays !== undefined) {
    where.durationDays = {}
    if (query.minDays !== undefined) (where.durationDays as any).gte = query.minDays
    if (query.maxDays !== undefined) (where.durationDays as any).lte = query.maxDays
  }

  // Filter by departure availability
  if (query.startDate || query.guests) {
    const depWhere: Prisma.TourDepartureWhereInput = { status: 'scheduled' }
    if (query.startDate) {
      const d = new Date(query.startDate)
      depWhere.startDate = { gte: d }
    }
    if (query.guests) {
      depWhere.availableSeats = { gte: query.guests }
    }
    where.departures = { some: depWhere }
  }

  const [tours, total] = await Promise.all([
    prisma.tour.findMany({
      where,
      orderBy: buildOrderBy(query.sort),
      skip,
      take:    limit,
      select:  tourCardSelect,
    }),
    prisma.tour.count({ where }),
  ])

  return {
    data:       tours,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }
}

export async function getTourBySlug(slug: string) {
  const tour = await prisma.tour.findUnique({
    where:  { slug },
    include: {
      provider:     { select: { id: true, name: true, slug: true, logoUrl: true, coverImageUrl: true, city: true, ratingAverage: true, reviewsCount: true, languages: true } },
      destination:  { select: { id: true, name: true, slug: true } },
      images:       { orderBy: { sortOrder: 'asc' } },
      itinerary:    { orderBy: { dayNumber: 'asc' } },
      includedItems: true,
      excludedItems: true,
      departures: {
        where:   { status: 'scheduled', startDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        take:    10,
      },
    },
  })

  if (!tour)               throw new AppError('Tour not found.', 404)
  if (tour.status !== 'active') throw new AppError('Tour not found.', 404)

  return tour
}

export async function getTourDepartures(tourId: string) {
  const tour = await prisma.tour.findUnique({ where: { id: tourId }, select: { id: true, status: true } })
  if (!tour || tour.status !== 'active') throw new AppError('Tour not found.', 404)

  const departures = await prisma.tourDeparture.findMany({
    where:   { tourId, status: 'scheduled', startDate: { gte: new Date() } },
    orderBy: { startDate: 'asc' },
  })

  return departures
}
