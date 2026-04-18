import { Prisma, type Payment } from '@prisma/client'
import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'
import { env } from '../config/env'
import {
  BonumInvoiceDuplicateError,
  createBonumInvoice,
  refundBonumPayment,
} from '../integrations/bonum/bonum.client'
import type { BonumInvoiceCreateInput } from '../integrations/bonum/bonum.mapper'
import { releaseRoomAvailabilityForCancel } from './booking.service'

function canReuseExistingBonumInvoice(
  payment: Pick<Payment, 'status' | 'providerOrderId' | 'followUpUrl' | 'sessionExpiresAt'>,
  booking: { holdExpiresAt: Date | null },
  now: Date,
): boolean {
  if (payment.status !== 'authorized') return false
  const pid = payment.providerOrderId?.trim()
  const url = payment.followUpUrl?.trim()
  if (!pid || !url) return false
  if (payment.sessionExpiresAt && payment.sessionExpiresAt <= now) return false
  if (booking.holdExpiresAt && booking.holdExpiresAt <= now) return false
  return true
}

function logBonumInvoiceReused(params: {
  paymentId: string
  bookingCode: string
  providerOrderId: string
}): void {
  console.log('BONUM INVOICE REUSED', {
    paymentId:       params.paymentId,
    bookingCode:     params.bookingCode,
    providerOrderId: params.providerOrderId,
  })
}

function buildInitiatePaymentResponse(params: {
  payment: { id: string; amount: number; currency: string }
  booking: { id: string; bookingCode: string }
  followUpUrl: string
  sessionExpiresAt: Date | null
  newHold: Date
}) {
  return {
    paymentId:     params.payment.id,
    bookingId:     params.booking.id,
    bookingCode:   params.booking.bookingCode,
    status:        'authorized' as const,
    amount:        params.payment.amount,
    currency:      params.payment.currency,
    followUpUrl:   params.followUpUrl,
    expiresAt:     params.sessionExpiresAt?.toISOString() ?? params.newHold.toISOString(),
    qrCodeData:    null,
    deeplinkUrl:   null,
    holdExpiresAt: params.newHold.toISOString(),
  }
}

const retryBuckets = new Map<string, number[]>()

function countRecentRetries(bookingId: string): number {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000
  const arr = (retryBuckets.get(bookingId) ?? []).filter((t) => now - t < windowMs)
  retryBuckets.set(bookingId, arr)
  return arr.length
}

function recordRetry(bookingId: string): void {
  const now = Date.now()
  const windowMs = 60 * 60 * 1000
  const arr = (retryBuckets.get(bookingId) ?? []).filter((t) => now - t < windowMs)
  arr.push(now)
  retryBuckets.set(bookingId, arr)
}

