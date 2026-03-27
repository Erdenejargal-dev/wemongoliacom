import { escapeHtml, formatListingTypeLabel, formatMoney } from '../utils/email-format'
import { wrapEmailHtml, wrapEmailText } from './email-layout'

export interface BookingEmailCommon {
  bookingCode:    string
  listingTitle:   string
  listingType:    string
  guests:         number
  totalAmount:    number
  currency:       string
  bookingStatus:  string
  /** Tour departure range, vehicle range, or accommodation check-in/out */
  dateSummary:    string
}

function commonLines(c: BookingEmailCommon): string[] {
  return [
    `Booking code: ${c.bookingCode}`,
    `Listing: ${c.listingTitle}`,
    `Type: ${formatListingTypeLabel(c.listingType)}`,
    `Dates: ${c.dateSummary}`,
    `Guests: ${c.guests}`,
    `Total: ${formatMoney(c.totalAmount, c.currency)}`,
    `Status: ${c.bookingStatus}`,
  ]
}

function commonHtmlRows(c: BookingEmailCommon): string {
  const rows = [
    ['Booking code', escapeHtml(c.bookingCode)],
    ['Listing', escapeHtml(c.listingTitle)],
    ['Type', escapeHtml(formatListingTypeLabel(c.listingType))],
    ['Dates', escapeHtml(c.dateSummary)],
    ['Guests', escapeHtml(String(c.guests))],
    ['Total', escapeHtml(formatMoney(c.totalAmount, c.currency))],
    ['Status', escapeHtml(c.bookingStatus)],
  ]
  return rows
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:#71717a;width:120px;vertical-align:top;">${escapeHtml(k)}</td><td style="padding:6px 0;color:#18181b;">${v}</td></tr>`,
    )
    .join('')
}

function tableWrap(rowsHtml: string): string {
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:8px;">${rowsHtml}</table>`
}

export function buildBookingCreatedTraveler(c: BookingEmailCommon) {
  const title = 'Your booking request was received'
  const intro =
    'Thank you for booking with WeMongolia. We have recorded your booking with the details below. You will receive updates if the host confirms or if anything changes.'
  const subject = `[WeMongolia] Booking ${c.bookingCode} — ${c.listingTitle}`
  const html = wrapEmailHtml(title, `<p style="margin:0 0 16px 0;">${escapeHtml(intro)}</p>${tableWrap(commonHtmlRows(c))}`)
  const text = wrapEmailText(title, [intro, '', ...commonLines(c)])
  return { subject, html, text }
}

export function buildBookingCreatedProvider(c: BookingEmailCommon & { travelerName: string; bookingsUrl: string }) {
  const title = 'New booking on WeMongolia'
  const intro = `${escapeHtml(c.travelerName)} booked one of your listings.`
  const subject = `[WeMongolia] New booking ${c.bookingCode}`
  const linkSafe = escapeHtml(c.bookingsUrl)
  const html = wrapEmailHtml(
    'New booking',
    `<p style="margin:0 0 16px 0;">${intro}</p>${tableWrap(commonHtmlRows(c))}<p style="margin:20px 0 0 0;"><a href="${linkSafe}" style="display:inline-block;background:#0285C9;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">View in Business Portal</a></p><p style="margin:12px 0 0 0;font-size:12px;color:#71717a;">If the button does not work, copy this link:<br><span style="word-break:break-all;">${linkSafe}</span></p>`,
  )
  const text = wrapEmailText('New booking', [
    `${c.travelerName} made a new booking.`,
    '',
    ...commonLines(c),
    '',
    `Manage bookings: ${c.bookingsUrl}`,
  ])
  return { subject, html, text }
}

export function buildBookingCancelledTraveler(
  c: BookingEmailCommon & { cancelledBy: 'traveler' | 'provider'; cancelReason?: string | null },
) {
  const isSelf = c.cancelledBy === 'traveler'
  const title = isSelf ? 'Your booking has been cancelled' : 'Your booking was cancelled by the host'
  const intro = isSelf
    ? 'We have cancelled your booking as requested. Details below.'
    : 'The host has cancelled your booking. Details below.'
  const subject = `[WeMongolia] Cancelled — ${c.bookingCode}`
  const reasonLine =
    c.cancelReason && c.cancelReason.trim()
      ? `<p style="margin:16px 0 0 0;"><strong>Reason:</strong> ${escapeHtml(c.cancelReason.trim())}</p>`
      : ''
  const textReason =
    c.cancelReason && c.cancelReason.trim() ? [`Reason: ${c.cancelReason.trim()}`] : []
  const html = wrapEmailHtml(
    title,
    `<p style="margin:0 0 16px 0;">${escapeHtml(intro)}</p>${tableWrap(commonHtmlRows(c))}${reasonLine}`,
  )
  const text = wrapEmailText(title, [intro, '', ...commonLines(c), ...textReason])
  return { subject, html, text }
}

export function buildBookingCancelledProvider(
  c: BookingEmailCommon & { cancelledBy: 'traveler' | 'provider'; travelerName: string; bookingsUrl: string; cancelReason?: string | null },
) {
  const isGuest = c.cancelledBy === 'traveler'
  const title = isGuest ? 'A traveler cancelled a booking' : 'Booking cancelled'
  const intro = isGuest
    ? `${escapeHtml(c.travelerName)} cancelled their booking.`
    : 'You cancelled this booking. Below is a summary for your records.'
  const subject = isGuest
    ? `[WeMongolia] Guest cancelled — ${c.bookingCode}`
    : `[WeMongolia] You cancelled booking ${c.bookingCode}`
  const reasonLine =
    c.cancelReason && c.cancelReason.trim()
      ? `<p style="margin:16px 0 0 0;"><strong>Reason:</strong> ${escapeHtml(c.cancelReason.trim())}</p>`
      : ''
  const linkSafe = escapeHtml(c.bookingsUrl)
  const html = wrapEmailHtml(
    title,
    `<p style="margin:0 0 16px 0;">${intro}</p>${tableWrap(commonHtmlRows(c))}${reasonLine}<p style="margin:20px 0 0 0;"><a href="${linkSafe}" style="color:#0285C9;text-decoration:none;font-weight:600;">Open bookings in Business Portal →</a></p>`,
  )
  const text = wrapEmailText(title, [
    isGuest ? `${c.travelerName} cancelled.` : 'Cancellation recorded.',
    '',
    ...commonLines(c),
    ...(c.cancelReason && c.cancelReason.trim() ? [`Reason: ${c.cancelReason.trim()}`] : []),
    '',
    c.bookingsUrl,
  ])
  return { subject, html, text }
}

export function buildSmtpTest(): { subject: string; html: string; text: string } {
  const title = 'SMTP test'
  const subject = '[WeMongolia] SMTP test message'
  const html = wrapEmailHtml(title, `<p style="margin:0;">This is a test message from the WeMongolia backend. If you received it, Zoho SMTP is working.</p>`)
  const text = wrapEmailText(title, ['This is a test message from the WeMongolia backend.'])
  return { subject, html, text }
}
