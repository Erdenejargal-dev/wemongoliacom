import { Prisma } from '@prisma/client'
import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { mapWebhookPayload } from '../integrations/bonum/bonum.mapper'
import { verifyBonumChecksumV2 } from '../integrations/bonum/bonum.verify'
import { refundBonumPayment } from '../integrations/bonum/bonum.client'
import { env } from '../config/env'

/**
 * Persist raw webhook first, then process idempotently.
 * Bonum: verify x-checksum-v2 (HMAC-SHA256 of raw body with MERCHANT_CHECKSUM_KEY).
 */
export async function ingestBonumWebhook(
  rawBody: Buffer,
  checksumHeader: string | undefined,
): Promise<{ status: number; body: Record<string, unknown> }> {
  if (env.NODE_ENV === 'production' && !env.BONUM_MERCHANT_CHECKSUM_KEY?.trim()) {
    return { status: 503, body: { success: false, error: 'Webhook checksum key not configured.' } }
  }

  const keyConfigured = Boolean(env.BONUM_MERCHANT_CHECKSUM_KEY?.trim())

  // 1) Verify HMAC on raw body first — do not parse or persist until checksum passes (when key is set).
  if (keyConfigured) {
    if (!verifyBonumChecksumV2(rawBody, checksumHeader)) {
      return { status: 401, body: { success: false, error: 'Invalid x-checksum-v2' } }
    }
  }

  let json: unknown
  try {
    json = JSON.parse(rawBody.toString('utf8'))
  } catch {
    return { status: 400, body: { success: false, error: 'Invalid JSON' } }
  }

  let parsed: ReturnType<typeof mapWebhookPayload>
  try {
    parsed = mapWebhookPayload(json)
  } catch {
    return { status: 400, body: { success: false, error: 'Invalid payload' } }
  }

  /** True when HMAC was verified; false in non-production when checksum key is unset (local only). */
  const signatureValid = keyConfigured

  const eventId =
    parsed.eventId ||
    crypto.createHash('sha256').update(rawBody).digest('hex')

  const existing = await prisma.webhookEvent.findUnique({ where: { eventId } })
  if (existing?.processed) {
    return { status: 200, body: { success: true, duplicate: true } }
  }

  if (!existing) {
    try {
      await prisma.webhookEvent.create({
        data: {
          eventId,
          provider:       'bonum',
          rawPayload:     json as Prisma.InputJsonValue,
          signatureValid,
          processed:      false,
        },
      })
    } catch (e) {
      if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002') {
        const again = await prisma.webhookEvent.findUnique({ where: { eventId } })
        if (again?.processed) {
          return { status: 200, body: { success: true, duplicate: true } }
        }
      } else {
        throw e
      }
    }
  }

  try {
    await processParsedWebhook(parsed, eventId, json)
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[bonum webhook] process error', msg)
    await prisma.webhookEvent.updateMany({
      where: { eventId },
      data:  { error: msg },
    })
    return { status: 200, body: { success: true, queued: true, error: msg } }
  }

  await prisma.webhookEvent.updateMany({
    where: { eventId },
    data:  { processed: true, processedAt: new Date(), error: null },
  })

  return { status: 200, body: { success: true } }
}

async function processParsedWebhook(
  parsed: ReturnType<typeof mapWebhookPayload>,
  eventId: string,
  rawJson: unknown,
): Promise<void> {
  if (parsed.type !== 'PAYMENT') {
    await prisma.webhookEvent.updateMany({
      where: { eventId },
      data:  { error: `Ignored webhook type: ${parsed.type}` },
    })
    return
  }

  const orConditions: Prisma.PaymentWhereInput[] = []
  if (parsed.transactionId) {
    orConditions.push({ id: parsed.transactionId })
    orConditions.push({ bonumTransactionId: parsed.transactionId })
  }
  if (parsed.invoiceId) {
    orConditions.push({ providerOrderId: parsed.invoiceId })
  }
  if (orConditions.length === 0) {
    throw new Error('Webhook missing transactionId and invoiceId')
  }

  const payment = await prisma.payment.findFirst({
    where: { OR: orConditions },
    include: { booking: true },
  })

  if (!payment) {
    throw new Error('Payment not found for Bonum transactionId / invoiceId')
  }

  await prisma.webhookEvent.updateMany({
    where: { eventId },
    data:  {
      bookingId: payment.bookingId,
      paymentId: payment.id,
    },
  })

  if (parsed.outcome === 'ignored') {
    return
  }

  if (parsed.outcome === 'payment_failed') {
    await handleFailure(payment, parsed)
    return
  }

  if (parsed.outcome === 'payment_success' && parsed.transactionId) {
    if (payment.status === 'paid' && payment.bonumTransactionId === parsed.transactionId) {
      return
    }
    if (payment.status === 'paid') {
      return
    }
    await handleSuccess(payment, parsed, rawJson)
  }
}

