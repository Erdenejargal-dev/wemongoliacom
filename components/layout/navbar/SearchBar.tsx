'use client'

import { useState } from 'react'
import { Search, MapPin, CalendarDays, Users, X } from 'lucide-react'

interface SearchBarProps {
  onClose: () => void
}

export function SearchBar({ onClose }: SearchBarProps) {
  const [destination, setDestination] = useState('')
  const [date, setDate] = useState('')
  const [guests, setGuests] = useState('')

  return (
    <div className="absolute inset-x-0 top-full bg-white border-b border-gray-100 shadow-lg z-40">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center gap-3">
          {/* Where */}
          <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-400/10 transition-all">
            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Where</p>
              <input
                value={destination}
                onChange={e => setDestination(e.target.value)}
                placeholder="Search destinations…"
                className="w-full text-sm text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-gray-200 hidden sm:block" />

          {/* When */}
          <div className="flex-1 flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-400/10 transition-all">
            <CalendarDays className="w-4 h-4 text-gray-400 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">When</p>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full text-sm text-gray-900 bg-transparent focus:outline-none"
              />
            </div>
          </div>

          {/* Divider */}
          <div className="w-px h-10 bg-gray-200 hidden sm:block" />

          {/* Guests */}
          <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-400/10 transition-all min-w-[140px]">
            <Users className="w-4 h-4 text-gray-400 shrink-0" />
            <div>
              <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wide">Guests</p>
              <input
                type="number"
                min="1"
                value={guests}
                onChange={e => setGuests(e.target.value)}
                placeholder="Add guests"
                className="w-full text-sm text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400"
              />
            </div>
          </div>

          {/* Search button */}
          <button className="flex items-center gap-2 px-5 py-3 bg-green-500 hover:bg-green-600 text-white text-sm font-semibold rounded-xl transition-colors shadow-sm shadow-green-200">
            <Search className="w-4 h-4" />
            <span className="hidden sm:inline">Search</span>
          </button>

          {/* Close */}
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors text-gray-500">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick suggestions */}
        <div className="flex items-center gap-2 mt-3 flex-wrap">
          <span className="text-xs text-gray-400">Popular:</span>
          {['Gobi Desert', 'Lake Khövsgöl', 'Ulaanbaatar', 'Terelj'].map(s => (
            <button key={s} onClick={() => setDestination(s)}
              className="text-xs px-3 py-1 bg-gray-100 hover:bg-green-50 hover:text-green-700 text-gray-600 rounded-full transition-colors border border-gray-200 hover:border-green-200">
              {s}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
