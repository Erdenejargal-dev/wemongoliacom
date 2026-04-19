'use client'

/**
 * components/layout/navbar/PreferenceSwitcher.tsx
 *
 * Phase 6 — UX + Growth Layer. Compact language + currency switcher for the
 * public navbar. Renders as a single pill that opens a small popover. On
 * mobile the same pill is reused inside MobileMenu — see `MobileMenu.tsx`.
 *
 * We never reload the page on change; consumers of `usePreferences()` re-render
 * locally. Currency change is also broadcast via the existing storage key so
 * legacy `useDisplayCurrency()` consumers (e.g. TourBookingCard) pick it up
 * without any extra wiring.
 */

import * as React from 'react'
import { Check, Globe, ChevronDown } from 'lucide-react'
import { usePreferences } from '@/components/providers/PreferencesProvider'
import type { Currency } from '@/lib/money'
import type { Language } from '@/components/providers/PreferencesProvider'

const LANG_OPTIONS: { value: Language; label: string; native: string }[] = [
  { value: 'en', label: 'English',  native: 'EN' },
  { value: 'mn', label: 'Монгол',  native: 'MN' },
]

const CUR_OPTIONS: { value: Currency; label: string }[] = [
  { value: 'MNT', label: '₮ MNT' },
  { value: 'USD', label: '$ USD' },
]

export function PreferenceSwitcher({ compact = false }: { compact?: boolean }) {
  const { currency, language, setCurrency, setLanguage } = usePreferences()
  const [open, setOpen] = React.useState(false)
  const wrapRef = React.useRef<HTMLDivElement>(null)

  // Close on outside click / Esc — standard popover hygiene.
  React.useEffect(() => {
    if (!open) return
    function onDoc(e: MouseEvent) {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false)
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDoc)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const currentLang = LANG_OPTIONS.find((l) => l.value === language) ?? LANG_OPTIONS[0]
  const currentCur  = CUR_OPTIONS.find((c) => c.value === currency) ?? CUR_OPTIONS[0]

  return (
    <div ref={wrapRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={[
          'flex items-center gap-1.5 rounded-lg text-sm font-medium text-gray-600',
          'hover:text-gray-900 hover:bg-gray-50 transition-colors',
          compact ? 'px-2 py-1.5' : 'px-3 py-1.5',
        ].join(' ')}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Change language or currency"
      >
        <Globe className="w-4 h-4 text-gray-500" />
        <span className="hidden sm:inline">{currentLang.native}</span>
        <span className="hidden sm:inline text-gray-300">·</span>
        <span>{currentCur.label}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 w-64 rounded-xl border border-gray-100 bg-white shadow-lg p-3 z-50"
        >
          <div className="mb-3">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Language</p>
            <div className="grid grid-cols-2 gap-1.5">
              {LANG_OPTIONS.map((opt) => {
                const selected = opt.value === language
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setLanguage(opt.value)}
                    className={[
                      'flex items-center justify-between px-3 py-2 rounded-lg text-sm',
                      selected
                        ? 'bg-brand-50 text-brand-800 border border-brand-200'
                        : 'border border-transparent text-gray-700 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <span>{opt.label}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                )
              })}
            </div>
          </div>

          <div>
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wide mb-1.5">Currency</p>
            <div className="grid grid-cols-2 gap-1.5">
              {CUR_OPTIONS.map((opt) => {
                const selected = opt.value === currency
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setCurrency(opt.value)}
                    className={[
                      'flex items-center justify-between px-3 py-2 rounded-lg text-sm',
                      selected
                        ? 'bg-brand-50 text-brand-800 border border-brand-200'
                        : 'border border-transparent text-gray-700 hover:bg-gray-50',
                    ].join(' ')}
                  >
                    <span>{opt.label}</span>
                    {selected && <Check className="w-3.5 h-3.5 text-brand-600" />}
                  </button>
                )
              })}
            </div>
          </div>

          <p className="mt-3 text-[11px] leading-relaxed text-gray-400">
            Prices may be displayed in your chosen currency. Payments are processed
            in the listing&apos;s original currency.
          </p>
        </div>
      )}
    </div>
  )
}
