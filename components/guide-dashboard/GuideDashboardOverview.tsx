'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Inbox, Star, TrendingUp, Loader2 } from 'lucide-react'
import { fetchGuidePortalAnalytics, type GuideAnalytics } from '@/lib/api/guides'

export function GuideDashboardOverview() {
  const { data: session } = useSession()
  const token = session?.user?.accessToken
  const userName = (session?.user as { firstName?: string })?.firstName ?? session?.user?.name ?? 'Guide'

  const [analytics, setAnalytics] = useState<GuideAnalytics | null>(null)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    let alive = true
    async function load() {
      if (!token) { setLoading(false); return }
      try {
        const a = await fetchGuidePortalAnalytics(token)
        if (alive) setAnalytics(a)
      } catch { /* non-fatal */ }
      finally { if (alive) setLoading(false) }
    }
    load()
    return () => { alive = false }
  }, [token])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Welcome back, {userName}</h1>
        <p className="text-sm text-gray-500 mt-1">Here&apos;s what&apos;s happening with your guide profile.</p>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading stats…
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            icon={<Inbox className="w-5 h-5 text-blue-500" />}
            label="New Inquiries"
            value={analytics?.inquiriesNew ?? 0}
            href="/dashboard/guide/inquiries"
          />
          <StatCard
            icon={<Star className="w-5 h-5 text-yellow-500" />}
            label="Avg. Rating"
            value={analytics ? (analytics.avgRating > 0 ? analytics.avgRating.toFixed(1) : '—') : '—'}
          />
          <StatCard
            icon={<TrendingUp className="w-5 h-5 text-green-500" />}
            label="Response Rate"
            value={analytics ? `${analytics.responseRate}%` : '—'}
          />
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <QuickAction href="/dashboard/guide/inquiries" label="View Inquiries" description="See and reply to traveler inquiries" />
        <QuickAction href="/dashboard/guide/profile"   label="Edit Profile"   description="Update your public guide profile" />
        <QuickAction href="/dashboard/guide/reviews"   label="Reviews"        description="View and respond to traveler reviews" />
        <QuickAction href="/guides"                    label="My Public Page" description="See how your profile looks to travelers" external />
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, href }: {
  icon:   React.ReactNode
  label:  string
  value:  string | number
  href?:  string
}) {
  const content = (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex items-center gap-4 hover:shadow-sm transition-shadow">
      <div className="p-2.5 rounded-xl bg-gray-50">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-xs text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
  return href ? <Link href={href}>{content}</Link> : <div>{content}</div>
}

function QuickAction({ href, label, description, external }: {
  href:        string
  label:       string
  description: string
  external?:   boolean
}) {
  const cls = "block bg-white rounded-2xl border border-gray-100 p-4 hover:shadow-sm hover:border-gray-200 transition-all group"
  const inner = (
    <>
      <p className="text-sm font-semibold text-gray-900 group-hover:text-brand-700 transition-colors">{label}</p>
      <p className="text-xs text-gray-400 mt-0.5">{description}</p>
    </>
  )
  return external
    ? <a href={href} target="_blank" rel="noopener noreferrer" className={cls}>{inner}</a>
    : <Link href={href} className={cls}>{inner}</Link>
}
