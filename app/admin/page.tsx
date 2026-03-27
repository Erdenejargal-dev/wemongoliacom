'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Users, Building2, BookOpen, TrendingUp, ShieldAlert,
  Clock, ArrowRight, CheckCircle2, XCircle, AlertCircle,
} from 'lucide-react'
import { fetchAdminAnalytics, fetchAdminProviders, fetchAdminBookings } from '@/lib/api/admin'
import type { AdminAnalytics, AdminProvider, AdminBooking } from '@/lib/api/admin'

// ── tiny helpers ─────────────────────────────────────────────────────────────

function fmt(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

const bookingStatusConfig: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Pending',   cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  confirmed: { label: 'Confirmed', cls: 'bg-green-50 text-green-700 border-green-200' },
  cancelled: { label: 'Cancelled', cls: 'bg-red-50 text-red-700 border-red-200' },
  completed: { label: 'Completed', cls: 'bg-blue-50 text-blue-700 border-blue-200' },
}

const verifyStatusConfig: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  pending_review: { label: 'Pending Review', icon: <AlertCircle className="w-3.5 h-3.5" />, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  unverified:     { label: 'Unverified',     icon: <Clock className="w-3.5 h-3.5" />,       cls: 'bg-gray-50 text-gray-500 border-gray-200' },
  verified:       { label: 'Verified',       icon: <CheckCircle2 className="w-3.5 h-3.5" />, cls: 'bg-green-50 text-green-700 border-green-200' },
  rejected:       { label: 'Rejected',       icon: <XCircle className="w-3.5 h-3.5" />,      cls: 'bg-red-50 text-red-700 border-red-200' },
}

// ── stat card ────────────────────────────────────────────────────────────────

function StatCard({
  label, value, sub, icon: Icon, accent = 'gray',
}: {
  label: string
  value: string | number
  sub?: string
  icon: React.ElementType
  accent?: 'gray' | 'amber' | 'blue' | 'green' | 'red'
}) {
  const accentCls: Record<string, string> = {
    gray:  'bg-gray-100 text-gray-600',
    amber: 'bg-amber-100 text-amber-600',
    blue:  'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red:   'bg-red-100 text-red-600',
  }
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accentCls[accent]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium text-gray-500 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  )
}

// ── page ─────────────────────────────────────────────────────────────────────

export default function AdminOverviewPage() {
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null)
  const [pending, setPending]     = useState<AdminProvider[]>([])
  const [recent, setRecent]       = useState<AdminBooking[]>([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    setLoading(true)
    Promise.all([
      fetchAdminAnalytics(token),
      fetchAdminProviders({ verificationStatus: 'pending_review', limit: 6 }, token),
      fetchAdminBookings({ limit: 8 }, token),
    ])
      .then(([a, p, b]) => {
        setAnalytics(a)
        setPending(p.data)
        setRecent(b.data)
      })
      .catch(e => setError(e?.message ?? 'Failed to load dashboard data'))
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-amber-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-sm text-red-700 font-medium">{error}</p>
        <p className="text-xs text-red-500 mt-1">Check that the backend is running and you are signed in as admin.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Operations Overview</h1>
        <p className="text-sm text-gray-500 mt-0.5">Real-time platform health and pending actions.</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Users"
          value={analytics?.users.total ?? 0}
          sub={`+${analytics?.users.newThisMonth ?? 0} this month`}
          icon={Users}
          accent="blue"
        />
        <StatCard
          label="Providers"
          value={analytics?.providers.total ?? 0}
          sub={`${analytics?.providers.active ?? 0} active · ${analytics?.providers.pendingVerification ?? 0} pending`}
          icon={Building2}
          accent={analytics?.providers.pendingVerification ? 'amber' : 'gray'}
        />
        <StatCard
          label="Total Bookings"
          value={analytics?.bookings.total ?? 0}
          sub={`${analytics?.bookings.thisMonth ?? 0} this month`}
          icon={BookOpen}
          accent="green"
        />
        <StatCard
          label="Revenue (paid)"
          value={fmt(analytics?.revenue.total ?? 0)}
          sub={`${fmt(analytics?.revenue.thisMonth ?? 0)} this month`}
          icon={TrendingUp}
          accent="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending verification queue */}
        <section className="bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              <h2 className="text-sm font-semibold text-gray-900">Pending Verification</h2>
              {(analytics?.providers.pendingVerification ?? 0) > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-amber-500 text-white text-[10px] font-bold">
                  {analytics?.providers.pendingVerification}
                </span>
              )}
            </div>
            <Link href="/admin/providers?verificationStatus=pending_review" className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {pending.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <CheckCircle2 className="w-8 h-8 text-green-400 mx-auto mb-2" />
              <p className="text-sm text-gray-500">No providers awaiting verification.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {pending.map(p => (
                <li key={p.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
                    <p className="text-xs text-gray-400 truncate">
                      {p.owner.firstName} {p.owner.lastName} · {p.owner.email}
                    </p>
                  </div>
                  <Link
                    href={`/admin/providers?verificationStatus=pending_review`}
                    className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-medium border border-amber-200 hover:bg-amber-100 transition-colors"
                  >
                    Review
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent bookings */}
        <section className="bg-white rounded-xl border border-gray-100">
          <div className="flex items-center justify-between px-5 py-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              <h2 className="text-sm font-semibold text-gray-900">Recent Bookings</h2>
            </div>
            <Link href="/admin/bookings" className="text-xs text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1">
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {recent.length === 0 ? (
            <div className="px-5 py-8 text-center">
              <p className="text-sm text-gray-500">No bookings yet.</p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-50">
              {recent.map(b => {
                const sc = bookingStatusConfig[b.bookingStatus] ?? { label: b.bookingStatus, cls: 'bg-gray-50 text-gray-500 border-gray-200' }
                return (
                  <li key={b.id} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs font-mono font-semibold text-gray-800">{b.bookingCode}</p>
                      <p className="text-xs text-gray-400 truncate">
                        {b.travelerFullName ?? b.user.firstName} · {b.provider.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold border ${sc.cls}`}>
                        {sc.label}
                      </span>
                      <span className="text-xs font-semibold text-gray-900">${b.totalAmount}</span>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>

      {/* Quick links */}
      <section>
        <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { href: '/admin/users',     label: 'Manage Users',     desc: 'View and edit user roles', icon: Users },
            { href: '/admin/providers', label: 'Manage Providers', desc: 'Verify and moderate businesses', icon: Building2 },
            { href: '/admin/bookings',  label: 'Manage Bookings',  desc: 'Review and support bookings', icon: BookOpen },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all group"
            >
              <div className="w-9 h-9 rounded-lg bg-gray-100 flex items-center justify-center group-hover:bg-gray-900 transition-colors">
                <item.icon className="w-4 h-4 text-gray-600 group-hover:text-white transition-colors" />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 ml-auto group-hover:text-gray-600 transition-colors" />
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
