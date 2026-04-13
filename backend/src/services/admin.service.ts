import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'

// ─────────────────────────────────────────────────────────────────────────────
// Users
// ─────────────────────────────────────────────────────────────────────────────

export interface UserListQuery {
  search?: string
  role?:   string
  page?:   number
  limit?:  number
}

export async function listUsers(query: UserListQuery) {
  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(100, query.limit ?? 20)
  const skip  = (page - 1) * limit

  const where: any = {}
  if (query.role)   where.role   = query.role
  if (query.search) {
    where.OR = [
      { firstName: { contains: query.search, mode: 'insensitive' } },
      { lastName:  { contains: query.search, mode: 'insensitive' } },
      { email:     { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id:        true,
        firstName: true,
        lastName:  true,
        email:     true,
        phone:     true,
        role:      true,
        avatarUrl: true,
        createdAt: true,
        _count: { select: { bookings: true, reviews: true } },
      },
    }),
    prisma.user.count({ where }),
  ])

  return {
    data:       users,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }
}

export async function getUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id:        true,
      firstName: true,
      lastName:  true,
      email:     true,
      phone:     true,
      role:      true,
      avatarUrl: true,
      country:   true,
      createdAt: true,
      _count: {
        select: { bookings: true, reviews: true, wishlistItems: true },
      },
    },
  })
  if (!user) throw new AppError('User not found.', 404)
  return user
}

/**
 * Set user role with admin lockout protection.
 * Prevents demoting the last remaining admin.
 */
export async function setUserRole(userId: string, role: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError('User not found.', 404)

  // Guard: cannot demote the last admin
  if (user.role === 'admin' && role !== 'admin') {
    const adminCount = await prisma.user.count({ where: { role: 'admin' } })
    if (adminCount <= 1) {
      throw new AppError(
        'Cannot change role: this is the last admin account. Promote another admin first.',
        400,
      )
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data:  { role: role as any },
    select: { id: true, email: true, role: true },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Providers
// ─────────────────────────────────────────────────────────────────────────────

export interface ProviderListQuery {
  search?:            string
  verificationStatus?: string
  page?:              number
  limit?:             number
}

export async function listProviders(query: ProviderListQuery) {
  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(100, query.limit ?? 20)
  const skip  = (page - 1) * limit

  const where: any = {}
  if (query.verificationStatus) where.verificationStatus = query.verificationStatus
  if (query.search) {
    where.OR = [
      { name:  { contains: query.search, mode: 'insensitive' } },
      { email: { contains: query.search, mode: 'insensitive' } },
      { city:  { contains: query.search, mode: 'insensitive' } },
    ]
  }

  const [providers, total] = await Promise.all([
    prisma.provider.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        owner: { select: { id: true, firstName: true, lastName: true, email: true } },
        _count: { select: { tours: true, vehicles: true, accommodations: true, bookings: true } },
      },
    }),
    prisma.provider.count({ where }),
  ])

  return {
    data:       providers,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }
}

export async function getProvider(providerId: string) {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: {
      owner: { select: { id: true, firstName: true, lastName: true, email: true } },
      _count: { select: { tours: true, vehicles: true, accommodations: true, bookings: true } },
    },
  })
  if (!provider) throw new AppError('Provider not found.', 404)
  return provider
}

/** Set provider plan (FREE / PRO) — admin-only action */
export async function setProviderPlan(providerId: string, plan: string) {
  const provider = await prisma.provider.findUnique({ where: { id: providerId } })
  if (!provider) throw new AppError('Provider not found.', 404)

  return prisma.provider.update({
    where: { id: providerId },
    data:  { plan: plan as any },
    select: { id: true, name: true, plan: true },
  })
}

/** Set operational status (draft/active/paused/archived) — independent of verification */
export async function setProviderStatus(providerId: string, status: string) {
  const provider = await prisma.provider.findUnique({ where: { id: providerId } })
  if (!provider) throw new AppError('Provider not found.', 404)

  return prisma.provider.update({
    where: { id: providerId },
    data:  { status: status as any },
    select: { id: true, name: true, status: true },
  })
}

/**
 * Set verification status with full lifecycle management.
 *
 * Separation of concerns:
 *  - verificationStatus = identity/legitimacy review (this function)
 *  - status (operational) = separate admin action via setProviderStatus
 *  - No auto-activate on verify — admin controls operational status explicitly
 *
 * Side effects on rejection:
 *  - If provider was operationally active, auto-downgrade to paused
 *  - rejectionReason is persisted so provider can see it in their dashboard
 *
 * Fires transactional emails after successful DB update.
 * Email failures are logged and never block the admin action.
 */
