import { env } from '../config/env'
import { prisma } from '../lib/prisma'
import { isSmtpConfigured, sendMailMessage } from '../lib/mailer'
import { buildPasswordResetEmail, buildWelcomeEmail } from '../templates/account-emails'
import {
  buildBookingCancelledProvider,
  buildBookingCancelledTraveler,
  buildBookingCreatedProvider,
  buildBookingCreatedTraveler,
  buildSmtpTest,
  type BookingEmailCommon,
} from '../templates/booking-transactional'
import {
  buildVerificationSubmittedProvider,
  buildVerificationSubmittedAdmin,
  buildVerificationApproved,
  buildVerificationRejected,
} from '../templates/verification-emails'
import { formatDateTime } from '../utils/email-format'

// ── Payload types (public API for future callers) ───────────────────────────

export type { BookingEmailCommon }

export interface BookingCreatedProviderPayload extends BookingEmailCommon {
  travelerName: string
  bookingsUrl:  string
}

export interface BookingCancelledPayload extends BookingEmailCommon {
  cancelledBy:  'traveler' | 'provider'
  cancelReason?: string | null
}

export interface BookingCancelledProviderPayload extends BookingCancelledPayload {
  travelerName: string
  bookingsUrl:  string
}

function publicAppBase(): string {
  return env.PUBLIC_APP_URL.replace(/\/$/, '')
}

function providerBookingsUrl(): string {
  return new URL('/dashboard/business/bookings', `${publicAppBase()}/`).href
}

function listingTitleFromSnapshot(snap: unknown): string {
  if (!snap || typeof snap !== 'object') return 'Listing'
  const o = snap as Record<string, unknown>
  if (typeof o.title === 'string' && o.title.trim()) return o.title.trim()
  if (typeof o.name === 'string' && o.name.trim()) return o.name.trim()
  return 'Listing'
}

function dateSummaryFromBooking(booking: {
  listingType:     string
  startDate:       Date
  endDate:         Date | null
  listingSnapshot: unknown
}): string {
  const snap = booking.listingSnapshot as Record<string, unknown> | null
  if (booking.listingType === 'accommodation') {
    const inRaw = snap && typeof snap.checkIn === 'string' ? snap.checkIn : booking.startDate.toISOString()
    const outRaw =
      snap && typeof snap.checkOut === 'string'
        ? snap.checkOut
        : booking.endDate
          ? booking.endDate.toISOString()
          : null
    return `Check-in ${formatDateTime(inRaw)} — Check-out ${outRaw ? formatDateTime(outRaw) : '—'}`
  }
  if (booking.listingType === 'tour') {
    const startRaw = snap && typeof snap.startDate === 'string' ? snap.startDate : booking.startDate.toISOString()
    const endRaw =
      snap && typeof snap.endDate === 'string'
        ? snap.endDate
        : booking.endDate
          ? booking.endDate.toISOString()
          : null
    return `Departure ${formatDateTime(startRaw)} — ${endRaw ? formatDateTime(endRaw) : '—'}`
  }
  const start = formatDateTime(booking.startDate)
  const end = booking.endDate ? formatDateTime(booking.endDate) : '—'
  return `${start} — ${end}`
}

async function safeSend(to: string | null | undefined, fn: () => { subject: string; html: string; text: string }): Promise<void> {
  const addr = to?.trim()
  if (!addr) {
    console.info('[email] Skipping send — no recipient address')
    return
  }
  if (!isSmtpConfigured()) return
  try {
    const { subject, html, text } = fn()
    await sendMailMessage({ to: addr, subject, html, text })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[email] Send failed:', msg)
  }
}

// ── Dedicated send functions ─────────────────────────────────────────────────

export async function sendBookingCreatedToTraveler(to: string, payload: BookingEmailCommon): Promise<void> {
  await safeSend(to, () => buildBookingCreatedTraveler(payload))
}

export async function sendBookingCreatedToProvider(to: string, payload: BookingCreatedProviderPayload): Promise<void> {
  await safeSend(to, () => buildBookingCreatedProvider(payload))
}

export async function sendBookingCancelledToTraveler(to: string, payload: BookingCancelledPayload): Promise<void> {
  await safeSend(to, () => buildBookingCancelledTraveler(payload))
}

