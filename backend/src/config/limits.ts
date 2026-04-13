/**
 * backend/src/config/limits.ts
 *
 * SINGLE SOURCE OF TRUTH for provider listing limits per plan.
 *
 * Rules:
 *   - Limits are per Provider (not per user)
 *   - Limits are per listing type (tours and accommodations are separate)
 *   - Counts include: draft, active, paused
 *   - Counts exclude: archived (soft-deleted)
 *   - Vehicles are NOT included — no provider management API/UI exists yet
 *
 * Never hardcode limit numbers in service files.
 * Always call getListingLimit(plan, key) from this module.
 * To change a limit: edit the number here — nowhere else.
 */

export const LISTING_LIMITS = {
  FREE: {
    tours:          3,
    accommodations: 3,
    // vehicles: excluded until provider vehicle management is implemented
  },
  PRO: {
    tours:          Infinity,
    accommodations: Infinity,
  },
} as const

export type PlanType        = keyof typeof LISTING_LIMITS
export type ListingLimitKey = keyof (typeof LISTING_LIMITS)['FREE']

/**
 * Returns the numeric listing limit for a given plan + listing type.
 * Returns Infinity for unlimited plans (PRO).
 * Safe for use in `if (count >= limit)` comparisons.
 */
export function getListingLimit(plan: PlanType, key: ListingLimitKey): number {
  return LISTING_LIMITS[plan][key] as number
}
