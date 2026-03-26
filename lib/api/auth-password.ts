import { apiClient } from './client'

export async function requestForgotPassword(email: string): Promise<void> {
  await apiClient.post<{ ok: boolean }>('/auth/forgot-password', { email }, null)
}

export async function confirmPasswordReset(token: string, password: string): Promise<void> {
  await apiClient.post<{ ok: boolean }>('/auth/reset-password', { token, password }, null)
}
