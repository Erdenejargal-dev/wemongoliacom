import { auth } from "@/lib/auth"
import { NextResponse } from "next/server"

/**
 * Edge proxy (formerly middleware): route guard so providers cannot use traveler-only routes.
 *
 *   /dashboard (exact)  → redirect provider_owner to /dashboard/business
 *   /account/*          → redirect provider_owner to /dashboard/business
 *
 * Admin: full access. Unauthenticated: pass through.
 */
export default auth(function proxy(req) {
  const role = req.auth?.user?.role

  if (role === "provider_owner") {
    const path = req.nextUrl.pathname
    if (path === "/dashboard" || path.startsWith("/account")) {
      return NextResponse.redirect(new URL("/dashboard/business", req.nextUrl))
    }
  }
})

export const config = {
  matcher: ["/dashboard", "/account/:path*"],
}
