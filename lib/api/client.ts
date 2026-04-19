/**
 * lib/api/client.ts
 * Base HTTP client for the WeMongolia Express backend.
 * All requests go to NEXT_PUBLIC_API_URL (client) or API_URL (server).
 */

import { CURRENCY_COOKIE } from '@/lib/preferences-storage'

const BASE =
  typeof window === 'undefined'
    ? (process.env.API_URL ?? 'http://localhost:4000/api/v1')
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1')

/**
 * Server-side reader for the display-currency cookie. We dynamic-import
 * `next/headers` so the same module keeps working in pages/routes that
 * don't (yet) run on the server, and so bundlers don't try to resolve it
 * in the browser build.
 */
async function readDisplayCurrencyOnServer(): Promise<'MNT' | 'USD' | null> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { cookies } = await import('next/headers') as any
    const jar = typeof cookies === 'function' ? cookies() : null
    // Next 15 returns a Promise; Next 14 is sync — handle both.
    const resolved = jar && typeof jar.then === 'function' ? await jar : jar
    const v = resolved?.get?.(CURRENCY_COOKIE)?.value as string | undefined
    if (v === 'MNT' || v === 'USD') return v
  } catch {
    // Not inside a server component / route handler — ignore silently.
  }
  return null
}

function readDisplayCurrencyOnClient(): 'MNT' | 'USD' | null {
  if (typeof document === 'undefined') return null
  const fromCookie = document.cookie.match(new RegExp(`(?:^|; )${CURRENCY_COOKIE}=([^;]*)`))
  if (fromCookie) {
    const v = decodeURIComponent(fromCookie[1])
    if (v === 'MNT' || v === 'USD') return v
  }
  try {
    const raw = window.localStorage.getItem('wm.displayCurrency')
    if (raw === 'MNT' || raw === 'USD') return raw
  } catch { /* ignore */ }
  return null
}

// ── Error type ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'ApiError'
  }
}

// ── Core fetcher ────────────────────────────────────────────────────────────

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
  retryCount = 0,
): Promise<T> {
  // Phase 3 / 6.1 — always attach the user's display-currency preference
  // so server-rendered pages and client-side fetches agree. Resolution:
  //   - on the client: cookie (new) → localStorage (Phase 3 fallback)
  //   - on the server: cookie via next/headers
  let displayCurrencyHeader: Record<string, string> = {}
  if (typeof window === 'undefined') {
    const server = await readDisplayCurrencyOnServer()
    if (server) displayCurrencyHeader = { 'X-Display-Currency': server }
  } else {
    const client = readDisplayCurrencyOnClient()
    if (client) displayCurrencyHeader = { 'X-Display-Currency': client }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...displayCurrencyHeader,
    ...(options.headers as Record<string, string> | undefined ?? {}),
  }

  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers,
    // Next.js cache options can be passed via options.next
  })

  let json: { success: boolean; data?: T; error?: string }
  try {
    json = await res.json()
  } catch {
    throw new ApiError(res.status, `HTTP ${res.status}`)
  }

  if (!res.ok) {
    // If the token expired, attempt to fetch a fresh session token once.
    // This relies on NextAuth's JWT refresh logic.
    if (res.status === 401 && token && retryCount < 1 && typeof window !== 'undefined') {
      try {
        // Fetch the latest session from NextAuth. This triggers the JWT callback
        // (including our refreshToken logic) and returns a fresh accessToken.
        const latestRes = await fetch('/api/auth/session', { credentials: 'include' })
        const latest = await latestRes.json().catch(() => null)
        const latestToken = (latest as any)?.user?.accessToken as string | undefined
        if (latestToken && latestToken !== token) {
          return request<T>(path, options, latestToken, retryCount + 1)
        }
      } catch {
        // ignore and throw below
      }
    }

    throw new ApiError(res.status, json.error ?? `HTTP ${res.status}`)
  }

  return json.data as T
}

// ── Typed helpers ────────────────────────────────────────────────────────────

export const apiClient = {
  get<T>(path: string, token?: string | null, init?: RequestInit) {
    return request<T>(path, { method: 'GET', ...init }, token)
  },
  post<T>(path: string, body: unknown, token?: string | null) {
    return request<T>(path, { method: 'POST', body: JSON.stringify(body) }, token)
  },
  put<T>(path: string, body: unknown, token?: string | null) {
    return request<T>(path, { method: 'PUT', body: JSON.stringify(body) }, token)
  },
  patch<T>(path: string, body?: unknown, token?: string | null) {
    return request<T>(
      path,
      { method: 'PATCH', body: body !== undefined ? JSON.stringify(body) : undefined },
      token,
    )
  },
  delete<T>(path: string, token?: string | null) {
    return request<T>(path, { method: 'DELETE' }, token)
  },
}

// ── Pagination helper type ───────────────────────────────────────────────────

export interface Paginated<T> {
  data: T[]
  pagination: { page: number; limit: number; total: number; pages: number }
}
