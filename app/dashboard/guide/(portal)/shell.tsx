'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Menu } from 'lucide-react'
import { GuideDashboardSidebar } from '@/components/guide-dashboard/GuideDashboardSidebar'
import { apiClient } from '@/lib/api/client'

export interface InitialGuideProfile {
  id:     string
  name:   string
  photo:  string | null
  status: string
}

export function GuidePortalShell({
  children,
  initialProfile,
}: {
  children:        React.ReactNode
  initialProfile?: InitialGuideProfile
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { data: session } = useSession()
  const token = session?.user?.accessToken
  const [newInquiries, setNewInquiries] = useState(0)

  useEffect(() => {
    let alive = true
    async function fetchNew() {
      if (!token) return
      try {
        const result = await apiClient.get<{ pagination: { total: number } }>(
          '/guide-portal/inquiries?status=new&limit=1',
          token,
        )
        if (alive) setNewInquiries(result?.pagination?.total ?? 0)
      } catch { /* non-fatal */ }
    }
    fetchNew()
    return () => { alive = false }
  }, [token])

  return (
    <div className="min-h-screen bg-gray-50/60">
      <GuideDashboardSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        initialProfile={initialProfile}
        newInquiries={newInquiries}
      />
      <button
        className="fixed top-4 left-4 z-50 md:hidden p-2 rounded-lg bg-white shadow border border-gray-100 hover:bg-gray-50 transition-colors"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu className="w-5 h-5 text-gray-600" />
      </button>
      <div className="md:pl-60">
        <main className="p-4 sm:p-6 pb-8">
          {children}
        </main>
      </div>
    </div>
  )
}
