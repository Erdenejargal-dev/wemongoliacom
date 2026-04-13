import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'
import { uniqueSlug } from '../utils/slug'
import { getListingLimit, type PlanType } from '../config/limits'

// ─────────────────────────────────────────────────────────────────────────────
// Verification submission (provider self-service)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Provider explicitly submits themselves for admin verification review.
 * Allowed only when verificationStatus is 'unverified' or 'rejected'.
 * Sets verificationStatus → 'pending_review'.
 * Admins are then responsible for reviewing and calling setProviderVerificationStatus.
 */
export async function submitForVerification(ownerUserId: string) {
  const provider = await prisma.provider.findUnique({
    where: { ownerUserId },
    select: {
      id:                 true,
      verificationStatus: true,
      name:               true,
      email:              true,
      providerTypes:      true,
      owner: { select: { email: true, firstName: true, lastName: true } },
    },
  })
  if (!provider) throw new AppError('Provider profile not found.', 404)

  if (!['unverified', 'rejected'].includes(provider.verificationStatus)) {
    throw new AppError(
      `Cannot submit for review: current verification status is "${provider.verificationStatus}". ` +
      'Only unverified or rejected providers can submit.',
      400,
    )
  }

  const updated = await prisma.provider.update({
    where: { ownerUserId },
    data: {
      verificationStatus: 'pending_review',
      rejectionReason:    null,  // Clear previous rejection reason on resubmit
    },
    select: { id: true, name: true, verificationStatus: true },
  })

  // Fire emails after successful DB update — never block the response
  void import('./email.service')
    .then(({ notifyVerificationSubmitted }) =>
      notifyVerificationSubmitted({
        providerEmail: provider.email,
        ownerEmail:    provider.owner.email,
        ownerName:     `${provider.owner.firstName} ${provider.owner.lastName}`.trim() || 'Provider',
        businessName:  provider.name,
        providerTypes: provider.providerTypes.map(String),
      }),
    )
    .catch(err => console.error('[email] notifyVerificationSubmitted failed:', err))

  return updated
}

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

    if (booking.listingType === 'accommodation' && booking.roomTypeId && booking.startDate && booking.endDate) {
      const { releaseRoomAvailabilityForCancel } = await import('./booking.service')
      await releaseRoomAvailabilityForCancel(tx, booking.roomTypeId, booking.startDate, booking.endDate)
    }

    return b
  })
    .then((updated) => {
      void import('./email.service')
        .then(({ notifyBookingCancelledByProvider }) => notifyBookingCancelledByProvider(bookingCode))
        .catch((err) => console.error('[email] notifyBookingCancelledByProvider schedule failed:', err))
      return updated
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
  const provider = await prisma.provider.findUnique({ where: { ownerUserId }, select: { id: true, plan: true } })
  if (!provider) throw new AppError('Provider not found.', 404)

  if (input.destinationId) {
    const dest = await prisma.destination.findUnique({ where: { id: input.destinationId }, select: { id: true } })
    if (!dest) throw new AppError('Destination not found.', 400)
  }

  // Pre-compute slug outside transaction (relies on @unique constraint as final guard)
  const slug = await uniqueSlug(input.title, async (s) => {
    const exists = await prisma.tour.findUnique({ where: { slug: s } })
    return !!exists
  })
  if (!slug) throw new AppError('Title must contain at least one letter or number.', 400)

  const status = input.status ?? 'draft'
  if (status === 'active') {
    validateTourReadiness({
      title: input.title,
      description: input.description || null,
      basePrice: input.basePrice,
      imageCount: 0,
      departureCount: 0,
    })
  }

  // ── Plan limit check + create in one transaction (prevents race conditions) ─
  const plan  = (provider.plan as PlanType) ?? 'FREE'
  const limit = getListingLimit(plan, 'tours')

  const tour = await prisma.$transaction(async (tx) => {
    if (limit !== Infinity) {
      const currentCount = await tx.tour.count({
        where: { providerId: provider.id, status: { not: 'archived' } },
      })
      if (currentCount >= limit) {
        throw new AppError(
          `You have reached the maximum of ${limit} tours on the ${plan} plan. ` +
          `Archive an existing tour or upgrade your plan to add more.`,
          403,
        )
      }
    }

    return tx.tour.create({
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
        status,
      },
      select: providerTourSelect,
    })
  })

  return tour
}

// ─────────────────────────────────────────────────────────────────────────────
// Update tour (provider action)
// ─────────────────────────────────────────────────────────────────────────────

