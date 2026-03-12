/**
 * lib/auth.ts
 * NextAuth configuration.
 *
 * Auth strategy:
 *   1. User submits email + password on the login page.
 *   2. NextAuth `authorize()` calls the Express backend POST /auth/login.
 *   3. On success the backend returns { user, accessToken }.
 *   4. The accessToken is stored in the NextAuth JWT (server-only) and
 *      then forwarded to session.user.accessToken for client use.
 *   5. All subsequent API calls use session.user.accessToken as Bearer token.
 *
 * Fallback: if the backend is unreachable we surface a clear error so
 * the user knows the API server is down (rather than silently failing).
 */

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.API_URL ?? "http://localhost:4000/api/v1";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email:    { label: "Email",    type: "email"    },
        password: { label: "Password", type: "password" },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required.");
        }

        let res: Response;
        try {
          res = await fetch(`${API_URL}/auth/login`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({
              email:    credentials.email,
              password: credentials.password,
            }),
          });
        } catch {
          // Network error — backend not reachable
          throw new Error(
            "Cannot connect to the server. Please ensure the API is running."
          );
        }

        let json: { success: boolean; data?: { user: any; accessToken: string }; error?: string };
        try {
          json = await res.json();
        } catch {
          throw new Error("Invalid response from server.");
        }

        if (!res.ok || !json.success) {
          throw new Error(json.error ?? "Invalid email or password.");
        }

        const { user, accessToken } = json.data!;

        return {
          id:          user.id,
          email:       user.email,
          name:        [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
          role:        user.role,
          avatar:      user.avatarUrl ?? null,
          accessToken,  // forwarded to JWT callback below
        };
      },
    }),
  ],

  callbacks: {
    // Store the backend accessToken in the server-side JWT
    async jwt({ token, user }: any) {
      if (user) {
        token.id          = user.id;
        token.role        = user.role;
        token.avatar      = user.avatar;
        token.accessToken = user.accessToken;
      }
      return token;
    },

    // Expose necessary fields to the client-side session
    async session({ session, token }: any) {
      if (session.user) {
        session.user.id          = token.id   as string;
        session.user.role        = token.role as string;
        session.user.avatar      = token.avatar as string | undefined;
        session.user.accessToken = token.accessToken as string | undefined;
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
