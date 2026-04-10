/**
 * lib/constants/geography.ts
 *
 * Canonical geography taxonomy for Mongolia.
 * Single source of truth for all geographic filtering, provider forms,
 * and location display across the platform.
 *
 * ─── Geography architecture ───────────────────────────────────────────────────
 *
 * Four intentionally separate levels:
 *
 * 1. PROVINCES / AIMAGS  (this file — MONGOLIA_PROVINCES)
 *    Mongolia's 21 official provinces (aimags) + Ulaanbaatar.
 *    This is the primary structured geography layer for the platform.
 *    Used for: provider location, tour coverage, stay location, filtering.
 *    Every listing and tour should set a province.
 *
 * 2. REGIONS  (this file — MONGOLIA_REGIONS)
 *    6 broader travel groupings. Useful for marketing-level browsing.
 *    Each province maps to one region.
 *    Used for: search sidebar, broad browsing, legacy compatibility.
 *    These can remain as long as they are useful — do not force removal.
 *
 * 3. DESTINATIONS  (admin-curated Destination records in DB)
 *    Curated places with editorial content pages.
 *    These are optional and admin-managed — NOT provider-managed.
 *    Examples: Terelj National Park, Lake Khövsgöl, Gobi Desert.
 *    Providers link to a destination only if it is relevant.
 *
 * 4. SPECIFIC PLACES  (listing-level, free-text)
 *    Specific locations mentioned in tour itineraries, descriptions, etc.
 *    These do NOT require a Destination page.
 *    Examples: Khongor Sand Dunes, Yolyn Am, Karakorum ruins.
 *    Providers describe these freely in text fields.
 *
 * ─── Tour location model ──────────────────────────────────────────────────────
 *
 * Tours use the HYBRID model (Option C — recommended):
 *
 *   - province[]   → structured, filterable geography (primary)
 *   - destination? → optional link to curated destination
 *   - meetingPoint → where travelers join (can optionally geocode this)
 *   - placesСovered (free text in description/itinerary)
 *
 * DO NOT use a single map pin for multi-stop tours — it is misleading.
 * Use a text-based TourLocationSection component instead.
 *
 * For accommodation (stays), a single map pin IS appropriate because
 * the property is a fixed location.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 */

// ── Province type ─────────────────────────────────────────────────────────────

export interface MongoliaProvince {
  /** URL-safe slug */
  slug:   string
  /** Official Mongolian name (English transliteration) */
  name:   string
  /** The broader travel region this province belongs to */
  region: string
  /** True for major urban centres (different browsing UX) */
  urban?: boolean
}

// ── Mongolia's 21 provinces (aimags) + Ulaanbaatar ───────────────────────────

export const MONGOLIA_PROVINCES: MongoliaProvince[] = [
  // ── Ulaanbaatar (capital — not a province but primary urban centre) ────────
  { slug: 'ulaanbaatar',  name: 'Ulaanbaatar',    region: 'Ulaanbaatar',      urban: true },

  // ── Central Mongolia ──────────────────────────────────────────────────────
  { slug: 'tov',          name: 'Töv',             region: 'Central Steppe'   },
  { slug: 'ovorhangai',   name: 'Övörkhangai',     region: 'Central Steppe'   },
  { slug: 'arkhangai',    name: 'Arkhangai',       region: 'Khangai Mountains' },
  { slug: 'bulgan',       name: 'Bulgan',           region: 'Khangai Mountains' },
  { slug: 'orkhon',       name: 'Orkhon',           region: 'Khangai Mountains', urban: true },

  // ── Northern Mongolia ─────────────────────────────────────────────────────
  { slug: 'khovsgol',     name: 'Khövsgöl',        region: 'Lake Khövsgöl'    },
  { slug: 'selenge',      name: 'Selenge',          region: 'Lake Khövsgöl'    },
  { slug: 'darkhan-uul',  name: 'Darkhan-Uul',      region: 'Lake Khövsgöl',   urban: true },

  // ── Eastern Mongolia ──────────────────────────────────────────────────────
  { slug: 'khentii',      name: 'Khentii',          region: 'Central Steppe'   },
  { slug: 'dornod',       name: 'Dornod',            region: 'Central Steppe'   },
  { slug: 'sukhbaatar',   name: 'Sükhbaatar',        region: 'Central Steppe'   },

  // ── Gobi region ───────────────────────────────────────────────────────────
  { slug: 'umnugovi',     name: 'Ömnögovi',          region: 'Gobi Desert'      },
  { slug: 'dundgovi',     name: 'Dundgovi',           region: 'Gobi Desert'      },
  { slug: 'dornogovi',    name: 'Dornogovi',          region: 'Gobi Desert'      },
  { slug: 'govi-altai',   name: 'Govi-Altai',         region: 'Gobi Desert'      },
  { slug: 'govisumber',   name: 'Govisümber',         region: 'Gobi Desert'      },
  { slug: 'bayankhongor', name: 'Bayankhongor',       region: 'Gobi Desert'      },

  // ── Western Mongolia (Altai region) ───────────────────────────────────────
  { slug: 'bayan-olgii',  name: 'Bayan-Ölgii',        region: 'Altai Mountains'  },
  { slug: 'khovd',        name: 'Khovd',               region: 'Altai Mountains'  },
  { slug: 'uvs',          name: 'Uvs',                 region: 'Altai Mountains'  },
  { slug: 'zavkhan',      name: 'Zavkhan',             region: 'Altai Mountains'  },
]

/** Slug → province object */
export const PROVINCE_BY_SLUG: Record<string, MongoliaProvince> = Object.fromEntries(
  MONGOLIA_PROVINCES.map(p => [p.slug, p]),
)

/** Province name → slug */
export const PROVINCE_SLUG_BY_NAME: Record<string, string> = Object.fromEntries(
  MONGOLIA_PROVINCES.map(p => [p.name, p.slug]),
)

/** Ordered province names for select dropdowns */
export const PROVINCE_NAMES: string[] = MONGOLIA_PROVINCES.map(p => p.name)

/** Ordered province slugs */
export const PROVINCE_SLUGS: string[] = MONGOLIA_PROVINCES.map(p => p.slug)

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

// ── 6 broad travel regions ────────────────────────────────────────────────────

export const MONGOLIA_REGIONS: MongoliaRegion[] = [
  { slug: 'gobi',        label: 'Gobi Desert',       searchParam: 'Gobi'        },
  { slug: 'khangai',     label: 'Khangai Mountains',  searchParam: 'Khangai'     },
  { slug: 'khuvsgul',    label: 'Lake Khövsgöl',      searchParam: 'Northern'    },
  { slug: 'ulaanbaatar', label: 'Ulaanbaatar',        searchParam: 'Ulaanbaatar' },
  { slug: 'altai',       label: 'Altai Mountains',    searchParam: 'Western'     },
  { slug: 'steppe',      label: 'Central Steppe',     searchParam: 'Central'     },
]

// ── Region derived maps ───────────────────────────────────────────────────────

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
