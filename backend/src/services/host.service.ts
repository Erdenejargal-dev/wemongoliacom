import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'

export interface HostListQuery {
  providerType?: string
  page?:         number
  limit?:        number
}

export async function listHosts(query: HostListQuery = {}) {
  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(50, query.limit ?? 12)
  const skip  = (page - 1) * limit

  const where: Record<string, unknown> = { status: 'active', isVerified: true }
  if (query.providerType) {
    where.providerTypes = { has: query.providerType }
  }

  const [providers, total] = await Promise.all([
    prisma.provider.findMany({
      where: where as any,
      orderBy: [{ reviewsCount: 'desc' }, { ratingAverage: 'desc' }],
      skip,
      take: limit,
      select: {
        id:            true,
        name:          true,
        slug:          true,
        description:   true,
        logoUrl:       true,
        coverImageUrl: true,
        city:          true,
        region:        true,
        country:       true,
        providerTypes: true,
        languages:     true,
        ratingAverage: true,
        reviewsCount:  true,
        isVerified:    true,
        totalGuestsHosted: true,
      },
    }),
    prisma.provider.count({ where: where as any }),
  ])

  return {
    data:       providers,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }
}

export async function getHostBySlug(slug: string) {
  const provider = await prisma.provider.findUnique({
    where: { slug },
    select: {
      id:                true,
      name:              true,
      slug:              true,
      description:       true,
      logoUrl:           true,
      coverImageUrl:     true,
      city:              true,
      region:            true,
      country:           true,
      address:           true,
      phone:             true,
      email:             true,
      website:           true,
      providerTypes:     true,
      languages:         true,
      ratingAverage:     true,
      reviewsCount:      true,
      totalGuestsHosted: true,
      isVerified:        true,
      createdAt:         true,
    },
  })

  if (!provider || provider.isVerified === false) throw new AppError('Host not found.', 404)

  // Fetch active listings for each type this host offers
  const [tours, vehicles, accommodations] = await Promise.all([
    prisma.tour.findMany({
      where:   { providerId: provider.id, status: 'active' },
      orderBy: [{ featured: 'desc' }, { ratingAverage: 'desc' }],
      take:    6,
      select: {
        id: true, slug: true, title: true, basePrice: true, currency: true,
        durationDays: true, ratingAverage: true, reviewsCount: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { imageUrl: true } },
      },
    }),
    prisma.vehicle.findMany({
      where:   { providerId: provider.id, status: 'active' },
      orderBy: { ratingAverage: 'desc' },
      take:    6,
      select: {
        id: true, slug: true, title: true, pricePerDay: true, currency: true,
        vehicleType: true, seats: true, withDriver: true, ratingAverage: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { imageUrl: true } },
      },
    }),
    prisma.accommodation.findMany({
      where:   { providerId: provider.id, status: 'active' },
      orderBy: { ratingAverage: 'desc' },
      take:    6,
      select: {
        id: true, slug: true, name: true, accommodationType: true,
        ratingAverage: true, reviewsCount: true,
        images: { orderBy: { sortOrder: 'asc' }, take: 1, select: { imageUrl: true } },
        roomTypes: { select: { basePricePerNight: true, currency: true }, take: 1 },
      },
    }),
  ])

  // Fetch latest reviews (across all listings)
  const reviews = await prisma.review.findMany({
    where:   { providerId: provider.id },
    orderBy: { createdAt: 'desc' },
    take:    5,
    select: {
      id: true, rating: true, comment: true, listingType: true, listingId: true,
      createdAt: true,
      user: { select: { firstName: true, lastName: true, avatarUrl: true, country: true } },
    },
  })

  return { provider, tours, vehicles, accommodations, reviews }
}
