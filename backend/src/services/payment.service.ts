import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'

// ─────────────────────────────────────────────────────────────────────────────
// Initiate payment — creates a Payment record in `unpaid → authorized` state
// ─────────────────────────────────────────────────────────────────────────────

export async function initiatePayment(userId: string, bookingId: string) {
  // Must be the booking owner
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  })
  if (!booking)                          throw new AppError('Booking not found.', 404)
  if (booking.userId !== userId)         throw new AppError('Forbidden.', 403)
  if (booking.payment)                   throw new AppError('Payment already initiated for this booking.', 409)
  if (booking.bookingStatus === 'cancelled')    throw new AppError('Cannot pay for a cancelled booking.', 400)

  // Create Payment with mock authorization
  const payment = await prisma.payment.create({
    data: {
      bookingId,
      providerId:       booking.providerId,
      userId,
      paymentGateway:   'mock',
      paymentReference: `MOCK-${Date.now()}`,
      amount:           booking.totalAmount,
      currency:         booking.currency ?? 'USD',
      status:           'authorized',
    },
  })

  // Update booking paymentStatus
  await prisma.booking.update({
    where: { id: bookingId },
    data:  { paymentStatus: 'authorized' },
  })

  return payment
}

// ─────────────────────────────────────────────────────────────────────────────
// Confirm payment — mark as paid (mock fulfillment)
// ─────────────────────────────────────────────────────────────────────────────

export async function confirmPayment(userId: string, paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment)                    throw new AppError('Payment not found.', 404)
  if (payment.userId !== userId)   throw new AppError('Forbidden.', 403)
  if (payment.status === 'paid')   throw new AppError('Payment is already confirmed.', 400)
  if (payment.status !== 'authorized') throw new AppError('Payment must be authorized before confirming.', 400)

  const [updatedPayment] = await prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data:  { status: 'paid', paidAt: new Date() },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data:  { paymentStatus: 'paid', bookingStatus: 'confirmed' },
    }),
  ])

  return updatedPayment
}

// ─────────────────────────────────────────────────────────────────────────────
// Get single payment (owner or provider or admin)
// ─────────────────────────────────────────────────────────────────────────────

export async function getPayment(userId: string, paymentId: string, role: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: { select: { id: true, bookingStatus: true, totalAmount: true, currency: true } },
    },
  })
  if (!payment) throw new AppError('Payment not found.', 404)

  // Only owner, the provider, or admin can view
  if (role !== 'admin' && payment.userId !== userId && payment.providerId !== userId) {
    throw new AppError('Forbidden.', 403)
  }

  return payment
}

// ─────────────────────────────────────────────────────────────────────────────
// List caller's payments
// ─────────────────────────────────────────────────────────────────────────────

export async function listMyPayments(userId: string, page = 1, limit = 20) {
  const skip = (page - 1) * limit
  const where = { userId }

  const [data, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
      include: {
        booking: { select: { id: true, bookingStatus: true, totalAmount: true, currency: true } },
      },
    }),
    prisma.payment.count({ where }),
  ])

  return { data, pagination: { page, limit, total, pages: Math.ceil(total / limit) } }
}

// ─────────────────────────────────────────────────────────────────────────────
// Request refund
// ─────────────────────────────────────────────────────────────────────────────

export async function requestRefund(userId: string, paymentId: string, reason: string, amount?: number) {
  const payment = await prisma.payment.findUnique({
    where:   { id: paymentId },
    include: { booking: { select: { tourDepartureId: true, guests: true } } },
  })
  if (!payment)                  throw new AppError('Payment not found.', 404)
  if (payment.userId !== userId) throw new AppError('Forbidden.', 403)
  if (payment.status !== 'paid') throw new AppError('Only paid payments can be refunded.', 400)

  const refundAmount = amount ?? payment.amount
  if (refundAmount > payment.amount)
    throw new AppError(`Refund amount cannot exceed the original amount of ${payment.amount}.`, 400)

  const tourDepartureId = payment.booking?.tourDepartureId
  const guests = payment.booking?.guests ?? 0

  const updatedPayment = await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data:  { status: 'refunded', refundAmount, refundReason: reason },
    })
    await tx.booking.update({
      where: { id: payment.bookingId },
      data:  { paymentStatus: 'refunded', bookingStatus: 'cancelled' },
    })

    if (tourDepartureId && guests > 0) {
      await tx.tourDeparture.update({
        where: { id: tourDepartureId },
        data:  { bookedSeats: { decrement: guests } },
      })
    }

    return tx.payment.findUniqueOrThrow({ where: { id: paymentId } })
  })

  return updatedPayment
}
