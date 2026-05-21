'use client'

import { useState, useEffect, useCallback } from 'react'
import { Search, X, Users, Award, ChevronDown } from 'lucide-react'
import Link from 'next/link'
import { GuideCard } from '@/components/guides/GuideCard'
import { useTranslations } from '@/lib/i18n'
import { fetchGuides, type GuideListItem, type GuideSpecialty } from '@/lib/api/guides'

const SPECIALTIES: Array<{ value: GuideSpecialty | 'All'; label: (key: ReturnType<typeof useTranslations>['t']['guidesBrowse']) => string }> = [
  { value: 'All',          label: g => g.filterAll },
  { value: 'Wildlife',     label: g => g.filterWildlife },
  { value: 'Trekking',     label: g => g.filterTrekking },
  { value: 'Cultural',     label: g => g.filterCultural },
  { value: 'Photography',  label: g => g.filterPhotography },
  { value: 'BirdWatching', label: g => g.filterBirdWatching },
  { value: 'Winter',       label: g => g.filterWinter },
  { value: 'Fishing',      label: g => g.filterFishing },
  { value: 'History',      label: g => g.filterHistory },
  { value: 'Adventure',    label: g => g.filterAdventure },
]

type SortOption = 'rating' | 'newest' | 'experience'

export default function GuidesPage() {
  const { t } = useTranslations()
  const g = t.guidesBrowse

  const [guides, setGuides]         = useState<GuideListItem[]>([])
  const [total, setTotal]           = useState(0)
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [specialty, setSpecialty]   = useState<GuideSpecialty | 'All'>('All')
  const [certifiedOnly, setCertifiedOnly] = useState(false)
  const [sort, setSort]             = useState<SortOption>('rating')

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const result = await fetchGuides({
        specialty: specialty !== 'All' ? specialty : undefined,
        certified: certifiedOnly || undefined,
        location:  search || undefined,
        sort,
        limit: 48,
      })
      // client-side search filter over name too
      const q = search.toLowerCase()
      const filtered = q
        ? result.guides.filter(g =>
            g.name.toLowerCase().includes(q) ||
            g.location.toLowerCase().includes(q) ||
            g.bio.toLowerCase().includes(q)
          )
        : result.guides
      setGuides(filtered)
      setTotal(filtered.length)
    } catch {
      setGuides([])
      setTotal(0)
    } finally {
      setLoading(false)
    }
  }, [specialty, certifiedOnly, sort, search])

  useEffect(() => {
    const timer = setTimeout(load, 300)
    return () => clearTimeout(timer)
  }, [load])

  function clearFilters() {
    setSearch('')
    setSpecialty('All')
    setCertifiedOnly(false)
    setSort('rating')
  }

  const hasFilters = search || specialty !== 'All' || certifiedOnly

  return (
    <div className="min-h-screen bg-gray-50/40">

      {/* Hero */}
      <section className="relative bg-gray-900 overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600"
          alt={g.heroImageAlt}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-gray-900/50 to-gray-900/90" />
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <div className="flex items-center justify-center gap-2 text-brand-400 text-xs font-bold uppercase tracking-widest mb-4">
            <Award className="w-3.5 h-3.5" aria-hidden />
            {g.heroKicker}
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4 leading-tight">
            {g.heroTitleLine1}
            <br className="hidden sm:block" />
            {g.heroTitleLine2}
          </h1>
          <p className="text-white/70 text-base sm:text-lg max-w-xl mx-auto mb-8 leading-relaxed">
            {g.heroSubtitle}
          </p>

          {/* Search */}
          <div className="relative max-w-lg mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={g.searchPlaceholder}
              aria-label={g.searchPlaceholder}
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">

        {/* Filter bar */}
        <section>
          <div className="flex flex-col gap-4">
            {/* Specialty pills */}
            <div className="flex flex-wrap gap-2">
              {SPECIALTIES.map(s => (
                <button
                  type="button"
                  key={s.value}
                  onClick={() => setSpecialty(s.value)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors ${
                    specialty === s.value
                      ? 'bg-gray-900 text-white'
                      : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {s.label(g)}
                </button>
              ))}
            </div>

            {/* Controls row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-3">
                {/* Certified toggle */}
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <div
                    role="checkbox"
                    aria-checked={certifiedOnly}
                    tabIndex={0}
                    onClick={() => setCertifiedOnly(v => !v)}
                    onKeyDown={e => e.key === 'Enter' && setCertifiedOnly(v => !v)}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${certifiedOnly ? 'bg-brand-500' : 'bg-gray-200'}`}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${certifiedOnly ? 'left-5' : 'left-0.5'}`} />
                  </div>
                  <span className="text-xs font-semibold text-gray-700">{g.certifiedToggle}</span>
                </label>

                {hasFilters && (
                  <button type="button" onClick={clearFilters}
                    className="text-xs text-gray-500 hover:text-gray-700 underline transition-colors">
                    {g.clearFilters}
                  </button>
                )}
              </div>

              <div className="flex items-center gap-3">
                <p className="text-sm text-gray-500 shrink-0">
                  {loading ? '…' : g.guideCount(total)}
                </p>
                {/* Sort dropdown */}
                <div className="relative">
                  <select
                    value={sort}
                    onChange={e => setSort(e.target.value as SortOption)}
                    className="appearance-none text-xs font-semibold text-gray-700 bg-white border border-gray-200 rounded-xl px-3 py-1.5 pr-7 focus:outline-none focus:border-brand-400 cursor-pointer"
                  >
                    <option value="rating">{g.sortRating}</option>
                    <option value="newest">{g.sortNewest}</option>
                    <option value="experience">{g.sortExperience}</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Grid */}
        <section>
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 h-64 animate-pulse" />
              ))}
            </div>
          ) : guides.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {guides.map(guide => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <Award className="w-10 h-10 text-gray-300 mx-auto mb-3" aria-hidden />
              <p className="text-gray-500 font-medium text-sm mb-1">{g.noResultsTitle}</p>
              <p className="text-gray-400 text-xs">{g.noResultsHint}</p>
              <button type="button" onClick={clearFilters}
                className="mt-4 text-sm text-brand-600 hover:text-brand-700 font-semibold underline transition-colors">
                {g.clearFilters}
              </button>
            </div>
          )}
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-brand-500 to-brand-600 rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">{g.ctaTitle}</h3>
          <p className="text-white/80 text-sm mb-5">{g.ctaSub}</p>
          <Link href="/guide-onboarding"
            className="inline-flex items-center gap-2 bg-white text-brand-700 font-bold text-sm px-6 py-3 rounded-xl hover:bg-brand-50 transition-colors shadow-lg">
            <Users className="w-4 h-4" aria-hidden />
            {g.ctaButton}
          </Link>
        </section>

      </div>
    </div>
  )
}