export async function initiatePayment(userId: string, bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { payment: true },
  })
  if (!booking) throw new AppError('Booking not found.', 404)
  if (booking.userId !== userId) throw new AppError('Forbidden.', 403)
  if (booking.listingType === 'vehicle') {
    throw new AppError('Vehicle bookings are not supported for online payment in v1.', 501)
  }
  if (booking.bookingStatus !== 'pending') {
    throw new AppError(`Cannot pay: booking is ${booking.bookingStatus}.`, 400)
  }
  if (booking.paymentStatus === 'paid') {
    throw new AppError('Booking is already paid.', 409)
  }

  const now = new Date()
  if (booking.holdExpiresAt && booking.holdExpiresAt < now) {
    throw new AppError('Payment window has expired. Please create a new booking.', 410)
  }

  if (countRecentRetries(bookingId) >= env.PAYMENT_MAX_RETRIES_PER_HOUR) {
    throw new AppError('Too many payment attempts. Try again later.', 429)
  }

  const maxUntil =
    booking.maxHoldUntil ??
    new Date(booking.createdAt.getTime() + env.MAX_HOLD_MINUTES_FROM_BOOKING * 60 * 1000)
  const extendTo = new Date(
    Math.min(
      now.getTime() + env.PAYMENT_SESSION_EXTENSION_MINUTES * 60 * 1000,
      maxUntil.getTime(),
    ),
  )
  const newHold = extendTo

  const idempotencyKey = crypto.randomUUID()

  let payment = booking.payment
  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        bookingId:      booking.id,
        providerId:     booking.providerId,
        userId:         booking.userId,
        amount:         booking.totalAmount,
        currency:       booking.currency ?? 'USD',
        status:         'unpaid',
        paymentGateway: env.BONUM_USE_STUB === 'true' || !env.BONUM_API_BASE_URL?.trim() ? 'bonum_stub' : 'bonum',
        idempotencyKey,
      },
    })
  } else {
    if (canReuseExistingBonumInvoice(payment, booking, now)) {
      await prisma.booking.update({
        where: { id: booking.id },
        data:  {
          paymentStatus:        'authorized',
          holdExpiresAt:        newHold,
          lastPaymentAttemptAt: new Date(),
        },
      })
      logBonumInvoiceReused({
        paymentId:       payment.id,
        bookingCode:     booking.bookingCode,
        providerOrderId: payment.providerOrderId!,
      })
      return buildInitiatePaymentResponse({
        payment,
        booking,
        followUpUrl:      payment.followUpUrl!,
        sessionExpiresAt: payment.sessionExpiresAt,
        newHold,
      })
    }

    await prisma.payment.update({
      where: { id: payment.id },
      data:  {
        idempotencyKey,
        ...(payment.status === 'failed' ? { status: 'unpaid', failedAt: null, failureCode: null, failureMessage: null } : {}),
      },
    })
  }

  const attemptNo = (await prisma.paymentAttempt.count({ where: { paymentId: payment!.id } })) + 1

  await prisma.paymentAttempt.updateMany({
    where: {
      paymentId: payment!.id,
      status:    { in: ['initiated', 'redirected'] },
    },
    data:  { status: 'superseded' },
  })

  const attempt = await prisma.paymentAttempt.create({
    data: {
      paymentId:      payment!.id,
      attemptNumber:  attemptNo,
      status:         'initiated',
      idempotencyKey: `attempt-${payment!.id}-${attemptNo}-${idempotencyKey}`,
    },
  })

  const bonumTxId = `BOOKING_${booking.bookingCode}`

  const invoiceInput: BonumInvoiceCreateInput = {
    amount:            Math.round(payment!.amount),
    transactionId:     bonumTxId,
    internalPaymentId: payment!.id,
  }

  let invoice: Awaited<ReturnType<typeof createBonumInvoice>>
  try {
    invoice = await createBonumInvoice(invoiceInput)
  } catch (err) {
    if (err instanceof BonumInvoiceDuplicateError) {
      const fresh = await prisma.payment.findUnique({ where: { id: payment!.id } })
      if (fresh?.providerOrderId?.trim() && fresh?.followUpUrl?.trim()) {
        logBonumInvoiceReused({
          paymentId:       fresh.id,
          bookingCode:     booking.bookingCode,
          providerOrderId: fresh.providerOrderId,
        })
        await prisma.$transaction([
          prisma.booking.update({
            where: { id: booking.id },
            data:  {
              paymentStatus:        'authorized',
              holdExpiresAt:        newHold,
              lastPaymentAttemptAt: new Date(),
            },
          }),
          prisma.paymentAttempt.update({
            where: { id: attempt.id },
            data:  {
              status:          'redirected',
              providerOrderId: fresh.providerOrderId,
              followUpUrl:     fresh.followUpUrl,
              qrPayload:       null,
              deeplinkUrl:     null,
              expiresAt:       fresh.sessionExpiresAt,
            },
          }),
        ])
        recordRetry(bookingId)
        return buildInitiatePaymentResponse({
          payment:          fresh,
          booking,
          followUpUrl:      fresh.followUpUrl,
          sessionExpiresAt: fresh.sessionExpiresAt,
          newHold,
        })
      }
      throw new AppError(
        'Could not start payment: duplicate transaction with no saved invoice. Please contact support.',
        409,
      )
    }
    throw err
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment!.id },
      data:  {
        status:           'authorized',
        providerOrderId:     invoice.invoiceId,
        followUpUrl:         invoice.followUpLink,
        sessionExpiresAt:    invoice.sessionExpiresAt,
        bonumTransactionId:  bonumTxId,
        metadata:            invoice.raw as Prisma.InputJsonValue,
        paymentGateway:   env.BONUM_USE_STUB === 'true' || !env.BONUM_API_BASE_URL?.trim() ? 'bonum_stub' : 'bonum',
      },
    }),
    prisma.booking.update({
      where: { id: booking.id },
      data:  {
        paymentStatus:         'authorized',
        holdExpiresAt:         newHold,
        lastPaymentAttemptAt:  new Date(),
      },
    }),
    prisma.paymentAttempt.update({
      where: { id: attempt.id },
      data:  {
        status:          'redirected',
        providerOrderId: invoice.invoiceId,
        followUpUrl:     invoice.followUpLink,
        qrPayload:       null,
        deeplinkUrl:     null,
        expiresAt:       invoice.sessionExpiresAt,
      },
    }),
  ])

  recordRetry(bookingId)

  return buildInitiatePaymentResponse({
    payment:          payment!,
    booking,
    followUpUrl:      invoice.followUpLink,
    sessionExpiresAt: invoice.sessionExpiresAt,
    newHold,
  })
}

/** @deprecated v1 — payment confirmation is webhook-driven */
export async function confirmPayment(_userId: string, _paymentId: string) {
  throw new AppError(
    'Manual payment confirmation is disabled. Payment is confirmed via Bonum webhook.',
    410,
  )
}

