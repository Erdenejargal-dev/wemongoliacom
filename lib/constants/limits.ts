/**
 * lib/constants/limits.ts
 *
 * ⚠️  REFERENCE ONLY — do not import this in UI components.
 *
 * The dashboard UI is fully driven by the GET /provider/limits API response
 * (see lib/api/provider.ts → fetchProviderLimits).
 * All limit values shown in the UI come from the backend at runtime,
 * so there is no risk of frontend constants drifting from backend enforcement.
 *
 * The authoritative backend config lives in:
 *   backend/src/config/limits.ts  ← edit limit numbers HERE
 *
 * This file exists only so the numbers are visible in the frontend repo
 * for reference during code review. It is intentionally not imported
 * by any component.
 *
 * To change limits: edit backend/src/config/limits.ts only.
 */

export const LISTING_LIMITS_REFERENCE = {
  FREE: {
    tours:          3,
    accommodations: 3,
  },
  PRO: {
    tours:          Infinity,
    accommodations: Infinity,
  },
} as const
