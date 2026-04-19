/**
 * backend/src/services/booking-request.service.ts
 *
 * Phase 6 — UX + Growth Layer.
 *
 * BookingRequest is a LEAD, not a booking. It is created when a listing is
 * not directly payable through the current payment gateway (today: any
 * non-MNT listing, because Bonum is MNT-only). The provider contacts the
 * traveler and, if accepted, creates a real Booking via the normal flow.
 *
 * This service deliberately does NOT:
 *   - compute or store money
 *   - look up FX rates
 *   - hold inventory
 *   - call the payment layer
 *
 * It DOES:
 *   - validate the listing exists and is active
 *   - persist the lead
 *   - notify the provider (via the existing Notification table)
 *
 * Authentication is OPTIONAL at the HTTP layer. A logged-out traveler can
 * submit a request (we store userId as null and rely on email/phone for
 * follow-up); a logged-in traveler gets the userId attached so the provider
 * can see which account submitted the lead.
 */

import { prisma } from '../lib/prisma'
import { Prisma, ListingType, BookingRequestStatus } from '@prisma/client'
import { AppError } from '../middleware/error'
import { createNotification } from './notification.service'

// ── Input types ─────────────────────────────────────────────────────────

export interface CreateBookingRequestInput {
  listingType: ListingType
  listingId:   string

  name:    string
  email:   string
  phone?:  string
  message?: string

  startDate?: string | Date | null
  endDate?:   string | Date | null
  guests?:    number | null
  quantity?:  number | null

  ipAddress?: string
  userAgent?: string
}

// ── Listing lookup helper ──────────────────────────────────────────────

/**
 * Resolve a listing's provider + currency for the lead payload. Accepts
 * only active listings; rejects archived/paused so leads never land in
 * an inbox for content that's been taken down.
 */
async function resolveListingMeta(
  listingType: ListingType,
  listingId:   string,
): Promise<{ providerId: string; currency: string | null; listingTitle: string }> {
  if (listingType === 'tour') {
    const t = await prisma.tour.findUnique({
      where:  { id: listingId },
      select: { providerId: true, baseCurrency: true, currency: true, title: true, status: true },
    })
    if (!t || t.status !== 'active') throw new AppError('Listing not found.', 404)
    return { providerId: t.providerId, currency: t.baseCurrency ?? t.currency ?? null, listingTitle: t.title }
  }
  if (listingType === 'vehicle') {
    const v = await prisma.vehicle.findUnique({
      where:  { id: listingId },
      select: { providerId: true, baseCurrency: true, currency: true, title: true, status: true },
    })
    if (!v || v.status !== 'active') throw new AppError('Listing not found.', 404)
    return { providerId: v.providerId, currency: v.baseCurrency ?? v.currency ?? null, listingTitle: v.title }
  }
  if (listingType === 'accommodation') {
    const a = await prisma.accommodation.findUnique({
      where:  { id: listingId },
      select: { providerId: true, name: true, status: true },
    })
    if (!a || a.status !== 'active') throw new AppError('Listing not found.', 404)
    // Accommodations price per room type — use the first room type's currency
    // as a non-authoritative hint for provider display.
    const rt = await prisma.roomType.findFirst({
      where:  { accommodationId: listingId },
      select: { baseCurrency: true, currency: true },
    })
    return {
      providerId:   a.providerId,
      currency:     rt?.baseCurrency ?? rt?.currency ?? null,
      listingTitle: a.name,
    }
  }
  throw new AppError('Unsupported listing type.', 400)
}

// ── Create ─────────────────────────────────────────────────────────────

