/**
 * app/destinations/[slug]/page.tsx
 *
 * Destination detail page — fully driven by the real backend.
 * Data source: GET /destinations/:slug → { destination, tours }
 *
 * Section order (conversion-optimised):
 *   1. Hero
 *   2. About + gallery
 *   3. Tours (conversion — shown first among discovery content)
 *   4. Highlights
 *   5. Things to Do (activities)
 *   6. Travel Tips
 *   7. CTA banner (tours + stays dual action)
 *
 * All sections are conditional — empty backend arrays hide the section.
 * No mock data, no fake counts.
 */

export const dynamic = 'force-dynamic'

import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Compass } from 'lucide-react'
import { fetchDestinationBySlug } from '@/lib/api/destinations'
import { DestinationHero } from '@/components/destinations/DestinationHero'
import { HighlightsGrid } from '@/components/destinations/HighlightsGrid'
import { ActivitiesList } from '@/components/destinations/ActivitiesList'
import { TravelTips } from '@/components/destinations/TravelTips'
import { DestinationTours } from '@/components/destinations/DestinationTours'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function DestinationPage({ params }: Props) {
  const { slug } = await params
  const result = await fetchDestinationBySlug(slug)
  if (!result) notFound()

  const { destination, tours } = result

  // Determine if there's any substantive content beyond the name/hero
  const hasAbout      = Boolean(destination.description || destination.shortDescription)
  const hasGallery    = destination.gallery.length > 0
  const hasHighlights = destination.highlights.length > 0
  const hasActivities = destination.activities.length > 0
  const hasTips       = destination.tips.length > 0
  const hasTours      = tours.length > 0
  const hasAnything   = hasAbout || hasHighlights || hasActivities || hasTips || hasTours

  return (
    <div className="min-h-screen bg-gray-50/40">

      {/* ── 1. Hero ─────────────────────────────── */}
      <DestinationHero destination={destination} />

      {/* ── Body ────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">

        {/* Sparse content notice — only shown when destination has no content yet */}
        {!hasAnything && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <Compass className="w-10 h-10 text-gray-300 mx-auto mb-4" />
            <h2 className="text-lg font-bold text-gray-900 mb-2">
              More about {destination.name} coming soon
            </h2>
            <p className="text-gray-500 text-sm mb-6 max-w-sm mx-auto">
              We&apos;re building out this destination page. In the meantime, browse available tours or stays.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/tours?destination=${encodeURIComponent(destination.name)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-bold rounded-xl transition-colors shadow-sm"
              >
                Browse {destination.name} Tours
              </Link>
              <Link
                href={`/stays?destination=${encodeURIComponent(destination.name)}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-semibold rounded-xl transition-colors"
              >
                Find Stays
              </Link>
            </div>
          </section>
        )}

        {/* ── 2. About + gallery ─────────────────── */}
        {hasAbout && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <div className="max-w-3xl">
              <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">About</span>
              <h2 className="text-2xl font-bold text-gray-900 mt-2 mb-4">
                Discover {destination.name}
              </h2>
              <p className="text-gray-700 leading-relaxed text-base">
                {destination.description ?? destination.shortDescription}
              </p>
            </div>

            {/* Gallery — larger thumbnails */}
            {hasGallery && (
              <div className="grid grid-cols-3 gap-3 mt-6">
                {destination.gallery.slice(0, 3).map((src, i) => (
                  <div key={i} className="h-48 rounded-xl overflow-hidden bg-gray-100">
                    <img
                      src={src}
                      alt={`${destination.name} ${i + 1}`}
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ── 3. Tours — conversion-first placement ── */}
        {hasTours && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <DestinationTours tours={tours} destinationName={destination.name} />
          </section>
        )}

        {/* ── 4. Highlights ──────────────────────── */}
        {hasHighlights && (
          <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
            <HighlightsGrid highlights={destination.highlights} />
          </section>
        )}

        {/* ── 5. Things to Do ────────────────────── */}
        {hasActivities && (
          <ActivitiesList activities={destination.activities} />
        )}

        {/* ── 6. Travel Tips ─────────────────────── */}
        {hasTips && (
          <TravelTips tips={destination.tips} />
        )}

        {/* ── 7. CTA — dual action (tours + stays) ── */}
        {destination.heroImageUrl && (
          <section className="relative rounded-2xl overflow-hidden">
            <img
              src={destination.heroImageUrl}
              alt={destination.name}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/30" />
            <div className="relative px-8 sm:px-12 py-14 max-w-xl">
              <p className="text-orange-400 text-xs font-bold uppercase tracking-widest mb-2">
                Plan Your Trip
              </p>
              <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3 leading-tight">
                Ready to explore {destination.name}?
              </h3>
              <p className="text-white/65 text-sm mb-7 leading-relaxed">
                Browse tours and find accommodation — filter by dates, style, and budget.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href={`/tours?destination=${encodeURIComponent(destination.name)}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors shadow-lg"
                >
                  Browse {destination.name} Tours
                </Link>
                <Link
                  href={`/stays?destination=${encodeURIComponent(destination.name)}`}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-white/15 hover:bg-white/25 text-white font-semibold text-sm rounded-xl transition-colors border border-white/25 backdrop-blur-sm"
                >
                  Find Stays
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* Fallback CTA (when no hero image) — only if there IS some content */}
        {!destination.heroImageUrl && hasAnything && (
          <section className="bg-gray-950 rounded-2xl p-8 text-center">
            <h3 className="text-xl font-bold text-white mb-2">
              Ready to explore {destination.name}?
            </h3>
            <p className="text-white/55 text-sm mb-6">
              Browse tours and stays — filter by dates, style, and budget.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href={`/tours?destination=${encodeURIComponent(destination.name)}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm rounded-xl transition-colors shadow-md"
              >
                Browse {destination.name} Tours
              </Link>
              <Link
                href={`/stays?destination=${encodeURIComponent(destination.name)}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm rounded-xl transition-colors border border-white/20"
              >
                Find Stays
              </Link>
            </div>
          </section>
        )}

      </div>
    </div>
  )
}
