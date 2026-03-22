/**
 * lib/auth-utils.ts
 * Client-side auth helpers for obtaining a fresh access token.
 * Use before authenticated mutations to avoid stale-token 401s.
 */

import { getSession } from 'next-auth/react'

/**
 * Fetches the current session from NextAuth.
 * Triggers the JWT callback (including token refresh when needed).
 * Returns the access token or null if unauthenticated or refresh failed.
 *
 * Call this right before making an authenticated API request instead of
 * using the token from useSession(), which can be stale after long idle.
 */
export async function getFreshAccessToken(): Promise<string | null> {
  const session = await getSession()
  return session?.user?.accessToken ?? null
}
