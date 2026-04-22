import { apiClient } from './client'

export interface BackendAccountProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone?: string | null
  avatarUrl?: string | null
  country?: string | null
  bio?: string | null
  role: string
  createdAt: string
  /** Present when the backend returns them (Phase 6 account prefs). */
  preferredLanguage?: 'mn' | 'en' | null
  preferredCurrency?: 'MNT' | 'USD' | null
}

export async function fetchMyProfile(token: string): Promise<BackendAccountProfile> {
  return apiClient.get<BackendAccountProfile>('/account', token)
}

export interface UpdateMyProfilePayload {
  firstName?: string
  lastName?: string
  phone?: string | null
  country?: string | null
  bio?: string | null
  avatarUrl?: string | null
  preferredLanguage?: 'mn' | 'en'
  preferredCurrency?: 'MNT' | 'USD'
}

export async function updateMyProfile(token: string, payload: UpdateMyProfilePayload): Promise<BackendAccountProfile> {
  return apiClient.put<BackendAccountProfile>('/account', payload, token)
}

export interface ChangePasswordPayload {
  currentPassword: string
  newPassword: string
}

export async function changePassword(token: string, payload: ChangePasswordPayload): Promise<void> {
  await apiClient.post<void>('/account/change-password', payload, token)
}