async function handleFailure(
  payment: Prisma.PaymentGetPayload<{ include: { booking: true } }>,
  parsed: ReturnType<typeof mapWebhookPayload>,
): Promise<void> {
  if (payment.status === 'paid') return

  const detail = parsed.invoiceStatus
    ? `Bonum invoice: ${parsed.invoiceStatus}`
    : 'Payment failed'

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data:  {
        status:         'failed',
        failedAt:       new Date(),
        failureCode:    parsed.invoiceStatus ?? 'FAILED',
        failureMessage: detail,
        metadata:       mergeMetadata(payment.metadata, {
          lastWebhook: parsed,
        }),
      },
    }),
    prisma.booking.update({
      where: { id: payment.bookingId },
      data:  { paymentStatus: 'failed' },
    }),
  ])
}

function mergeMetadata(
  current: Prisma.JsonValue | null | undefined,
  patch: Record<string, unknown>,
): Prisma.InputJsonValue {
  const base =
    current && typeof current === 'object' && !Array.isArray(current)
      ? (current as Record<string, unknown>)
      : {}
  return { ...base, ...patch } as Prisma.InputJsonValue
}

async function handleSuccess(
  payment: Prisma.PaymentGetPayload<{ include: { booking: true } }>,
  parsed: ReturnType<typeof mapWebhookPayload>,
  rawJson: unknown,
): Promise<void> {
  const booking = payment.booking
  if (!parsed.transactionId) {
    throw new Error('Missing transactionId on success webhook')
  }

  const now = new Date()
  const holdExpired =
    booking.holdExpiresAt != null && booking.holdExpiresAt < now
  const isCancelled = booking.bookingStatus === 'cancelled'

  if (isCancelled || holdExpired) {
    await prisma.payment.update({
      where: { id: payment.id },
      data:  {
        bonumTransactionId: parsed.transactionId,
        refundQueuedAt:     new Date(),
        failureMessage:     'Late success after cancel/expiry — refund',
        metadata:           mergeMetadata(payment.metadata, {
          lateWebhook: rawJson as Record<string, unknown>,
        }),
      },
    })

    const refund = await refundBonumPayment({
      transactionId: parsed.transactionId,
      amount:        payment.amount,
      currency:      payment.currency,
      reason:        'Late payment after booking released',
    })

    if (!refund.ok) {
      await prisma.payment.update({
        where: { id: payment.id },
        data:  { failureMessage: 'Late success: refund API failed or not configured — manual review required' },
      })
    } else {
      await prisma.payment.update({
        where: { id: payment.id },
        data:  {
          status:         'refunded',
          refundAmount:   payment.amount,
          refundReason:   'Automatic refund: payment after expiry/cancel',
          refundQueuedAt: null,
        },
      })
    }
    return
  }

  if (booking.bookingStatus !== 'pending') {
    if (booking.bookingStatus === 'confirmed' && booking.paymentStatus === 'paid') {
      return
    }
    throw new Error(`Unexpected booking state ${booking.bookingStatus} for success`)
  }

  await prisma.$transaction(async (tx) => {
    const payRows = await tx.payment.updateMany({
      where: {
        id:     payment.id,
        status: { in: ['unpaid', 'authorized'] },
      },
      data: {
        status:             'paid',
        bonumTransactionId: parsed.transactionId!,
        paidAt:             (() => {
          if (!parsed.completedAt) return new Date()
          const d = new Date(parsed.completedAt)
          return Number.isNaN(d.getTime()) ? new Date() : d
        })(),
        providerOrderId:    parsed.invoiceId ?? payment.providerOrderId,
        metadata:           mergeMetadata(payment.metadata, {
          paymentVendor: parsed.paymentVendor,
          lastPaidWebhook: rawJson as Record<string, unknown>,
        }),
      },
    })
    if (payRows.count === 0) return

    await tx.booking.updateMany({
      where: {
        id:               booking.id,
        bookingStatus:    'pending',
        paymentStatus: { in: ['unpaid', 'authorized'] },
      },
      data: {
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
      },
    })
  })
}
