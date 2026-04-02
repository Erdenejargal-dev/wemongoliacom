'use client'

import { useState } from 'react'
import { DashboardSidebar } from '@/components/provider-dashboard/DashboardSidebar'
import { DashboardHeader } from '@/components/provider-dashboard/DashboardHeader'
import { ProviderLocaleProvider } from '@/lib/i18n/provider/context'

/**
 * DashboardShell — wraps all /dashboard/business/(portal)/* pages.
 * Injects ProviderLocaleProvider so every page/component in the
 * provider portal has access to useProviderLocale().
 */
export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ProviderLocaleProvider>
      <div className="min-h-screen bg-gray-50/60">
        <DashboardSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="md:pl-60">
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
          <main className="p-4 sm:p-6">
            {children}
          </main>
        </div>
      </div>
    </ProviderLocaleProvider>
  )
}
