/**
 * lib/locale-currency-resolver.server.ts
 *
 * Server-only: reads `next/headers` + NextAuth `auth()` and returns the same
 * `resolveLocaleCurrency` result the Edge middleware uses, so RSC, layout,
 * and the client initial props stay aligned with the first response.
 *
 * On the *first* request, `Set-Cookie` from middleware is not yet visible to
 * `cookies()` in the RSC pass — the incoming request has no `wm_lang`/
 * `wm_currency`. This helper therefore MUST read `CF-IPCountry` from
 * `headers()` (step 3) when cookies are absent; the middleware in parallel
 * seeds cookies for the *next* request and for `document.cookie` on
 * `document.load`.
 */

import { headers, cookies } from 'next/headers'
import { auth } from '@/lib/auth'
import {
  resolveLocaleCurrency,
  readCfIpCountryFromHeaders,
  type ResolvedLocaleCurrency,
} from '@/lib/locale-currency-resolver'
import { CURRENCY_COOKIE, LANGUAGE_COOKIE } from '@/lib/preferences-storage'

/**
 * @returns The resolved public language and display currency for this request.
 */
export async function getResolvedLocaleCurrencyForRequest(): Promise<ResolvedLocaleCurrency> {
  const h = await headers()
  const cf = readCfIpCountryFromHeaders(h)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const jar: any = cookies()
  const resolvedJar = jar && typeof jar.then === 'function' ? await jar : jar
  const cookieLanguage =  resolvedJar?.get?.(LANGUAGE_COOKIE)?.value ?? null
  const cookieCurrency =  resolvedJar?.get?.(CURRENCY_COOKIE)?.value ?? null

  const session = await auth()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const u = session?.user as any

  return resolveLocaleCurrency({
    userLanguage:  u?.preferredLanguage ?? null,
    userCurrency:  u?.preferredCurrency ?? null,
    cookieLanguage,
    cookieCurrency,
    cfIpCountry:  cf,
  })
}

export type { ResolvedLocaleCurrency }
