'use client'

import { useState, useRef, useEffect } from 'react'
import { useTranslations } from '@/lib/i18n'
import { Users, Plus, Minus, ChevronDown } from 'lucide-react'

interface GuestSelectorProps {
  value: { adults: number; children: number }
  onChange: (v: { adults: number; children: number }) => void
  className?: string
}

function Counter({ label, sub, value, onChange, min = 0, max = 20 }: { label: string; sub: string; value: number; onChange: (v: number) => void; min?: number; max?: number }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-400">{sub}</p>
      </div>
      <div className="flex items-center gap-3">
        <button type="button" onClick={() => onChange(Math.max(min, value - 1))} disabled={value <= min}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <Minus className="w-3.5 h-3.5" />
        </button>
        <span className="w-6 text-center text-sm font-semibold text-gray-900">{value}</span>
        <button type="button" onClick={() => onChange(Math.min(max, value + 1))} disabled={value >= max}
          className="w-8 h-8 rounded-full border border-gray-200 flex items-center justify-center text-gray-600 hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}

export function GuestSelector({ value, onChange, className }: GuestSelectorProps) {
  const { t } = useTranslations()
  const tr = t.browse.travel
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const total = value.adults + value.children
  const guestLine =
    total === 0 ? tr.addGuests : tr.guestSummary(total)

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-2 w-full border rounded-xl px-3 py-2.5 bg-white text-left transition-all ${open ? 'ring-2 ring-brand-400/20 border-brand-400' : 'border-gray-200 hover:border-gray-300'}`}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={tr.travelers}
      >
        <Users className="w-4 h-4 text-brand-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{tr.travelers}</p>
          <p className="text-sm text-gray-900">{guestLine}</p>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-100 shadow-xl z-50 p-4">
          <div className="divide-y divide-gray-50">
            <Counter label={tr.adults} sub={tr.adultsSub} value={value.adults} onChange={v => onChange({ ...value, adults: v })} min={1} max={20} />
            <Counter label={tr.children} sub={tr.childrenSub} value={value.children} onChange={v => onChange({ ...value, children: v })} min={0} max={10} />
          </div>
          <button type="button" onClick={() => setOpen(false)} className="w-full mt-3 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
            {tr.done}
          </button>
        </div>
      )}
    </div>
  )
}
