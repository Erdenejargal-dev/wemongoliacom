'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { Loader2 } from 'lucide-react'
import { DashboardOverview } from '@/components/provider-dashboard/DashboardOverview'
import { apiClient, ApiError } from '@/lib/api/client'
import {
  fetchProviderAnalytics,
  fetchProviderBookings,
} from '@/lib/api/provider'
import { getFreshAccessToken } from '@/lib/auth-utils'
import type { ProviderType } from '@/lib/provider-menu'
import { useProviderLocale } from '@/lib/i18n/provider/context'

type VerificationStatus = 'unverified' | 'pending_review' | 'verified' | 'rejected'
type ProviderProfile = {
  id: string; name: string; description?: string | null;
  providerTypes: ProviderType[]; status: 'draft' | 'active' | 'paused' | 'archived'
  verificationStatus?: VerificationStatus; rejectionReason?: string | null
}

export default function BusinessDashboardPage() {
  const router  = useRouter()
  const { data: session, status } = useSession()
  const token   = session?.user?.accessToken
  const { t }   = useProviderLocale()

  const [provider,       setProvider]       = useState<ProviderProfile | null>(null)
  const [freshToken,     setFreshToken]     = useState<string | null>(null)
  const [analytics,      setAnalytics]      = useState<Awaited<ReturnType<typeof fetchProviderAnalytics>>>(null)
  const [recentBookings, setRecentBookings] = useState<Awaited<ReturnType<typeof fetchProviderBookings>>['data']>([])
  const [loading,        setLoading]        = useState(true)
  const [error,          setError]          = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    async function load() {
      const ft = token ? await getFreshAccessToken() : null
      if (!ft) { setLoading(false); return }
      if (alive) setFreshToken(ft)
      setLoading(true); setError(null)
      try {
        const [pRes, aRes, bRes] = await Promise.all([
          apiClient.get<ProviderProfile>('/provider/profile', ft),
          fetchProviderAnalytics(ft),
          fetchProviderBookings(ft, { limit: 5 }),
        ])
        if (!alive) return
        setProvider(pRes); setAnalytics(aRes); setRecentBookings(bRes.data ?? [])
      } catch (e: unknown) {
        if (!alive) return
        if (e instanceof ApiError && e.status === 401) { await signOut({ redirect: false }); router.push('/auth/login') }
        else setError(e instanceof Error ? e.message : 'Failed to load provider profile.')
      } finally { if (alive) setLoading(false) }
    }
    load()
    return () => { alive = false }
  }, [token])

  if (status === 'loading' || loading) return (
    <div className="flex items-center justify-center py-24"><Loader2 className="w-5 h-5 text-brand-500 animate-spin" /></div>
  )

  if (!token) return (
    <div className="py-16 text-center">
      <p className="text-sm text-gray-600">Sign in to access the Business Portal.</p>
    </div>
  )

  if (error) return (
    <div className="py-16 text-center">
      <p className="text-sm text-red-600">{error}</p>
      <p className="text-xs text-gray-500 mt-2">
        If you haven&apos;t registered your business yet, go to{' '}
        <Link href="/onboarding" className="text-brand-600 font-semibold underline">onboarding</Link>.
      </p>
    </div>
  )

  if (!provider) return (
    <div className="py-16 text-center">
      <p className="text-sm text-gray-600">No provider profile found.</p>
      <Link href="/onboarding" className="text-brand-600 font-semibold text-sm underline">Complete onboarding →</Link>
    </div>
  )

  return (
    <div className="space-y-4">
      {provider.status === 'draft' && provider.verificationStatus !== 'pending_review' && provider.verificationStatus !== 'verified' && (
        <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-800">
          {t.overview.draftWarning}
        </div>
      )}
      <DashboardOverview
        providerName={provider.name}
        providerDescription={provider.description}
        providerTypes={provider.providerTypes}
        verificationStatus={provider.verificationStatus}
        rejectionReason={provider.rejectionReason}
        token={freshToken ?? undefined}
        analytics={analytics}
        recentBookings={recentBookings}
      />
    </div>
  )
}
