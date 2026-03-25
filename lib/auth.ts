/**
 * lib/auth.ts
 * NextAuth configuration.
 *
 * Auth strategy:
 *   Call the Express backend POST /auth/login.
 *   On success the backend returns { user, accessToken }.
 *   The accessToken is stored in the NextAuth JWT and forwarded to
 *   session.user.accessToken for Bearer-authenticated API calls.
 */

import NextAuth from "next-auth";
import type { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.API_URL ?? "http://localhost:4000/api/v1";

type BackendLoginUser = {
  id: string
  email: string
  firstName?: string
  lastName?: string
  role: string
  avatarUrl?: string | null
}

function decodeJwt(token: string): { exp?: number; userId?: string; role?: string } {
  try {
    const parts = token.split('.')
    if (parts.length < 2) return {}
    const payloadB64 = parts[1].replace(/-/g, '+').replace(/_/g, '/')
    const json =
      typeof Buffer !== 'undefined'
        ? Buffer.from(payloadB64, 'base64').toString('utf8')
        : atob(payloadB64)
    return JSON.parse(json)
  } catch {
    return {}
  }
}

// ── Main authorize ─────────────────────────────────────────────────────────

export const authOptions: NextAuthConfig = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials, _req) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        const email    = credentials.email    as string;
        const password = credentials.password as string;

        const res = await fetch(`${API_URL}/auth/login`, {
          method:  "POST",
          headers: { "Content-Type": "application/json" },
          body:    JSON.stringify({ email, password }),
        });

        let json: {
          success: boolean;
          data?: { user: BackendLoginUser; accessToken: string; refreshToken: string };
          error?: string;
        };

        try {
          json = await res.json();
        } catch {
          throw new Error("Invalid response from server.");
        }

        if (!res.ok || !json.success) {
          throw new Error(json.error ?? "Invalid email or password.");
        }

        const { user, accessToken, refreshToken } = json.data!;
        return {
          id:          user.id,
          email:       user.email,
          name:        [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
          role:        user.role ?? "traveler",
          avatar:      user.avatarUrl ?? undefined,
          accessToken,
          refreshToken,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      if (user) {
        const u = user as any
        token.id          = u.id
        token.role        = u.role
        token.avatar      = u.avatar
        token.accessToken = u.accessToken
        token.refreshToken = u.refreshToken

        const decoded = decodeJwt(String(u.accessToken))
        if (decoded.exp) {
          token.accessTokenExpiresAt = decoded.exp * 1000
        } else {
          token.accessTokenExpiresAt = Date.now() + 10 * 60 * 1000 // safe fallback
        }
      }

      // Refresh the access token when:
      // 1. useSession().update() is called (e.g. after onboarding promotes role)
      // 2. The token is near expiry
      const expiresAt = token.accessTokenExpiresAt as number | undefined
      const now = Date.now()
      const needsRefresh = trigger === 'update' || (expiresAt && now >= expiresAt - 10_000)
      if (needsRefresh && token.accessToken && token.refreshToken) {
        try {
          const refreshRes = await fetch(`${API_URL}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken: token.refreshToken }),
          })

          const payload = await refreshRes.json().catch(() => null)
          const data = payload?.data as { accessToken?: string; refreshToken?: string } | undefined

          if (!refreshRes.ok || !payload?.success || !data?.accessToken) {
            throw new Error(payload?.error ?? 'Failed to refresh access token.')
          }

          token.accessToken = data.accessToken
          if (data.refreshToken) token.refreshToken = data.refreshToken

          const decoded = decodeJwt(token.accessToken as string)
          if (decoded.role) token.role = decoded.role
          if (decoded.exp) token.accessTokenExpiresAt = decoded.exp * 1000
        } catch (e) {
          // If refresh fails, clear tokens so the UI can sign out/redirect cleanly.
          token.accessToken = undefined
          token.refreshToken = undefined
          token.accessTokenExpiresAt = undefined
          token.error = 'TokenRefreshFailed'
        }
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id          = token.id as string
        session.user.role        = token.role as string
        session.user.avatar      = token.avatar as string | undefined
        session.user.accessToken = token.accessToken as string | undefined
        // Expose refresh failure so UI can sign out / redirect
        if (token.error === 'TokenRefreshFailed') {
          (session as any).error = 'TokenRefreshFailed'
        }
      }
      return session;
    },
  },

  pages: {
    signIn:  "/auth/login",
    signOut: "/auth/login",
    error:   "/auth/error",
  },

  session: {
    strategy: "jwt" as const,
    maxAge:   30 * 24 * 60 * 60, // 30 days
  },

  secret: process.env.NEXTAUTH_SECRET,
};

export const { handlers, signIn, signOut, auth } = NextAuth(authOptions);
