import { Prisma } from '@prisma/client'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'
import { toPricingDTO } from '../utils/pricing'
import { getActiveRate } from '../utils/fx'
import { assertSupportedCurrency } from '../utils/currency'

/** Returns tour IDs that have at least one departure with remainingSeats >= minRequired. */
async function getTourIdsWithRemainingSeats(
  minRequired: number,
  startFrom: Date,
  maxDate: Date | null,
): Promise<string[]> {
  /**
   * IMPORTANT: Prisma does NOT auto-convert camelCase field names to
   * snake_case column names. The actual PostgreSQL column for `tourId`
   * is `"tourId"` (quoted camelCase), NOT `tour_id`.
   * Same applies to startDate, availableSeats, bookedSeats.
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

export interface TourListQuery {
  destinationId?: string
  category?:      string
  difficulty?:    string
  minPrice?:      number
  maxPrice?:      number
  /** Currency of minPrice/maxPrice — converted to MNT for filtering. Defaults to 'MNT'. */
  priceCurrency?: 'MNT' | 'USD'
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
  id:                  true,
  slug:                true,
  title:               true,
  shortDescription:    true,
  category:            true,
  durationDays:        true,
  maxGuests:           true,
  difficulty:          true,
  basePrice:           true,
  currency:            true,
  baseAmount:          true,
  baseCurrency:        true,
  normalizedAmountMnt: true,
  normalizedFxRate:    true,
  normalizedFxRateAt:  true,
  ratingAverage:       true,
  reviewsCount:        true,
  featured:            true,
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
    case 'price_asc':  return [{ normalizedAmountMnt: 'asc' }]
    case 'price_desc': return [{ normalizedAmountMnt: 'desc' }]
    case 'rating':     return [{ ratingAverage: 'desc' }]
    case 'newest':     return [{ createdAt: 'desc' }]
    case 'popular':    return [{ reviewsCount: 'desc' }]
    default:           return [{ featured: 'desc' }, { ratingAverage: 'desc' }]
  }
}

async function resolveMntBounds(query: TourListQuery): Promise<{ minMnt: number | null; maxMnt: number | null }> {
  if (query.minPrice === undefined && query.maxPrice === undefined) return { minMnt: null, maxMnt: null }
  const from = query.priceCurrency ? assertSupportedCurrency(query.priceCurrency) : 'MNT'
  if (from === 'MNT') {
    return { minMnt: query.minPrice ?? null, maxMnt: query.maxPrice ?? null }
  }
  const snap = await getActiveRate(from, 'MNT')
  return {
    minMnt: query.minPrice !== undefined ? query.minPrice * snap.rate : null,
    maxMnt: query.maxPrice !== undefined ? query.maxPrice * snap.rate : null,
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
  // Phase 2 Option B — filter on MNT-normalized amount so MNT + USD
  // listings are comparable.
  const { minMnt, maxMnt } = await resolveMntBounds(query)
  if (minMnt !== null || maxMnt !== null) {
    where.normalizedAmountMnt = {}
    if (minMnt !== null) (where.normalizedAmountMnt as any).gte = minMnt
    if (maxMnt !== null) (where.normalizedAmountMnt as any).lte = maxMnt
  }
  if (query.minDays !== undefined || query.maxDays !== undefined) {
    where.durationDays = {}
    if (query.minDays !== undefined) (where.durationDays as any).gte = query.minDays
    if (query.maxDays !== undefined) (where.durationDays as any).lte = query.maxDays
  }

  // Filter by departure availability (remainingSeats = availableSeats - bookedSeats)
  if (query.startDate || query.guests) {
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    const startFrom = query.startDate
      ? (() => {
          const d = new Date(query.startDate)
          return d > now ? d : now
        })()
      : now
    const minRequired = Math.max(1, query.guests ?? 0)
    const tourIds = await getTourIdsWithRemainingSeats(minRequired, startFrom, null)
    where.id = { in: tourIds }
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
    data:       tours.map((t) => ({ ...t, pricing: toPricingDTO(t) })),
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
        take:    20,
        select: {
          id: true, startDate: true, endDate: true,
          availableSeats: true, bookedSeats: true,
          priceOverride: true, currency: true,
          baseOverrideAmount: true, baseOverrideCurrency: true,
          status: true,
        },
      },
    },
  })

  if (!tour)               throw new AppError('Tour not found.', 404)
  if (tour.status !== 'active') throw new AppError('Tour not found.', 404)

  // Only expose departures with at least 1 remaining seat (consistent with search)
  // Phase 3 — attach a per-departure `pricing` DTO when the departure has a
  // price override, so the frontend can read a single consistent shape and
  // stop branching on legacy override columns.
  const departures = tour.departures
    .filter((d) => d.availableSeats - d.bookedSeats >= 1)
    .slice(0, 10)
    .map((d) => ({
      ...d,
      pricing: toPricingDTO({
        baseAmount:     d.baseOverrideAmount ?? undefined,
        baseCurrency:   d.baseOverrideCurrency ?? undefined,
        legacyAmount:   d.priceOverride ?? undefined,
        legacyCurrency: d.currency ?? undefined,
      }),
    }))

  return {
    ...tour,
    departures,
    pricing: toPricingDTO(tour),
  }
}

export async function getTourDepartures(tourId: string) {
  const tour = await prisma.tour.findUnique({ where: { id: tourId }, select: { id: true, status: true } })
  if (!tour || tour.status !== 'active') throw new AppError('Tour not found.', 404)

  const departures = await prisma.tourDeparture.findMany({
    where:   { tourId, status: 'scheduled', startDate: { gte: new Date() } },
    orderBy: { startDate: 'asc' },
  })

  // Only return departures with at least 1 remaining seat
  return departures.filter((d) => (d.availableSeats - d.bookedSeats) >= 1)
}
