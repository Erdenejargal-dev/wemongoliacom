import { Prisma, type Payment } from '@prisma/client'
import crypto from 'crypto'
import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'
import { env } from '../config/env'
import {
  BonumInvoiceDuplicateError,
  BonumQrDuplicateError,
  createBonumInvoice,
  createBonumQrPayment,
  lookupBonumQrInvoice,
  refundBonumPayment,
} from '../integrations/bonum/bonum.client'
import {
  isBonumWebhookUrl,
  parseBonumQrDeeplink,
  resolveBonumBrowserReturnUrl,
  type BonumInvoiceCreateInput,
  type BonumQrCreateResult,
  type BonumQrDeeplink,
} from '../integrations/bonum/bonum.mapper'
import { releaseRoomAvailabilityForCancel } from './booking.service'
import {
  describeBookingPaymentCapability,
  bonumCanCharge,
} from '../utils/payment-capability'
import { assertSupportedCurrency } from '../utils/currency'
import { convertWithSnapshot, type FxRateSnapshot } from '../utils/fx'

function mergePaymentMetadata(
  current: Prisma.JsonValue | null | undefined,
  patch: Record<string, unknown>,
): Prisma.InputJsonValue {
  const base =
    current && typeof current === 'object' && !Array.isArray(current)
      ? { ...(current as Record<string, unknown>) }
      : {}
  return { ...base, ...patch } as Prisma.InputJsonValue
}

function readQrFromMetadata(
  metadata: Prisma.JsonValue | null | undefined,
): {
  qrCode: string
  qrImage: string | null
  deeplinks: BonumQrDeeplink[]
} | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  const m = metadata as Record<string, unknown>
  if (m.checkoutMode !== 'qr') return null
  const qrCode = typeof m.qrCode === 'string' ? m.qrCode.trim() : ''
  if (!qrCode) return null
  const qrImage = typeof m.qrImage === 'string' ? m.qrImage : null
  const deeplinks: BonumQrDeeplink[] = []
  if (Array.isArray(m.deeplinks)) {
    for (const d of m.deeplinks) {
      const parsed = parseBonumQrDeeplink(d)
      if (parsed) deeplinks.push(parsed)
    }
  }
  return { qrCode, qrImage, deeplinks }
}

function canReuseExistingBonumQr(
  payment: Pick<Payment, 'status' | 'providerOrderId' | 'sessionExpiresAt' | 'metadata'>,
  booking: { holdExpiresAt: Date | null },
  now: Date,
): boolean {
  if (payment.status !== 'authorized') return false
  if (!payment.providerOrderId?.trim()) return false
  if (!readQrFromMetadata(payment.metadata)) return false
  if (payment.sessionExpiresAt && payment.sessionExpiresAt <= now) return false
  if (booking.holdExpiresAt && booking.holdExpiresAt <= now) return false
  return true
}

function canReuseExistingBonumInvoice(
  payment: Pick<Payment, 'status' | 'providerOrderId' | 'followUpUrl' | 'sessionExpiresAt'>,
  booking: { holdExpiresAt: Date | null },
  now: Date,
): boolean {
  if (payment.status !== 'authorized') return false
  const pid = payment.providerOrderId?.trim()
  const url = payment.followUpUrl?.trim()
  if (!pid || !url) return false
  if (isBonumWebhookUrl(url)) return false
  if (payment.sessionExpiresAt && payment.sessionExpiresAt <= now) return false
  if (booking.holdExpiresAt && booking.holdExpiresAt <= now) return false
  return true
}

