import { getToken } from "next-auth/jwt"
import type { NextAuthRequest } from "next-auth"
import { auth } from "@/lib/auth"
import { CURRENCY_COOKIE, LANGUAGE_COOKIE } from "@/lib/preferences-storage"
import { readCfIpCountryFromHeaders, resolveLocaleCurrency } from "@/lib/locale-currency-resolver"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

const ONE_YEAR_S = 60 * 60 * 24 * 365

/**
 * Edge proxy: locale/currency cookies + provider route guard.
 *
 * 1) Seeds `wm_lang` + `wm_currency` when the pair is missing or invalid
 *    (same resolver as RSC; Cloudflare and/or Vercel geo headers when present).
 * 2) Redirects `provider_owner` away from traveler-only /dashboard and /account
 *    to /dashboard/business. Admin: full access. Unauthenticated: pass through.
 */
function cookiePairValid(req: NextRequest): boolean {
  const l = req.cookies.get(LANGUAGE_COOKIE)?.value
  const c = req.cookies.get(CURRENCY_COOKIE)?.value
  return (l === "mn" || l === "en") && (c === "MNT" || c === "USD")
}

export default auth(async function proxy(request: NextAuthRequest) {
  const path = request.nextUrl.pathname
  const role = request.auth?.user?.role

  let res: NextResponse
  if (role === "provider_owner" && (path === "/dashboard" || path.startsWith("/account"))) {
    res = NextResponse.redirect(new URL("/dashboard/business", request.nextUrl))
  } else {
    res = NextResponse.next()
  }

  if (cookiePairValid(request)) {
    return res
  }

  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    return res
  }

  const token = await getToken({ req: request, secret })
  const cf = readCfIpCountryFromHeaders(request.headers)
  const resolved = resolveLocaleCurrency({
    userLanguage:   (token as { preferredLanguage?: string } | null)?.preferredLanguage ?? null,
    userCurrency:   (token as { preferredCurrency?: string } | null)?.preferredCurrency ?? null,
    cookieLanguage: request.cookies.get(LANGUAGE_COOKIE)?.value ?? null,
    cookieCurrency: request.cookies.get(CURRENCY_COOKIE)?.value ?? null,
    cfIpCountry:    cf,
  })

  const isProd = process.env.NODE_ENV === "production"
  res.cookies.set(LANGUAGE_COOKIE, resolved.language, {
    path:     "/",
    maxAge:   ONE_YEAR_S,
    sameSite: "lax",
    secure:   isProd,
  })
  res.cookies.set(CURRENCY_COOKIE, resolved.currency, {
    path:     "/",
    maxAge:   ONE_YEAR_S,
    sameSite: "lax",
    secure:   isProd,
  })
  return res
})

export const config = {
  matcher: [
    // Pages only — not `/api/*` (avoids Set-Cookie on every JSON request).
    "/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)",
  ],
}