export async function setProviderVerificationStatus(
  providerId:       string,
  verificationStatus: string,
  rejectionReason?: string | null,
) {
  const provider = await prisma.provider.findUnique({
    where: { id: providerId },
    include: {
      owner: { select: { email: true, firstName: true, lastName: true } },
    },
  })
  if (!provider) throw new AppError('Provider not found.', 404)

  const isVerified = verificationStatus === 'verified'

  const dataUpdate: any = {
    verificationStatus: verificationStatus as any,
    isVerified,
    reviewedAt:      new Date(),
    // Clear rejectionReason on approve/reset; set it on rejection
    rejectionReason: verificationStatus === 'rejected'
      ? (rejectionReason?.trim() || null)
      : null,
  }

  // When rejected and currently active: auto-pause so they stop showing in public search
  if (verificationStatus === 'rejected' && provider.status === 'active') {
    dataUpdate.status = 'paused'
  }

  const updated = await prisma.provider.update({
    where: { id: providerId },
    data:  dataUpdate,
    select: { id: true, name: true, verificationStatus: true, isVerified: true, status: true, rejectionReason: true },
  })

  // Fire email after successful DB update — failures never block the API response
  const ownerName = `${provider.owner.firstName} ${provider.owner.lastName}`.trim() || 'Provider'
  if (verificationStatus === 'verified') {
    void import('./email.service')
      .then(({ notifyVerificationApproved }) =>
        notifyVerificationApproved({
          providerEmail: provider.email,
          ownerEmail:    provider.owner.email,
          ownerName,
          businessName:  provider.name,
        }),
      )
      .catch(err => console.error('[email] notifyVerificationApproved failed:', err))
  } else if (verificationStatus === 'rejected' && rejectionReason?.trim()) {
    void import('./email.service')
      .then(({ notifyVerificationRejected }) =>
        notifyVerificationRejected({
          providerEmail:   provider.email,
          ownerEmail:      provider.owner.email,
          ownerName,
          businessName:    provider.name,
          rejectionReason: rejectionReason.trim(),
        }),
      )
      .catch(err => console.error('[email] notifyVerificationRejected failed:', err))
  }

  return updated
}

// ─────────────────────────────────────────────────────────────────────────────
// Bookings
// ─────────────────────────────────────────────────────────────────────────────

export interface BookingListQuery {
  search?:      string
  status?:      string
  listingType?: string
  page?:        number
  limit?:       number
}

export async function listBookings(query: BookingListQuery) {
  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(100, query.limit ?? 20)
  const skip  = (page - 1) * limit

  const where: any = {}
  if (query.status)      where.bookingStatus = query.status
  if (query.listingType) where.listingType   = query.listingType

  // NOTE: Prisma does NOT support mixing relation filters and scalar filters
  // inside the same `where.OR` array for findMany. Instead we build
  // separate searchable clauses and combine them with AND + sub-OR.
  if (query.search) {
    where.AND = [
      {
        OR: [
          { bookingCode:      { contains: query.search, mode: 'insensitive' } },
          { travelerFullName: { contains: query.search, mode: 'insensitive' } },
          { travelerEmail:    { contains: query.search, mode: 'insensitive' } },
          { provider:         { name: { contains: query.search, mode: 'insensitive' } } },
        ],
      },
    ]
  }

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id:               true,
        bookingCode:      true,
        listingType:      true,
        listingId:        true,
        bookingStatus:    true,
        paymentStatus:    true,
        totalAmount:      true,
        currency:         true,
        guests:           true,
        startDate:        true,
        endDate:          true,
        travelerFullName: true,
        travelerEmail:    true,
        travelerPhone:    true,
        specialRequests:  true,
        listingSnapshot:  true,
        cancelReason:     true,
        createdAt:        true,
        user:     { select: { id: true, firstName: true, lastName: true, email: true } },
        provider: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.booking.count({ where }),
  ])

  return {
    data:       bookings,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }
}

export async function getAdminBooking(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      user:     { select: { id: true, firstName: true, lastName: true, email: true } },
      provider: { select: { id: true, name: true, slug: true } },
      payment:  true,
    },
  })
  if (!booking) throw new AppError('Booking not found.', 404)
  return booking
}

// ─────────────────────────────────────────────────────────────────────────────
// Platform analytics
// ─────────────────────────────────────────────────────────────────────────────

export async function getPlatformAnalytics() {
  const now              = new Date()
  const startOfMonth     = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalUsers,
    newUsersThisMonth,
    totalProviders,
    activeProviders,
    pendingVerification,
    totalBookings,
    bookingsThisMonth,
    revenueAll,
    revenueThisMonth,
    revenueLastMonth,
    totalReviews,
    avgRating,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.provider.count(),
    prisma.provider.count({ where: { status: 'active' } }),
    prisma.provider.count({ where: { verificationStatus: 'pending_review' } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.booking.aggregate({
      where: { paymentStatus: 'paid' },
      _sum:  { totalAmount: true },
    }),
    prisma.booking.aggregate({
      where: { paymentStatus: 'paid', createdAt: { gte: startOfMonth } },
      _sum:  { totalAmount: true },
    }),
    prisma.booking.aggregate({
      where: { paymentStatus: 'paid', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
      _sum:  { totalAmount: true },
    }),
    prisma.review.count(),
    prisma.review.aggregate({ _avg: { rating: true } }),
  ])

  return {
    users: {
      total:        totalUsers,
      newThisMonth: newUsersThisMonth,
    },
    providers: {
      total:               totalProviders,
      active:              activeProviders,
      pendingVerification,
    },
    bookings: {
      total:     totalBookings,
      thisMonth: bookingsThisMonth,
    },
    revenue: {
      total:     revenueAll._sum?.totalAmount      ?? 0,
      thisMonth: revenueThisMonth._sum?.totalAmount  ?? 0,
      lastMonth: revenueLastMonth._sum?.totalAmount  ?? 0,
    },
    reviews: {
      total:     totalReviews,
      avgRating: avgRating._avg?.rating ?? 0,
    },
  }
}
