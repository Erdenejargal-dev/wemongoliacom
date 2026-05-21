'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import {
  X, LayoutDashboard, Inbox, User, Star, Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { WeMongoliaLogo } from '@/components/brand/WeMongoliaLogo'
import { GUIDE_MENU_ITEMS } from '@/lib/guide-menu'
import { apiClient } from '@/lib/api/client'
import type { InitialGuideProfile } from '@/app/dashboard/guide/(portal)/shell'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  LayoutDashboard,
  Inbox,
  User,
  Star,
  Settings,
}

interface GuideDashboardSidebarProps {
  open:            boolean
  onClose:         () => void
  initialProfile?: InitialGuideProfile
  newInquiries?:   number
}

export function GuideDashboardSidebar({
  open,
  onClose,
  initialProfile,
  newInquiries = 0,
}: GuideDashboardSidebarProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [profile, setProfile] = useState<InitialGuideProfile | null>(initialProfile ?? null)

  useEffect(() => {
    if (initialProfile || !token) return
    apiClient.get<InitialGuideProfile>('/guide-portal/profile', token)
      .then(p => setProfile({ id: p.id, name: p.name, photo: p.photo ?? null, status: p.status }))
      .catch(() => { /* non-fatal */ })
  }, [token, initialProfile])

  const isActive = (href: string) =>
    href === '/dashboard/guide' ? pathname === href : pathname.startsWith(href)

  const sidebarContent = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
        <Link href="/" onClick={onClose}>
          <WeMongoliaLogo className="h-7" />
        </Link>
        <button onClick={onClose} className="md:hidden p-1 rounded hover:bg-gray-100">
          <X className="w-5 h-5 text-gray-400" />
        </button>
      </div>

      {/* Guide name + status */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Guide Portal</p>
        {profile ? (
          <div className="flex items-center gap-2">
            {profile.photo ? (
              <img src={profile.photo} alt="" className="w-7 h-7 rounded-full object-cover" />
            ) : (
              <div className="w-7 h-7 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 text-xs font-bold">
                {profile.name.charAt(0)}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{profile.name}</p>
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full font-medium',
                profile.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500',
              )}>
                {profile.status === 'active' ? 'Active' : 'Paused'}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-400">Loading…</p>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {GUIDE_MENU_ITEMS.map(item => {
          const Icon = ICON_MAP[item.icon] ?? LayoutDashboard
          const active = isActive(item.href)
          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
              )}
            >
              <Icon className={cn('w-4 h-4 shrink-0', active ? 'text-brand-600' : 'text-gray-400')} />
              <span className="flex-1">{item.label}</span>
              {item.id === 'inquiries' && newInquiries > 0 && (
                <span className="min-w-[20px] h-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center px-1">
                  {newInquiries}
                </span>
              )}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-100">
        <Link href="/" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
          ← Back to WeMongolia
        </Link>
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 w-60 bg-white border-r border-gray-100 z-40">
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/30" onClick={onClose} />
          <aside className="relative w-64 bg-white h-full shadow-xl flex flex-col">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  )
}
