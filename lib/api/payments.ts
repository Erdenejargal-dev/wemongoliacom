/**
 * Bonum payment API helpers.
 */

import { apiClient } from './client'

export type CheckoutMode = 'qr' | 'hosted_invoice'

/**
 * Bonum `links[]` entry (QR initiate). Field names vary; backend may map to `url` + `label` only,
 * or pass through richer objects from Bonum (`link`, `name`, `logo`, etc.).
 */
export interface BonumDeeplink {
  /** Primary app deeplink (Bonum often uses `link` instead) */
  url?: string
  link?: string
  /** Short label / bank name fallback */
  label?: string
  name?: string
  description?: string
  logo?: string | null
  appStoreId?: string
  androidPackageName?: string
}

/** Resolve app URL whether API sent `url` (our default) or Bonum-style `link`. */
export function getBonumDeeplinkHref(d: BonumDeeplink): string {
  const o = d as Record<string, unknown>
  const raw = d.url ?? d.link ?? o.link
  return typeof raw === 'string' ? raw.trim() : ''
}

/** Display title: `name`, then `label`, then fallback. */
export function getBonumBankDisplayName(d: BonumDeeplink): string {
  const o = d as Record<string, unknown>
  const n = d.name ?? d.label ?? o.name ?? o.bankName
  if (typeof n === 'string' && n.trim()) return n.trim()
  return 'Bank app'
}

export function getBonumBankDescription(d: BonumDeeplink): string | null {
  const o = d as Record<string, unknown>
  const v = d.description ?? o.description
  if (typeof v === 'string' && v.trim()) return v.trim()
  return null
}

/** Logo URL when present on the payload (Bonum CDN). */
export function getBonumBankLogo(d: BonumDeeplink): string | null {
  const o = d as Record<string, unknown>
  const v = d.logo ?? o.logo
  if (typeof v === 'string' && v.trim()) return v.trim()
  return null
}

export function getBonumAppStoreId(d: BonumDeeplink): string | undefined {
  const o = d as Record<string, unknown>
  const v = d.appStoreId ?? o.appStoreId
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

export function getBonumAndroidPackage(d: BonumDeeplink): string | undefined {
  const o = d as Record<string, unknown>
  const v = d.androidPackageName ?? o.androidPackageName
  return typeof v === 'string' && v.trim() ? v.trim() : undefined
}

export interface InitiatePaymentResponse {
  paymentId: string
  bookingId: string
  bookingCode: string
  status: string
  amount: number
  currency: string
  expiresAt: string
  holdExpiresAt: string
  checkoutMode: CheckoutMode
  invoiceId: string | null
  qrCode: string | null
  qrImage: string | null
  deeplinks: BonumDeeplink[]
  /** Hosted Bonum checkout — only when `checkoutMode === 'hosted_invoice'` or QR fallback. */
  followUpUrl: string | null
  /** @deprecated use qrCode */
  qrCodeData: string | null
  /** @deprecated use deeplinks[0] */
  deeplinkUrl: string | null
}

export interface PaymentStatusResponse {
  bookingId: string
  bookingCode: string
  bookingStatus: string
  paymentStatus: string
  holdExpiresAt: string | null
  maxHoldUntil: string | null
  payment: {
    id: string
    status: string
    paidAt: string | null
    amount: number
    currency: string
    followUpUrl: string | null
  }
}

export async function initiatePayment(bookingId: string, token: string): Promise<InitiatePaymentResponse> {
  return apiClient.post<InitiatePaymentResponse>(`/payments/initiate/${bookingId}`, {}, token)
}

export async function getPaymentStatus(paymentId: string, token: string): Promise<PaymentStatusResponse> {
  return apiClient.get<PaymentStatusResponse>(`/payments/${paymentId}/status`, token)
}

export async function retryPayment(paymentId: string, token: string): Promise<InitiatePaymentResponse> {
  return apiClient.post<InitiatePaymentResponse>(`/payments/${paymentId}/retry`, {}, token)
}
