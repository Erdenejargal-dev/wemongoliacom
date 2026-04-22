'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import { X, ChevronRight, LayoutDashboard, Compass, CalendarCheck, MessageSquare, Star, BarChart2, Settings, Languages } from 'lucide-react'
import { cn } from '@/lib/utils'
import { WeMongoliaLogo } from '@/components/brand/WeMongoliaLogo'
import { apiClient } from '@/lib/api/client'
import { buildProviderMenu, type ProviderType } from '@/lib/provider-menu'
import { useProviderLocale } from '@/lib/i18n/provider/context'
import { useTranslations } from '@/lib/i18n'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Compass,
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
  const { t, lang, setLang } = useProviderLocale()
  const { t: appT } = useTranslations()

  const [provider, setProvider] = useState<{
    id: string
    name: string
    email?: string | null
    providerTypes: ProviderType[]
    plan?: string | null
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeId, setActiveId] = useState<string | null>(() => {
    try { return localStorage.getItem('wm_nav_active') } catch { return null }
  })

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
      if (!token) { setLoading(false); return }
      setLoading(true)
      try {
        const p = await apiClient.get<any>('/provider/profile', token)
        if (!alive) return
        setProvider({
          id:            p.id,
          name:          p.name,
          email:         p.email ?? null,
          providerTypes: (p.providerTypes ?? []) as ProviderType[],
          plan:          p.plan ?? 'FREE',
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

  function isActive(item: { id: string; href: string }): boolean {
    if (effectiveActiveId) return effectiveActiveId === item.id
    return pathname === item.href
  }

  return (
    <>
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
            <WeMongoliaLogo className="h-7 w-auto" />
          </Link>
          <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-gray-100" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Provider info */}
        {provider && (
          <div className="px-4 py-3 border-b border-gray-50 bg-gray-50/40">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-bold text-gray-900 truncate">{provider.name}</p>
              {/* Plan badge */}
              <span className={`shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                provider.plan === 'PRO'
                  ? 'text-amber-700 bg-amber-50 border-amber-200'
                  : 'text-gray-500 bg-white border-gray-200'
              }`}>
                {provider.plan === 'PRO' ? '⭐ PRO' : 'FREE'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1 mt-1">
              {providerTypes.map(pt => (
                <span key={pt} className="text-[9px] font-semibold text-gray-500 bg-white border border-gray-200 px-1.5 py-0.5 rounded-full">
                  {pt === 'tour_operator' ? '🗺️' : pt === 'car_rental' ? '🚐' : '🏕️'}{' '}
                  {t.providerTypes[pt] ?? pt}
                </span>
              ))}
            </div>
          </div>
        )}
        {loading && (
          <div className="px-4 py-3 border-b border-gray-50 text-xs text-gray-400">
            {t.sidebar.loading}
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
                // Translate menu label from locale dict by item.id; fall back to item.label
                const label = (t.menu as Record<string, string>)[item.id] ?? item.label
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
                    <span className="truncate">{label}</span>
                    {active && <ChevronRight className="w-3 h-3 ml-auto shrink-0" />}
                  </Link>
                )
              })}
            </div>
          ))}
        </nav>

        {/* Language toggle + Footer */}
        <div className="px-4 py-3 border-t border-gray-100 space-y-3">
          {/* Language switch */}
          <button
            onClick={() => setLang(lang === 'mn' ? 'en' : 'mn')}
            className="w-full flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-gray-500 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors border border-gray-200"
            title={lang === 'mn' ? appT.common.switchToEnglish : appT.common.switchToMongolian}
          >
            <Languages className="w-3.5 h-3.5" />
            {t.langToggleLabel}
          </button>

          {/* User */}
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
              {provider?.name?.charAt(0) ?? 'B'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">{provider?.name ?? 'Business'}</p>
              <p className="text-[10px] text-gray-400 truncate">{provider?.email ?? ''}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
