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

  return prisma.provider.update({
    where: { ownerUserId },
    data:  { ...data, slug },
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

  return prisma.booking.update({
    where: { bookingCode },
    data:  {
      bookingStatus: 'cancelled',
      cancelledAt:   new Date(),
      cancelReason:  reason,
    },
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
