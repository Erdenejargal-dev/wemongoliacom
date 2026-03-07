'use client'

import { Search, SlidersHorizontal } from 'lucide-react'
import type { ReactNode } from 'react'

interface FilterOption {
  label: string
  value: string
}

interface TableToolbarProps {
  searchValue: string
  onSearchChange: (v: string) => void
  searchPlaceholder?: string
  filters?: { label: string; value: string; options: FilterOption[]; onChange: (v: string) => void }[]
  actions?: ReactNode
}

export function TableToolbar({ searchValue, onSearchChange, searchPlaceholder = 'Search…', filters, actions }: TableToolbarProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between mb-4">
      <div className="flex flex-wrap gap-3 items-center flex-1">
        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchValue}
            onChange={e => onSearchChange(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
          />
        </div>

        {/* Filters */}
        {filters?.map(f => (
          <div key={f.label} className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-gray-400" />
            <select
              value={f.value}
              onChange={e => f.onChange(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10 bg-white"
            >
              {f.options.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