export interface UpdateTourInput {
  // Core info
  title?:              string
  shortDescription?:   string
  description?:        string
  // Trip setup
  category?:           string
  difficulty?:         'Easy' | 'Moderate' | 'Challenging' | null
  durationDays?:       number
  maxGuests?:          number
  minGuests?:          number
  languages?:          string[]
  // Location
  destinationId?:      string | null
  meetingPoint?:       string | null
  // Pricing & policy
  basePrice?:          number
  currency?:           string
  cancellationPolicy?: string | null
  // Status
  status?:             'draft' | 'active' | 'paused'
}

export async function updateProviderTour(ownerUserId: string, tourId: string, input: UpdateTourInput) {
  const tour = await getProviderTour(tourId, ownerUserId)

  if (input.destinationId) {
    const dest = await prisma.destination.findUnique({ where: { id: input.destinationId }, select: { id: true } })
    if (!dest) throw new AppError('Destination not found.', 400)
  }

  let slug = tour.slug
  if (input.title && input.title !== tour.title) {
    slug = await uniqueSlug(input.title, async (s) => {
      const existing = await prisma.tour.findUnique({ where: { slug: s } })
      return !!existing && existing.id !== tourId
    })
    if (!slug) throw new AppError('Title must contain at least one letter or number.', 400)
  }

  const targetStatus = input.status ?? tour.status
  if (targetStatus === 'active') {
    const [imageCount, departureCount] = await Promise.all([
      prisma.tourImage.count({ where: { tourId } }),
      prisma.tourDeparture.count({ where: { tourId, status: 'scheduled', startDate: { gte: new Date() } } }),
    ])
    validateTourReadiness({
      title: input.title ?? tour.title,
      description: input.description !== undefined ? (input.description || null) : tour.description,
      basePrice: input.basePrice ?? tour.basePrice,
      imageCount,
      departureCount,
    })
  }

  return prisma.tour.update({
    where: { id: tourId },
    data: {
      slug,
      // Core info
      ...(input.title             !== undefined && { title:             input.title }),
      ...(input.shortDescription  !== undefined && { shortDescription:  input.shortDescription  || null }),
      ...(input.description       !== undefined && { description:       input.description       || null }),
      // Trip setup
      ...(input.category          !== undefined && { category:          input.category          || null }),
      ...(input.difficulty        !== undefined && { difficulty:        input.difficulty }),
      ...(input.durationDays      !== undefined && { durationDays:      input.durationDays }),
      ...(input.maxGuests         !== undefined && { maxGuests:         input.maxGuests }),
      ...(input.minGuests         !== undefined && { minGuests:         input.minGuests }),
      ...(input.languages         !== undefined && { languages:         input.languages }),
      // Location
      ...(input.destinationId     !== undefined && { destinationId:     input.destinationId     || null }),
      ...(input.meetingPoint      !== undefined && { meetingPoint:      input.meetingPoint      || null }),
      // Pricing & policy
      ...(input.basePrice         !== undefined && { basePrice:         input.basePrice }),
      ...(input.currency          !== undefined && { currency:          input.currency }),
      ...(input.cancellationPolicy !== undefined && { cancellationPolicy: input.cancellationPolicy || null }),
      // Status
      ...(input.status            !== undefined && { status:            input.status }),
    },
    select: providerTourSelect,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Archive (soft-delete) tour
// ─────────────────────────────────────────────────────────────────────────────

export async function archiveProviderTour(ownerUserId: string, tourId: string) {
  await getProviderTour(tourId, ownerUserId)

  return prisma.tour.update({
    where: { id: tourId },
    data: { status: 'archived' },
    select: providerTourSelect,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Get single tour for provider
// ─────────────────────────────────────────────────────────────────────────────

const providerTourDetailSelect = {
  id:                 true,
  providerId:         true,
  slug:               true,
  title:              true,
  shortDescription:   true,
  description:        true,
  category:           true,
  difficulty:         true,
  durationDays:       true,
  maxGuests:          true,
  minGuests:          true,
  meetingPoint:       true,
  cancellationPolicy: true,
  languages:          true,
  basePrice:          true,
  currency:           true,
  status:             true,
  ratingAverage:      true,
  reviewsCount:       true,
  createdAt:          true,
  updatedAt:          true,
  destination:        { select: { id: true, name: true, slug: true } },
  images:             { orderBy: { sortOrder: 'asc' as const }, select: { id: true, imageUrl: true, publicId: true, altText: true, sortOrder: true } },
  _count:             { select: { departures: true, images: true } },
} as const

export async function getProviderTourDetail(ownerUserId: string, tourId: string) {
  const provider = await prisma.provider.findUnique({ where: { ownerUserId }, select: { id: true } })
  if (!provider) throw new AppError('Provider not found.', 404)

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: providerTourDetailSelect,
  })
  if (!tour) throw new AppError('Tour not found.', 404)
  if (tour.providerId !== provider.id) throw new AppError('Forbidden.', 403)

  const departureCount = await prisma.tourDeparture.count({
    where: { tourId, status: 'scheduled', startDate: { gte: new Date() } },
  })

  const readiness = checkTourReadiness({
    title: tour.title,
    description: tour.description,
    basePrice: tour.basePrice,
    imageCount: tour._count.images,
    departureCount,
  })

  return { ...tour, readiness }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tour images — add & remove
// ─────────────────────────────────────────────────────────────────────────────

export async function addTourImages(
  ownerUserId: string,
  tourId: string,
  images: { imageUrl: string; publicId?: string; altText?: string; width?: number; height?: number; format?: string; bytes?: number }[],
) {
  await getProviderTour(tourId, ownerUserId)

  const maxSort = await prisma.tourImage.findFirst({
    where: { tourId },
    orderBy: { sortOrder: 'desc' },
    select: { sortOrder: true },
  })
  let nextSort = (maxSort?.sortOrder ?? -1) + 1

  const created = await prisma.$transaction(
    images.map(img =>
      prisma.tourImage.create({
        data: {
          tourId,
          imageUrl:  img.imageUrl,
          publicId:  img.publicId ?? null,
          altText:   img.altText ?? null,
          width:     img.width ?? null,
          height:    img.height ?? null,
          format:    img.format ?? null,
          bytes:     img.bytes ?? null,
          sortOrder: nextSort++,
        },
      }),
    ),
  )

  return created
}

export async function removeTourImage(ownerUserId: string, tourId: string, imageId: string) {
  await getProviderTour(tourId, ownerUserId)

  const image = await prisma.tourImage.findUnique({ where: { id: imageId } })
  if (!image || image.tourId !== tourId) throw new AppError('Image not found.', 404)

  await prisma.tourImage.delete({ where: { id: imageId } })

  return { deleted: true, publicId: image.publicId }
}

// ─────────────────────────────────────────────────────────────────────────────
// Tour departures — CRUD
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateDepartureInput {
  startDate:      string
  endDate:        string
  availableSeats: number
  priceOverride?: number
  currency?:      string
}

export interface UpdateDepartureInput {
  startDate?:      string
  endDate?:        string
  availableSeats?: number
  priceOverride?:  number | null
  currency?:       string
  status?:         'scheduled' | 'cancelled'
}

const departureSelect = {
  id:             true,
  tourId:         true,
  startDate:      true,
  endDate:        true,
  availableSeats: true,
  bookedSeats:    true,
  priceOverride:  true,
  currency:       true,
  status:         true,
  createdAt:      true,
  updatedAt:      true,
} as const

export async function listTourDepartures(ownerUserId: string, tourId: string) {
  await getProviderTour(tourId, ownerUserId)

  return prisma.tourDeparture.findMany({
    where: { tourId },
    select: departureSelect,
    orderBy: { startDate: 'asc' },
  })
}

export async function createTourDeparture(ownerUserId: string, tourId: string, input: CreateDepartureInput) {
  await getProviderTour(tourId, ownerUserId)

  const start = new Date(input.startDate)
  const end = new Date(input.endDate)
  if (isNaN(start.getTime()) || isNaN(end.getTime())) throw new AppError('Invalid date.', 400)
  if (end <= start) throw new AppError('End date must be after start date.', 400)

  return prisma.tourDeparture.create({
    data: {
      tourId,
      startDate:      start,
      endDate:        end,
      availableSeats: input.availableSeats,
      priceOverride:  input.priceOverride ?? null,
      currency:       input.currency ?? 'USD',
      status:         'scheduled',
    },
    select: departureSelect,
  })
}

export async function updateTourDeparture(ownerUserId: string, tourId: string, departureId: string, input: UpdateDepartureInput) {
  await getProviderTour(tourId, ownerUserId)

  const dep = await prisma.tourDeparture.findUnique({ where: { id: departureId } })
  if (!dep || dep.tourId !== tourId) throw new AppError('Departure not found.', 404)

  if (input.availableSeats !== undefined && input.availableSeats < dep.bookedSeats) {
    throw new AppError(
      `Cannot reduce available seats to ${input.availableSeats}. There are already ${dep.bookedSeats} booked seat(s).`,
      400,
    )
  }

  const data: Record<string, unknown> = {}
  if (input.startDate) data.startDate = new Date(input.startDate)
  if (input.endDate) data.endDate = new Date(input.endDate)
  if (input.availableSeats !== undefined) data.availableSeats = input.availableSeats
  if (input.priceOverride !== undefined) data.priceOverride = input.priceOverride
  if (input.currency !== undefined) data.currency = input.currency
  if (input.status !== undefined) data.status = input.status

  return prisma.tourDeparture.update({
    where: { id: departureId },
    data,
    select: departureSelect,
  })
}

export async function deleteTourDeparture(ownerUserId: string, tourId: string, departureId: string) {
  await getProviderTour(tourId, ownerUserId)

  const dep = await prisma.tourDeparture.findUnique({
    where: { id: departureId },
    include: { bookings: { where: { bookingStatus: { in: ['pending', 'confirmed'] } }, select: { id: true }, take: 1 } },
  })
  if (!dep || dep.tourId !== tourId) throw new AppError('Departure not found.', 404)
  if (dep.bookings.length > 0) throw new AppError('Cannot delete a departure with active bookings. Cancel it instead.', 400)

  await prisma.tourDeparture.delete({ where: { id: departureId } })
  return { deleted: true }
}

// ─────────────────────────────────────────────────────────────────────────────
// Publish readiness
// ─────────────────────────────────────────────────────────────────────────────

interface ReadinessInput {
  title:          string
  description:    string | null
  basePrice:      number
  imageCount:     number
  departureCount: number
}

export interface ReadinessResult {
  ready: boolean
  missing: string[]
}

export function checkTourReadiness(input: ReadinessInput): ReadinessResult {
  const missing: string[] = []

  if (!input.title || input.title.trim().length < 2) missing.push('Title must be at least 2 characters')
  if (!input.description || input.description.trim().length < 50) missing.push('Description must be at least 50 characters')
  if (input.basePrice <= 0) missing.push('Price must be greater than 0')
  if (input.imageCount < 1) missing.push('At least 1 image is required')
  if (input.departureCount < 1) missing.push('At least 1 upcoming departure is required')

  return { ready: missing.length === 0, missing }
}

function validateTourReadiness(input: ReadinessInput) {
  const result = checkTourReadiness(input)
  if (!result.ready) {
    throw new AppError(`Tour is not ready to publish: ${result.missing.join('; ')}`, 400)
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: load tour and assert it belongs to this provider
// ─────────────────────────────────────────────────────────────────────────────

async function getProviderTour(tourId: string, ownerUserId: string) {
  const provider = await prisma.provider.findUnique({ where: { ownerUserId }, select: { id: true } })
  if (!provider) throw new AppError('Provider not found.', 404)

  const tour = await prisma.tour.findUnique({
    where: { id: tourId },
    select: { id: true, slug: true, title: true, description: true, basePrice: true, status: true, providerId: true },
  })
  if (!tour) throw new AppError('Tour not found.', 404)
  if (tour.providerId !== provider.id) throw new AppError('Forbidden.', 403)
  return tour
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider plan limits — current usage + per-plan caps
// ─────────────────────────────────────────────────────────────────────────────

export interface ProviderLimitsResponse {
  plan: string
  tours: {
    current: number
    limit:   number | null  // null = unlimited (PRO)
  }
  accommodations: {
    current: number
    limit:   number | null
  }
}

/**
 * Returns the provider's current plan, current listing counts (non-archived),
 * and the per-type limits from the centralized config.
 *
 * Used by GET /provider/limits — consumed by the dashboard
 * to show usage indicators and disable Add buttons at limit.
 */
export async function getMyProviderLimits(ownerUserId: string): Promise<ProviderLimitsResponse> {
  const provider = await prisma.provider.findUnique({
    where: { ownerUserId },
    select: { id: true, plan: true },
  })
  if (!provider) throw new AppError('Provider not found.', 404)

  const plan = (provider.plan as PlanType) ?? 'FREE'

  // Count non-archived listings (draft + active + paused all count)
  const [tourCurrent, accommodationCurrent] = await Promise.all([
    prisma.tour.count({
      where: { providerId: provider.id, status: { not: 'archived' } },
    }),
    prisma.accommodation.count({
      where: { providerId: provider.id, status: { not: 'archived' } },
    }),
  ])

  const tourLimit          = getListingLimit(plan, 'tours')
  const accommodationLimit = getListingLimit(plan, 'accommodations')

  return {
    plan,
    tours: {
      current: tourCurrent,
      // Infinity does not serialize cleanly in JSON — use null to signal "unlimited"
      limit: tourLimit === Infinity ? null : tourLimit,
    },
    accommodations: {
      current: accommodationCurrent,
      limit: accommodationLimit === Infinity ? null : accommodationLimit,
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
