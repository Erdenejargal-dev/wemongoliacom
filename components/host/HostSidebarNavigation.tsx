'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Plus, Compass, CalendarCheck, Star, MessageSquare,
  Car, CalendarDays, BedDouble, LogOut, ChevronDown, ChevronUp,
} from 'lucide-react'
import type { ProviderType } from '@/lib/mock-data/provider'
import { PROVIDER_TYPE_META } from '@/lib/mock-data/provider'
import { useState } from 'react'

const ICON_MAP: Record<string, React.ReactNode> = {
  LayoutDashboard: <LayoutDashboard className="w-4 h-4" />,
  Plus:            <Plus className="w-4 h-4" />,
  Compass:         <Compass className="w-4 h-4" />,
  CalendarCheck:   <CalendarCheck className="w-4 h-4" />,
  Star:            <Star className="w-4 h-4" />,
  MessageSquare:   <MessageSquare className="w-4 h-4" />,
  Car:             <Car className="w-4 h-4" />,
  CalendarDays:    <CalendarDays className="w-4 h-4" />,
  BedDouble:       <BedDouble className="w-4 h-4" />,
}

const TYPE_SECTION_LABEL: Record<ProviderType, string> = {
  tour_operator: 'Tours & Experiences',
  car_rental:    'Car Rentals',
  accommodation: 'Accommodation',
}

interface HostSidebarNavigationProps {
  providerName: string
  providerTypes: ProviderType[]
}

export function HostSidebarNavigation({ providerName, providerTypes }: HostSidebarNavigationProps) {
  const pathname = usePathname()
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({})

  // Build deduplicated menu: Dashboard first, then per-type sections
  const dashboardItem = { label: 'Dashboard', href: '/host/dashboard', icon: 'LayoutDashboard' }

  // Collect per-type sections (excluding Dashboard duplicate)
  const sections = providerTypes.map(type => ({
    type,
    label: TYPE_SECTION_LABEL[type],
    items: PROVIDER_TYPE_META[type].menuItems.filter(m => m.href !== '/host/dashboard'),
  }))

  return (
    <aside className="w-64 shrink-0 bg-white border-r border-gray-100 flex flex-col h-full">
      {/* Brand */}
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2 mb-3">
          <div className="w-7 h-7 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-white text-xs font-bold">W</span>
          </div>
          <span className="text-xs font-bold text-gray-900">WeMongolia Host</span>
        </Link>
        <p className="text-xs font-semibold text-gray-900 truncate">{providerName}</p>
        <div className="flex flex-wrap gap-1 mt-1">
          {providerTypes.map(t => (
            <span key={t} className="text-[9px] font-bold uppercase tracking-wide text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {PROVIDER_TYPE_META[t].icon} {t.replace('_', ' ')}
            </span>
          ))}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {/* Dashboard — always first */}
        <NavItem item={dashboardItem} active={pathname === dashboardItem.href} />

        {/* Type sections */}
        {sections.map(sec => {
          const isOpen = !collapsed[sec.type]
          return (
            <div key={sec.type} className="mt-3">
              <button
                onClick={() => setCollapsed(p => ({ ...p, [sec.type]: !p[sec.type] }))}
                className="w-full flex items-center justify-between px-2 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span>{sec.label}</span>
                {isOpen ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
              </button>
              {isOpen && (
                <div className="space-y-0.5">
                  {sec.items.map(item => (
                    <NavItem key={item.href} item={item} active={pathname === item.href} />
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </nav>

      {/* Bottom */}
      <div className="border-t border-gray-100 px-3 py-3">
        <Link href="/" className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:bg-red-50 hover:text-red-500 transition-colors">
          <LogOut className="w-4 h-4" />Exit Dashboard
        </Link>
      </div>
    </aside>
  )
}

function NavItem({ item, active }: { item: { label: string; href: string; icon: string }; active: boolean }) {
  return (
    <Link href={item.href}
      className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${active ? 'bg-green-50 text-green-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'}`}>
      <span className={active ? 'text-green-600' : 'text-gray-400'}>{ICON_MAP[item.icon] ?? <LayoutDashboard className="w-4 h-4" />}</span>
      {item.label}
    </Link>
  )
}
