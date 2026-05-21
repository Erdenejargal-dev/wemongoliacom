import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'

export interface GuideListQuery {
  specialty?: string
  language?:  string
  certified?: boolean
  location?:  string
  page?:      number
  limit?:     number
  sort?:      'rating' | 'newest' | 'experience'
}

function buildOrderBy(sort?: GuideListQuery['sort']) {
  switch (sort) {
    case 'newest':     return [{ createdAt: 'desc' as const }]
    case 'experience': return [{ yearsExperience: 'desc' as const }]
    default:           return [{ ratingAverage: 'desc' as const }]
  }
}

export async function listGuides(query: GuideListQuery) {
  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(48, query.limit ?? 24)
  const skip  = (page - 1) * limit

  const where: Record<string, unknown> = { status: 'active' }

  if (query.specialty) {
    where.specialties = { has: query.specialty }
  }
  if (query.language) {
    where.languages = { has: query.language }
  }
  if (query.certified !== undefined) {
    where.certified = query.certified
  }
  if (query.location) {
    where.location = { contains: query.location, mode: 'insensitive' }
  }

  const [guides, total] = await Promise.all([
    prisma.guide.findMany({
      where,
      orderBy: buildOrderBy(query.sort),
      skip,
      take: limit,
      select: {
        id:              true,
        slug:            true,
        name:            true,
        bio:             true,
        photo:           true,
        coverImage:      true,
        location:        true,
        specialties:     true,
        languages:       true,
        certified:       true,
        yearsExperience: true,
        totalGuests:     true,
        dailyRate:       true,
        dailyCurrency:   true,
        ratingAverage:   true,
        reviewsCount:    true,
        verified:        true,
      },
    }),
    prisma.guide.count({ where }),
  ])

  return {
    guides,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  }
}

export async function getGuideBySlug(slug: string) {
  const guide = await prisma.guide.findUnique({
    where: { slug },
    include: {
      reviews: {
        orderBy: { date: 'desc' },
        take: 50,
      },
    },
  })

  if (!guide || guide.status === 'archived') {
    throw new AppError(404, 'Guide not found')
  }

  return guide
}
