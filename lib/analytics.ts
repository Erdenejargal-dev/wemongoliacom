/**
 * lib/analytics.ts
 *
 * Phase 6 — UX + Growth Layer. Lightweight analytics shim.
 *
 * Intentionally NOT a full analytics system. It:
 *   - Pushes an event to `window.dataLayer` if present (GTM / GA4 friendly)
 *   - Falls back to `window.posthog.capture` if PostHog is loaded
 *   - In dev, logs to console.debug so we can verify wiring without a
 *     vendor installed
 *
 * All emitters are no-ops on the server and inside jest/vitest.
 */

type EventMap = {
  preference_changed:    { field: 'currency' | 'language'; value: string }
  booking_request_opened:   { listingType: string; listingId: string; currency: string | null }
  booking_request_submitted:{ listingType: string; listingId: string; currency: string | null; authenticated: boolean }
  booking_request_error:    { listingType: string; listingId: string; message: string }
  view_listing_unpayable:   { listingType: string; listingId: string; baseCurrency: string }
}

export function track<E extends keyof EventMap>(event: E, payload: EventMap[E]): void {
  if (typeof window === 'undefined') return
  try {
    const dl: unknown = (window as any).dataLayer
    if (Array.isArray(dl)) {
      dl.push({ event, ...payload })
    }
    const ph = (window as any).posthog
    if (ph && typeof ph.capture === 'function') {
      ph.capture(event, payload)
    }
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.debug('[analytics]', event, payload)
    }
  } catch {
    // Analytics must never throw.
  }
}
