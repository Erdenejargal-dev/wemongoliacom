import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'

export interface VehicleListQuery {
  destinationId?: string
  vehicleType?:   string
  withDriver?:    boolean
  transmission?:  string
  minSeats?:      number
  minPrice?:      number
  maxPrice?:      number
  startDate?:     string
  endDate?:       string
  page?:          number
  limit?:         number
  sort?:          'price_asc' | 'price_desc' | 'rating' | 'newest'
}

function buildOrderBy(sort?: VehicleListQuery['sort']): Prisma.VehicleOrderByWithRelationInput[] {
  switch (sort) {
    case 'price_asc':  return [{ pricePerDay: 'asc' }]
    case 'price_desc': return [{ pricePerDay: 'desc' }]
    case 'rating':     return [{ ratingAverage: 'desc' }]
    case 'newest':     return [{ createdAt: 'desc' }]
    default:           return [{ ratingAverage: 'desc' }]
  }
}

export async function listVehicles(query: VehicleListQuery = {}) {
  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(50, query.limit ?? 12)
  const skip  = (page - 1) * limit

  const where: Prisma.VehicleWhereInput = { status: 'active' }

  if (query.destinationId)         where.destinationId = query.destinationId
  if (query.vehicleType)           where.vehicleType   = query.vehicleType as any
  if (query.transmission)          where.transmission  = query.transmission as any
  if (query.withDriver !== undefined) where.withDriver = query.withDriver
  if (query.minSeats !== undefined)   where.seats      = { gte: query.minSeats }
  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.pricePerDay = {}
    if (query.minPrice !== undefined) (where.pricePerDay as any).gte = query.minPrice
    if (query.maxPrice !== undefined) (where.pricePerDay as any).lte = query.maxPrice
  }

  // Availability check: no confirmed booking overlapping the requested range
  if (query.startDate && query.endDate) {
    const start = new Date(query.startDate)
    const end   = new Date(query.endDate)
    where.availability = {
      none: {
        AND: [
          { startDate: { lte: end } },
          { endDate:   { gte: start } },
          { status:    { in: ['booked', 'blocked', 'maintenance'] } },
        ],
      },
    }
  }

  const [vehicles, total] = await Promise.all([
    prisma.vehicle.findMany({
      where,
      orderBy: buildOrderBy(query.sort),
      skip,
      take: limit,
      select: {
        id:           true,
        slug:         true,
        title:        true,
        description:  true,
        vehicleType:  true,
        make:         true,
        model:        true,
        year:         true,
        seats:        true,
        transmission: true,
        withDriver:   true,
        features:     true,
        pricePerDay:  true,
        currency:     true,
        ratingAverage: true,
        reviewsCount:  true,
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
      },
    }),
    prisma.vehicle.count({ where }),
  ])

  return {
    data:       vehicles,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }
}

export async function getVehicleBySlug(slug: string) {
  const vehicle = await prisma.vehicle.findUnique({
    where:   { slug },
    include: {
      provider:    { select: { id: true, name: true, slug: true, logoUrl: true, city: true, ratingAverage: true, reviewsCount: true } },
      destination: { select: { id: true, name: true, slug: true } },
      images:      { orderBy: { sortOrder: 'asc' } },
      availability: {
        where:   { startDate: { gte: new Date() } },
        orderBy: { startDate: 'asc' },
        take:    30,
      },
    },
  })

  if (!vehicle || vehicle.status !== 'active') throw new AppError('Vehicle not found.', 404)

  return vehicle
}
