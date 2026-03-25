/**
 * lib/navigation.ts
 * Centralized auth redirect helpers.
 *
 * Keeps all "where do we send the user?" logic in one place so that
 * login forms, register forms, navbar CTAs, and onboarding can share
 * the same intent-preserving redirect behaviour.
 */

/** Validate a callbackUrl to prevent open redirects. Only relative paths allowed. */
export function sanitizeCallbackUrl(url: string | null | undefined): string | null {
  if (!url) return null
  if (url.startsWith('/') && !url.startsWith('//')) return url
  return null
}

/** Build a login URL that preserves where the user should go after auth. */
export function buildLoginUrl(callbackUrl?: string): string {
  if (!callbackUrl) return '/auth/login'
  return `/auth/login?callbackUrl=${encodeURIComponent(callbackUrl)}`
}

/** Build a register URL that preserves callbackUrl. */
export function buildRegisterUrl(callbackUrl?: string | null): string {
  if (!callbackUrl) return '/auth/register'
  return `/auth/register?callbackUrl=${encodeURIComponent(callbackUrl)}`
}

/** Determine the post-login redirect when no explicit callbackUrl was provided. */
export function getDefaultRedirect(role?: string): string {
  if (role === 'provider_owner' || role === 'admin') return '/dashboard/business'
  return '/dashboard'
}

/** Determine where "Become a Host" should link based on current auth state. */
export function getHostCTAHref(session: { user?: { role?: string } } | null): string {
  if (!session) return buildLoginUrl('/onboarding')
  if (session.user?.role === 'provider_owner' || session.user?.role === 'admin') return '/dashboard/business'
  return '/onboarding'
}

export function isProviderOrAdmin(role?: string | null): boolean {
  return role === 'provider_owner' || role === 'admin'
}
