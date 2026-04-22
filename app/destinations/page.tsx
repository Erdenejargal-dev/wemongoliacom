'use client'

import { useState, useEffect } from 'react'
import { Search, X, MapPin, Compass, Loader2 } from 'lucide-react'
import { DestinationCard } from '@/components/destinations/DestinationCard'
import { fetchDestinations, type BackendDestination } from '@/lib/api/destinations'
import Link from 'next/link'
import { useTranslations } from '@/lib/i18n'

const ALL_REGIONS = 'All'

export default function DestinationsPage() {
  const { t } = useTranslations()
  const bd = t.browse.destinations
  const [destinations, setDestinations] = useState<BackendDestination[]>([])
  const [loading, setLoading]           = useState(true)
  const [search,  setSearch]            = useState('')
  const [region,  setRegion]            = useState(ALL_REGIONS)

  useEffect(() => {
    fetchDestinations({ limit: 50 })
      .then(res => setDestinations(res.data))
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  // Build region list from real backend data only
  const regions = Array.from(
    new Set(destinations.map((dest) => dest.region).filter((r): r is string => Boolean(r))),
  ).sort()

  // Only surface region filter when there are 2+ distinct regions
  const hasMultipleRegions = regions.length > 1

  const featured   = destinations.filter((dest) => dest.featured)
  const hasFilters = Boolean(search) || region !== ALL_REGIONS

  const filtered = destinations.filter((dest) => {
    const q           = search.toLowerCase()
    const matchSearch = !q
      || dest.name.toLowerCase().includes(q)
      || (dest.region ?? '').toLowerCase().includes(q)
      || (dest.shortDescription ?? '').toLowerCase().includes(q)
    const matchRegion = region === ALL_REGIONS || dest.region === region
    return matchSearch && matchRegion
  })

  function clearFilters() {
    setSearch('')
    setRegion(ALL_REGIONS)
  }

  return (
    <div className="min-h-screen bg-white">

      {/* ── Hero ──────────────────────────────── */}
      <section className="relative bg-gray-950 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1706901549707-908e73f91f66?q=80&w=1025&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt={bd.heroImageAlt}
          className="absolute inset-0 w-full h-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/40 to-black/80" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-24 sm:py-32 text-center">
          <p className="text-orange-400 text-xs font-semibold uppercase tracking-[0.2em] mb-4">
            {bd.heroEyebrow}
          </p>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white mb-5 leading-[1.1] tracking-tight">
            {bd.heroTitle}
            <br className="hidden sm:block" />
            <span className="text-orange-400">{bd.heroTitleAccent}</span>
          </h1>
          <p className="text-white/65 text-base sm:text-lg max-w-xl mx-auto mb-10 leading-relaxed">
            {bd.heroLead}
          </p>

          {/* Search */}
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={bd.searchPlaceholder}
              aria-label={bd.searchPlaceholder}
              className="w-full pl-11 pr-10 py-4 bg-white rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-400/30 shadow-2xl"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                title={t.common.close}
                aria-label={t.common.close}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* ── Body ──────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-16">

        {/* Loading */}
        {loading && (
          <div className="flex justify-center py-24">
            <Loader2 className="w-6 h-6 text-orange-500 animate-spin" />
          </div>
        )}

        {!loading && (
          <>
            {/* Featured grid — only when not filtering */}
            {!hasFilters && featured.length > 0 && (
              <section>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2">
                    <span className="w-1 h-5 rounded-full bg-orange-500 inline-block" />
                    <h2 className="text-lg font-bold text-gray-900">{bd.featured}</h2>
                  </div>
                  <Link
                    href="/tours"
                    className="text-xs font-semibold text-orange-600 hover:text-orange-700 transition-colors"
                  >
                    {bd.browseTours}
                  </Link>
                </div>

                {/* Adaptive grid based on featured count */}
                <div className={`grid gap-4 ${
                  featured.length === 1
                    ? 'grid-cols-1 sm:grid-cols-2'
                    : featured.length <= 3
                      ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
                      : 'grid-cols-2 lg:grid-cols-4'
                }`}>
                  {featured.map(dest => (
                    <DestinationCard key={dest.slug} destination={dest} featured />
                  ))}
                </div>
              </section>
            )}

            {/* Filter + full grid */}
            <section>
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between mb-6">

                {/* Region pills — only rendered when multiple regions exist */}
                <div className="flex items-center gap-2 flex-wrap min-h-[32px]">
                  {hasMultipleRegions && (
                    <>
                      <button
                        type="button"
                        onClick={() => setRegion(ALL_REGIONS)}
                        className={`text-xs font-semibold px-3.5 py-2 rounded-full transition-colors ${
                          region === ALL_REGIONS
                            ? 'bg-gray-900 text-white'
                            : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        {bd.allRegions}
                      </button>
                      {regions.map(r => (
                        <button
                          type="button"
                          key={r}
                          onClick={() => setRegion(r)}
                          className={`text-xs font-semibold px-3.5 py-2 rounded-full transition-colors ${
                            region === r
                              ? 'bg-gray-900 text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                          }`}
                        >
                          {r}
                        </button>
                      ))}
                    </>
                  )}

                  {hasFilters && (
                    <button
                      type="button"
                      onClick={clearFilters}
                      className="text-xs text-gray-500 hover:text-gray-800 underline transition-colors"
                    >
                      {bd.clear}
                    </button>
                  )}
                </div>

                <p className="text-sm text-gray-400 shrink-0">
                  {bd.count(filtered.length)}
                </p>
              </div>

              {/* Destination grid */}
              {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {filtered.map(dest => (
                    <DestinationCard key={dest.slug} destination={dest} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <Compass className="w-10 h-10 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-700 font-semibold text-base mb-1">{bd.emptyTitle}</p>
                  <p className="text-gray-400 text-sm mb-5">
                    {search ? bd.emptyNoResults(search) : bd.emptyHint}
                  </p>
                  <button
                    type="button"
                    onClick={clearFilters}
                    className="text-sm font-semibold text-orange-600 hover:text-orange-700 underline transition-colors"
                  >
                    {bd.clearFilters}
                  </button>
                </div>
              )}
            </section>

            {/* CTA — dark + dual action (tours + stays) */}
            <section className="relative bg-gray-950 rounded-3xl p-8 sm:p-12 text-center overflow-hidden">
              {/* Subtle radial glow */}
              <div
                className="absolute inset-0 opacity-20 pointer-events-none"
                style={{ background: 'radial-gradient(ellipse at 50% 0%, #f97316 0%, transparent 70%)' }}
              />
              <div className="relative">
                <h3 className="text-2xl font-bold text-white mb-2">
                  {bd.ctaTitle}
                </h3>
                <p className="text-white/55 text-sm mb-7 max-w-md mx-auto">
                  {bd.ctaLead}
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <Link
                    href="/tours"
                    className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-7 py-3.5 rounded-xl transition-colors shadow-lg"
                  >
                    <Compass className="w-4 h-4" />
                    {bd.ctaTours}
                  </Link>
                  <Link
                    href="/stays"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-sm px-7 py-3.5 rounded-xl transition-colors border border-white/20"
                  >
                    {bd.ctaStays}
                  </Link>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  )
}
