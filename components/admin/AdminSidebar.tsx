'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Building2,
  BookOpen,
  ShieldCheck,
  X,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WeMongoliaLogo } from '@/components/brand/WeMongoliaLogo'
import { PLATFORM } from '@/lib/constants/platform'

const navItems = [
  { href: '/admin',           label: 'Overview',   icon: LayoutDashboard, exact: true },
  { href: '/admin/users',     label: 'Users',      icon: Users },
  { href: '/admin/providers', label: 'Providers',  icon: Building2 },
  { href: '/admin/bookings',  label: 'Bookings',   icon: BookOpen },
]

interface AdminSidebarProps {
  open?:    boolean
  onClose?: () => void
  userName?: string
  userEmail?: string
}

export function AdminSidebar({ open = true, onClose, userName, userEmail }: AdminSidebarProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Mobile overlay */}
      {open && onClose && (
        <div
          className="fixed inset-0 bg-black/40 z-30 md:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 h-full w-60 bg-gray-950 border-r border-gray-800 z-40 flex flex-col transition-transform duration-200',
          'md:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo + badge */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <Link href="/" className="flex items-center gap-2.5 min-w-0">
            <WeMongoliaLogo className="h-7 w-auto max-w-[120px] brightness-0 invert" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-2.5 h-2.5" />
              ADMIN
            </span>
            {onClose && (
              <button onClick={onClose} className="md:hidden p-1 rounded hover:bg-gray-800 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider px-3 mb-2">
            Operations
          </p>
          <ul className="space-y-0.5">
            {navItems.map(item => {
              const active = item.exact
                ? pathname === item.href
                : pathname.startsWith(item.href)

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={onClose}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors group',
                      active
                        ? 'bg-amber-500/15 text-amber-400 border border-amber-500/20'
                        : 'text-gray-400 hover:bg-gray-800 hover:text-gray-100',
                    )}
                  >
                    <item.icon
                      className={cn(
                        'w-4 h-4 shrink-0',
                        active ? 'text-amber-400' : 'text-gray-500 group-hover:text-gray-300',
                      )}
                    />
                    {item.label}
                    {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-amber-400" />}
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Support reference */}
          <div className="mt-6 px-3">
            <p className="text-[10px] font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Support
            </p>
            <a
              href={`mailto:${PLATFORM.supportEmail}`}
              className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
            >
              {PLATFORM.supportEmail}
            </a>
          </div>
        </nav>

        {/* Footer / user */}
        <div className="px-4 py-4 border-t border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 text-xs font-bold">
              {userName?.charAt(0)?.toUpperCase() ?? 'A'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-gray-200 truncate">
                {userName ?? 'Admin'}
              </p>
              <p className="text-[10px] text-gray-500 truncate">
                {userEmail ?? PLATFORM.supportEmail}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
