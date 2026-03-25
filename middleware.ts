import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

/**
 * Route guard: providers must not access traveler-only routes.
 *
 *   /dashboard (exact)  → traveler dashboard — redirect provider_owner to /dashboard/business
 *   /account/*          → traveler account   — redirect provider_owner to /dashboard/business
 *
 * Admin users retain access to everything.
 * Unauthenticated users pass through (pages handle their own auth).
 */
export default auth((req) => {
  const role = req.auth?.user?.role

  if (role === 'provider_owner') {
    const path = req.nextUrl.pathname
    if (path === '/dashboard' || path.startsWith('/account')) {
      return NextResponse.redirect(new URL('/dashboard/business', req.nextUrl))
    }
  }
})

export const config = {
  matcher: ["/dashboard", "/account/:path*"],
}
