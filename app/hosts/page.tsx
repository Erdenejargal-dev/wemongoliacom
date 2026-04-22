'use client'

import { useState } from 'react'
import { Search, X, Users, Compass } from 'lucide-react'
import { hosts } from '@/lib/mock-data/hosts'
import { HostCard } from '@/components/hosts/HostCard'
import Link from 'next/link'
import { useTranslations } from '@/lib/i18n'
import type { HostsBrowseMessages } from '@/lib/i18n/messages/hostsBrowse'

const TYPES = ['All', 'company', 'guide', 'experience', 'driver'] as const
type TypeFilter = (typeof TYPES)[number]

function typeFilterLabel(t: TypeFilter, hb: HostsBrowseMessages): string {
  switch (t) {
    case 'All': return hb.filterAll
    case 'company': return hb.filterCompany
    case 'guide': return hb.filterGuide
    case 'experience': return hb.filterExperience
    case 'driver': return hb.filterDriver
    default: return hb.filterAll
  }
}

const FEATURED_SLUGS = ['gobi-adventure-tours', 'altai-expeditions', 'northern-trails']

export default function HostsPage() {
  const { t } = useTranslations()
  const hb = t.hostsBrowse
  const [search, setSearch] = useState('')
  const [type, setType] = useState<TypeFilter>('All')

  const featured = hosts.filter(h => FEATURED_SLUGS.includes(h.slug))

  const filtered = hosts.filter(h => {
    const q = search.toLowerCase()
    const matchSearch = !q
      || h.name.toLowerCase().includes(q)
      || h.location.toLowerCase().includes(q)
      || h.description.toLowerCase().includes(q)
    const matchType = type === 'All' || h.type === type
    return matchSearch && matchType
  })

  const hasFilters = search || type !== 'All'

  return (
    <div className="min-h-screen bg-gray-50/40">

      {/* ── Hero ─────────────────────────────── */}
      <section className="relative bg-gray-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=1600"
          alt={hb.heroImageAlt}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900/90" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="flex items-center justify-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Users className="w-3.5 h-3.5" aria-hidden />
            {hb.heroKicker}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            {hb.heroTitleLine1}
            <br className="hidden sm:block" />
            {hb.heroTitleLine2}
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            {hb.heroSubtitle}
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={hb.searchPlaceholder}
              aria-label={hb.searchPlaceholder}
              className="w-full pl-11 pr-10 py-3.5 bg-white rounded-2xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-400/30 shadow-xl"
            />
            {search && (
              <button type="button" onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={t.common.close}>
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">

        {/* ── Featured Operators ───────────────── */}
        {!hasFilters && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <span className="w-1 h-5 rounded-full bg-brand-500 inline-block" aria-hidden />
              <h2 className="text-lg font-bold text-gray-900">{hb.featuredSection}</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {featured.map(host => (
                <HostCard key={host.slug} host={host} featured />
              ))}
            </div>
          </section>
        )}

        {/* ── All Hosts ────────────────────────── */}
        <section>
          {/* Filter row */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
            <div className="flex flex-wrap gap-2">
              {TYPES.map(tf => (
                <button type="button" key={tf}
                  onClick={() => setType(tf)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${type === tf ? 'bg-gray-900 text-white' : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'}`}>
                  {typeFilterLabel(tf, hb)}
                </button>
              ))}
              {hasFilters && (
                <button type="button" onClick={() => { setSearch(''); setType('All') }}
                  className="text-xs text-gray-500 hover:text-gray-700 underline transition-colors">
                  {hb.clearAll}
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 shrink-0">
              {hb.hostCount(filtered.length)}
            </p>
          </div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(host => (
                <HostCard key={host.slug} host={host} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Compass className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden />
              <p className="text-gray-500 font-medium text-sm mb-1">{hb.noResultsTitle}</p>
              <p className="text-gray-400 text-xs">{hb.noResultsHint}</p>
              <button type="button" onClick={() => { setSearch(''); setType('All') }}
                className="mt-4 text-sm text-brand-600 hover:text-brand-700 font-semibold underline transition-colors">
                {hb.clearFilters}
              </button>
            </div>
          )}
        </section>

        {/* ── CTA ──────────────────────────────── */}
        <section className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">{hb.ctaTitle}</h3>
          <p className="text-white/80 text-sm mb-5">{hb.ctaSub}</p>
          <Link href="/onboarding"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors shadow-lg">
            <Users className="w-4 h-4" aria-hidden />
            {hb.ctaButton}
          </Link>
        </section>

      </div>
    </div>
  )
}
