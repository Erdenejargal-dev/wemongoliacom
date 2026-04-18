/**
 * Bonum merchant API mapping (hosted invoice + PAYMENT webhooks).
 * Field names follow the Bonum ecommerce / invoice guide.
 */

import { env } from '../../config/env'

// ─── Invoice creation (POST /bonum-gateway/ecommerce/invoices) ─────────────

export interface BonumInvoiceCreateInput {
  /** Amount as required by Bonum (integer minor units, e.g. MNT). */
  amount: number
  /** Ignored for real calls — `createBonumInvoice` sets callback via `resolveBonumWebhookCallbackUrl()`. */
  callback?: string
  /** Correlation id sent to Bonum — we use `BOOKING_${bookingCode}`; stored in `Payment.bonumTransactionId`. */
  transactionId: string
  /** Our `Payment.id` (cuid) — used for stub `followUpLink`, Bonum `returnUrl`, and dev return URL; not sent as raw id to Bonum. */
  internalPaymentId?: string
  /** Public page Bonum should redirect the **browser** to after payment (`returnUrl` in invoice JSON). */
  browserReturnUrl?: string
  expiresIn?: number
  providers?: string[]
  items?: unknown[]
  extras?: unknown
}

/**
 * Public callback URL that Bonum will POST to — must match a route that preserves raw body.
 * Prefer `API_BASE_URL` when the API is not co-hosted with the web app.
 */
export function resolveBonumWebhookCallbackUrl(): string {
  const raw = (env.API_BASE_URL?.trim() || env.PUBLIC_APP_URL?.trim() || '').replace(/\/$/, '')
  if (!raw) {
    throw new Error('Set API_BASE_URL (preferred) or PUBLIC_APP_URL for the Bonum invoice callback.')
  }
  let parsed: URL
  try {
    parsed = new URL(raw)
  } catch {
    throw new Error('Invalid API_BASE_URL / PUBLIC_APP_URL for Bonum invoice callback.')
  }
  if (parsed.protocol !== 'https:') {
    throw new Error('Bonum invoice callback base URL must use https://')
  }
  const host = parsed.hostname.toLowerCase()
  if (host === 'localhost' || host === '127.0.0.1' || host.endsWith('.local')) {
    throw new Error('Bonum invoice callback cannot use localhost, 127.0.0.1, or .local hosts.')
  }
  return `${raw}${env.API_PREFIX}/webhooks/bonum`
}

/**
 * Browser redirect after payment completes on Bonum — must be the **frontend** origin (not the API webhook).
 * Bonum uses the invoice `callback` for server webhook; `returnUrl` tells Bonum where to send the **user** after payment.
 */
export function resolveBonumBrowserReturnUrl(paymentId: string): string {
  const raw = env.PUBLIC_APP_URL?.trim() || ''
  if (!raw) {
    throw new Error(
      'Set PUBLIC_APP_URL to the public frontend origin (e.g. https://wemongolia.com) for Bonum payment return.',
    )
  }
  const base = raw.replace(/\/$/, '')
  let parsed: URL
  try {
    parsed = new URL(base)
  } catch {
    throw new Error('Invalid PUBLIC_APP_URL for Bonum browser return URL.')
  }
  if (parsed.protocol !== 'https:' && env.NODE_ENV === 'production') {
    throw new Error('Bonum browser return URL must use https:// in production.')
  }
  const host = parsed.hostname.toLowerCase()
  if (env.NODE_ENV === 'production' && (host === 'localhost' || host === '127.0.0.1')) {
    throw new Error('PUBLIC_APP_URL cannot be localhost in production for Bonum return URL.')
  }
  return `${base}/checkout/payment-return?paymentId=${encodeURIComponent(paymentId)}`
}

/** True if this URL targets our Bonum webhook route (must never be used as a browser payment or return link). */
export function isBonumWebhookUrl(url: string): boolean {
  const t = url.trim()
  if (!t) return false
  try {
    const u = new URL(t)
    const path = u.pathname.replace(/\/$/, '') || '/'
    if (path.endsWith('/webhooks/bonum')) return true
  } catch {
    return false
  }
  try {
    const expected = resolveBonumWebhookCallbackUrl()
    return t === expected || t.replace(/\/$/, '') === expected.replace(/\/$/, '')
  } catch {
    return false
  }
}

/**
 * `BONUM_INVOICE_PROVIDERS_JSON` e.g. `["QPAY"]` — invalid JSON or wrong shape → `undefined`.
 */
export function parseBonumInvoiceProvidersFromEnv(): string[] | undefined {
  const raw = env.BONUM_INVOICE_PROVIDERS_JSON?.trim()
  if (!raw) return undefined
  try {
    const j = JSON.parse(raw) as unknown
    if (Array.isArray(j) && j.length > 0 && j.every((x) => typeof x === 'string')) {
      return j as string[]
    }
  } catch {
    /* invalid → omit */
  }
  return undefined
}

