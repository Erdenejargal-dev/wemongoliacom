"use client";

import { SessionProvider as NextAuthSessionProvider } from "next-auth/react";
import { SessionExpiredGuard } from "@/components/auth/SessionExpiredGuard";

/**
 * refetchInterval: 5 min — Keeps access token fresh before 15m expiry.
 * Without this, long-lived tabs can hold a stale token and get 401 on submit.
 */
const REFETCH_INTERVAL = 5 * 60; // 5 minutes

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextAuthSessionProvider refetchInterval={REFETCH_INTERVAL}>
      <SessionExpiredGuard />
      {children}
    </NextAuthSessionProvider>
  );
}