function logBonumQrReused(params: {
  paymentId: string
  bookingCode: string
  providerOrderId: string
}): void {
  console.log('BONUM QR REUSED', {
    paymentId:       params.paymentId,
    bookingCode:     params.bookingCode,
    providerOrderId: params.providerOrderId,
  })
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
  newHold: Date
  checkoutMode: 'qr' | 'hosted_invoice'
  sessionExpiresAt: Date | null
  invoiceId: string | null
  qrCode?: string | null
  qrImage?: string | null
  deeplinks?: BonumQrDeeplink[]
  followUpUrl?: string | null
}) {
  const firstDeeplink = params.deeplinks?.[0]
  const rawFollowUp = params.followUpUrl?.trim() ?? ''
  const followUp =
    rawFollowUp && isBonumWebhookUrl(rawFollowUp)
      ? resolveBonumBrowserReturnUrl(params.payment.id)
      : rawFollowUp || null

  const amountDisplay = Math.round(Number(params.payment.amount))

  return {
    paymentId:     params.payment.id,
    bookingId:     params.booking.id,
    bookingCode:   params.booking.bookingCode,
    status:        'authorized' as const,
    amount:        amountDisplay,
    currency:      params.payment.currency,
    expiresAt:     params.sessionExpiresAt?.toISOString() ?? params.newHold.toISOString(),
    holdExpiresAt: params.newHold.toISOString(),
    checkoutMode:  params.checkoutMode,
    invoiceId:     params.invoiceId,
    qrCode:        params.qrCode ?? null,
    qrImage:       params.qrImage ?? null,
    deeplinks:     params.deeplinks ?? [],
    followUpUrl:   followUp,
    qrCodeData:    params.qrCode ?? null,
    deeplinkUrl:   firstDeeplink?.url ?? null,
  }
}

const retryBuckets = new Map<string, number[]>()

/** In-process throttle for Bonum QR invoice lookup (fallback when webhook is slow). */
const lastQrLookupByPaymentId = new Map<string, number>()

function pruneQrLookupThrottle(): void {
  const now = Date.now()
  const maxAge = 60 * 60 * 1000
  for (const [id, t] of lastQrLookupByPaymentId) {
    if (now - t > maxAge) lastQrLookupByPaymentId.delete(id)
  }
}

function isQrLookupDisabled(): boolean {
  const v = env.BONUM_QR_LOOKUP_DISABLED?.trim().toLowerCase()
  return v === 'true' || v === '1' || v === 'yes'
}

/** qrCode on metadata even when checkoutMode was not set (partial writes). */
function extractQrCodeLoose(metadata: Prisma.JsonValue | null): string | null {
  if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return null
  const m = metadata as Record<string, unknown>
  const q = typeof m.qrCode === 'string' ? m.qrCode.trim() : ''
  return q || null
}

function resolveQrCodeForLookup(
  payment: { metadata: Prisma.JsonValue | null; attempts: { qrPayload: string | null }[] },
): string | null {
  const fromStrict = readQrFromMetadata(payment.metadata)
  if (fromStrict?.qrCode?.trim()) return fromStrict.qrCode.trim()
  const loose = extractQrCodeLoose(payment.metadata)
  if (loose) return loose
  const latest = payment.attempts[0]
  if (latest?.qrPayload?.trim()) return latest.qrPayload.trim()
  return null
}

function hasQrPaymentSignals(
  payment: { metadata: Prisma.JsonValue | null; attempts: { qrPayload: string | null }[] },
): boolean {
  if (payment.attempts[0]?.qrPayload?.trim()) return true
  if (!payment.metadata || typeof payment.metadata !== 'object' || Array.isArray(payment.metadata)) {
    return false
  }
  const m = payment.metadata as Record<string, unknown>
  if (m.checkoutMode === 'qr') return true
  if (typeof m.qrCode === 'string' && m.qrCode.trim()) return true
  return false
}

function shouldAttemptQrLookupFallback(
  payment: {
    status: string
    metadata: Prisma.JsonValue | null
    attempts: { qrPayload: string | null }[]
  },
  booking: { bookingStatus: string; paymentStatus: string },
): boolean {
  if (isQrLookupDisabled()) return false
  if (booking.bookingStatus !== 'pending') return false
  if (!['unpaid', 'authorized'].includes(booking.paymentStatus)) return false
  if (!['unpaid', 'authorized'].includes(payment.status)) return false
  return hasQrPaymentSignals(payment)
}

