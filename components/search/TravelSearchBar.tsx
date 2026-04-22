'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { DestinationAutocomplete } from './DestinationAutocomplete'
import { DateRangePicker } from './DateRangePicker'
import { GuestSelector } from './GuestSelector'
import type { SearchQuery } from '@/lib/search/types'
import { useTranslations } from '@/lib/i18n'

interface TravelSearchBarProps {
  variant?: 'hero' | 'compact'
  initialDestination?: string
  /** Current filters to preserve when searching (compact variant on /tours) */
  currentFilters?: SearchQuery
  /** Called when search is submitted (compact) — merge destination into filters and navigate */
  onSearch?: (destination: string) => void
}

export function TravelSearchBar({ variant = 'hero', initialDestination = '', currentFilters, onSearch }: TravelSearchBarProps) {
  const { t } = useTranslations()
  const tr = t.browse.travel
  const router = useRouter()
  const [destination, setDestination] = useState(initialDestination)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [guests, setGuests] = useState(currentFilters?.guests ?? { adults: 1, children: 0 })

  const handleSearch = () => {
    if (variant === 'compact' && currentFilters && onSearch) {
      onSearch(destination)
      return
    }
    // Hero variant: navigate with destination + guests + dates (params backend search uses)
    const params = new URLSearchParams()
    if (destination) params.set('destination', destination)
    const guestCount = guests.adults + guests.children
    if (guestCount > 1) params.set('guests', String(guestCount))
    if (startDate) params.set('fromDate', startDate)
    if (endDate) params.set('toDate', endDate)
    router.push(`/tours?${params.toString()}`)
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 shadow-sm p-1.5">
        <DestinationAutocomplete value={destination} onChange={setDestination} className="flex-1 min-w-0" />
        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center gap-2 px-4 py-2 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-lg transition-colors shrink-0"
          aria-label={tr.search}
        >
          <Search className="w-4 h-4" />
          {tr.search}
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        {/* Destination */}
        <DestinationAutocomplete value={destination} onChange={setDestination} placeholder={tr.placeholderWhere} />

        {/* Dates */}
        <DateRangePicker
          startDate={startDate} endDate={endDate}
          onStartChange={setStartDate} onEndChange={setEndDate}
          className="sm:col-span-2 lg:col-span-1"
        />

        {/* Guests */}
        <GuestSelector value={guests} onChange={setGuests} />

        {/* Search button */}
        <button
          type="button"
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 w-full py-3 bg-brand-500 hover:bg-brand-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-brand-200 active:scale-[0.98]"
          aria-label={tr.searchTours}
        >
          <Search className="w-4 h-4" />
          {tr.searchTours}
        </button>
      </div>
    </div>
  )
}
