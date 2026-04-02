'use client'

import { useEffect, useState } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Loader2, BookOpen, DollarSign, Star, TrendingUp, BarChart2 } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { StatCard } from '@/components/dashboard/ui/StatCard'
import { fetchProviderAnalytics, type ProviderAnalytics } from '@/lib/api/provider'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'
import { useRouter } from 'next/navigation'
import { useProviderLocale } from '@/lib/i18n/provider/context'

export default function AnalyticsPage() {
  const router        = useRouter()
  const { data: session } = useSession()
  const token         = session?.user?.accessToken
  const { t }         = useProviderLocale()
  const at            = t.analytics

  const [analytics, setAnalytics] = useState<ProviderAnalytics | null>(null)
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    async function load() {
      const ft = token ? await getFreshAccessToken() : null
      if (!ft) { setLoading(false); return }
      setLoading(true); setError(null)
      try {
        const data = await fetchProviderAnalytics(ft)
        if (!alive) return
        setAnalytics(data)
      } catch (e: unknown) {
        if (!alive) return
        if (e instanceof ApiError && e.status === 401) { await signOut({ redirect: false }); router.push('/auth/login') }
        else setError(e instanceof Error ? e.message : at.errorLoading)
      } finally { if (alive) setLoading(false) }
    }
    load()
    return () => { alive = false }
  }, [token])

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-5 h-5 text-brand-500 animate-spin" /></div>

  if (error) return (
    <div className="space-y-4">
      <PageHeader title={at.title} description={at.description} />
      <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
    </div>
  )

  if (!token) return (
    <div className="space-y-4">
      <PageHeader title={at.title} description={at.description} />
      <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">{at.signInNotice}</div>
    </div>
  )

  return (
    <div className="space-y-6">
      <PageHeader title={at.title} description={at.description} />
      {analytics ? (
        <>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title={at.totalBookings} value={analytics.bookings?.total ?? 0}  icon={BookOpen}   iconColor="text-blue-600"   iconBg="bg-blue-50"   />
            <StatCard title={at.totalRevenue}  value={analytics.revenue?.total  != null ? `$${analytics.revenue.total.toLocaleString()}`  : '—'} icon={DollarSign} iconColor="text-brand-600" iconBg="bg-brand-50" />
            <StatCard title={at.thisMonth}     value={analytics.revenue?.thisMonth != null ? `$${analytics.revenue.thisMonth.toLocaleString()}` : '—'} icon={TrendingUp} iconColor="text-purple-600" iconBg="bg-purple-50" />
            <StatCard
              title={at.reviews}
              value={analytics.reviews?.total != null
                ? `${analytics.reviews.total} (${analytics.reviews?.avgRating != null ? at.avgSuffix(analytics.reviews.avgRating.toFixed(1)) : '—'})`
                : '—'}
              icon={Star}
              iconColor="text-amber-600"
              iconBg="bg-amber-50"
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-sm font-semibold text-gray-900 mb-4">{at.bookingStatus}</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div><p className="text-xs font-medium text-gray-500">{at.pending}</p>   <p className="text-lg font-semibold text-amber-600">{analytics.bookings?.pending   ?? 0}</p></div>
              <div><p className="text-xs font-medium text-gray-500">{at.confirmed}</p> <p className="text-lg font-semibold text-blue-600">{analytics.bookings?.confirmed  ?? 0}</p></div>
              <div><p className="text-xs font-medium text-gray-500">{at.completed}</p> <p className="text-lg font-semibold text-brand-600">{analytics.bookings?.completed ?? 0}</p></div>
              <div><p className="text-xs font-medium text-gray-500">{at.cancelled}</p> <p className="text-lg font-semibold text-gray-600">{analytics.bookings?.cancelled  ?? 0}</p></div>
            </div>
          </div>
        </>
      ) : (
        <div className="py-12 text-center bg-white border border-gray-100 rounded-xl">
          <BarChart2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-600">{at.noData}</p>
          <p className="text-xs text-gray-400 mt-1">{at.noDataDesc}</p>
        </div>
      )}
    </div>
  )
}
