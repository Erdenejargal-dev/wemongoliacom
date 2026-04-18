'use client'

import { useState, type CSSProperties } from 'react'
import { ChevronRight } from 'lucide-react'

export interface BankDeeplinkCardProps {
  href: string
  /** Primary display name */
  name: string
  /** Secondary line (e.g. local language) */
  description?: string | null
  logoUrl?: string | null
  /** Reserved for future App Store / Play deep links */
  appStoreId?: string
  androidPackageName?: string
  accent: string
}

function initialsFromName(name: string): string {
  const t = name.trim()
  if (!t) return '?'
  const parts = t.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase()
  }
  return t.slice(0, 2).toUpperCase()
}

/**
 * Polished bank-app row: logo, name, description, open affordance.
 * Opens `href` in the same tab / app scheme as a normal anchor.
 */
export function BankDeeplinkCard({
  href,
  name,
  description,
  logoUrl,
  appStoreId,
  androidPackageName,
  accent,
}: BankDeeplinkCardProps) {
  const [logoFailed, setLogoFailed] = useState(false)
  const showLogo = Boolean(logoUrl?.trim()) && !logoFailed

  const accentVar: CSSProperties = { ['--checkout-accent' as string]: accent }

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      data-app-store-id={appStoreId || undefined}
      data-android-package={androidPackageName || undefined}
      className="group flex w-full items-stretch gap-4 rounded-2xl border border-slate-200/95 bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md active:scale-[0.99] sm:p-4"
      style={accentVar}
    >
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-slate-200/90 bg-slate-50">
        {showLogo ? (
          // eslint-disable-next-line @next/next/no-img-element -- remote Bonum CDN URLs; no Next Image domains configured
          <img
            src={logoUrl!}
            alt=""
            className="h-full w-full object-contain p-1"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setLogoFailed(true)}
          />
        ) : (
          <div
            className="flex h-full w-full items-center justify-center text-sm font-bold tracking-tight text-white"
            style={{ background: `linear-gradient(145deg, ${accent}, #026ba3)` }}
            aria-hidden
          >
            {initialsFromName(name)}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1 py-0.5">
        <p className="truncate text-[15px] font-semibold leading-snug text-slate-900">{name}</p>
        {description?.trim() ? (
          <p className="mt-0.5 line-clamp-2 text-sm leading-relaxed text-slate-600">{description.trim()}</p>
        ) : null}
        <p className="mt-2 text-xs font-medium text-slate-500 opacity-0 transition group-hover:opacity-100 sm:opacity-100">
          Opens your bank app
        </p>
      </div>

      <div className="flex shrink-0 flex-col items-end justify-center gap-1 self-center">
        <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-slate-600 transition group-hover:border-[var(--checkout-accent)] group-hover:bg-[var(--checkout-accent)] group-hover:text-white group-hover:shadow-sm">
          <ChevronRight className="h-5 w-5 transition group-hover:translate-x-0.5" />
        </span>
      </div>
    </a>
  )
}
