'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import { X, ChevronRight,
  LayoutDashboard, Plus, Compass, CalendarCheck, CalendarDays,
  Star, MessageSquare, CreditCard, BarChart2, Settings,
  Car, BedDouble,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { buildProviderMenu, SECTION_LABELS, type MenuSection } from '@/lib/provider-menu'
import { mockProviders, PROVIDER_TYPE_META, type Provider, type ProviderType } from '@/lib/mock-data/provider'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Plus,
  Compass,
  CalendarCheck,
  CalendarDays,
  Star,
  MessageSquare,
  CreditCard,
  BarChart2,
  Settings,
  Car,
  BedDouble,
}

interface DashboardSidebarProps {
  open: boolean
  onClose: () => void
}

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const [provider, setProvider]   = useState<Provider | null>(null)
  const [activeId, setActiveId]   = useState<string | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wm_provider')
      if (stored) setProvider(JSON.parse(stored))
      else setProvider(mockProviders[0])
    } catch {
      setProvider(mockProviders[0])
    }
    // Restore last-clicked nav item
    const savedActive = localStorage.getItem('wm_nav_active')
    if (savedActive) setActiveId(savedActive)
  }, [])

  // When pathname changes (e.g. browser back/forward), clear the saved id
  // so active falls back to url matching for items with unique hrefs
  useEffect(() => {
    setActiveId(prev => {
      if (!prev) return prev
      // Keep the saved id only if its href still matches the current pathname
      const allItems = buildProviderMenu(provider?.providerTypes ?? ['tour_operator'])
        .flatMap(s => s.items)
      const saved = allItems.find(i => i.id === prev)
      return saved?.href === pathname ? prev : null
    })
  }, [pathname, provider])

  function handleItemClick(id: string) {
    setActiveId(id)
    localStorage.setItem('wm_nav_active', id)
    onClose()
  }

  const providerTypes: ProviderType[] = provider?.providerTypes ?? ['tour_operator']
  const sections = buildProviderMenu(providerTypes)

  /** Determine if a menu item is active:
   *  - If we have a stored activeId AND the current pathname matches one of the
   *    items in the menu → use id comparison (prevents dual-highlight)
   *  - Otherwise fall back to pathname match
   */
  function isActive(item: { id: string; href: string }): boolean {
    if (activeId) return activeId === item.id
    return pathname === item.href
  }

  return (
    <>
      {/* Mobile overlay */}
      {open && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={onClose} />
      )}

      <aside className={cn(
        'fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-100 z-40 flex flex-col transition-transform duration-200',
        'md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Brand */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5" onClick={onClose}>
            <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center">
              <span className="text-white text-xs font-bold">WM</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">We Mongolia</span>
          </Link>
          <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-gray-100">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider info */}
        {provider && (
          <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/40">
            <p className="text-xs font-bold text-gray-900 truncate">{provider.name}</p>
            <div className="flex flex-wrap gap-1 mt-1">
              {providerTypes.map(t => (
                <span key={t} className="text-[9px] font-semibold text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded-full">
                  {PROVIDER_TYPE_META[t].icon} {SECTION_LABELS[t]}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-3 px-3 space-y-1">
          {sections.map(sec => (
            <div key={sec.key}>
              {sec.label && (
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-2 pt-3 pb-1">
                  {sec.label}
                </p>
              )}
              {sec.items.map(item => {
                const IconComp = ICON_MAP[item.icon]
                const active = isActive(item)
                return (
                  <Link
                    key={item.id}
                    href={item.href}
                    onClick={() => handleItemClick(item.id)}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors',
                      active
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    {IconComp && (
                      <IconComp className={cn('w-4 h-4 shrink-0', active ? 'text-white' : 'text-gray-400')} />
                    )}
                    {item.label}
                    {active && <ChevronRight className="w-3 h-3 ml-auto" />}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {provider?.name?.charAt(0) ?? 'B'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{provider?.name ?? 'Business Admin'}</p>
              <p className="text-[10px] text-gray-400 truncate">{provider?.email ?? 'admin@wemongolia.com'}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