export async function getPaymentStatus(userId: string, paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: {
        select: {
          id:            true,
          bookingCode:   true,
          bookingStatus: true,
          paymentStatus: true,
          holdExpiresAt: true,
          maxHoldUntil:  true,
          listingType:   true,
        },
      },
    },
  })
  if (!payment) throw new AppError('Payment not found.', 404)
  if (payment.userId !== userId) throw new AppError('Forbidden.', 403)

  const b = payment.booking
  return {
    bookingCode:   b.bookingCode,
    bookingStatus: b.bookingStatus,
    paymentStatus: b.paymentStatus,
    holdExpiresAt: b.holdExpiresAt?.toISOString() ?? null,
    maxHoldUntil:  b.maxHoldUntil?.toISOString() ?? null,
    payment:       {
      id:        payment.id,
      status:    payment.status,
      paidAt:    payment.paidAt?.toISOString() ?? null,
      amount:    payment.amount,
      currency:  payment.currency,
      followUpUrl: payment.followUpUrl,
    },
  }
}

export async function retryPayment(userId: string, paymentId: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: { booking: true },
  })
  if (!payment) throw new AppError('Payment not found.', 404)
  if (payment.userId !== userId) throw new AppError('Forbidden.', 403)
  return initiatePayment(userId, payment.bookingId)
}

export async function getPayment(userId: string, paymentId: string, role: string) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      booking: { select: { id: true, bookingStatus: true, totalAmount: true, currency: true } },
    },
  })
  if (!payment) throw new AppError('Payment not found.', 404)

  if (role === 'admin' || payment.userId === userId) {
    return payment
  }

  if (role === 'provider_owner') {
    const provider = await prisma.provider.findUnique({
      where: { ownerUserId: userId },
      select: { id: true },
    })
    if (provider && payment.providerId === provider.id) {
      return payment
    }
  }

  throw new AppError('Forbidden.', 403)
}

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

async function executeRefund(
  paymentId: string,
  reason: string,
  amount?: number,
) {
  const payment = await prisma.payment.findUnique({
    where:   { id: paymentId },
    include: {
      booking: {
        select: {
          tourDepartureId: true,
          guests:          true,
          listingType:     true,
          roomTypeId:      true,
          startDate:       true,
          endDate:         true,
        },
      },
    },
  })
  if (!payment) throw new AppError('Payment not found.', 404)
  if (payment.status !== 'paid') throw new AppError('Only paid payments can be refunded.', 400)

  const refundAmount = amount ?? payment.amount
  if (refundAmount > payment.amount) {
    throw new AppError(`Refund amount cannot exceed the original amount of ${payment.amount}.`, 400)
  }

  if (payment.bonumTransactionId) {
    const apiRefund = await refundBonumPayment({
      transactionId: payment.bonumTransactionId,
      amount:        refundAmount,
      currency:      payment.currency,
      reason,
    })
    if (!apiRefund.ok) {
      throw new AppError('Refund could not be completed with the payment provider.', 502)
    }
  } else if (payment.paymentGateway !== 'mock' && payment.paymentGateway !== 'bonum_stub') {
    throw new AppError('Cannot refund: missing PSP transaction id.', 400)
  }

  const tourDepartureId = payment.booking?.tourDepartureId
  const guests = payment.booking?.guests ?? 0
  const listingType = payment.booking?.listingType
  const roomTypeId = payment.booking?.roomTypeId
  const startDate = payment.booking?.startDate
  const endDate = payment.booking?.endDate

  await prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id: paymentId },
      data:  {
        status:       'refunded',
        refundAmount,
        refundReason: reason,
      },
    })
    await tx.booking.update({
      where: { id: payment.bookingId },
      data:  {
        paymentStatus: 'refunded',
        bookingStatus: 'cancelled',
        cancelledAt:   new Date(),
        cancelReason:  reason,
      },
    })

    if (tourDepartureId && guests > 0) {
      await tx.tourDeparture.update({
        where: { id: tourDepartureId },
        data:  { bookedSeats: { decrement: guests } },
      })
    }
    if (listingType === 'accommodation' && roomTypeId && startDate && endDate) {
      await releaseRoomAvailabilityForCancel(tx, roomTypeId, startDate, endDate)
    }
  })

  return prisma.payment.findUniqueOrThrow({ where: { id: paymentId } })
}

export async function requestRefund(userId: string, paymentId: string, reason: string, amount?: number) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } })
  if (!payment) throw new AppError('Payment not found.', 404)
  if (payment.userId !== userId) throw new AppError('Forbidden.', 403)
  return executeRefund(paymentId, reason, amount)
}

/** Provider-initiated refund for a paid booking (ownership verified). */
export async function refundBookingAsProvider(ownerUserId: string, bookingCode: string, reason: string) {
  const provider = await prisma.provider.findUnique({ where: { ownerUserId } })
  if (!provider) throw new AppError('Provider not found.', 404)
  const booking = await prisma.booking.findFirst({
    where: { bookingCode, providerId: provider.id },
    include: { payment: true },
  })
  if (!booking?.payment) throw new AppError('Booking or payment not found.', 404)
  if (booking.payment.status !== 'paid') {
    throw new AppError('Only paid bookings can be refunded this way.', 400)
  }
  return executeRefund(booking.payment.id, reason)
}
