'use client'

import { useEffect, useState } from 'react'
import { DashboardOverview } from '@/components/provider-dashboard/DashboardOverview'
import { mockProviders, type Provider } from '@/lib/mock-data/provider'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'

export default function DashboardPage() {
  const [provider, setProvider] = useState<Provider | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    try {
      const stored = localStorage.getItem('wm_provider')
      if (stored) { setProvider(JSON.parse(stored)); setLoading(false); return }
    } catch {}
    setProvider(mockProviders[0])
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-5 h-5 text-green-500 animate-spin" />
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <p className="text-gray-600 text-sm mb-3">No provider profile found.</p>
        <Link href="/onboarding" className="text-green-600 font-semibold text-sm underline">
          Complete onboarding →
        </Link>
      </div>
    )
  }

  return (
    <DashboardOverview
      providerName={provider.name}
      providerTypes={provider.providerTypes}
    />
  )
}
