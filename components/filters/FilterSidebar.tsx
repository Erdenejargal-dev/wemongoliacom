'use client'

import { SlidersHorizontal, RotateCcw, Star } from 'lucide-react'
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

const STYLES = [
  { label: 'All styles', value: 'any' },
  { label: 'Adventure', value: 'adventure' },
  { label: 'Cultural', value: 'cultural' },
  { label: 'Trekking', value: 'trekking' },
  { label: 'Photography', value: 'photography' },
  { label: 'Luxury', value: 'luxury' },
  { label: 'Budget', value: 'budget' },
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
            className="w-full accent-green-500" />
          <div className="flex justify-between text-xs text-gray-500">
            <span>${query.priceRange[0]}</span>
            <span>${query.priceRange[1]}</span>
          </div>
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
                  ? 'bg-green-50 text-green-700 font-medium border border-green-200'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}>
              {d.label}
            </button>
          ))}
        </div>
      </div>

      {/* Style */}
      <div>
        <SectionTitle>Tour Style</SectionTitle>
        <div className="flex flex-wrap gap-1.5">
          {STYLES.map(s => (
            <button key={s.value} onClick={() => onUpdate({ style: s.value })}
              className={`px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                query.style === s.value
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'border-gray-200 text-gray-600 hover:border-gray-400'
              }`}>
              {s.label}
            </button>
          ))}
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
                  ? 'bg-green-50 text-green-700 font-medium border border-green-200'
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
