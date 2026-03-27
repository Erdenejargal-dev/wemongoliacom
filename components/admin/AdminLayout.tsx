'use client'

import { useState } from 'react'
import { Menu, Bell, ShieldCheck } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { AdminSidebar } from './AdminSidebar'

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session } = useSession()

  const userName  = session?.user?.name ?? undefined
  const userEmail = session?.user?.email ?? undefined

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        userName={userName}
        userEmail={userEmail}
      />

      {/* Main content */}
      <div className="md:pl-60">
        {/* Top bar */}
        <header className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 sm:px-6 h-14 flex items-center justify-between">
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>

          {/* Admin badge — desktop breadcrumb hint */}
          <div className="hidden md:flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-gray-700">Admin Console</span>
          </div>

          <div className="flex items-center gap-2 ml-auto">
            <button className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="w-5 h-5 text-gray-500" />
            </button>
            <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-600 text-xs font-bold">
              {session?.user?.name?.charAt(0)?.toUpperCase() ?? 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  )
}
