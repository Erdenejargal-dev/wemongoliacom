'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard, Calendar, BookOpen, Star, MessageSquare,
  CreditCard, BarChart2, Settings, Compass, ChevronRight, X
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WeMongoliaLogo } from '@/components/brand/WeMongoliaLogo'

const navItems = [
  { href: '/dashboard/business',           label: 'Overview',   icon: LayoutDashboard },
  { href: '/dashboard/business/services',  label: 'Services',   icon: Compass },
  { href: '/dashboard/business/bookings',  label: 'Bookings',   icon: BookOpen },
  { href: '/dashboard/business/calendar',  label: 'Calendar',   icon: Calendar },
  { href: '/dashboard/business/reviews',   label: 'Reviews',    icon: Star },
  { href: '/dashboard/business/messages',  label: 'Messages',   icon: MessageSquare },
  { href: '/dashboard/business/payments',  label: 'Payments',   icon: CreditCard },
  { href: '/dashboard/business/analytics', label: 'Analytics',  icon: BarChart2 },
  { href: '/dashboard/business/settings',  label: 'Settings',   icon: Settings },
]

interface SidebarProps {
  open?: boolean
  onClose?: () => void
}

export function Sidebar({ open = true, onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && onClose && (
        <div className="fixed inset-0 bg-black/40 z-30 md:hidden" onClick={onClose} />
      )}

      <aside className={cn(
        'fixed left-0 top-0 h-full w-60 bg-white border-r border-gray-100 z-40 flex flex-col transition-transform duration-200',
        'md:translate-x-0',
        open ? 'translate-x-0' : '-translate-x-full'
      )}>
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <WeMongoliaLogo className="h-8 w-auto max-w-[140px]" />
          </Link>
          {onClose && (
            <button onClick={onClose} className="md:hidden p-1 rounded-lg hover:bg-gray-100">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider px-3 mb-2">Business</p>
          <ul className="space-y-0.5">
            {navItems.map(item => {
              const active = pathname === item.href
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                      active
                        ? 'bg-gray-900 text-white'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    )}
                  >
                    <item.icon className={cn('w-4 h-4 shrink-0', active ? 'text-white' : 'text-gray-400 group-hover:text-gray-600')} />
                    {item.label}
                    {active && <ChevronRight className="w-3.5 h-3.5 ml-auto" />}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>

        {/* Footer */}
        <div className="px-4 py-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-blue-500 flex items-center justify-center text-white text-xs font-semibold">
              B
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-900 truncate">Business Admin</p>
              <p className="text-[10px] text-gray-400 truncate">admin@wemongolia.com</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
