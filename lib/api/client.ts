/**
 * lib/api/client.ts
 * Base HTTP client for the WeMongolia Express backend.
 * All requests go to NEXT_PUBLIC_API_URL (client) or API_URL (server).
 */

const BASE =
  typeof window === 'undefined'
    ? (process.env.API_URL ?? 'http://localhost:4000/api/v1')
    : (process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000/api/v1')

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
  // Phase 3 — always attach the user's display-currency preference, if one
  // is persisted in localStorage. This is the single place the header is
  // added, so individual endpoints don't need to know about display currency
  // at all. Explicit `X-Display-Currency` passed in `options.headers` wins.
  let displayCurrencyHeader: Record<string, string> = {}
  if (typeof window !== 'undefined') {
    try {
      const raw = window.localStorage.getItem('wm.displayCurrency')
      if (raw === 'MNT' || raw === 'USD') {
        displayCurrencyHeader = { 'X-Display-Currency': raw }
      }
    } catch {
      // localStorage can throw in private mode / SSR — ignore quietly.
    }
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
