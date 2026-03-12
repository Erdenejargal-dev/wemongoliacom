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

export async function setUserRole(userId: string, role: string) {
  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) throw new AppError('User not found.', 404)

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
  search?:   string
  status?:   string
  page?:     number
  limit?:    number
}

export async function listProviders(query: ProviderListQuery) {
  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(100, query.limit ?? 20)
  const skip  = (page - 1) * limit

  const where: any = {}
  if (query.status) where.status = query.status
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

export async function setProviderStatus(providerId: string, status: string) {
  const provider = await prisma.provider.findUnique({ where: { id: providerId } })
  if (!provider) throw new AppError('Provider not found.', 404)

  return prisma.provider.update({
    where: { id: providerId },
    data:  { status: status as any },
    select: { id: true, name: true, status: true },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Platform analytics
// ─────────────────────────────────────────────────────────────────────────────

export async function getPlatformAnalytics() {
  const now            = new Date()
  const startOfMonth   = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)
  const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0)

  const [
    totalUsers,
    newUsersThisMonth,
    totalProviders,
    activeProviders,
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
      total:         totalUsers,
      newThisMonth:  newUsersThisMonth,
    },
    providers: {
      total:   totalProviders,
      active:  activeProviders,
    },
    bookings: {
      total:        totalBookings,
      thisMonth:    bookingsThisMonth,
    },
    revenue: {
      total:         revenueAll._sum?.totalAmount      ?? 0,
      thisMonth:     revenueThisMonth._sum?.totalAmount  ?? 0,
      lastMonth:     revenueLastMonth._sum?.totalAmount  ?? 0,
    },
    reviews: {
      total:     totalReviews,
      avgRating: avgRating._avg?.rating ?? 0,
    },
  }
}
