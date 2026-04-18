/**
 * Bonum merchant API mapping (hosted invoice + PAYMENT webhooks).
 * Field names follow the Bonum ecommerce / invoice guide.
 */

// ─── Invoice creation (POST /bonum-gateway/ecommerce/invoices) ─────────────

export interface BonumInvoiceCreateInput {
  /** Amount as required by Bonum (see guide for currency/minor units). */
  amount: number
  /** Merchant webhook URL for Bonum callbacks. */
  callback: string
  /**
   * Correlation id — we use internal Payment.id so webhooks resolve to our Payment row.
   */
  transactionId: string
  expiresIn?: number
  providers?: string[]
  items?: unknown[]
  extras?: unknown
}

/** Request body for POST .../invoices */
export function mapInvoiceCreateBody(input: BonumInvoiceCreateInput): Record<string, unknown> {
  const body: Record<string, unknown> = {
    amount:         input.amount,
    callback:       input.callback,
    transactionId:  input.transactionId,
  }
  if (input.expiresIn !== undefined) body.expiresIn = input.expiresIn
  if (input.providers?.length) body.providers = input.providers
  if (input.items?.length) body.items = input.items
  if (input.extras !== undefined) body.extras = input.extras
  return body
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
