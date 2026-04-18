/**
 * Bonum ecommerce client — hosted invoice flow (v1 primary).
 * Endpoints from Bonum merchant guide (paths relative to BONUM_API_BASE_URL).
 */

import { env } from '../../config/env'
import { getBonumAccessToken } from './bonum.auth'
import {
  mapInvoiceCreateBody,
  mapInvoiceCreateResponse,
  omitUndefinedFields,
  parseBonumInvoiceProvidersFromEnv,
  resolveBonumWebhookCallbackUrl,
  type BonumInvoiceCreateInput,
  type BonumInvoiceCreateResult,
} from './bonum.mapper'

const PATH_INVOICES = '/bonum-gateway/ecommerce/invoices'
const PATH_PAYMENT_PROVIDERS = '/bonum-gateway/ecommerce/invoices/payment-providers'

function useStub(): boolean {
  return env.BONUM_USE_STUB === 'true' || (!env.BONUM_API_BASE_URL?.trim() && env.NODE_ENV !== 'production')
}

function baseUrl(): string {
  const u = env.BONUM_API_BASE_URL?.trim()
  if (!u) throw new Error('BONUM_API_BASE_URL is not configured')
  return u.replace(/\/$/, '')
}

/**
 * Create hosted invoice — POST /bonum-gateway/ecommerce/invoices
 * Uses Bearer access token from auth cache.
 */
export async function createBonumInvoice(
  input: BonumInvoiceCreateInput,
): Promise<BonumInvoiceCreateResult> {
  if (useStub()) {
    const returnPid = input.internalPaymentId ?? input.transactionId
    return {
      invoiceId:        `stub-inv-${input.transactionId}-${Date.now()}`,
      followUpLink:       `${env.PUBLIC_APP_URL.replace(/\/$/, '')}/checkout/payment-return?paymentId=${encodeURIComponent(returnPid)}&stub=1`,
      sessionExpiresAt:  new Date(Date.now() + 30 * 60 * 1000),
      raw:               { stub: true },
    }
  }

  const accessToken = await getBonumAccessToken()
  const url = `${baseUrl()}${PATH_INVOICES}`

  const callback = resolveBonumWebhookCallbackUrl()
  const providersResolved = parseBonumInvoiceProvidersFromEnv() ?? input.providers
  const expiresInEffective =
    input.expiresIn ??
    (env.BONUM_INVOICE_EXPIRES_IN_SECONDS > 0 ? env.BONUM_INVOICE_EXPIRES_IN_SECONDS : 900)

  const body = omitUndefinedFields(
    mapInvoiceCreateBody({
      ...input,
      callback,
      expiresIn: expiresInEffective,
      providers: providersResolved,
    }),
  )

  console.log('BONUM REQUEST BODY:', JSON.stringify(body, null, 2))

  const res = await fetch(url, {
    method:  'POST',
    headers: {
      'Content-Type':  'application/json',
      Authorization:   `Bearer ${accessToken}`,
      'X-TERMINAL-ID': env.BONUM_TERMINAL_ID,
      Accept:          'application/json',
    },
    body: JSON.stringify(body),
  })

  const text = await res.text()
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    console.error('BONUM ERROR RESPONSE (non-JSON):', text)
    console.error('BONUM REQUEST BODY (same attempt):', JSON.stringify(body, null, 2))
    throw new Error(`Bonum invoices returned non-JSON: HTTP ${res.status}`)
  }

  if (!res.ok) {
    console.error('BONUM ERROR RESPONSE:', json)
    console.error('BONUM REQUEST BODY (same attempt):', JSON.stringify(body, null, 2))
    const msg = typeof json === 'object' && json !== null && 'message' in json
      ? String((json as { message?: string }).message)
      : text
    throw new Error(`Bonum invoice create failed: HTTP ${res.status} ${msg}`)
  }

  return mapInvoiceCreateResponse(json)
}

/**
 * Optional: list payment providers (QPAY, E_COMMERCE, etc.).
 * GET /bonum-gateway/ecommerce/invoices/payment-providers
 */
export async function listBonumPaymentProviders(): Promise<unknown> {
  if (useStub()) {
    return { providers: ['QPAY', 'E_COMMERCE', 'WE_CHAT', 'SONO_SHOP'] }
  }

  const accessToken = await getBonumAccessToken()
  const url = `${baseUrl()}${PATH_PAYMENT_PROVIDERS}`
  const res = await fetch(url, {
    method:  'GET',
    headers: {
      Authorization:   `Bearer ${accessToken}`,
      'X-TERMINAL-ID': env.BONUM_TERMINAL_ID,
      Accept:          'application/json',
    },
  })

  const text = await res.text()
  try {
    return JSON.parse(text)
  } catch {
    return text
  }
}

/**
 * Refund / reversal against Bonum — path not specified in the integration brief.
 * When BONUM_REFUND_RELATIVE_PATH is unset, returns ok:false so callers can escalate manually.
 */
export async function refundBonumPayment(params: {
  transactionId: string
  amount: number
  currency: string
  reason?: string
}): Promise<{ ok: boolean; raw?: unknown }> {
  if (useStub()) {
    return { ok: true, raw: { stub: true } }
  }

  const rel = env.BONUM_REFUND_RELATIVE_PATH?.trim()
  if (!rel) {
    return {
      ok: false,
      raw: 'Bonum refund: set BONUM_REFUND_RELATIVE_PATH when Bonum documents the refund endpoint.',
    }
  }

  try {
    const accessToken = await getBonumAccessToken()
    const path = rel.startsWith('/') ? rel : `/${rel}`
    const url = `${baseUrl()}${path}`
    const res = await fetch(url, {
      method:  'POST',
      headers: {
        'Content-Type':  'application/json',
        Authorization:   `Bearer ${accessToken}`,
        'X-TERMINAL-ID': env.BONUM_TERMINAL_ID,
      },
      body: JSON.stringify({
        transactionId: params.transactionId,
        amount:        params.amount,
        currency:      params.currency,
        reason:        params.reason,
      }),
    })

    const text = await res.text()
    let json: unknown
    try {
      json = JSON.parse(text)
    } catch {
      return { ok: res.ok, raw: text }
    }
    return { ok: res.ok, raw: json }
  } catch (e) {
    return { ok: false, raw: e instanceof Error ? e.message : String(e) }
  }
}
