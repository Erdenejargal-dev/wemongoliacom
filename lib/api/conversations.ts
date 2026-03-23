/**
 * lib/api/conversations.ts
 * Frontend helpers for the conversations API.
 * Used by provider Messages page and traveler account messages.
 */

import { apiClient } from './client'

// ── Types (match backend responses) ─────────────────────────────────────────

export interface ConversationUser {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
}

export interface ConversationProvider {
  id: string
  name: string
  slug: string
  logoUrl: string | null
}

export interface Conversation {
  id: string
  travelerId: string
  providerId: string
  listingType?: 'tour' | 'vehicle' | 'accommodation'
  listingId?: string | null
  bookingId?: string | null
  lastMessageAt: string
  lastMessagePreview?: string | null
  travelerUnreadCount: number
  providerUnreadCount: number
  createdAt: string
  updatedAt: string
  traveler: ConversationUser
  provider: ConversationProvider
}

export interface MessageSender {
  id: string
  firstName: string
  lastName: string
  avatarUrl: string | null
}

export interface Message {
  id: string
  conversationId: string
  senderId: string
  senderRole: 'traveler' | 'provider'
  text: string
  attachments: string[]
  createdAt: string
  sender?: MessageSender
}

// ── API functions ──────────────────────────────────────────────────────────

export async function fetchConversations(token: string): Promise<Conversation[]> {
  try {
    const result = await apiClient.get<Conversation[]>('/conversations', token)
    return Array.isArray(result) ? result : []
  } catch {
    return []
  }
}

export async function fetchMessages(
  conversationId: string,
  token: string,
  cursor?: string,
): Promise<{ messages: Message[]; nextCursor: string | null }> {
  try {
    const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
    const result = await apiClient.get<{ messages: Message[]; nextCursor: string | null }>(
      `/conversations/${conversationId}/messages${query}`,
      token,
    )
    return {
      messages: result?.messages ?? [],
      nextCursor: result?.nextCursor ?? null,
    }
  } catch {
    return { messages: [], nextCursor: null }
  }
}

export async function sendConversationMessage(
  conversationId: string,
  text: string,
  token: string,
): Promise<Message | null> {
  try {
    return await apiClient.post<Message>(
      `/conversations/${conversationId}/messages`,
      { text },
      token,
    )
  } catch {
    return null
  }
}

export async function markConversationRead(
  conversationId: string,
  token: string,
): Promise<void> {
  try {
    await apiClient.post(`/conversations/${conversationId}/read`, {}, token)
  } catch {
    // non-fatal
  }
}