async function persistQrCodeFromAttemptIfMissing(
  payment: Prisma.PaymentGetPayload<{
    include: {
      booking: {
        select: {
          id: true
          bookingCode: true
          bookingStatus: true
          paymentStatus: true
          holdExpiresAt: true
          maxHoldUntil: true
          listingType: true
        }
      }
      attempts: true
    }
  }>,
): Promise<typeof payment | null> {
  if (readQrFromMetadata(payment.metadata)?.qrCode?.trim()) return null
  const qr = payment.attempts[0]?.qrPayload?.trim()
  if (!qr) return null
  await prisma.payment.update({
    where: { id: payment.id },
    data:  {
      metadata: mergePaymentMetadata(payment.metadata, {
        checkoutMode: 'qr',
        qrCode:       qr,
      }),
    },
  })
  const refreshed = await prisma.payment.findUnique({
    where: { id: payment.id },
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
      attempts: { orderBy: { attemptNumber: 'desc' }, take: 1 },
    },
  })
  return refreshed ?? null
}

/**
 * Mirrors bonumWebhook.handleSuccess for QR lookup fallback only (webhook remains primary).
 */
async function applyBonumQrLookupSuccess(
  payment: Prisma.PaymentGetPayload<{ include: { booking: true } }>,
  parsed: { transactionId: string; invoiceId?: string | null; raw: Record<string, unknown> },
): Promise<{ updated: boolean; lateRefund?: boolean }> {
  const booking = payment.booking
  const txId = parsed.transactionId.trim()
  if (!txId) return { updated: false }

  const now = new Date()
  const holdExpired =
    booking.holdExpiresAt != null && booking.holdExpiresAt < now
  const isCancelled = booking.bookingStatus === 'cancelled'

  if (isCancelled || holdExpired) {
    await prisma.payment.update({
      where: { id: payment.id },
      data:  {
        bonumTransactionId: txId,
        refundQueuedAt:     new Date(),
        failureMessage:     'Late success after cancel/expiry — refund',
        metadata:           mergePaymentMetadata(payment.metadata, {
          lateQrLookup: parsed.raw,
        }),
      },
    })

    const refund = await refundBonumPayment({
      transactionId: txId,
      amount:        payment.amount,
      currency:      payment.currency,
      reason:        'Late payment after booking released',
    })

    if (!refund.ok) {
      await prisma.payment.update({
        where: { id: payment.id },
        data:  {
          failureMessage:
            'Late success: refund API failed or not configured — manual review required',
        },
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
    return { updated: false, lateRefund: true }
  }

  if (booking.bookingStatus !== 'pending') {
    if (booking.bookingStatus === 'confirmed' && booking.paymentStatus === 'paid') {
      return { updated: false }
    }
    console.warn(
      `[bonum qr lookup] unexpected booking state ${booking.bookingStatus} for paid lookup`,
    )
    return { updated: false }
  }

  let payUpdated = false
  await prisma.$transaction(async (tx) => {
    const payRows = await tx.payment.updateMany({
      where: {
        id:     payment.id,
        status: { in: ['unpaid', 'authorized'] },
      },
      data: {
        status:             'paid',
        bonumTransactionId: txId,
        paidAt:             new Date(),
        providerOrderId:    parsed.invoiceId ?? payment.providerOrderId,
        metadata:           mergePaymentMetadata(payment.metadata, {
          lastQrLookup: parsed.raw,
        }),
      },
    })
    if (payRows.count === 0) return
    payUpdated = true

    await tx.booking.updateMany({
      where: {
        id:              booking.id,
        bookingStatus:   'pending',
        paymentStatus: { in: ['unpaid', 'authorized'] },
      },
      data: {
        paymentStatus: 'paid',
        bookingStatus: 'confirmed',
      },
    })
  })

  return { updated: payUpdated }
}

async function maybeReconcileFromBonumQrLookup(
  userId: string,
  payment: Prisma.PaymentGetPayload<{
    include: {
      booking: {
        select: {
          id: true
          bookingCode: true
          bookingStatus: true
          paymentStatus: true
          holdExpiresAt: true
          maxHoldUntil: true
          listingType: true
        }
      }
      attempts: true
    }
  }>,
): Promise<void> {
  const dbg = (msg: string, extra?: Record<string, unknown>) => {
    console.log('[payment confirm debug]', msg, { paymentId: payment.id, ...extra })
  }

  if (payment.userId !== userId) {
    dbg('qr lookup skipped: user mismatch')
    return
  }
  if (!shouldAttemptQrLookupFallback(payment, payment.booking)) {
    dbg('qr lookup skipped: not eligible for QR fallback', {
      bookingStatus:   payment.booking.bookingStatus,
      bookingPay:      payment.booking.paymentStatus,
      paymentStatus:   payment.status,
      lookupDisabled:  isQrLookupDisabled(),
      hasQrSignals:    hasQrPaymentSignals(payment),
    })
    return
  }

  const qrCode = resolveQrCodeForLookup(payment)
  dbg('qrCode resolution', {
    found:              Boolean(qrCode),
    qrCodeLength:       qrCode?.length ?? 0,
    fromStrictMetadata: Boolean(readQrFromMetadata(payment.metadata)?.qrCode),
    fromLooseMetadata:  Boolean(extractQrCodeLoose(payment.metadata)),
    fromAttempt:        Boolean(payment.attempts[0]?.qrPayload?.trim()),
  })
  if (!qrCode) {
    dbg('qr lookup skipped: no qrCode on payment metadata or latest attempt')
    return
  }

  const now = Date.now()
  const ageMs = now - payment.createdAt.getTime()
  if (ageMs < env.BONUM_QR_LOOKUP_MIN_AGE_MS) {
    dbg('qr lookup skipped: min age not reached', {
      ageMs,
      minAgeMs: env.BONUM_QR_LOOKUP_MIN_AGE_MS,
    })
    return
  }

  pruneQrLookupThrottle()
  const last = lastQrLookupByPaymentId.get(payment.id) ?? 0
  if (now - last < env.BONUM_QR_LOOKUP_MIN_INTERVAL_MS) {
    dbg('qr lookup skipped: throttle interval', {
      msSinceLast: now - last,
      minInterval: env.BONUM_QR_LOOKUP_MIN_INTERVAL_MS,
    })
    return
  }
  lastQrLookupByPaymentId.set(payment.id, now)

  dbg('qr lookup attempting Bonum POST /mpay-service/merchant/transaction/qr', {
    qrCodeLength: qrCode.length,
    qrPrefix:     `${qrCode.slice(0, 12)}…`,
  })

  console.log('[bonum qr lookup] request', {
    paymentId:    payment.id,
    qrCodeLength: qrCode.length,
    qrPrefix:     `${qrCode.slice(0, 12)}…`,
  })

  let parsed: Awaited<ReturnType<typeof lookupBonumQrInvoice>>
  try {
    parsed = await lookupBonumQrInvoice({ qrCode })
  } catch (e) {
    console.error('[bonum qr lookup] request failed', e instanceof Error ? e.message : e)
    dbg('qr lookup HTTP/request error', { error: e instanceof Error ? e.message : String(e) })
    return
  }

  console.log('[bonum qr lookup] parsed result', {
    paymentId:     payment.id,
    paymentState:  parsed.paymentState,
    transactionId: parsed.transactionId,
    invoiceId:     parsed.invoiceId,
    rawTopKeys:    Object.keys(parsed.raw),
  })
  dbg('parsed lookup state machine', {
    paymentState: parsed.paymentState,
    transactionId: parsed.transactionId,
    invoiceId: parsed.invoiceId,
  })

  if (parsed.qrCodeEcho?.trim() && !extractQrCodeLoose(payment.metadata)) {
    await prisma.payment.update({
      where: { id: payment.id },
      data:  {
        metadata: mergePaymentMetadata(payment.metadata, {
          checkoutMode: 'qr',
          qrCode:       parsed.qrCodeEcho.trim(),
        }),
      },
    })
  }

  if (parsed.paymentState !== 'paid') {
    console.log('[bonum qr lookup] reconcile', {
      paymentId: payment.id,
      updated:   false,
      reason:    parsed.paymentState,
    })
    dbg('reconciliation not run: lookup did not classify as paid', {
      paymentState: parsed.paymentState,
    })
    return
  }

  const txId =
    parsed.transactionId?.trim() ||
    payment.bonumTransactionId?.trim() ||
    `BOOKING_${payment.booking.bookingCode}`

  const full = await prisma.payment.findUnique({
    where: { id: payment.id },
    include: { booking: true },
  })
  if (!full) return

  try {
    const result = await applyBonumQrLookupSuccess(full, {
      transactionId: txId,
      invoiceId:     parsed.invoiceId ?? full.providerOrderId,
      raw:           parsed.raw,
    })
    console.log('[bonum qr lookup] reconcile', {
      paymentId:   payment.id,
      updated:     result.updated,
      lateRefund:  result.lateRefund ?? false,
    })
    dbg('reconciliation result', {
      updated:    result.updated,
      lateRefund: result.lateRefund ?? false,
    })
  } catch (e) {
    console.error('[bonum qr lookup] reconcile error', e instanceof Error ? e.message : e)
    dbg('reconciliation threw', { error: e instanceof Error ? e.message : String(e) })
  }
}

function buildPaymentStatusResponse(
  payment: Prisma.PaymentGetPayload<{
    include: {
      booking: {
        select: {
          id: true
          bookingCode: true
          bookingStatus: true
          paymentStatus: true
          holdExpiresAt: true
          maxHoldUntil: true
          listingType: true
        }
      }
    }
  }>,
) {
  const b = payment.booking
  return {
    bookingId:     b.id,
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
      followUpUrl: payment.followUpUrl
        ? (isBonumWebhookUrl(payment.followUpUrl)
            ? resolveBonumBrowserReturnUrl(payment.id)
            : payment.followUpUrl)
        : null,
    },
  }
}

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

  // ── Phase 6.2 payment-currency path ──────────────────────────────────
  //
  // Bonum settles in MNT only. For MNT bookings we pass the amount
  // through untouched. For non-MNT bookings (e.g. USD-priced listings)
  // we convert to MNT at payment time using the existing FX layer and
  // persist a payable snapshot on the Payment so we always know:
  //   - the booking's original currency + original amount, and
  //   - the MNT amount + the exact FX rate/source/timestamp used.
  //
  // Guards:
  //   - `capability.payable === true` (covers MNT direct and MVP conversion).
  //   - `capability.payableCurrency === 'MNT'` (Bonum invariant).
  //   - If conversion is required but no FX rate exists, `convertWithSnapshot`
  //     throws AppError(503) with a clear operator-facing message.
  const bookingCurrency = assertSupportedCurrency(booking.currency, 'booking.currency')
  const capability = describeBookingPaymentCapability(bookingCurrency)
  if (!capability.payable || capability.payableCurrency !== 'MNT' || !bonumCanCharge('MNT')) {
    throw new AppError(
      capability.userMessage ??
        `Payment unavailable: this booking is priced in ${booking.currency}, ` +
          'but the payment gateway cannot settle this currency. Please contact support.',
      400,
    )
  }

  // Resolve the MNT-denominated amount Bonum will actually charge.
  //   - Same-currency (MNT → MNT) is a no-op in the FX util.
  //   - Cross-currency (USD → MNT) looks up the most recent `FxRate` row;
  //     if none exists it throws AppError(503) with an explicit message.
  let payableAmountMnt = booking.totalAmount
  let payableFxSnapshot: FxRateSnapshot | null = null
  if (bookingCurrency !== 'MNT') {
    const { amount, snapshot } = await convertWithSnapshot(
      booking.totalAmount,
      bookingCurrency,
      'MNT',
    )
    payableAmountMnt = amount
    payableFxSnapshot = snapshot
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

  // Payable snapshot persisted on payment.metadata — never lose the
  // original booking currency / amount / FX context. Stored even when no
  // conversion was needed so downstream readers can rely on a uniform
  // shape ('same_currency' source, rate = 1).
  const payableSnapshot = {
    originalCurrency:  bookingCurrency,
    originalAmount:    booking.totalAmount,
    payableCurrency:   'MNT' as const,
    payableAmount:     payableAmountMnt,
    fxRate:            payableFxSnapshot?.rate ?? 1,
    fxSource:          payableFxSnapshot?.source ?? 'same_currency',
    fxCapturedAt:      (payableFxSnapshot?.capturedAt ?? now).toISOString(),
    conversionRequired: bookingCurrency !== 'MNT',
  }

  let payment = booking.payment
  if (!payment) {
    payment = await prisma.payment.create({
      data: {
        bookingId:      booking.id,
        providerId:     booking.providerId,
        userId:         booking.userId,
        // Bonum invariant: the Payment row stores the amount/currency the
        // processor will actually settle (MNT). The booking's own totals
        // and currency remain untouched and authoritative for accounting.
        amount:         payableAmountMnt,
        currency:       'MNT',
        status:         'unpaid',
        paymentGateway: env.BONUM_USE_STUB === 'true' || !env.BONUM_API_BASE_URL?.trim() ? 'bonum_stub' : 'bonum',
        idempotencyKey,
        metadata:       { payableSnapshot } as Prisma.InputJsonValue,
      },
    })
  } else {
    if (canReuseExistingBonumQr(payment, booking, now)) {
      await prisma.booking.update({
        where: { id: booking.id },
        data:  {
          paymentStatus:        'authorized',
          holdExpiresAt:        newHold,
          lastPaymentAttemptAt: new Date(),
        },
      })
      logBonumQrReused({
        paymentId:       payment.id,
        bookingCode:     booking.bookingCode,
        providerOrderId: payment.providerOrderId!,
      })
      const qr = readQrFromMetadata(payment.metadata)!
      return buildInitiatePaymentResponse({
        payment,
        booking,
        newHold,
        checkoutMode:     'qr',
        sessionExpiresAt: payment.sessionExpiresAt,
        invoiceId:        payment.providerOrderId,
        qrCode:           qr.qrCode,
        qrImage:          qr.qrImage,
        deeplinks:        qr.deeplinks,
        followUpUrl:      null,
      })
    }
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
        newHold,
        checkoutMode:     'hosted_invoice',
        sessionExpiresAt: payment.sessionExpiresAt,
        invoiceId:        payment.providerOrderId,
        followUpUrl:      payment.followUpUrl,
        qrCode:           null,
        qrImage:          null,
        deeplinks:        [],
      })
    }

    // Refresh the MNT-denominated amount + FX snapshot on every retry
    // so we always charge using the latest active rate (and never a stale
    // one cached on the Payment row). Booking totals stay untouched.
    await prisma.payment.update({
      where: { id: payment.id },
      data:  {
        idempotencyKey,
        amount:   payableAmountMnt,
        currency: 'MNT',
        metadata: mergePaymentMetadata(payment.metadata, { payableSnapshot }),
        ...(payment.status === 'failed' ? { status: 'unpaid', failedAt: null, failureCode: null, failureMessage: null } : {}),
      },
    })
    payment = {
      ...payment,
      amount:   payableAmountMnt,
      currency: 'MNT',
    }
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
  const expiresInSec =
    env.BONUM_INVOICE_EXPIRES_IN_SECONDS > 0 ? env.BONUM_INVOICE_EXPIRES_IN_SECONDS : 900

  let qrResult: BonumQrCreateResult | null = null
  try {
    qrResult = await createBonumQrPayment({
      amount:        Math.round(payment!.amount),
      transactionId: bonumTxId,
      expiresIn:     expiresInSec,
    })
  } catch (qrErr) {
    if (qrErr instanceof BonumQrDuplicateError) {
      const fresh = await prisma.payment.findUnique({ where: { id: payment!.id } })
      const qrFromDb = readQrFromMetadata(fresh?.metadata)
      if (fresh?.providerOrderId?.trim() && qrFromDb) {
        logBonumQrReused({
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
              qrPayload:       qrFromDb.qrCode,
              deeplinkUrl:     qrFromDb.deeplinks[0]?.url ?? null,
              expiresAt:       fresh.sessionExpiresAt,
            },
          }),
        ])
        recordRetry(bookingId)
        return buildInitiatePaymentResponse({
          payment:          fresh,
          booking,
          newHold,
          checkoutMode:     'qr',
          sessionExpiresAt: fresh.sessionExpiresAt,
          invoiceId:        fresh.providerOrderId,
          qrCode:           qrFromDb.qrCode,
          qrImage:          qrFromDb.qrImage,
          deeplinks:        qrFromDb.deeplinks,
          followUpUrl:      null,
        })
      }
    }
    qrResult = null
  }

  if (qrResult) {
    const metaQr = {
      checkoutMode: 'qr' as const,
      qrCode:       qrResult.qrCode,
      qrImage:      qrResult.qrImage,
      deeplinks:    qrResult.links,
      rawQr:        qrResult.raw,
    }
    await prisma.$transaction([
      prisma.payment.update({
        where: { id: payment!.id },
        data:  {
          status:            'authorized',
          providerOrderId:   qrResult.invoiceId,
          followUpUrl:       null,
          sessionExpiresAt:  qrResult.sessionExpiresAt,
          bonumTransactionId: bonumTxId,
          metadata:          mergePaymentMetadata(payment!.metadata, metaQr),
          paymentGateway:    env.BONUM_USE_STUB === 'true' || !env.BONUM_API_BASE_URL?.trim() ? 'bonum_stub' : 'bonum',
        },
      }),
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
          providerOrderId: qrResult.invoiceId,
          followUpUrl:     null,
          qrPayload:       qrResult.qrCode,
          deeplinkUrl:     qrResult.links[0]?.url ?? null,
          expiresAt:       qrResult.sessionExpiresAt,
        },
      }),
    ])
    recordRetry(bookingId)
    return buildInitiatePaymentResponse({
      payment:          payment!,
      booking,
      newHold,
      checkoutMode:     'qr',
      sessionExpiresAt: qrResult.sessionExpiresAt,
      invoiceId:        qrResult.invoiceId,
      qrCode:           qrResult.qrCode,
      qrImage:          qrResult.qrImage,
      deeplinks:        qrResult.links,
      followUpUrl:      null,
    })
  }

  const invoiceInput: BonumInvoiceCreateInput = {
    amount:            Math.round(payment!.amount),
    transactionId:     bonumTxId,
    internalPaymentId: payment!.id,
    expiresIn:         expiresInSec,
  }

  let invoice: Awaited<ReturnType<typeof createBonumInvoice>>
  try {
    invoice = await createBonumInvoice(invoiceInput)
  } catch (err) {
    if (err instanceof BonumInvoiceDuplicateError) {
      const fresh = await prisma.payment.findUnique({ where: { id: payment!.id } })
      const qrFromDb = readQrFromMetadata(fresh?.metadata)
      if (fresh?.providerOrderId?.trim() && qrFromDb) {
        logBonumQrReused({
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
              qrPayload:       qrFromDb.qrCode,
              deeplinkUrl:     qrFromDb.deeplinks[0]?.url ?? null,
              expiresAt:       fresh.sessionExpiresAt,
            },
          }),
        ])
        recordRetry(bookingId)
        return buildInitiatePaymentResponse({
          payment:          fresh,
          booking,
          newHold,
          checkoutMode:     'qr',
          sessionExpiresAt: fresh.sessionExpiresAt,
          invoiceId:        fresh.providerOrderId,
          qrCode:           qrFromDb.qrCode,
          qrImage:          qrFromDb.qrImage,
          deeplinks:        qrFromDb.deeplinks,
          followUpUrl:      null,
        })
      }
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
          newHold,
          checkoutMode:     'hosted_invoice',
          sessionExpiresAt: fresh.sessionExpiresAt,
          invoiceId:        fresh.providerOrderId,
          followUpUrl:      fresh.followUpUrl,
          qrCode:           null,
          qrImage:          null,
          deeplinks:        [],
        })
      }
      throw new AppError(
        'Could not start payment: duplicate transaction with no saved session. Please contact support.',
        409,
      )
    }
    throw err
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment!.id },
      data:  {
        status:             'authorized',
        providerOrderId:    invoice.invoiceId,
        followUpUrl:        invoice.followUpLink,
        sessionExpiresAt:   invoice.sessionExpiresAt,
        bonumTransactionId: bonumTxId,
        metadata: mergePaymentMetadata(payment!.metadata, {
          checkoutMode: 'hosted_invoice',
          rawInvoice:   invoice.raw,
        }),
        paymentGateway: env.BONUM_USE_STUB === 'true' || !env.BONUM_API_BASE_URL?.trim() ? 'bonum_stub' : 'bonum',
      },
    }),
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
    newHold,
    checkoutMode:     'hosted_invoice',
    sessionExpiresAt: invoice.sessionExpiresAt,
    invoiceId:        invoice.invoiceId,
    followUpUrl:      invoice.followUpLink,
    qrCode:           null,
    qrImage:          null,
    deeplinks:        [],
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
  const statusInclude = {
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
    attempts: { orderBy: { attemptNumber: 'desc' as const }, take: 1 },
  }

  let payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: statusInclude,
  })
  if (!payment) throw new AppError('Payment not found.', 404)
  if (payment.userId !== userId) throw new AppError('Forbidden.', 403)

  const b = payment.booking
  if (b.paymentStatus === 'paid' && b.bookingStatus === 'confirmed') {
    return buildPaymentStatusResponse(payment)
  }

  const persisted = await persistQrCodeFromAttemptIfMissing(payment)
  if (persisted) payment = persisted

  await maybeReconcileFromBonumQrLookup(userId, payment)

  const refreshed = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: statusInclude,
  })
  if (!refreshed) throw new AppError('Payment not found.', 404)

  return buildPaymentStatusResponse(refreshed)
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