export async function createBookingRequest(params: {
  userId?:   string | null
  input:     CreateBookingRequestInput
}): Promise<{ id: string }> {
  const { userId, input } = params

  // Defensive normalization.
  const name  = input.name.trim()
  const email = input.email.trim().toLowerCase()
  if (name.length < 2)                       throw new AppError('Name is required.', 400)
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new AppError('Valid email is required.', 400)

  const { providerId, currency, listingTitle } = await resolveListingMeta(
    input.listingType,
    input.listingId,
  )

  const startDate = input.startDate ? new Date(input.startDate) : null
  const endDate   = input.endDate   ? new Date(input.endDate)   : null
  if (startDate && Number.isNaN(startDate.valueOf())) throw new AppError('Invalid startDate.', 400)
  if (endDate   && Number.isNaN(endDate.valueOf()))   throw new AppError('Invalid endDate.',   400)

  const req = await prisma.bookingRequest.create({
    data: {
      userId:     userId ?? null,
      providerId,
      listingType: input.listingType,
      listingId:   input.listingId,
      name,
      email,
      phone:   input.phone?.trim() || null,
      message: input.message?.trim() || null,
      startDate,
      endDate,
      guests:   input.guests   ?? null,
      quantity: input.quantity ?? null,
      listingCurrency: currency,
      ipAddress: input.ipAddress ?? null,
      userAgent: input.userAgent ?? null,
    },
    select: { id: true, providerId: true },
  })

  // Notify provider (best-effort — a failed notification must NOT fail the lead).
  try {
    const provider = await prisma.provider.findUnique({
      where:  { id: req.providerId },
      select: { ownerUserId: true },
    })
    if (provider?.ownerUserId) {
      await createNotification({
        userId:   provider.ownerUserId,
        type:     'booking_request',
        title:    'New booking request',
        body:     `${name} is interested in "${listingTitle}". They left contact info — follow up to arrange payment.`,
        actionUrl: `/dashboard/business/booking-requests/${req.id}`,
      })
    }
  } catch (err) {
    // Swallow — the lead is already saved; provider sees it in their inbox
    // next time they open the page even if the push notification failed.
    // eslint-disable-next-line no-console
    console.warn('[booking-request] notify provider failed:', (err as Error).message)
  }

  return { id: req.id }
}

// ── Provider views ─────────────────────────────────────────────────────

export interface ListBookingRequestsQuery {
  status?: BookingRequestStatus
  page?:   number
  limit?:  number
}

/** Lists the signed-in provider's incoming requests. Scoped by providerId. */
export async function listProviderBookingRequests(
  providerId: string,
  query:      ListBookingRequestsQuery = {},
) {
  const page  = Math.max(1, query.page  ?? 1)
  const limit = Math.min(100, query.limit ?? 25)
  const skip  = (page - 1) * limit

  const where: Prisma.BookingRequestWhereInput = { providerId }
  if (query.status) where.status = query.status

  const [rows, total] = await Promise.all([
    prisma.bookingRequest.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.bookingRequest.count({ where }),
  ])

  return {
    data: rows,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  }
}

export async function getProviderBookingRequest(providerId: string, requestId: string) {
  const row = await prisma.bookingRequest.findUnique({ where: { id: requestId } })
  if (!row)                       throw new AppError('Booking request not found.', 404)
  if (row.providerId !== providerId) throw new AppError('Forbidden.', 403)
  return row
}

export async function updateProviderBookingRequest(
  providerId: string,
  requestId:  string,
  patch:      { status?: BookingRequestStatus; providerNote?: string | null },
) {
  const row = await prisma.bookingRequest.findUnique({
    where:  { id: requestId },
    select: { id: true, providerId: true, status: true },
  })
  if (!row)                         throw new AppError('Booking request not found.', 404)
  if (row.providerId !== providerId) throw new AppError('Forbidden.', 403)

  const now = new Date()
  const next: Prisma.BookingRequestUpdateInput = {
    updatedAt: now,
  }
  if (patch.status)                            next.status = patch.status
  if (patch.providerNote !== undefined)        next.providerNote = patch.providerNote ?? null
  if (patch.status && patch.status !== 'new' && row.status === 'new') {
    next.reviewedAt = now
  }

  return prisma.bookingRequest.update({ where: { id: requestId }, data: next })
}

// ── Traveler views ─────────────────────────────────────────────────────

/** Lists the signed-in user's own requests (so they can see status). */
export async function listMyBookingRequests(userId: string) {
  return prisma.bookingRequest.findMany({
    where:   { userId },
    orderBy: { createdAt: 'desc' },
    take:    50,
  })
}
