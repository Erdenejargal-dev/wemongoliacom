/**
 * lib/constants/geography.ts
 *
 * Canonical region taxonomy for Mongolia.
 * Single source of truth for:
 *   - search sidebar region filters  (lib/api/search.ts imports REGION_SLUG_TO_PARAM)
 *   - provider listing categorization
 *   - tour / stay region metadata
 *   - admin destination region picker
 *
 * ─── Architecture decision ───────────────────────────────────────────────────
 * Three geographic levels are intentionally kept separate:
 *
 * 1. REGIONS (this file)
 *    Controlled taxonomy. 6 broad geographic areas of Mongolia.
 *    Used for search sidebar filters and provider / tour categorization.
 *    Every tour, stay, and provider should set one of these regions.
 *    Examples: Gobi Desert, Altai Mountains, Central Steppe.
 *
 * 2. DESTINATIONS (admin-curated Destination records in DB)
 *    Specific places or areas with editorial content pages.
 *    Used for /destinations browse, detail pages, and homepage discovery.
 *    A destination normally maps to one region (via destination.region field).
 *    Examples: Terelj National Park (region: Central Steppe),
 *              Lake Khövsgöl (region: Lake Khövsgöl).
 *    Destinations are created/managed by platform admins — NOT by providers.
 *
 * 3. SPECIFIC PLACES (listing-level, free-text)
 *    Specific locations mentioned in tour/stay listings via:
 *      - tour description, meetingPoint, itinerary
 *      - stay address / city
 *    These do NOT require a Destination page.
 *    Examples: Khongor Sand Dunes, Tsagaan Suvarga, Yol Valley, Kharkhorin.
 *    Providers can mention these freely in their listing text.
 *
 * This keeps the discovery experience curated while letting providers describe
 * their listings accurately without polluting the Destination CMS.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Region type ───────────────────────────────────────────────────────────────

export interface MongoliaRegion {
  /** URL-safe slug used in query params and UI */
  slug: string
  /** Human-readable display label shown to users */
  label: string
  /**
   * Backend search term (partial-match against tour/stay/destination region field).
   * Intentionally kept as a simple string so the backend can do a `contains` query
   * without needing a separate enum.
   */
  searchParam: string
}

// ── Canonical region list ─────────────────────────────────────────────────────

export const MONGOLIA_REGIONS: MongoliaRegion[] = [
  { slug: 'gobi',        label: 'Gobi Desert',       searchParam: 'Gobi'        },
  { slug: 'khangai',     label: 'Khangai Mountains',  searchParam: 'Khangai'     },
  { slug: 'khuvsgul',    label: 'Lake Khövsgöl',      searchParam: 'Northern'    },
  { slug: 'ulaanbaatar', label: 'Ulaanbaatar',        searchParam: 'Ulaanbaatar' },
  { slug: 'altai',       label: 'Altai Mountains',    searchParam: 'Western'     },
  { slug: 'steppe',      label: 'Central Steppe',     searchParam: 'Central'     },
]

// ── Derived lookup maps ───────────────────────────────────────────────────────

/** slug → display label   e.g. 'gobi' → 'Gobi Desert' */
export const REGION_LABEL: Record<string, string> = Object.fromEntries(
  MONGOLIA_REGIONS.map(r => [r.slug, r.label]),
)

/** slug → backend search param   e.g. 'altai' → 'Western' */
export const REGION_SLUG_TO_PARAM: Record<string, string> = Object.fromEntries(
  MONGOLIA_REGIONS.map(r => [r.slug, r.searchParam]),
)

/** Ordered display labels for dropdowns / filter pills */
export const REGION_LABELS: string[] = MONGOLIA_REGIONS.map(r => r.label)

/** Ordered slugs */
export const REGION_SLUGS: string[] = MONGOLIA_REGIONS.map(r => r.slug)
