/**
 * Bonum payment API helpers.
 */

import { apiClient } from './client'

export type CheckoutMode = 'qr' | 'hosted_invoice'

export interface BonumDeeplink {
  url: string
  label?: string
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
