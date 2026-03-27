'use client'

import { SlidersHorizontal, RotateCcw, Star, MapPin, Users } from 'lucide-react'
import type { SearchQuery } from '@/lib/search/types'

interface FilterSidebarProps {
  query: SearchQuery
  onUpdate: (patch: Partial<SearchQuery>) => void
  onReset: () => void
  total: number
}

const DURATIONS = [
  { label: 'Any duration', value: 'any' },
  { label: '1 Day', value: '1' },
  { label: '2–3 Days', value: '2-3' },
  { label: '4–7 Days', value: '4-7' },
  { label: '8+ Days', value: '8+' },
]

const REGIONS = [
  { label: 'All regions', value: '' },
  { label: 'Gobi Desert', value: 'gobi' },
  { label: 'Khangai Mountains', value: 'khangai' },
  { label: 'Lake Khuvsgul', value: 'khuvsgul' },
  { label: 'Ulaanbaatar', value: 'ulaanbaatar' },
  { label: 'Altai Mountains', value: 'altai' },
  { label: 'Central Steppes', value: 'steppe' },
]

const GROUP_SIZES = [
  { label: '1', value: 1 },
  { label: '2', value: 2 },
  { label: '3', value: 3 },
  { label: '4', value: 4 },
  { label: '5', value: 5 },
  { label: '6+', value: 6 },
]

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">{children}</p>
}

export function FilterSidebar({ query, onUpdate, onReset, total }: FilterSidebarProps) {
  return (
    <aside className="w-full space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-500" />
          <span className="text-sm font-semibold text-gray-900">Filters</span>
        </div>
        <button onClick={onReset} className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors">
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      {/* Price Range */}
      <div>
        <SectionTitle>Price (USD / person)</SectionTitle>
        <div className="space-y-2">
          <input type="range" min={0} max={2000} step={50}
            value={query.priceRange[1]}
            onChange={e => onUpdate({ priceRange: [query.priceRange[0], Number(e.target.value)] })}
            className="w-full accent-brand-500" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>${query.priceRange[0]}</span>
            <span>${query.priceRange[1]}</span>
          </div>
        </div>
      </div>

      {/* Departure dates — filters by real scheduled departure dates */}
      <div>
        <SectionTitle>Departure dates</SectionTitle>
        <p className="text-xs text-gray-500 mb-2">Filter by scheduled departure date</p>
        <div className="space-y-2">
          <div>
            <label className="text-[10px] text-gray-400 block mb-0.5">From</label>
            <input
              type="date"
              min={new Date().toISOString().slice(0, 10)}
              value={query.fromDate || ''}
              onChange={e => onUpdate({ fromDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20"
            />
          </div>
          <div>
            <label className="text-[10px] text-gray-400 block mb-0.5">To</label>
            <input
              type="date"
              min={query.fromDate || new Date().toISOString().slice(0, 10)}
              value={query.toDate || ''}
              onChange={e => onUpdate({ toDate: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:border-brand-400 focus:ring-1 focus:ring-brand-400/20"
            />
          </div>
          {(query.fromDate || query.toDate) && (
            <button
              onClick={() => onUpdate({ fromDate: '', toDate: '' })}
              className="text-xs text-brand-600 hover:text-brand-700"
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      {/* Region (backend-supported) */}
      <div>
        <SectionTitle>Region</SectionTitle>
        <div className="space-y-1">
          {REGIONS.map(r => (
            <button key={r.value || 'all'} onClick={() => onUpdate({ region: r.value })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                query.region === r.value
                  ? 'bg-brand-50 text-brand-700 font-medium border border-brand-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {r.value && <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />}
              {r.label}
            </button>
          ))}
        </div>
      </div>

      {/* Duration */}
      <div>
        <SectionTitle>Duration</SectionTitle>
        <div className="space-y-1">
          {DURATIONS.map(d => (
            <button key={d.value} onClick={() => onUpdate({ durationFilter: d.value })}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                query.durationFilter === d.value
                  ? 'bg-brand-50 text-brand-700 font-medium border border-brand-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Group size (guests) — filters tours with future departures that fit party size */}
      <div>
        <SectionTitle>Group size</SectionTitle>
        <p className="text-xs text-gray-500 mb-2">Tours with future departures that fit your party</p>
        <div className="flex flex-wrap gap-1.5">
          {GROUP_SIZES.map(g => {
            const total = (query.guests?.adults ?? 1) + (query.guests?.children ?? 0)
            const isActive = total === g.value || (g.value === 6 && total >= 6)
            return (
              <button
                key={g.value}
                onClick={() => onUpdate({ guests: { adults: g.value, children: 0 } })}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  isActive ? 'bg-brand-50 text-brand-700 border-brand-200' : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Users className="w-3 h-3" />
                {g.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Rating */}
      <div>
        <SectionTitle>Minimum Rating</SectionTitle>
        <div className="space-y-1">
          {[0, 3, 4, 4.5].map(r => (
            <button key={r} onClick={() => onUpdate({ rating: r })}
              className={`flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm transition-colors ${
                query.rating === r
                  ? 'bg-brand-50 text-brand-700 font-medium border border-brand-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {r === 0 ? 'Any rating' : (
                <>
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {r}+ stars
                </>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Result count */}
      <p className="text-xs text-gray-400 border-t border-gray-100 pt-4">
        {total} tour{total !== 1 ? 's' : ''} match your filters
      </p>
    </aside>
  )
}
