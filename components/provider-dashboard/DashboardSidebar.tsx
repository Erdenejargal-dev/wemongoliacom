'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { X, ChevronRight, LayoutDashboard, CalendarCheck, MessageSquare, Star, BarChart2, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { apiClient } from '@/lib/api/client'
import { buildProviderMenu, SECTION_LABELS, type ProviderType } from '@/lib/provider-menu'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  CalendarCheck,
  MessageSquare,
  Star,
  BarChart2,
  Settings,
}

interface DashboardSidebarProps {
  open: boolean
  onClose: () => void
}

export function DashboardSidebar({ open, onClose }: DashboardSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [provider, setProvider] = useState<{
    id: string
    name: string
    email?: string | null
    providerTypes: ProviderType[]
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(() => {
    try {
      return localStorage.getItem('wm_nav_active')
    } catch {
      return null
    }
  })

  // Derive the effective active id from state + current pathname.
  const effectiveActiveId = (() => {
    if (!activeId) return null
    const allItems = buildProviderMenu(provider?.providerTypes ?? ['tour_operator']).flatMap(s => s.items)
    const saved = allItems.find(i => i.id === activeId)
    return saved?.href === pathname ? activeId : null
  })()

  function handleItemClick(id: string) {
    setActiveId(id)
    localStorage.setItem('wm_nav_active', id)
    onClose()
  }

  useEffect(() => {
    let alive = true
    async function load() {
      if (!token) {
        setLoading(false)
        return
      }
      setLoading(true)
      try {
        const p = await apiClient.get<any>('/provider/profile', token)
        if (!alive) return
        setProvider({
          id: p.id,
          name: p.name,
          email: p.email ?? null,
          providerTypes: (p.providerTypes ?? []) as ProviderType[],
        })
      } catch {
        if (!alive) return
        setProvider(null)
      } finally {
        if (alive) setLoading(false)
      }
    }
    load()
    return () => { alive = false }
  }, [token])

  const providerTypes: ProviderType[] = provider?.providerTypes?.length ? provider.providerTypes : ['tour_operator']
  const sections = useMemo(() => buildProviderMenu(providerTypes), [providerTypes])

  /** Determine if a menu item is active:
   *  - If we have a stored activeId AND the current pathname matches one of the
   *    items in the menu → use id comparison (prevents dual-highlight)
   *  - Otherwise fall back to pathname match
   */
  function isActive(item: { id: string; href: string }): boolean {
    if (effectiveActiveId) return effectiveActiveId === item.id
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
                  {t === 'tour_operator' ? '🗺️' : t === 'car_rental' ? '🚐' : '🏕️'} {SECTION_LABELS[t]}
                </span>
              ))}
            </div>
          </div>
        )}
        {loading && (
          <div className="px-4 py-3 border-b border-gray-50 text-xs text-gray-400">
            Loading business…
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
              <p className="text-[10px] text-gray-400 truncate">{provider?.email ?? ''}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
