'use client'

import { Menu } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { WeMongoliaLogo } from '@/components/brand/WeMongoliaLogo'

interface DashboardHeaderProps {
  onMenuClick: () => void
}

export function DashboardHeader({ onMenuClick }: DashboardHeaderProps) {
  const { data: session } = useSession()
  const name = session?.user?.name ?? ''
  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'B'

  return (
    <header className="sticky top-0 z-20 bg-white/80 backdrop-blur-sm border-b border-gray-100 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
      <button
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      <div className="hidden md:flex items-center gap-2">
        <WeMongoliaLogo className="h-6 w-auto opacity-90" />
        <span className="text-xs font-medium text-gray-400">Business Portal</span>
      </div>

      <div className="flex items-center gap-3 ml-auto">
        <Link
          href="/dashboard/business/settings"
          className="flex items-center gap-2 p-1 pr-3 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center text-white text-xs font-bold">
            {initials}
          </div>
          <span className="text-sm font-medium text-gray-700 hidden sm:block max-w-[120px] truncate">
            {name || 'Settings'}
          </span>
        </Link>
      </div>
    </header>
  )
}