export async function sendBookingCancelledToProvider(to: string, payload: BookingCancelledProviderPayload): Promise<void> {
  await safeSend(to, () => buildBookingCancelledProvider(payload))
}

// ── Verification emails ──────────────────────────────────────────────────────

const PLATFORM_ADMIN_EMAIL = 'info@wemongolia.com'

/**
 * Fire after provider submits for verification.
 * Sends two emails:
 *  1. Confirmation to provider (or owner if no provider email)
 *  2. Alert to info@wemongolia.com
 * Failures are logged only.
 */
export async function notifyVerificationSubmitted(params: {
  providerEmail: string | null | undefined
  ownerEmail:    string
  ownerName:     string
  businessName:  string
  providerTypes: string[]
}): Promise<void> {
  if (!isSmtpConfigured()) return
  const adminUrl = `${publicAppBase()}/admin/providers?verificationStatus=pending_review`
  const to       = params.providerEmail?.trim() || params.ownerEmail.trim()

  await Promise.all([
    safeSend(to, () =>
      buildVerificationSubmittedProvider({
        ownerName:    params.ownerName,
        businessName: params.businessName,
        providerTypes: params.providerTypes,
      }),
    ),
    safeSend(PLATFORM_ADMIN_EMAIL, () =>
      buildVerificationSubmittedAdmin({
        ownerName:    params.ownerName,
        ownerEmail:   params.ownerEmail,
        businessName: params.businessName,
        providerTypes: params.providerTypes,
        adminUrl,
      }),
    ),
  ])
}

/**
 * Fire after admin verifies a provider.
 * Sends one email to the provider. Failures are logged only.
 */
export async function notifyVerificationApproved(params: {
  providerEmail: string | null | undefined
  ownerEmail:    string
  ownerName:     string
  businessName:  string
}): Promise<void> {
  if (!isSmtpConfigured()) return
  const dashboardUrl = `${publicAppBase()}/dashboard/business`
  const to = params.providerEmail?.trim() || params.ownerEmail.trim()
  await safeSend(to, () =>
    buildVerificationApproved({
      ownerName:    params.ownerName,
      businessName: params.businessName,
      dashboardUrl,
    }),
  )
}

/**
 * Fire after admin rejects a provider.
 * Sends one email to the provider with the rejection reason. Failures are logged only.
 */
export async function notifyVerificationRejected(params: {
  providerEmail:   string | null | undefined
  ownerEmail:      string
  ownerName:       string
  businessName:    string
  rejectionReason: string
}): Promise<void> {
  if (!isSmtpConfigured()) return
  const profileSettingsUrl = `${publicAppBase()}/dashboard/business/settings`
  const to = params.providerEmail?.trim() || params.ownerEmail.trim()
  await safeSend(to, () =>
    buildVerificationRejected({
      ownerName:          params.ownerName,
      businessName:       params.businessName,
      rejectionReason:    params.rejectionReason,
      profileSettingsUrl,
    }),
  )
}

/** Reserved for admin approval workflow — no email sent until product wires this. */
export async function sendProviderOnboardingApproved(_to: string, _businessName: string): Promise<void> {
  console.info('[email] sendProviderOnboardingApproved: reserved — not sending yet')
}

export async function sendPasswordResetEmail(
  to: string,
  payload: { firstName: string; resetUrl: string; expiresMinutes: number },
): Promise<void> {
  await safeSend(to, () => buildPasswordResetEmail(payload))
}

/** After successful registration; failures logged only. */
export async function notifyWelcomeAfterRegistration(to: string, firstName: string): Promise<void> {
  const base = env.PUBLIC_APP_URL.replace(/\/$/, '')
  const exploreUrl = `${base}/tours`
  const tripsUrl = `${base}/account/trips`
  const hostUrl = `${base}/onboarding`
  await safeSend(to, () => buildWelcomeEmail({ firstName, exploreUrl, tripsUrl, hostUrl }))
}

/** Throws on failure — for protected dev/cron test endpoint only. */
export async function sendSmtpTest(to: string): Promise<void> {
  const addr = to?.trim()
  if (!addr) throw new Error('No recipient')
  if (!isSmtpConfigured()) throw new Error('SMTP not configured')
  const { subject, html, text } = buildSmtpTest()
  await sendMailMessage({ to: addr, subject, html, text })
}

// ── Orchestration (load DB, fire after successful transactions) ───────────