/**
 * Phase 3 — pre-flight payment-capability probe.
 *
 * The traveler UI (booking cards, checkout, payment init) hits this to
 * decide what to show BEFORE trying to initiate. Returns the pure
 * capability object plus the booking's own currency so the frontend can
 * render "payable in X — your listing is priced in Y" without guessing.
 */
export async function getBookingPaymentCapability(userId: string, bookingCode: string) {
  const booking = await prisma.booking.findUnique({
    where: { bookingCode },
    select: {
      id:            true,
      bookingCode:   true,
      userId:        true,
      currency:      true,
      baseCurrency:  true,
      bookingStatus: true,
      paymentStatus: true,
      totalAmount:   true,
      baseTotalAmount: true,
      listingType:   true,
    },
  })
  if (!booking) throw new AppError('Booking not found.', 404)
  if (booking.userId !== userId) throw new AppError('Forbidden.', 403)

  const bookingCurrency = assertSupportedCurrency(booking.currency, 'booking.currency')
  const capability = describeBookingPaymentCapability(bookingCurrency)

  // Phase 6.2 — when conversion is required, attempt an FX preview so the
  // traveler sees the MNT amount they'll be charged BEFORE hitting the pay
  // button. If no rate exists, we surface a null preview and downgrade the
  // capability so the UI can message "conversion unavailable" instead of
  // silently showing Reserve and 503-ing at initiate time.
  let payablePreview: { amount: number; currency: 'MNT'; fxRate: number; fxSource: string; fxCapturedAt: string } | null = null
  let effectiveCapability = capability
  if (capability.conversionRequired && capability.payableCurrency === 'MNT') {
    try {
      const { amount, snapshot } = await convertWithSnapshot(
        booking.totalAmount,
        bookingCurrency,
        'MNT',
      )
      payablePreview = {
        amount,
        currency:     'MNT',
        fxRate:       snapshot.rate,
        fxSource:     snapshot.source,
        fxCapturedAt: snapshot.capturedAt.toISOString(),
      }
    } catch {
      // No active FX rate → conversion path is not actually usable right now.
      effectiveCapability = {
        ...capability,
        payable:     false,
        reasonCode:  'unsupported_currency',
        userMessage:
          `Online payment is temporarily unavailable for ${bookingCurrency}: ` +
          'exchange rate is not configured. Please contact support to complete this booking.',
      }
    }
  }

  return {
    bookingCode:     booking.bookingCode,
    listingType:     booking.listingType,
    bookingStatus:   booking.bookingStatus,
    paymentStatus:   booking.paymentStatus,
    amount:          booking.totalAmount,
    currency:        bookingCurrency,
    baseAmount:      booking.baseTotalAmount,
    baseCurrency:    booking.baseCurrency ?? bookingCurrency,
    capability:      effectiveCapability,
    payablePreview,
  }
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
