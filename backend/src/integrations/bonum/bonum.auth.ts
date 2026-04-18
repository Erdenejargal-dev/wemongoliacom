/**
 * Bonum ecommerce auth: token create + refresh with caching.
 * Guide: GET /bonum-gateway/ecommerce/auth/create — Authorization: AppSecret {APP_SECRET}, X-TERMINAL-ID
 *        GET /bonum-gateway/ecommerce/auth/refresh — Authorization: Bearer {refreshToken}
 * Avoid creating new tokens more often than ~25 minutes (rate-limit guidance).
 */

import { env } from '../../config/env'

const PATH_AUTH_CREATE = '/bonum-gateway/ecommerce/auth/create'
const PATH_AUTH_REFRESH = '/bonum-gateway/ecommerce/auth/refresh'

/** Minimum interval between auth/create calls (not refresh). */
const MIN_CREATE_INTERVAL_MS = env.BONUM_TOKEN_MIN_CREATE_INTERVAL_MS

type TokenCache = {
  accessToken:  string
  refreshToken: string
  /** Wall-clock time when access token should be considered expired. */
  accessExpiresAtMs: number
}

let cache: TokenCache | null = null
let lastAuthCreateAtMs = 0

function baseUrl(): string {
  const u = env.BONUM_API_BASE_URL?.trim()
  if (!u) throw new Error('BONUM_API_BASE_URL is not configured')
  return u.replace(/\/$/, '')
}

function parseAuthResponse(json: unknown): TokenCache {
  if (!json || typeof json !== 'object') throw new Error('Invalid Bonum auth response')
  const o = json as Record<string, unknown>
  const nested = (typeof o.data === 'object' && o.data !== null ? o.data : o) as Record<string, unknown>

  const accessToken = String(nested.accessToken ?? nested.access_token ?? '')
  const refreshToken = String(nested.refreshToken ?? nested.refresh_token ?? '')
  if (!accessToken || !refreshToken) {
    throw new Error('Bonum auth response missing accessToken or refreshToken')
  }

  const expiresInSec =
    typeof nested.expiresIn === 'number'
      ? nested.expiresIn
      : typeof nested.expires_in === 'number'
        ? nested.expires_in
        : typeof nested.accessTokenExpiresIn === 'number'
          ? nested.accessTokenExpiresIn
          : 3600

  const bufferMs = 90_000
  const accessExpiresAtMs = Date.now() + expiresInSec * 1000 - bufferMs

  return { accessToken, refreshToken, accessExpiresAtMs }
}

async function fetchAuthCreate(): Promise<TokenCache> {
  const now = Date.now()
  if (lastAuthCreateAtMs > 0 && now - lastAuthCreateAtMs < MIN_CREATE_INTERVAL_MS) {
    throw new Error(
      'Bonum auth/create rate limited (~25 min between creates per guide). Use refresh or wait.',
    )
  }

  const url = `${baseUrl()}${PATH_AUTH_CREATE}`
  const res = await fetch(url, {
    method:  'GET',
    headers: {
      Authorization:  `AppSecret ${env.BONUM_APP_SECRET}`,
      'X-TERMINAL-ID': env.BONUM_TERMINAL_ID,
      Accept:           'application/json',
    },
  })

  const text = await res.text()
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`Bonum auth/create returned non-JSON: HTTP ${res.status}`)
  }
  if (!res.ok) {
    throw new Error(`Bonum auth/create failed: HTTP ${res.status} ${text}`)
  }

  const parsed = parseAuthResponse(json)
  lastAuthCreateAtMs = Date.now()
  return parsed
}

async function fetchAuthRefresh(refreshToken: string): Promise<TokenCache> {
  const url = `${baseUrl()}${PATH_AUTH_REFRESH}`
  const res = await fetch(url, {
    method:  'GET',
    headers: {
      Authorization: `Bearer ${refreshToken}`,
      Accept:          'application/json',
    },
  })

  const text = await res.text()
  let json: unknown
  try {
    json = JSON.parse(text)
  } catch {
    throw new Error(`Bonum auth/refresh returned non-JSON: HTTP ${res.status}`)
  }
  if (!res.ok) {
    throw new Error(`Bonum auth/refresh failed: HTTP ${res.status} ${text}`)
  }

  return parseAuthResponse(json)
}

/**
 * Returns a valid access token, reusing cache and preferring refresh over create.
 */
export async function getBonumAccessToken(): Promise<string> {
  const now = Date.now()

  if (cache && cache.accessExpiresAtMs > now) {
    return cache.accessToken
  }

  if (cache?.refreshToken) {
    try {
      cache = await fetchAuthRefresh(cache.refreshToken)
      return cache.accessToken
    } catch (e) {
      console.warn('[bonum auth] refresh failed, falling back to create if allowed:', e)
    }
  }

  if (lastAuthCreateAtMs > 0 && now - lastAuthCreateAtMs < MIN_CREATE_INTERVAL_MS) {
    throw new Error('Bonum auth: access expired, refresh failed, and create is rate-limited — retry later.')
  }

  cache = await fetchAuthCreate()
  return cache.accessToken
}

/** For tests: clear cache */
export function __resetBonumAuthCacheForTests(): void {
  cache = null
  lastAuthCreateAtMs = 0
}
