import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'
import { toPricingDTO } from '../utils/pricing'
import { getActiveRate } from '../utils/fx'
import { assertSupportedCurrency } from '../utils/currency'

export interface AccommodationListQuery {
  destinationId?:       string
  /** Single type — backward compatible. */
  accommodationType?:   string
  /** Comma-separated multi-type filter, e.g. "ger_camp,resort".
   *  Overrides accommodationType when present. */
  accommodationTypes?:  string
  minPrice?:            number
  maxPrice?:            number
  /** Currency of minPrice/maxPrice — converted to MNT for filtering. Defaults to 'MNT'. */
  priceCurrency?:       'MNT' | 'USD'
  guests?:              number
  checkIn?:             string
  checkOut?:            string
  amenities?:           string[]
  page?:                number
  limit?:               number
  sort?:                'price_asc' | 'price_desc' | 'rating' | 'newest'
}

// Phase 2 Option B — price sorting at the accommodation level is a known
// NEEDS CLARIFICATION: the shell has no price, and Prisma has no direct
// "sort parent by MIN(child.normalizedAmountMnt)". Until that product
// decision lands, price_* sorts fall back to rating so results stay stable.
function buildOrderBy(sort?: AccommodationListQuery['sort']): Prisma.AccommodationOrderByWithRelationInput[] {
  switch (sort) {
    case 'price_asc':  return [{ ratingAverage: 'asc' }]
    case 'price_desc': return [{ ratingAverage: 'desc' }]
    case 'rating':     return [{ ratingAverage: 'desc' }]
    case 'newest':     return [{ createdAt: 'desc' }]
    default:           return [{ ratingAverage: 'desc' }]
  }
}

async function resolveMntBounds(query: AccommodationListQuery): Promise<{ minMnt: number | null; maxMnt: number | null }> {
  if (query.minPrice === undefined && query.maxPrice === undefined) return { minMnt: null, maxMnt: null }
  const from = query.priceCurrency ? assertSupportedCurrency(query.priceCurrency) : 'MNT'
  if (from === 'MNT') return { minMnt: query.minPrice ?? null, maxMnt: query.maxPrice ?? null }
  const snap = await getActiveRate(from, 'MNT')
  return {
    minMnt: query.minPrice !== undefined ? query.minPrice * snap.rate : null,
    maxMnt: query.maxPrice !== undefined ? query.maxPrice * snap.rate : null,
  }
}

export async function listAccommodations(query: AccommodationListQuery = {}) {
  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(50, query.limit ?? 12)
  const skip  = (page - 1) * limit

  const where: Prisma.AccommodationWhereInput = { status: 'active' }

  if (query.destinationId) where.destinationId = query.destinationId

  // Multi-type filter takes precedence over single-type
  if (query.accommodationTypes) {
    const types = query.accommodationTypes
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)
    if (types.length > 0) where.accommodationType = { in: types as any[] }
  } else if (query.accommodationType) {
    where.accommodationType = query.accommodationType as any
  }

  if (query.amenities?.length) where.amenities = { hasEvery: query.amenities }

  // Phase 2 Option B — price filter is converted to MNT and applied on
  // the room-level `normalizedAmountMnt`. Kept consistent whether or not
  // the caller specified check-in/out dates.
  const { minMnt, maxMnt } = await resolveMntBounds(query)
  const priceClause: any = {}
  if (minMnt !== null) priceClause.gte = minMnt
  if (maxMnt !== null) priceClause.lte = maxMnt
  const hasPriceClause = Object.keys(priceClause).length > 0

  if (query.checkIn && query.checkOut) {
    const checkIn  = new Date(query.checkIn)
    const checkOut = new Date(query.checkOut)

    where.roomTypes = {
      some: {
        ...(query.guests ? { maxGuests: { gte: query.guests } } : {}),
        ...(hasPriceClause ? { normalizedAmountMnt: priceClause } : {}),
        availability: {
          every: {
            date:           { gte: checkIn, lt: checkOut },
            availableUnits: { gt: 0 },
            status:         'available',
          },
        },
      },
    }
  } else if (hasPriceClause || query.guests) {
    where.roomTypes = {
      some: {
        ...(query.guests ? { maxGuests: { gte: query.guests } } : {}),
        ...(hasPriceClause ? { normalizedAmountMnt: priceClause } : {}),
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
          select: {
            id: true, name: true, maxGuests: true,
            basePricePerNight: true, currency: true,
            baseAmount: true, baseCurrency: true,
            normalizedAmountMnt: true, normalizedFxRate: true, normalizedFxRateAt: true,
          },
          take: 3,
        },
      },
    }),
    prisma.accommodation.count({ where }),
  ])

  return {
    data: accommodations.map((a) => ({
      ...a,
      roomTypes: a.roomTypes.map((rt) => ({ ...rt, pricing: toPricingDTO(rt) })),
    })),
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
          // Room-level images — separate from the property gallery (AccommodationImage).
          // Never mix these two. Room images show the specific ger/room interior.
          images: {
            orderBy: { sortOrder: 'asc' as const },
            take:    5,
          },
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

  return {
    ...acc,
    roomTypes: acc.roomTypes.map((rt) => ({ ...rt, pricing: toPricingDTO(rt) })),
  }
}
