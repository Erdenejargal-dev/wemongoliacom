import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'
import { GuideSpecialty, GuideInquiryStatus } from '@prisma/client'

async function getOwnedGuide(userId: string) {
  const guide = await prisma.guide.findUnique({ where: { ownerUserId: userId } })
  if (!guide) throw new AppError('Guide profile not found. Complete onboarding first.', 404)
  return guide
}

export async function getMyGuideProfile(userId: string) {
  return getOwnedGuide(userId)
}

export interface GuideProfileUpdate {
  bio?:             string
  about?:           string
  photo?:           string
  coverImage?:      string
  location?:        string
  region?:          string
  specialties?:     GuideSpecialty[]
  languages?:       string[]
  dailyRate?:       number | null
  dailyCurrency?:   string
  contactEmail?:    string
  contactPhone?:    string | null
  website?:         string | null
}

export async function updateMyGuideProfile(userId: string, data: GuideProfileUpdate) {
  const guide = await getOwnedGuide(userId)
  return prisma.guide.update({ where: { id: guide.id }, data })
}

export async function setGuideStatus(userId: string, status: 'active' | 'paused') {
  const guide = await getOwnedGuide(userId)
  return prisma.guide.update({ where: { id: guide.id }, data: { status } })
}

export async function listInquiries(
  userId: string,
  params: { status?: GuideInquiryStatus; page?: number; limit?: number },
) {
  const guide = await getOwnedGuide(userId)
  const page  = Math.max(1, params.page  ?? 1)
  const limit = Math.min(50, params.limit ?? 20)
  const skip  = (page - 1) * limit
  const where = { guideId: guide.id, ...(params.status ? { status: params.status } : {}) }

  const [data, total] = await Promise.all([
    prisma.guideInquiry.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit }),
    prisma.guideInquiry.count({ where }),
  ])

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function replyToInquiry(
  userId: string,
  inquiryId: string,
  reply: string,
  status: GuideInquiryStatus,
) {
  const guide = await getOwnedGuide(userId)
  const inquiry = await prisma.guideInquiry.findUnique({ where: { id: inquiryId } })
  if (!inquiry || inquiry.guideId !== guide.id) throw new AppError('Inquiry not found.', 404)

  return prisma.guideInquiry.update({
    where: { id: inquiryId },
    data:  { guideReply: reply, repliedAt: new Date(), status },
  })
}

export async function listMyReviews(userId: string, params: { page?: number; limit?: number }) {
  const guide = await getOwnedGuide(userId)
  const page  = Math.max(1, params.page  ?? 1)
  const limit = Math.min(50, params.limit ?? 20)
  const skip  = (page - 1) * limit
  const where = { guideId: guide.id }

  const [data, total] = await Promise.all([
    prisma.guideReview.findMany({ where, orderBy: { date: 'desc' }, skip, take: limit }),
    prisma.guideReview.count({ where }),
  ])

  return { data, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } }
}

export async function replyToReview(userId: string, reviewId: string, reply: string) {
  const guide = await getOwnedGuide(userId)
  const review = await prisma.guideReview.findUnique({ where: { id: reviewId } })
  if (!review || review.guideId !== guide.id) throw new AppError('Review not found.', 404)

  return prisma.guideReview.update({
    where: { id: reviewId },
    data:  { guideReply: reply, repliedAt: new Date() },
  })
}

export async function getAnalytics(userId: string) {
  const guide = await getOwnedGuide(userId)

  const [inquiryCounts, ratingAgg, reviewsCount] = await Promise.all([
    prisma.guideInquiry.groupBy({
      by:    ['status'],
      where: { guideId: guide.id },
      _count: { _all: true },
    }),
    prisma.guideReview.aggregate({
      where: { guideId: guide.id },
      _avg:  { rating: true },
      _count: { _all: true },
    }),
    prisma.guideReview.count({ where: { guideId: guide.id } }),
  ])

  const total    = inquiryCounts.reduce((s, r) => s + r._count._all, 0)
  const newCount = inquiryCounts.find(r => r.status === 'new')?._count._all ?? 0
  const replied  = inquiryCounts.find(r => r.status === 'replied')?._count._all ?? 0
  const accepted = inquiryCounts.find(r => r.status === 'accepted')?._count._all ?? 0

  return {
    inquiriesTotal:  total,
    inquiriesNew:    newCount,
    inquiriesReplied: replied,
    inquiriesAccepted: accepted,
    responseRate:    total > 0 ? Math.round(((replied + accepted) / total) * 100) : 0,
    avgRating:       ratingAgg._avg.rating ?? 0,
    reviewsCount,
  }
}
