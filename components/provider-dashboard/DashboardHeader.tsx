'use client'

import { Bell, Search, Menu } from 'lucide-react'
import Link from 'next/link'

interface DashboardHeaderProps {
  onMenuClick: () => void
  title?: string
  subtitle?: string
}

export function DashboardHeader({ onMenuClick, title, subtitle }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
      {/* Mobile hamburger */}
      <button
        className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors shrink-0"
        onClick={onMenuClick}
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>

      {/* Title (desktop) or search (desktop) */}
      {title ? (
        <div className="hidden md:block">
          <p className="text-sm font-bold text-gray-900 leading-tight">{title}</p>
          {subtitle && <p className="text-xs text-gray-400">{subtitle}</p>}
        </div>
      ) : (
        <div className="hidden sm:flex items-center flex-1 max-w-sm">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            />
          </div>
        </div>
      )}

      {/* Right actions */}
      <div className="flex items-center gap-2 ml-auto">
        {/* Search toggle mobile */}
        <button className="sm:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Search className="w-4 h-4 text-gray-500" />
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <Bell className="w-5 h-5 text-gray-600" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
        </button>

        {/* Profile */}
        <Link href="/dashboard/business/settings"
          className="w-8 h-8 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-opacity">
          B
        </Link>
      </div>
    </header>
  )
}
