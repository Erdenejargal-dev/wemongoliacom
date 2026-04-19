import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'
import { toPricingDTO, type PricingDTOContext } from '../utils/pricing'
import { getActiveRateSafe } from '../utils/fx'

// ── Slug helper ───────────────────────────────────────────────────────────────

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export interface DestinationListQuery {
  featured?: boolean
  page?:     number
  limit?:    number
}

export async function listDestinations(query: DestinationListQuery = {}) {
  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(50, query.limit ?? 20)
  const skip  = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (query.featured !== undefined) where.featured = query.featured

  const [destinations, total] = await Promise.all([
    prisma.destination.findMany({
      where,
      orderBy: [{ featured: 'desc' }, { name: 'asc' }],
      skip,
      take: limit,
      select: {
        id:               true,
        name:             true,
        slug:             true,
        country:          true,
        region:           true,
        shortDescription: true,
        heroImageUrl:     true,
        highlights:       true,
        bestTimeToVisit:  true,
        featured:         true,
      },
    }),
    prisma.destination.count({ where }),
  ])

  return {
    data: destinations,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }
}

export async function getDestinationBySlug(slug: string) {
  const destination = await prisma.destination.findUnique({
    where: { slug },
  })
  if (!destination) throw new AppError('Destination not found.', 404)

  // Fetch featured active tours linked to this destination (up to 6).
  //
  // Phase 6.3 — project the Phase-2 normalized pricing columns AND attach a
  // `pricing` DTO, mirroring the tours-list card contract. Destination cards
  // previously selected only `basePrice`+`currency`, which stranded them on
  // the legacy fallback path and prevented display-currency switching.
  const [tours, mntToUsd] = await Promise.all([
    prisma.tour.findMany({
      where: {
        destinationId: destination.id,
        status:        'active',
      },
      orderBy: [{ featured: 'desc' }, { ratingAverage: 'desc' }],
      take: 6,
      select: {
        id:                  true,
        slug:                true,
        title:               true,
        shortDescription:    true,
        basePrice:           true,
        currency:            true,
        baseAmount:          true,
        baseCurrency:        true,
        normalizedAmountMnt: true,
        normalizedFxRate:    true,
        normalizedFxRateAt:  true,
        durationDays:        true,
        difficulty:          true,
        ratingAverage:       true,
        reviewsCount:        true,
        featured:            true,
        images: {
          orderBy: { sortOrder: 'asc' },
          take:    1,
          select:  { imageUrl: true },
        },
        provider: {
          select: { name: true, slug: true, logoUrl: true },
        },
      },
    }),
    getActiveRateSafe('MNT', 'USD'),
  ])

  const pricingCtx: PricingDTOContext = { mntToUsdRate: mntToUsd }
  const toursWithPricing = tours.map((t) => ({ ...t, pricing: toPricingDTO(t, pricingCtx) }))

  return { destination, tours: toursWithPricing }
}

// ── Admin CRUD ────────────────────────────────────────────────────────────────

export interface AdminDestinationInput {
  name:             string
  slug?:            string
  country?:         string
  region?:          string | null
  shortDescription?: string | null
  description?:     string | null
  heroImageUrl?:    string | null
  gallery?:         string[]
  highlights?:      string[]
  activities?:      string[]
  tips?:            string[]
  bestTimeToVisit?: string | null
  weatherInfo?:     string | null
  featured?:        boolean
}

export async function adminListDestinations() {
  return prisma.destination.findMany({
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
    select: {
      id:               true,
      name:             true,
      slug:             true,
      country:          true,
      region:           true,
      shortDescription: true,
      heroImageUrl:     true,
      featured:         true,
      createdAt:        true,
      _count: {
        select: { tours: true, accommodations: true },
      },
    },
  })
}

export async function adminGetDestination(id: string) {
  const destination = await prisma.destination.findUnique({ where: { id } })
  if (!destination) throw new AppError('Destination not found.', 404)
  return destination
}

export async function adminCreateDestination(data: AdminDestinationInput) {
  const slug = (data.slug?.trim() || slugify(data.name)).replace(/\s+/g, '-')
  const existing = await prisma.destination.findUnique({ where: { slug } })
  if (existing) throw new AppError(`Slug "${slug}" is already taken.`, 409)

  return prisma.destination.create({
    data: {
      name:             data.name.trim(),
      slug,
      country:          data.country?.trim()          ?? 'Mongolia',
      region:           data.region?.trim()           ?? null,
      shortDescription: data.shortDescription?.trim() ?? null,
      description:      data.description?.trim()      ?? null,
      heroImageUrl:     data.heroImageUrl?.trim()     ?? null,
      gallery:          data.gallery                  ?? [],
      highlights:       data.highlights               ?? [],
      activities:       data.activities               ?? [],
      tips:             data.tips                     ?? [],
      bestTimeToVisit:  data.bestTimeToVisit?.trim()  ?? null,
      weatherInfo:      data.weatherInfo?.trim()      ?? null,
      featured:         data.featured                 ?? false,
    },
  })
}

export async function adminUpdateDestination(id: string, data: Partial<AdminDestinationInput>) {
  const existing = await prisma.destination.findUnique({ where: { id } })
  if (!existing) throw new AppError('Destination not found.', 404)

  // If slug is being changed, verify it's not already taken
  if (data.slug && data.slug !== existing.slug) {
    const conflict = await prisma.destination.findUnique({ where: { slug: data.slug } })
    if (conflict) throw new AppError(`Slug "${data.slug}" is already taken.`, 409)
  }

  return prisma.destination.update({
    where: { id },
    data:  {
      ...(data.name             !== undefined && { name:             data.name.trim() }),
      ...(data.slug             !== undefined && { slug:             data.slug.trim() }),
      ...(data.country          !== undefined && { country:          data.country?.trim() ?? 'Mongolia' }),
      ...(data.region           !== undefined && { region:           data.region?.trim()  ?? null }),
      ...(data.shortDescription !== undefined && { shortDescription: data.shortDescription?.trim() ?? null }),
      ...(data.description      !== undefined && { description:      data.description?.trim()      ?? null }),
      ...(data.heroImageUrl     !== undefined && { heroImageUrl:     data.heroImageUrl?.trim()      ?? null }),
      ...(data.gallery          !== undefined && { gallery:          data.gallery }),
      ...(data.highlights       !== undefined && { highlights:       data.highlights }),
      ...(data.activities       !== undefined && { activities:       data.activities }),
      ...(data.tips             !== undefined && { tips:             data.tips }),
      ...(data.bestTimeToVisit  !== undefined && { bestTimeToVisit:  data.bestTimeToVisit?.trim() ?? null }),
      ...(data.weatherInfo      !== undefined && { weatherInfo:      data.weatherInfo?.trim()     ?? null }),
      ...(data.featured         !== undefined && { featured:         data.featured }),
    },
  })
}

export async function adminDeleteDestination(id: string) {
  const existing = await prisma.destination.findUnique({
    where: { id },
    include: { _count: { select: { tours: true } } },
  })
  if (!existing) throw new AppError('Destination not found.', 404)
  if (existing._count.tours > 0) {
    throw new AppError(
      `Cannot delete: ${existing._count.tours} tour(s) are linked to this destination. Unlink them first.`,
      409,
    )
  }
  return prisma.destination.delete({ where: { id } })
}

export async function adminToggleDestinationFeatured(id: string) {
  const existing = await prisma.destination.findUnique({ where: { id } })
  if (!existing) throw new AppError('Destination not found.', 404)
  return prisma.destination.update({
    where: { id },
    data:  { featured: !existing.featured },
  })
}
