import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    id: string;
    role: string;
    avatar?: string;
    /** JWT issued by the Express backend — stored in NextAuth session */
    accessToken?: string;
  }

  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      role: string;
      avatar?: string;
      /** Backend JWT — use this as Bearer token for API calls */
      accessToken?: string;
    };
    /** Set when token refresh failed; UI should sign out / redirect */
    error?: 'TokenRefreshFailed';
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: string;
    avatar?: string;
    accessToken?: string;
    refreshToken?: string;
    accessTokenExpiresAt?: number;
    error?: 'TokenRefreshFailed';
  }
}
