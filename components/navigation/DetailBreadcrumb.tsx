import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

export type BreadcrumbSegment = { href: string; label: string }

type Variant = 'slash' | 'chevron'

export function DetailBreadcrumb({
  ariaLabel,
  items,
  currentTitle,
  variant = 'slash',
  bar = false,
  className,
}: {
  ariaLabel: string
  items: BreadcrumbSegment[]
  currentTitle: string
  variant?: Variant
  /** Full-width top bar (e.g. hosts) */
  bar?: boolean
  className?: string
}) {
  const renderSeparator = () =>
    variant === 'chevron' ? (
      <ChevronRight className="w-3 h-3 shrink-0 text-gray-400" aria-hidden />
    ) : (
      <span className="shrink-0" aria-hidden>
        /
      </span>
    )

  const nav = (
    <nav
      className="flex items-center gap-1.5 text-xs text-gray-500 min-w-0"
      aria-label={ariaLabel}
    >
      {items.map((item, i) => (
        <span key={item.href} className="flex items-center gap-1.5 min-w-0">
          {i > 0 && renderSeparator()}
          <Link
            href={item.href}
            className="hover:text-gray-800 transition-colors shrink-0 hover:text-gray-700"
          >
            {item.label}
          </Link>
        </span>
      ))}
      <span className="flex items-center gap-1.5 min-w-0">
        {items.length > 0 && renderSeparator()}
        <span className="text-gray-900 font-medium truncate max-w-[200px]">{currentTitle}</span>
      </span>
    </nav>
  )

  if (bar) {
    return (
      <div className={cn('bg-white border-b border-gray-100', className)}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-10 flex items-center min-w-0">
          {nav}
        </div>
      </div>
    )
  }

  return (
    <div className={cn('max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-2 min-w-0', className)}>
      {nav}
    </div>
  )
}