type BookingWithRelations = NonNullable<Awaited<ReturnType<typeof loadBookingForEmail>>>

async function loadBookingForEmail(bookingCode: string) {
  return prisma.booking.findUnique({
    where: { bookingCode },
    include: {
      user:     { select: { email: true, firstName: true, lastName: true } },
      provider: { select: { name: true, email: true, ownerUserId: true } },
    },
  })
}

function toCommonBookingPayload(b: BookingWithRelations): BookingEmailCommon {
  return {
    bookingCode:   b.bookingCode,
    listingTitle:  listingTitleFromSnapshot(b.listingSnapshot),
    listingType:   b.listingType,
    guests:        b.guests,
    totalAmount:   b.totalAmount,
    currency:      b.currency,
    bookingStatus: b.bookingStatus,
    dateSummary:   dateSummaryFromBooking(b),
  }
}

function travelerDisplayName(b: BookingWithRelations): string {
  const fromBooking = b.travelerFullName?.trim()
  if (fromBooking) return fromBooking
  return `${b.user.firstName} ${b.user.lastName}`.trim() || 'Traveler'
}

/**
 * After booking is committed. Failures are logged only; never throws.
 */
export async function notifyBookingCreated(bookingCode: string): Promise<void> {
  if (!isSmtpConfigured()) return
  try {
    const booking = await loadBookingForEmail(bookingCode)
    if (!booking) {
      console.warn('[email] notifyBookingCreated: booking not found', bookingCode)
      return
    }
    const owner = await prisma.user.findUnique({
      where: { id: booking.provider.ownerUserId },
      select: { email: true },
    })
    const common = toCommonBookingPayload(booking)
    const travelerName = travelerDisplayName(booking)
    const bookingsUrl = providerBookingsUrl()
    const providerTo = booking.provider.email?.trim() || owner?.email?.trim()

    await Promise.all([
      sendBookingCreatedToTraveler(booking.user.email, common),
      sendBookingCreatedToProvider(providerTo ?? '', {
        ...common,
        travelerName,
        bookingsUrl,
      }),
    ])
  } catch (err) {
    console.error('[email] notifyBookingCreated error:', err instanceof Error ? err.message : err)
  }
}

export async function notifyBookingCancelledByTraveler(bookingCode: string): Promise<void> {
  if (!isSmtpConfigured()) return
  try {
    const booking = await loadBookingForEmail(bookingCode)
    if (!booking) return
    const owner = await prisma.user.findUnique({
      where: { id: booking.provider.ownerUserId },
      select: { email: true },
    })
    const common = toCommonBookingPayload(booking)
    const travelerName = travelerDisplayName(booking)
    const bookingsUrl = providerBookingsUrl()
    const providerTo = booking.provider.email?.trim() || owner?.email?.trim()
    const payload: BookingCancelledPayload = {
      ...common,
      cancelledBy:  'traveler',
      cancelReason: booking.cancelReason,
    }
    await Promise.all([
      sendBookingCancelledToTraveler(booking.user.email, payload),
      sendBookingCancelledToProvider(providerTo ?? '', {
        ...payload,
        travelerName,
        bookingsUrl,
      }),
    ])
  } catch (err) {
    console.error('[email] notifyBookingCancelledByTraveler error:', err instanceof Error ? err.message : err)
  }
}

export async function notifyBookingCancelledByProvider(bookingCode: string): Promise<void> {
  if (!isSmtpConfigured()) return
  try {
    const booking = await loadBookingForEmail(bookingCode)
    if (!booking) return
    const owner = await prisma.user.findUnique({
      where: { id: booking.provider.ownerUserId },
      select: { email: true },
    })
    const common = toCommonBookingPayload(booking)
    const travelerName = travelerDisplayName(booking)
    const bookingsUrl = providerBookingsUrl()
    const providerTo = booking.provider.email?.trim() || owner?.email?.trim()
    const payload: BookingCancelledPayload = {
      ...common,
      cancelledBy:  'provider',
      cancelReason: booking.cancelReason,
    }
    await Promise.all([
      sendBookingCancelledToTraveler(booking.user.email, payload),
      sendBookingCancelledToProvider(providerTo ?? '', {
        ...payload,
        travelerName,
        bookingsUrl,
      }),
    ])
  } catch (err) {
    console.error('[email] notifyBookingCancelledByProvider error:', err instanceof Error ? err.message : err)
  }
}
