'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

type DayState = 'available' | 'booked' | 'blocked' | 'empty'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const initialBooked = new Set([5, 6, 12, 13, 19, 20, 26])
const initialBlocked = new Set([3, 17, 24])

export function CalendarGrid() {
  const today = new Date()
  const [viewDate, setViewDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1))
  const [dayStates, setDayStates] = useState<Map<string, DayState>>(new Map())

  const year = viewDate.getFullYear()
  const month = viewDate.getMonth()
  const monthLabel = viewDate.toLocaleString('default', { month: 'long', year: 'numeric' })
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()

  const getKey = (d: number) => `${year}-${month}-${d}`

  const getDayState = (d: number): DayState => {
    const key = getKey(d)
    if (dayStates.has(key)) return dayStates.get(key)!
    if (initialBooked.has(d)) return 'booked'
    if (initialBlocked.has(d)) return 'blocked'
    return 'available'
  }

  const toggle = (d: number) => {
    const key = getKey(d)
    const cur = getDayState(d)
    const next: DayState = cur === 'available' ? 'blocked' : cur === 'blocked' ? 'booked' : 'available'
    setDayStates(prev => new Map(prev).set(key, next))
  }

  const cells: (number | null)[] = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ]

  const stateStyles: Record<DayState, string> = {
    available: 'bg-brand-50 text-brand-700 hover:bg-brand-100 border-brand-200',
    booked:    'bg-blue-50 text-blue-700 border-blue-200 cursor-default',
    blocked:   'bg-red-50 text-red-600 border-red-200',
    empty:     '',
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-gray-900">{monthLabel}</h3>
        <div className="flex items-center gap-1">
          <button onClick={() => setViewDate(new Date(year, month - 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button onClick={() => setViewDate(new Date(year, month + 1, 1))} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Day labels */}
      <div className="grid grid-cols-7 mb-2">
        {DAYS.map(d => (
          <div key={d} className="text-center text-xs font-medium text-gray-400 py-1">{d}</div>
        ))}
      </div>

      {/* Day cells */}
      <div className="grid grid-cols-7 gap-1">
        {cells.map((d, i) => {
          if (!d) return <div key={`empty-${i}`} />
          const state = getDayState(d)
          const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear()
          return (
            <button
              key={d}
              onClick={() => toggle(d)}
              className={cn(
                'aspect-square flex items-center justify-center text-sm rounded-lg border transition-colors',
                stateStyles[state],
                isToday && 'ring-2 ring-gray-900 ring-offset-1'
              )}
            >
              {d}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50">
        {(['available', 'booked', 'blocked'] as DayState[]).map(s => (
          <div key={s} className="flex items-center gap-1.5">
            <div className={cn('w-3 h-3 rounded-sm border', stateStyles[s])} />
            <span className="text-xs text-gray-500 capitalize">{s}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
