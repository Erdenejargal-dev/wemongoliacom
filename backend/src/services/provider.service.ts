import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'
import { uniqueSlug } from '../utils/slug'

// ─────────────────────────────────────────────────────────────────────────────
// Get provider for the authenticated owner
// ─────────────────────────────────────────────────────────────────────────────

export async function getMyProvider(ownerUserId: string) {
  const provider = await prisma.provider.findUnique({
    where: { ownerUserId },
    include: {
      _count: {
        select: {
          tours:          true,
          vehicles:       true,
          accommodations: true,
          bookings:       true,
        },
      },
    },
  })
  if (!provider) throw new AppError('Provider profile not found. Please register your business first.', 404)
  return provider
}

// ─────────────────────────────────────────────────────────────────────────────
// Update provider profile
// ─────────────────────────────────────────────────────────────────────────────

export interface UpdateProviderInput {
  name?:         string
  tagline?:      string
  description?:  string
  logoUrl?:      string
  coverUrl?:     string
  phone?:        string
  email?:        string
  websiteUrl?:   string
  address?:      string
  city?:         string
  country?:      string
  socialLinks?:  Record<string, string>
}

export async function updateMyProvider(ownerUserId: string, data: UpdateProviderInput) {
  const provider = await prisma.provider.findUnique({ where: { ownerUserId } })
  if (!provider) throw new AppError('Provider profile not found.', 404)

  // If name is changing, regenerate slug
  let slug = provider.slug
  if (data.name && data.name !== provider.name) {
    slug = await uniqueSlug(data.name, async (s) => {
      const exists = await prisma.provider.findUnique({ where: { slug: s } })
      return !!exists
    })
  }

  // Map API field names to Prisma schema (websiteUrl -> website, coverUrl -> coverImageUrl)
  const mapped = { ...data }
  if ('websiteUrl' in mapped && mapped.websiteUrl !== undefined) {
    ;(mapped as any).website = mapped.websiteUrl
    delete (mapped as any).websiteUrl
  }
  if ('coverUrl' in mapped && mapped.coverUrl !== undefined) {
    ;(mapped as any).coverImageUrl = mapped.coverUrl
    delete (mapped as any).coverUrl
  }

  return prisma.provider.update({
    where: { ownerUserId },
    data:  { ...mapped, slug },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider bookings — list with filters
// ─────────────────────────────────────────────────────────────────────────────

export interface ProviderBookingQuery {
  bookingStatus?: string
  listingType?:   string
  page?:          number
  limit?:         number
}

export async function listProviderBookings(ownerUserId: string, query: ProviderBookingQuery) {
  const provider = await prisma.provider.findUnique({ where: { ownerUserId } })
  if (!provider) throw new AppError('Provider not found.', 404)

  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(50, query.limit ?? 20)
  const skip  = (page - 1) * limit

  const where: any = { providerId: provider.id }
  if (query.bookingStatus) where.bookingStatus = query.bookingStatus
  if (query.listingType)   where.listingType   = query.listingType

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, phone: true, avatarUrl: true } },
      },
    }),
    prisma.booking.count({ where }),
  ])

  return {
    data:       bookings,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirm booking (provider action)
// ─────────────────────────────────────────────────────────────────────────────

export async function confirmBooking(bookingCode: string, ownerUserId: string) {
  const booking = await getProviderBooking(bookingCode, ownerUserId)
  if (booking.bookingStatus !== 'pending')
    throw new AppError(`Cannot confirm a booking with status "${booking.bookingStatus}".`, 400)

  return prisma.booking.update({
    where: { bookingCode },
    data:  { bookingStatus: 'confirmed' },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Complete booking (provider action)
// ─────────────────────────────────────────────────────────────────────────────

export async function completeBooking(bookingCode: string, ownerUserId: string) {
  const booking = await getProviderBooking(bookingCode, ownerUserId)
  if (booking.bookingStatus !== 'confirmed')
    throw new AppError(`Cannot complete a booking with status "${booking.bookingStatus}".`, 400)

  return prisma.booking.update({
    where: { bookingCode },
    data:  { bookingStatus: 'completed' },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Cancel booking (provider action)
// ─────────────────────────────────────────────────────────────────────────────

export async function cancelBookingByProvider(bookingCode: string, ownerUserId: string, reason?: string) {
  const booking = await getProviderBooking(bookingCode, ownerUserId)
  if (['cancelled', 'completed'].includes(booking.bookingStatus))
    throw new AppError(`Booking is already ${booking.bookingStatus}.`, 400)

  return prisma.$transaction(async (tx) => {
    const b = await tx.booking.update({
      where: { bookingCode },
      data:  {
        bookingStatus: 'cancelled',
        cancelledAt:   new Date(),
        cancelReason:  reason,
      },
    })

    if (booking.tourDepartureId && booking.guests > 0) {
      await tx.tourDeparture.update({
        where: { id: booking.tourDepartureId },
        data:  { bookedSeats: { decrement: booking.guests } },
      })
    }

    return b
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Analytics — summary stats for provider dashboard
// ─────────────────────────────────────────────────────────────────────────────

export async function getProviderAnalytics(ownerUserId: string) {
  const provider = await prisma.provider.findUnique({ where: { ownerUserId } })
  if (!provider) throw new AppError('Provider not found.', 404)

  const pid = provider.id
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalBookings,
    pendingBookings,
    confirmedBookings,
    completedBookings,
    cancelledBookings,
    revenueAgg,
    thisMonthAgg,
    lastMonthAgg,
    totalReviews,
    avgRating,
  ] = await Promise.all([
    prisma.booking.count({ where: { providerId: pid } }),
    prisma.booking.count({ where: { providerId: pid, bookingStatus: 'pending' } }),
    prisma.booking.count({ where: { providerId: pid, bookingStatus: 'confirmed' } }),
    prisma.booking.count({ where: { providerId: pid, bookingStatus: 'completed' } }),
    prisma.booking.count({ where: { providerId: pid, bookingStatus: 'cancelled' } }),
    prisma.booking.aggregate({
      where: { providerId: pid, paymentStatus: 'paid' },
      _sum:  { totalAmount: true },
    }),
    prisma.booking.aggregate({
      where: { providerId: pid, paymentStatus: 'paid', createdAt: { gte: startOfMonth } },
      _sum:   { totalAmount: true },
      _count: { _all: true },
    }),
    prisma.booking.aggregate({
      where: { providerId: pid, paymentStatus: 'paid', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum:   { totalAmount: true },
      _count: { _all: true },
    }),
    prisma.review.count({ where: { providerId: pid } }),
    prisma.review.aggregate({ where: { providerId: pid }, _avg: { rating: true } }),
  ])

  return {
    bookings: {
      total:     totalBookings,
      pending:   pendingBookings,
      confirmed: confirmedBookings,
      completed: completedBookings,
      cancelled: cancelledBookings,
    },
    revenue: {
      total:          (revenueAgg._sum?.totalAmount    ?? 0),
      thisMonth:      (thisMonthAgg._sum?.totalAmount  ?? 0),
      lastMonth:      (lastMonthAgg._sum?.totalAmount  ?? 0),
      thisMonthCount: (thisMonthAgg._count?._all       ?? 0),
      lastMonthCount: (lastMonthAgg._count?._all       ?? 0),
    },
    reviews: {
      total:      totalReviews,
      avgRating:  avgRating._avg.rating ?? 0,
    },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider reviews — list all reviews for this provider
// ─────────────────────────────────────────────────────────────────────────────

export interface ProviderReviewQuery {
  page?:  number
  limit?: number
}

export interface ProviderReviewItem {
  id:            string
  rating:        number
  title:         string | null
  comment:       string | null
  providerReply: string | null
  createdAt:     string
  listingType:   string
  listingId:     string
  listingName:   string
  user: {
    firstName: string
    lastName:  string
    avatarUrl: string | null
  }
}

export async function listProviderReviews(ownerUserId: string, query: ProviderReviewQuery) {
  const provider = await prisma.provider.findUnique({ where: { ownerUserId } })
  if (!provider) throw new AppError('Provider not found.', 404)

  const page  = Math.max(1, query.page ?? 1)
  const limit = Math.min(50, query.limit ?? 20)
  const skip  = (page - 1) * limit

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where: { providerId: provider.id },
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id:            true,
        rating:        true,
        title:         true,
        comment:       true,
        providerReply: true,
        createdAt:     true,
        listingType:   true,
        listingId:     true,
        user: { select: { firstName: true, lastName: true, avatarUrl: true } },
      },
    }),
    prisma.review.count({ where: { providerId: provider.id } }),
  ])

  // Resolve listing names
  const tourIds        = reviews.filter(r => r.listingType === 'tour').map(r => r.listingId)
  const vehicleIds     = reviews.filter(r => r.listingType === 'vehicle').map(r => r.listingId)
  const accommodationIds = reviews.filter(r => r.listingType === 'accommodation').map(r => r.listingId)

  const [tours, vehicles, accommodations] = await Promise.all([
    tourIds.length > 0 ? prisma.tour.findMany({ where: { id: { in: tourIds } }, select: { id: true, title: true } }) : [],
    vehicleIds.length > 0 ? prisma.vehicle.findMany({ where: { id: { in: vehicleIds } }, select: { id: true, title: true } }) : [],
    accommodationIds.length > 0 ? prisma.accommodation.findMany({ where: { id: { in: accommodationIds } }, select: { id: true, name: true } }) : [],
  ])

  const listingName = (type: string, id: string) => {
    if (type === 'tour') return tours.find((t: { id: string }) => t.id === id)?.title ?? 'Tour'
    if (type === 'vehicle') return vehicles.find((v: { id: string }) => v.id === id)?.title ?? 'Vehicle'
    if (type === 'accommodation') return accommodations.find((a: { id: string }) => a.id === id)?.name ?? 'Accommodation'
    return 'Listing'
  }

  const data: ProviderReviewItem[] = reviews.map(r => ({
    id:            r.id,
    rating:        r.rating,
    title:         r.title,
    comment:       r.comment,
    providerReply: r.providerReply,
    createdAt:     r.createdAt.toISOString(),
    listingType:   r.listingType,
    listingId:     r.listingId,
    listingName:   listingName(r.listingType, r.listingId),
    user:          { firstName: r.user.firstName, lastName: r.user.lastName, avatarUrl: r.user.avatarUrl },
  }))

  return {
    data,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider reply to review
// ─────────────────────────────────────────────────────────────────────────────

export async function replyToReviewByOwner(ownerUserId: string, reviewId: string, reply: string) {
  const provider = await prisma.provider.findUnique({ where: { ownerUserId } })
  if (!provider) throw new AppError('Provider not found.', 404)
  return (await import('./review.service')).replyToReview(reviewId, provider.id, reply)
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider Tours — List & Create (Phase 3A)
// ─────────────────────────────────────────────────────────────────────────────

export interface ProviderTourQuery {
  status?: string
  page?:   number
  limit?:  number
}

export interface CreateTourInput {
  title:            string
  shortDescription?: string
  description?:     string
  durationDays?:    number
  basePrice:        number
  currency?:        string
  destinationId?:   string
  status?:          'draft' | 'active' | 'paused'
}

const providerTourSelect = {
  id:               true,
  slug:             true,
  title:            true,
  shortDescription: true,
  durationDays:     true,
  basePrice:        true,
  currency:         true,
  status:           true,
  ratingAverage:    true,
  reviewsCount:     true,
  createdAt:        true,
  updatedAt:        true,
  images:           { orderBy: { sortOrder: 'asc' as const }, take: 1, select: { imageUrl: true } },
  destination:      { select: { id: true, name: true, slug: true } },
} as const

export async function listProviderTours(ownerUserId: string, query: ProviderTourQuery) {
  const provider = await prisma.provider.findUnique({ where: { ownerUserId }, select: { id: true } })
  if (!provider) throw new AppError('Provider not found.', 404)

  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(50, query.limit ?? 20)
  const skip  = (page - 1) * limit

  const where: Record<string, unknown> = { providerId: provider.id }
  if (query.status) where.status = query.status

  const [tours, total] = await Promise.all([
    prisma.tour.findMany({
      where,
      select: providerTourSelect,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.tour.count({ where }),
  ])

  return {
    data: tours,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }
}

export async function createProviderTour(ownerUserId: string, input: CreateTourInput) {
  const provider = await prisma.provider.findUnique({ where: { ownerUserId }, select: { id: true } })
  if (!provider) throw new AppError('Provider not found.', 404)

  if (input.destinationId) {
    const dest = await prisma.destination.findUnique({ where: { id: input.destinationId }, select: { id: true } })
    if (!dest) throw new AppError('Destination not found.', 400)
  }

  const slug = await uniqueSlug(input.title, async (s) => {
    const exists = await prisma.tour.findUnique({ where: { slug: s } })
    return !!exists
  })
  if (!slug) throw new AppError('Title must contain at least one letter or number.', 400)

  const tour = await prisma.tour.create({
    data: {
      providerId:       provider.id,
      slug,
      title:            input.title,
      shortDescription: input.shortDescription || null,
      description:      input.description || null,
      durationDays:     input.durationDays ?? 1,
      basePrice:        input.basePrice,
      currency:         input.currency ?? 'USD',
      destinationId:    input.destinationId || null,
      status:           input.status ?? 'draft',
    },
    select: providerTourSelect,
  })

  return tour
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: load booking and assert it belongs to this provider
// ─────────────────────────────────────────────────────────────────────────────

async function getProviderBooking(bookingCode: string, ownerUserId: string) {
  const booking = await prisma.booking.findUnique({
    where: { bookingCode },
    include: { provider: { select: { ownerUserId: true } } },
  })
  if (!booking) throw new AppError('Booking not found.', 404)
  if (booking.provider.ownerUserId !== ownerUserId) throw new AppError('Forbidden.', 403)
  return booking
}
