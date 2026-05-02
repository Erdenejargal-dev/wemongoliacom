'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { DashboardSidebar } from '@/components/provider-dashboard/DashboardSidebar'
import { DashboardHeader } from '@/components/provider-dashboard/DashboardHeader'
import { MobileBottomNav } from '@/components/provider-dashboard/MobileBottomNav'
import { ProviderLocaleProvider } from '@/lib/i18n/provider/context'
import { apiClient } from '@/lib/api/client'
import type { ProviderType } from '@/lib/provider-menu'

export interface InitialProvider {
  id: string
  name: string
  email?: string | null
  providerTypes: ProviderType[]
  plan?: string | null
}

/**
 * DashboardShell — wraps all /dashboard/business/(portal)/* pages.
 * Fetches the pending bookings count once here so both the desktop
 * sidebar and mobile bottom nav share a single request.
 */
export function DashboardShell({ children, initialProvider }: { children: React.ReactNode; initialProvider?: InitialProvider }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session } = useSession()
  const token = session?.user?.accessToken
  const [pendingCount, setPendingCount] = useState(0)

  useEffect(() => {
    let alive = true
    async function fetchPending() {
      if (!token) return
      try {
        const result = await apiClient.get<{
          data: unknown[]
          pagination: { total: number }
        }>('/provider/bookings?bookingStatus=pending&limit=1', token)
        if (alive) setPendingCount(result?.pagination?.total ?? 0)
      } catch { /* non-fatal */ }
    }
    fetchPending()
    return () => { alive = false }
  }, [token])

  return (
    <ProviderLocaleProvider>
      <div className="min-h-screen bg-gray-50/60">
        <DashboardSidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          initialProvider={initialProvider}
          pendingCount={pendingCount}
        />
        <MobileBottomNav pendingCount={pendingCount} />
        <div className="md:pl-60">
          <DashboardHeader onMenuClick={() => setSidebarOpen(true)} />
          {/* pb-20 reserves space above the mobile bottom nav */}
          <main className="p-4 sm:p-6 pb-24 md:pb-6">
            {children}
          </main>
        </div>
      </div>
    </ProviderLocaleProvider>
  )
}
