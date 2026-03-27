'use client'

import { CalendarDays } from 'lucide-react'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartChange: (v: string) => void
  onEndChange: (v: string) => void
  className?: string
}

export function DateRangePicker({ startDate, endDate, onStartChange, onEndChange, className }: DateRangePickerProps) {
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className={`flex items-stretch gap-0 ${className}`}>
      {/* Start date */}
      <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-l-xl px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-brand-400/20 focus-within:border-brand-400 transition-all">
        <CalendarDays className="w-4 h-4 text-brand-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Check in</p>
          <input
            type="date"
            value={startDate}
            min={today}
            onChange={e => { onStartChange(e.target.value); if (endDate && e.target.value > endDate) onEndChange('') }}
            className="w-full text-sm text-gray-900 bg-transparent focus:outline-none"
          />
        </div>
      </div>

      {/* Divider */}
      <div className="w-px bg-gray-200 self-stretch" />

      {/* End date */}
      <div className="flex-1 flex items-center gap-2 border border-gray-200 rounded-r-xl px-3 py-2.5 bg-white focus-within:ring-2 focus-within:ring-brand-400/20 focus-within:border-brand-400 transition-all">
        <CalendarDays className="w-4 h-4 text-brand-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">Check out</p>
          <input
            type="date"
            value={endDate}
            min={startDate || today}
            onChange={e => onEndChange(e.target.value)}
            className="w-full text-sm text-gray-900 bg-transparent focus:outline-none"
          />
        </div>
      </div>
    </div>
  )
}
