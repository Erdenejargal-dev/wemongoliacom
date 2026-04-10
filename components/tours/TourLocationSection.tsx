/**
 * components/tours/TourLocationSection.tsx
 *
 * User-facing location context for tour listings.
 *
 * Design decision: tours do NOT use a single map pin.
 * A map pin would be misleading for multi-province circuit tours —
 * it would suggest the tour starts and ends at one spot when it covers
 * hundreds of kilometres across multiple provinces.
 *
 * Instead, this component shows a clean text-based location module:
 *   - Province(s) / region the tour operates in
 *   - Linked destination if the tour is tied to one
 *   - Meeting point (where travelers join — this IS a fixed location)
 *   - Optional "Open meeting point in Google Maps" link if coordinates available
 *
 * For stays/accommodations, use PropertyMap instead (single fixed location).
 */

import Link from 'next/link'
import { MapPin, Navigation, ExternalLink, Globe } from 'lucide-react'

interface TourLocationSectionProps {
  /** Primary destination the tour is linked to (optional) */
  destination?: {
    name: string
    slug: string
    region?: string | null
  } | null
  /** Province(s) the tour covers — human-readable names */
  provinces?: string[]
  /** Broader region label if no provinces set */
  region?: string | null
  /** Where travelers meet the guide */
  meetingPoint?: string | null
  /** Meeting point coordinates — only used for the "Open in Maps" link */
  meetingLat?: number | null
  meetingLng?: number | null
}

export function TourLocationSection({
  destination,
  provinces,
  region,
  meetingPoint,
  meetingLat,
  meetingLng,
}: TourLocationSectionProps) {
  const hasProvince = provinces && provinces.length > 0
  const hasRegion   = region || destination?.region
  const hasMeeting  = meetingPoint && meetingPoint.trim().length > 0
  const hasMapLink  = hasMeeting && meetingLat != null && meetingLng != null

  // Nothing to show
  if (!destination && !hasProvince && !hasRegion && !hasMeeting) return null

  const mapsUrl = hasMapLink
    ? `https://www.google.com/maps?q=${meetingLat},${meetingLng}`
    : hasMeeting
      ? `https://www.google.com/maps/search/${encodeURIComponent(meetingPoint!)}`
      : null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
        <Globe className="w-5 h-5 text-brand-500" />
        Location &amp; Coverage
      </h2>

      <div className="space-y-4">

        {/* Province / region coverage */}
        {(hasProvince || hasRegion) && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
                {hasProvince ? (provinces!.length > 1 ? 'Provinces covered' : 'Province') : 'Region'}
              </p>
              {hasProvince ? (
                <div className="flex flex-wrap gap-1.5">
                  {provinces!.map(p => (
                    <span
                      key={p}
                      className="inline-flex items-center px-2.5 py-1 text-xs font-semibold bg-brand-50 text-brand-700 rounded-full border border-brand-200"
                    >
                      {p}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-sm font-medium text-gray-900">{hasRegion}</p>
              )}
            </div>
          </div>
        )}

        {/* Linked destination */}
        {destination && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center shrink-0 mt-0.5">
              <MapPin className="w-4 h-4 text-orange-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Destination</p>
              <Link
                href={`/destinations/${destination.slug}`}
                className="text-sm font-medium text-brand-600 hover:text-brand-700 transition-colors underline-offset-2 hover:underline"
              >
                {destination.name}
              </Link>
              {destination.region && (
                <p className="text-xs text-gray-400 mt-0.5">{destination.region}</p>
              )}
            </div>
          </div>
        )}

        {/* Meeting point */}
        {hasMeeting && (
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center shrink-0 mt-0.5">
              <Navigation className="w-4 h-4 text-green-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">Meeting point</p>
              <p className="text-sm text-gray-900">{meetingPoint}</p>
              {mapsUrl && (
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 mt-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  Open in Google Maps
                </a>
              )}
            </div>
          </div>
        )}

        {/* Informational note for multi-location tours */}
        {hasProvince && provinces!.length > 1 && (
          <p className="text-xs text-gray-400 mt-1 pl-11">
            This tour visits multiple provinces. Specific places and the full route are described in the itinerary below.
          </p>
        )}
      </div>
    </div>
  )
}
