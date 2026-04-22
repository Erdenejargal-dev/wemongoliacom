'use client'

import { useState, useRef, useEffect } from 'react'
import { MapPin, Search, X } from 'lucide-react'
import { DESTINATIONS } from '@/lib/search/types'
import { useTranslations } from '@/lib/i18n'

interface DestinationAutocompleteProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  className?: string
}

export function DestinationAutocomplete({ value, onChange, placeholder, className }: DestinationAutocompleteProps) {
  const { t } = useTranslations()
  const tr = t.browse.travel
  const ph = placeholder ?? tr.placeholderWhere
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [activeIdx, setActiveIdx] = useState(-1)
  const ref = useRef<HTMLDivElement>(null)

  const filtered = value.trim()
    ? DESTINATIONS.filter(d => d.toLowerCase().includes(value.toLowerCase()))
    : DESTINATIONS

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleKey = (e: React.KeyboardEvent) => {
    if (!open) return
    if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, filtered.length - 1)) }
    if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)) }
    if (e.key === 'Enter' && activeIdx >= 0) { onChange(filtered[activeIdx]); setOpen(false) }
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div className={`flex items-center gap-2 ${focused ? 'ring-2 ring-brand-400/20 border-brand-400' : 'border-gray-200'} border rounded-xl px-3 py-2.5 bg-white transition-all`}>
        <MapPin className="w-4 h-4 text-brand-500 shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wide">{tr.whereLabel}</p>
          <input
            value={value}
            onChange={e => { onChange(e.target.value); setOpen(true); setActiveIdx(-1) }}
            onFocus={() => { setFocused(true); setOpen(true) }}
            onBlur={() => setFocused(false)}
            onKeyDown={handleKey}
            placeholder={ph}
            aria-label={ph}
            className="w-full text-sm text-gray-900 bg-transparent focus:outline-none placeholder:text-gray-400"
          />
        </div>
        {value && (
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false) }}
            className="text-gray-400 hover:text-gray-600"
            title={t.common.close}
            aria-label={t.common.close}
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-xl border border-gray-100 shadow-xl z-50 overflow-hidden">
          <div className="p-1">
            {filtered.map((dest, i) => (
              <button
                key={dest}
                onMouseDown={() => { onChange(dest); setOpen(false) }}
                className={`flex items-center gap-2.5 w-full px-3 py-2.5 text-sm rounded-lg text-left transition-colors ${i === activeIdx ? 'bg-brand-50 text-brand-700' : 'hover:bg-gray-50 text-gray-700'}`}
              >
                <MapPin className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                {dest}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