/** Request body for POST .../invoices — types Bonum accepts (integer amount, string ids, no stray fields). */
export function mapInvoiceCreateBody(input: BonumInvoiceCreateInput): Record<string, unknown> {
  const amount = Math.round(Number(input.amount))
  if (!Number.isFinite(amount)) {
    throw new Error('Bonum invoice amount must be a finite number')
  }

  const body: Record<string, unknown> = {
    amount,
    callback:      input.callback,
    transactionId: String(input.transactionId),
  }

  if (input.browserReturnUrl?.trim()) {
    body.returnUrl = input.browserReturnUrl.trim()
  }

  if (input.expiresIn !== undefined && input.expiresIn !== null) {
    const sec = Math.round(Number(input.expiresIn))
    if (Number.isFinite(sec) && sec > 0) body.expiresIn = sec
  }
  if (input.providers !== undefined && Array.isArray(input.providers) && input.providers.length > 0) {
    body.providers = input.providers
  }
  if (input.items !== undefined && Array.isArray(input.items) && input.items.length > 0) {
    body.items = input.items
  }
  if (input.extras !== undefined) body.extras = input.extras
  return body
}

/** Remove keys whose value is `undefined` before sending JSON (some APIs reject explicit null/undefined). */
export function omitUndefinedFields(body: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = { ...body }
  Object.keys(out).forEach((k) => {
    if (out[k] === undefined) delete out[k]
  })
  return out
}

export interface BonumInvoiceCreateResult {
  /** Bonum invoice id — primary external reference for hosted payment. */
  invoiceId: string
  followUpLink: string
  sessionExpiresAt: Date | null
  raw: Record<string, unknown>
}

export function mapInvoiceCreateResponse(json: unknown): BonumInvoiceCreateResult {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid Bonum invoice response: not an object')
  }
  const o = json as Record<string, unknown>
  const data = (typeof o.data === 'object' && o.data !== null ? o.data : o) as Record<string, unknown>

  const invoiceId = String(data.invoiceId ?? data.id ?? '')
  const followUpLink = String(data.followUpLink ?? data.follow_up_link ?? '')
  if (!invoiceId || !followUpLink) {
    throw new Error('Bonum invoice response missing invoiceId or followUpLink')
  }
  if (isBonumWebhookUrl(followUpLink)) {
    throw new Error(
      'Bonum returned the webhook URL as followUpLink; hosted checkout URL is required. Check invoice API fields (returnUrl vs callback).',
    )
  }

  const exp = data.expiresAt ?? data.expires_at ?? data.sessionExpiresAt
  let sessionExpiresAt: Date | null = null
  if (typeof exp === 'string' || exp instanceof Date) {
    const d = new Date(exp as string | Date)
    sessionExpiresAt = Number.isNaN(d.getTime()) ? null : d
  }

  return {
    invoiceId,
    followUpLink,
    sessionExpiresAt,
    raw: o as Record<string, unknown>,
  }
}

// ─── Webhook: type PAYMENT, status SUCCESS | FAILED ────────────────────────

export type BonumWebhookTopStatus = 'SUCCESS' | 'FAILED'
export type BonumPaymentBodyStatus = 'PAID' | string
export type BonumInvoiceTerminalStatus = 'EXPIRED' | 'CANCELLED' | 'FAILED' | string

export interface BonumWebhookParsed {
  /** Idempotency key for WebhookEvent.eventId */
  eventId: string
  type: string
  topStatus: BonumWebhookTopStatus | string
  transactionId: string | null
  invoiceId: string | null
  /** body.status for SUCCESS path (e.g. PAID) */
  bodyPaymentStatus: BonumPaymentBodyStatus | null
  /** body.invoiceStatus for FAILED path */
  invoiceStatus: BonumInvoiceTerminalStatus | null
  completedAt: string | null
  paymentVendor: string | null
  /** Normalized outcome for our state machine */
  outcome: 'payment_success' | 'payment_failed' | 'ignored'
}

export function mapWebhookPayload(json: unknown): BonumWebhookParsed {
  if (!json || typeof json !== 'object') {
    throw new Error('Invalid webhook payload')
  }
  const root = json as Record<string, unknown>
  const type = String(root.type ?? '')
  const topStatus = String(root.status ?? '')

  const body = (typeof root.body === 'object' && root.body !== null
    ? root.body
    : root) as Record<string, unknown>

  const transactionId =
    body.transactionId !== undefined && body.transactionId !== null
      ? String(body.transactionId)
      : null
  const invoiceId =
    body.invoiceId !== undefined && body.invoiceId !== null
      ? String(body.invoiceId)
      : null

  const bodyPaymentStatus = body.status !== undefined && body.status !== null
    ? String(body.status) as BonumPaymentBodyStatus
    : null
  const invoiceStatus = body.invoiceStatus !== undefined && body.invoiceStatus !== null
    ? String(body.invoiceStatus) as BonumInvoiceTerminalStatus
    : null

  const completedAt =
    typeof body.completedAt === 'string'
      ? body.completedAt
      : body.completedAt instanceof Date
        ? body.completedAt.toISOString()
        : null

  const paymentVendor =
    typeof body.paymentVendor === 'string'
      ? body.paymentVendor
      : null

  const eventId = [
    type,
    topStatus,
    transactionId ?? '',
    invoiceId ?? '',
    completedAt ?? String(root.timestamp ?? ''),
  ].join(':')

  let outcome: BonumWebhookParsed['outcome'] = 'ignored'
  if (type === 'PAYMENT' && topStatus === 'SUCCESS') {
    if (bodyPaymentStatus === 'PAID') outcome = 'payment_success'
  } else if (type === 'PAYMENT' && topStatus === 'FAILED') {
    outcome = 'payment_failed'
  }

  return {
    eventId,
    type,
    topStatus,
    transactionId,
    invoiceId,
    bodyPaymentStatus,
    invoiceStatus,
    completedAt,
    paymentVendor,
    outcome,
  }
}
