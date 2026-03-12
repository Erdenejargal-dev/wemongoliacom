import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'

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

  // Fetch featured active tours linked to this destination (up to 6)
  const tours = await prisma.tour.findMany({
    where: {
      destinationId: destination.id,
      status:        'active',
    },
    orderBy: [{ featured: 'desc' }, { ratingAverage: 'desc' }],
    take: 6,
    select: {
      id:               true,
      slug:             true,
      title:            true,
      shortDescription: true,
      basePrice:        true,
      currency:         true,
      durationDays:     true,
      difficulty:       true,
      ratingAverage:    true,
      reviewsCount:     true,
      featured:         true,
      images: {
        orderBy: { sortOrder: 'asc' },
        take:    1,
        select:  { imageUrl: true },
      },
      provider: {
        select: { name: true, slug: true, logoUrl: true },
      },
    },
  })

  return { destination, tours }
}
