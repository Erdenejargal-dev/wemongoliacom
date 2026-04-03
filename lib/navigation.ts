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

// ── Shared user navigation items ─────────────────────────────────────────────
// Single source of truth used by both UserMenu (desktop dropdown) and
// MobileMenu (drawer). Adding an item here propagates to both surfaces.

export interface UserNavItem {
  href:     string
  label:    string
  /** Lucide icon name (string) — caller maps to component */
  iconName: string
}

export function getUserNavItems(role: string | null | undefined): UserNavItem[] {
  if (role === 'admin') {
    return [
      { href: '/admin',   label: 'Admin Console', iconName: 'ShieldCheck'     },
      { href: '/account', label: 'My Account',    iconName: 'CircleUserRound' },
    ]
  }

  if (role === 'provider_owner') {
    return [
      { href: '/dashboard/business',           label: 'Business Portal',  iconName: 'Building2'     },
      { href: '/dashboard/business/bookings',  label: 'Bookings',         iconName: 'CalendarCheck' },
      { href: '/dashboard/business/messages',  label: 'Messages',         iconName: 'MessageSquare' },
      { href: '/dashboard/business/settings',  label: 'Settings',         iconName: 'Settings'      },
    ]
  }

  // Traveler (default)
  return [
    { href: '/account',          label: 'My Account', iconName: 'CircleUserRound' },
    { href: '/account/trips',    label: 'My Trips',   iconName: 'CalendarCheck'   },
    { href: '/account/messages', label: 'Messages',   iconName: 'MessageSquare'   },
  ]
}

/** True if this role should see a "Become a Host" CTA */
export function showBecomeAHost(role?: string | null): boolean {
  return !role || role === 'traveler'
}
