import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'

// ─────────────────────────────────────────────────────────────────────────────
// List reviews for a listing
// ─────────────────────────────────────────────────────────────────────────────

export interface ReviewListQuery {
  listingId:    string
  listingType:  'tour' | 'vehicle' | 'accommodation'
  page?:        number
  limit?:       number
}

export async function listReviews(query: ReviewListQuery) {
  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(50, query.limit ?? 10)
  const skip  = (page - 1) * limit

  const where = { listingId: query.listingId, listingType: query.listingType as any }

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      select: {
        id:             true,
        rating:         true,
        title:          true,
        comment:        true,
        providerReply:  true,
        createdAt:      true,
        user: {
          select: { firstName: true, lastName: true, avatarUrl: true, country: true },
        },
      },
    }),
    prisma.review.count({ where }),
  ])

  return {
    data:       reviews,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Create review (traveler, completed booking only)
// ─────────────────────────────────────────────────────────────────────────────

export interface CreateReviewInput {
  userId:      string
  bookingId:   string
  rating:      number
  title?:      string
  comment?:    string
}

export async function createReview(input: CreateReviewInput) {
  // Verify the booking exists, belongs to this user, and is completed
  const booking = await prisma.booking.findUnique({ where: { id: input.bookingId } })
  if (!booking)                          throw new AppError('Booking not found.', 404)
  if (booking.userId !== input.userId)   throw new AppError('Forbidden.', 403)
  if (booking.bookingStatus !== 'completed')
    throw new AppError('You can only review completed bookings.', 400)

  // One review per booking
  const existing = await prisma.review.findUnique({
    where: { bookingId: input.bookingId },
  })
  if (existing) throw new AppError('You have already reviewed this booking.', 409)

  const review = await prisma.review.create({
    data: {
      bookingId:   input.bookingId,
      userId:      input.userId,
      providerId:  booking.providerId,
      listingType: booking.listingType,
      listingId:   booking.listingId,
      rating:      input.rating,
      title:       input.title,
      comment:     input.comment,
    },
    include: {
      user: { select: { firstName: true, lastName: true, avatarUrl: true } },
    },
  })

  // Update provider + listing rating averages (fire-and-forget)
  updateRatingAverages(booking.listingType as string, booking.listingId, booking.providerId)
    .catch(() => null)

  return review
}

// ─────────────────────────────────────────────────────────────────────────────
// Provider reply
// ─────────────────────────────────────────────────────────────────────────────

export async function replyToReview(reviewId: string, providerId: string, reply: string) {
  const review = await prisma.review.findUnique({ where: { id: reviewId } })
  if (!review)                          throw new AppError('Review not found.', 404)
  if (review.providerId !== providerId) throw new AppError('Forbidden.', 403)

  return prisma.review.update({
    where: { id: reviewId },
    data:  { providerReply: reply },
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: recompute average rating for listing + provider
// ─────────────────────────────────────────────────────────────────────────────

async function updateRatingAverages(listingType: string, listingId: string, providerId: string) {
  // Listing aggregate
  const { _avg, _count } = await prisma.review.aggregate({
    where:   { listingId, listingType: listingType as any },
    _avg:    { rating: true },
    _count:  { rating: true },
  })

  const avg   = _avg.rating  ?? 0
  const count = _count.rating ?? 0

  if (listingType === 'tour') {
    await prisma.tour.update({ where: { id: listingId }, data: { ratingAverage: avg, reviewsCount: count } })
  } else if (listingType === 'vehicle') {
    await prisma.vehicle.update({ where: { id: listingId }, data: { ratingAverage: avg, reviewsCount: count } })
  } else if (listingType === 'accommodation') {
    await prisma.accommodation.update({ where: { id: listingId }, data: { ratingAverage: avg, reviewsCount: count } })
  }

  // Provider aggregate across all listing types
  const providerAgg = await prisma.review.aggregate({
    where:  { providerId },
    _avg:   { rating: true },
    _count: { rating: true },
  })
  await prisma.provider.update({
    where: { id: providerId },
    data:  {
      ratingAverage: providerAgg._avg.rating  ?? 0,
      reviewsCount:  providerAgg._count.rating ?? 0,
    },
  })
}
