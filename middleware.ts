/**
 * Edge middleware — seeds `wm_lang` + `wm_currency` when the pair is missing
 * or incomplete, using the same pure resolver as RSC (`resolveLocaleCurrency`).
 *
 * Cloudflare appends `CF-IPCountry` to requests at the edge. We read it here
 * so first-time visitors get MN → mn+MNT before any client JavaScript runs.
 *
 * When both cookies are already valid, we do not touch them (manual choice
 * persists). When either is missing or invalid, we write a full pair from
 * the resolved snapshot (user JWT > partial cookies > CF > default).
 */

import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { CURRENCY_COOKIE, LANGUAGE_COOKIE } from '@/lib/preferences-storage'
import { resolveLocaleCurrency, readCfIpCountryFromHeaders } from '@/lib/locale-currency-resolver'

const ONE_YEAR_S = 60 * 60 * 24 * 365

function cookiePairValid(req: NextRequest): boolean {
  const l = req.cookies.get(LANGUAGE_COOKIE)?.value
  const c = req.cookies.get(CURRENCY_COOKIE)?.value
  return (l === 'mn' || l === 'en') && (c === 'MNT' || c === 'USD')
}

export async function middleware(request: NextRequest) {
  if (cookiePairValid(request)) {
    return NextResponse.next()
  }

  const secret = process.env.NEXTAUTH_SECRET
  if (!secret) {
    return NextResponse.next()
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

  const isProd = process.env.NODE_ENV === 'production'
  const res = NextResponse.next()
  res.cookies.set(LANGUAGE_COOKIE, resolved.language, {
    path:     '/',
    maxAge:   ONE_YEAR_S,
    sameSite: 'lax',
    secure:   isProd,
  })
  res.cookies.set(CURRENCY_COOKIE, resolved.currency, {
    path:     '/',
    maxAge:   ONE_YEAR_S,
    sameSite: 'lax',
    secure:   isProd,
  })
  return res
}

export const config = {
  matcher: [
    // Pages only — not `/api/*` (Route Handlers / NextAuth) to avoid
    // redundant Set-Cookie on every JSON request.
    '/((?!api/|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
