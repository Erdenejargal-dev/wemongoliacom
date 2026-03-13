/**
 * lib/auth.ts
 * NextAuth configuration.
 *
 * Auth strategy:
 *   PRIMARY  — Call the Express backend POST /auth/login.
 *              On success the backend returns { user, accessToken }.
 *              The accessToken is stored in the NextAuth JWT and forwarded
 *              to session.user.accessToken for Bearer-authenticated API calls.
 *
 *   FALLBACK — If the backend is unreachable (network error / not started),
 *              authenticate directly against MongoDB using bcryptjs.
 *              The session works normally; session.user.accessToken will be
 *              undefined, so backend-protected API calls won't be available,
 *              but the UI renders correctly.
 */

import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

const API_URL = process.env.API_URL ?? "http://localhost:4000/api/v1";

// ── MongoDB fallback (used when Express backend is not running) ─────────────
//
// DATABASE ARCHITECTURE (from actual source files):
//
//  FRONTEND  → MongoDB Atlas (mongodb+srv://.../wemongolia)
//              ORM: Mongoose  |  lib/mongodb.ts + lib/models/User.ts
//              User fields:   name, email, password, role (customer|business_owner|admin)
//              Used by:       old Next.js API routes (app/api/auth/register, etc.)
//
//  BACKEND   → PostgreSQL  (DATABASE_URL=postgresql://...)
//              ORM: Prisma  |  backend/prisma/schema.prisma  provider="postgresql"
//              User fields:   firstName, lastName, email, passwordHash, role (traveler|provider_owner|admin)
//              Used by:       Express API (backend/src/)
//
//  These are TWO separate databases / user pools.
//  This fallback lets MongoDB users (registered via old Next.js routes) still
//  authenticate when the Express/PostgreSQL backend is not running.
//
async function mongoFallback(email: string, password: string) {
  // Dynamic imports keep the bundle clean when the backend IS running
  const { default: dbConnect } = await import("@/lib/mongodb");
  const { default: User }      = await import("@/lib/models/User");
  const bcrypt                 = await import("bcryptjs");

  await dbConnect();

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
  if (!user) throw new Error("Invalid email or password.");

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error("Invalid email or password.");

  return {
    id:          (user._id as any).toString(),
    email:       user.email,
    name:        user.name,
    role:        user.role,       // 'customer' | 'business_owner' | 'admin'
    avatar:      user.avatar ?? undefined,
    accessToken: undefined,       // no JWT without the backend
  };
}

// ── Main authorize ─────────────────────────────────────────────────────────

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

        const email    = credentials.email    as string;
        const password = credentials.password as string;

        // ── 1. Try Express backend ────────────────────────────────────────
        let backendUnreachable = false;
        try {
          const res = await fetch(`${API_URL}/auth/login`, {
            method:  "POST",
            headers: { "Content-Type": "application/json" },
            body:    JSON.stringify({ email, password }),
          });

          let json: {
            success: boolean;
            data?: { user: any; accessToken: string };
            error?: string;
          };

          try {
            json = await res.json();
          } catch {
            throw new Error("Invalid response from server.");
          }

          if (!res.ok || !json.success) {
            // Backend is up but returned an auth error (wrong password etc.)
            throw new Error(json.error ?? "Invalid email or password.");
          }

          const { user, accessToken } = json.data!;
          return {
            id:          user.id,
            email:       user.email,
            name:        [user.firstName, user.lastName].filter(Boolean).join(" ") || user.email,
            role:        user.role,
            avatar:      user.avatarUrl ?? undefined,
            accessToken,
          };

        } catch (err: any) {
          // Network-level error → backend not running → try MongoDB
          if (
            err instanceof TypeError ||           // fetch() network failure
            err?.cause?.code === "ECONNREFUSED" ||
            err?.message?.includes("fetch failed") ||
            err?.message?.includes("ECONNREFUSED")
          ) {
            console.warn("[auth] Express backend unreachable — falling back to MongoDB.");
            backendUnreachable = true;
          } else {
            // Real auth error from the backend (wrong credentials, etc.)
            throw err;
          }
        }

        // ── 2. MongoDB fallback ──────────────────────────────────────────
        if (backendUnreachable) {
          return await mongoFallback(email, password);
        }

        return null;
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }: any) {
      if (user) {
        token.id          = user.id;
        token.role        = user.role;
        token.avatar      = user.avatar;
        token.accessToken = user.accessToken;  // may be undefined (MongoDB mode)
      }
      return token;
    },

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
