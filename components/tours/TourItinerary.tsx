'use client'

import { useState } from 'react'
import { ChevronDown, MapPin, Bed, Utensils } from 'lucide-react'
import type { TourItineraryDay } from '@/lib/mock-data/tourDetails'

interface TourItineraryProps {
  itinerary: TourItineraryDay[]
}

export function TourItinerary({ itinerary }: TourItineraryProps) {
  const [openDays, setOpenDays] = useState<Set<number>>(new Set([1]))

  const toggle = (day: number) => {
    setOpenDays(prev => {
      const next = new Set(prev)
      next.has(day) ? next.delete(day) : next.add(day)
      return next
    })
  }

  const expandAll = () => setOpenDays(new Set(itinerary.map(d => d.day)))
  const collapseAll = () => setOpenDays(new Set())

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-gray-900">Day-by-Day Itinerary</h2>
        <div className="flex gap-3">
          <button onClick={expandAll} className="text-xs text-green-600 hover:text-green-700 font-medium transition-colors">Expand all</button>
          <span className="text-gray-300">|</span>
          <button onClick={collapseAll} className="text-xs text-gray-500 hover:text-gray-700 font-medium transition-colors">Collapse all</button>
        </div>
      </div>

      <div className="space-y-2">
        {itinerary.map((day, idx) => {
          const isOpen = openDays.has(day.day)
          const isLast = idx === itinerary.length - 1
          return (
            <div key={day.day} className="border border-gray-100 rounded-2xl overflow-hidden bg-white">
              <button
                onClick={() => toggle(day.day)}
                className="flex items-center justify-between w-full px-5 py-4 text-left hover:bg-gray-50/70 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {/* Day badge */}
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isOpen ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-600'}`}>
                    Day {day.day}
                  </span>
                  <span className="text-sm font-semibold text-gray-900">{day.title}</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
              </button>

              {isOpen && (
                <div className="px-5 pb-5 border-t border-gray-50">
                  <p className="text-sm text-gray-600 leading-relaxed mt-3 mb-3">{day.description}</p>

                  {/* Activities */}
                  <ul className="space-y-1.5 mb-3">
                    {day.activities.map((a, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-400 shrink-0" />
                        {a}
                      </li>
                    ))}
                  </ul>

                  {/* Meta pills */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {day.accommodation && (
                      <span className="flex items-center gap-1.5 text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full">
                        <Bed className="w-3 h-3" />{day.accommodation}
                      </span>
                    )}
                    {day.meals && (
                      <span className="flex items-center gap-1.5 text-xs bg-amber-50 text-amber-700 px-2.5 py-1 rounded-full">
                        <Utensils className="w-3 h-3" />{day.meals}
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
