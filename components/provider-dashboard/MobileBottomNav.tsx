'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, CalendarCheck, Compass, MessageSquare, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProviderLocale } from '@/lib/i18n/provider/context'

const NAV_ITEMS = [
  { id: 'overview',  href: '/dashboard/business',          icon: LayoutDashboard, label: 'Home'     },
  { id: 'bookings',  href: '/dashboard/business/bookings', icon: CalendarCheck,   label: 'Bookings' },
  { id: 'services',  href: '/dashboard/business/services', icon: Compass,         label: 'Listings' },
  { id: 'messages',  href: '/dashboard/business/messages', icon: MessageSquare,   label: 'Messages' },
  { id: 'settings',  href: '/dashboard/business/settings', icon: Settings,        label: 'Settings' },
] as const

interface MobileBottomNavProps {
  pendingCount: number
}

export function MobileBottomNav({ pendingCount }: MobileBottomNavProps) {
  const pathname = usePathname()
  const { t } = useProviderLocale()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 md:hidden bg-white border-t border-gray-100 shadow-[0_-1px_8px_rgba(0,0,0,0.06)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="flex h-16">
        {NAV_ITEMS.map(item => {
          const active = item.href === '/dashboard/business'
            ? pathname === item.href
            : pathname.startsWith(item.href)
          const label = (t.menu as Record<string, string>)[item.id] ?? item.label
          const badge = item.id === 'bookings' && pendingCount > 0 ? pendingCount : 0

          return (
            <Link
              key={item.id}
              href={item.href}
              className={cn(
                'flex-1 flex flex-col items-center justify-center gap-0.5 relative min-h-[44px] transition-colors',
                active ? 'text-brand-600' : 'text-gray-400'
              )}
            >
              {/* Active indicator bar at top */}
              {active && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-brand-500 rounded-full" />
              )}

              <div className="relative">
                <item.icon className="w-5 h-5" />
                {badge > 0 && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-0.5 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </div>

              <span className="text-[10px] font-semibold">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
