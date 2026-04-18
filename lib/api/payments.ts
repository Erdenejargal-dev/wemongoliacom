/**
 * Bonum payment API helpers.
 */

import { apiClient } from './client'

export interface InitiatePaymentResponse {
  paymentId: string
  bookingId: string
  bookingCode: string
  status: string
  amount: number
  currency: string
  followUpUrl: string
  expiresAt: string
  qrCodeData: string | null
  deeplinkUrl: string | null
  holdExpiresAt: string
}

export interface PaymentStatusResponse {
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
