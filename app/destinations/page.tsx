'use client'

import { useState } from 'react'
import { Search, X, MapPin, Compass } from 'lucide-react'
import { destinations } from '@/lib/mock-data/destinations'
import { DestinationCard } from '@/components/destinations/DestinationCard'
import Link from 'next/link'

const REGIONS = ['All', ...Array.from(new Set(destinations.map(d => d.region))).sort()]
const DIFFICULTIES = ['All', 'Easy', 'Moderate', 'Challenging']
const FEATURED_SLUGS = ['gobi-desert', 'lake-khovsgol', 'altai-mountains', 'ulaanbaatar']

export default function DestinationsPage() {
  const [search, setSearch] = useState('')
  const [region, setRegion] = useState('All')
  const [difficulty, setDifficulty] = useState('All')

  const featured = destinations.filter(d => FEATURED_SLUGS.includes(d.slug))

  const filtered = destinations.filter(d => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || d.name.toLowerCase().includes(q)
      || d.region.toLowerCase().includes(q)
      || d.tagline.toLowerCase().includes(q)
    const matchRegion     = region === 'All'     || d.region === region
    const matchDifficulty = difficulty === 'All' || d.difficulty === difficulty
    return matchSearch && matchRegion && matchDifficulty
  })

  const hasFilters = search || region !== 'All' || difficulty !== 'All'

  function clearFilters() {
    setSearch('')
    setRegion('All')
    setDifficulty('All')
  }

  return (
    <div className="min-h-screen bg-gray-50/40">

      {/* ── Hero ─────────────────────────────── */}
      <section className="relative bg-gray-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=1600"
          alt="Mongolia destinations"
          className="absolute inset-0 w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/60 to-gray-900/90" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="flex items-center justify-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-widest mb-4">
            <MapPin className="w-3.5 h-3.5" />
            Mongolia
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            Explore Destinations<br className="hidden sm:block" /> in Mongolia
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            Discover Mongolia&apos;s most breathtaking landscapes, from the Gobi Desert to the Altai Mountains.
          </p>

          {/* Search bar */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search destinations…"
              className="w-full pl-11 pr-10 py-3.5 bg-white rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30 shadow-xl"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">

        {/* ── Popular Destinations ─────────────── */}
        {!hasFilters && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-5 rounded-full bg-brand-500 inline-block" />
              <h2 className="text-lg font-bold text-gray-900">Popular Destinations</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {featured.map(dest => (
                <DestinationCard key={dest.slug} destination={dest} featured />
              ))}
            </div>
          </section>
        )}

        {/* ── Filter row ───────────────────────── */}
        <section>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              {/* Region filter */}
              <div className="flex flex-wrap gap-2">
                {REGIONS.map(r => (
                  <button key={r}
                    onClick={() => setRegion(r)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${region === r ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                    {r}
                  </button>
                ))}
              </div>

              {/* Difficulty filter */}
              <div className="flex flex-wrap gap-2">
                {DIFFICULTIES.map(d => (
                  <button key={d}
                    onClick={() => setDifficulty(d)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${difficulty === d ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                    {d}
                  </button>
                ))}
              </div>

              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-gray-500 hover:text-gray-700 underline transition-colors">
                  Clear all
                </button>
              )}
            </div>

            <p className="text-sm text-gray-500 shrink-0">
              {filtered.length} destination{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* ── Destinations Grid ───────────────── */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(dest => (
                <DestinationCard key={dest.slug} destination={dest} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Compass className="w-10 h-10 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500 font-medium text-sm mb-1">No destinations found</p>
              <p className="text-gray-400 text-xs">Try adjusting your search or filters</p>
              <button onClick={clearFilters} className="mt-4 text-sm text-brand-600 hover:text-brand-700 font-semibold underline transition-colors">
                Clear filters
              </button>
            </div>
          )}
        </section>

        {/* ── Bottom CTA ───────────────────────── */}
        <section className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">Can&apos;t find what you&apos;re looking for?</h3>
          <p className="text-white/80 text-sm mb-5">Browse tours with scheduled departures across Mongolia and filter by your interests.</p>
          <Link href="/tours"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors shadow-lg">
            <Compass className="w-4 h-4" />
            Browse All Tours
          </Link>
        </section>

      </div>
    </div>
  )
}
