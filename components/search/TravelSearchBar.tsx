'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Search } from 'lucide-react'
import { DestinationAutocomplete } from './DestinationAutocomplete'
import { DateRangePicker } from './DateRangePicker'
import { GuestSelector } from './GuestSelector'

interface TravelSearchBarProps {
  variant?: 'hero' | 'compact'
  initialDestination?: string
}

export function TravelSearchBar({ variant = 'hero', initialDestination = '' }: TravelSearchBarProps) {
  const router = useRouter()
  const [destination, setDestination] = useState(initialDestination)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [guests, setGuests] = useState({ adults: 1, children: 0 })

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (destination) params.set('destination', destination)
    if (startDate) params.set('startDate', startDate)
    if (endDate) params.set('endDate', endDate)
    params.set('adults', String(guests.adults))
    params.set('children', String(guests.children))
    router.push(`/tours?${params.toString()}`)
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 bg-white rounded-xl border border-gray-200 shadow-sm p-1.5">
        <DestinationAutocomplete value={destination} onChange={setDestination} className="flex-1 min-w-0" />
        <button onClick={handleSearch}
          className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-lg transition-colors shrink-0">
          <Search className="w-4 h-4" />
          Search
        </button>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-2xl shadow-2xl shadow-black/10 border border-gray-100 p-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
        {/* Destination */}
        <DestinationAutocomplete value={destination} onChange={setDestination} placeholder="Where to?" />

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
          onClick={handleSearch}
          className="flex items-center justify-center gap-2 w-full py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-green-200 active:scale-[0.98]"
        >
          <Search className="w-4 h-4" />
          Search Tours
        </button>
      </div>
    </div>
  )
}
