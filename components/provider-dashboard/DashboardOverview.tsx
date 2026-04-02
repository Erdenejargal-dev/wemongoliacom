'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BookOpen, CalendarCheck, AlertCircle, CheckCircle2,
  ArrowRight, Plus, MessageSquare, Settings, Compass,
} from 'lucide-react'
import type { ProviderBooking, ProviderAnalytics } from '@/lib/api/provider'
import { VerificationBanner } from './VerificationBanner'
import { useProviderLocale } from '@/lib/i18n/provider/context'
import type { ProviderType } from '@/lib/provider-menu'

interface DashboardOverviewProps {
  providerName?: string
  providerDescription?: string | null
  providerTypes?: ProviderType[]
  verificationStatus?: 'unverified' | 'pending_review' | 'verified' | 'rejected'
  rejectionReason?: string | null
  token?: string
  analytics: ProviderAnalytics | null
  recentBookings: ProviderBooking[]
}

function StatCard({
  label, value, sub, accent,
}: {
  label: string; value: string | number; sub?: string; accent: string
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <p className="text-xs font-medium text-gray-500 mb-2">{label}</p>
      <p className={`text-2xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="text-[11px] text-gray-400 mt-1">{sub}</p>}
    </div>
  )
}

export function DashboardOverview({
  providerName,
  providerDescription,
  providerTypes = ['tour_operator'],
  verificationStatus,
  rejectionReason,
  token,
  analytics,
  recentBookings,
}: DashboardOverviewProps) {
  const { t } = useProviderLocale()
  const ot = t.overview

  const [currentVerificationStatus, setCurrentVerificationStatus] = useState(verificationStatus)
  useEffect(() => { setCurrentVerificationStatus(verificationStatus) }, [verificationStatus])

  const pendingCount       = analytics?.bookings?.pending ?? 0
  const hasIncompleteProfile = !providerDescription || providerDescription.trim().length < 50

  // Locale-aware date format
  function fmtDate(iso: string) {
    return new Date(iso).toLocaleDateString(t.dateLocale, { month: 'short', day: 'numeric' })
  }

  const statusColors: Record<string, string> = {
    pending:   'bg-amber-100 text-amber-700',
    confirmed: 'bg-brand-100 text-brand-700',
    completed: 'bg-blue-100 text-blue-700',
    cancelled: 'bg-red-100 text-red-700',
  }

  const quickActions = [
    { href: '/dashboard/business/services', label: ot.addTour,  icon: Plus,         bg: 'bg-brand-50',   hbg: 'group-hover:bg-brand-100',  border: 'hover:border-brand-200',  iconCls: 'text-brand-600'  },
    { href: '/dashboard/business/bookings', label: ot.bookings, icon: CalendarCheck, bg: 'bg-blue-50',    hbg: 'group-hover:bg-blue-100',   border: 'hover:border-blue-200',   iconCls: 'text-blue-600'   },
    { href: '/dashboard/business/messages', label: ot.messages, icon: MessageSquare, bg: 'bg-purple-50',  hbg: 'group-hover:bg-purple-100', border: 'hover:border-purple-200', iconCls: 'text-purple-600' },
    { href: '/dashboard/business/settings', label: ot.settings, icon: Settings,      bg: 'bg-gray-100',   hbg: 'group-hover:bg-gray-200',   border: 'hover:border-gray-200',   iconCls: 'text-gray-600'   },
  ]

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {providerTypes.map(pt => (
              <span key={pt} className="text-[10px] font-semibold text-brand-300 bg-brand-500/15 border border-brand-500/20 px-2.5 py-1 rounded-full">
                {pt === 'tour_operator' ? '🗺️' : pt === 'car_rental' ? '🚐' : '🏕️'}{' '}
                {t.providerTypes[pt] ?? pt}
              </span>
            ))}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1">
            {providerName ?? 'Your Business'}
          </h1>
          <p className="text-sm text-gray-300 max-w-lg">{ot.manage}</p>
        </div>
      </div>

      {/* Verification banner */}
      {currentVerificationStatus && token && (
        <VerificationBanner
          verificationStatus={currentVerificationStatus}
          token={token}
          rejectionReason={rejectionReason}
          onStatusChange={setCurrentVerificationStatus}
        />
      )}

      {/* Action alerts */}
      {(pendingCount > 0 || hasIncompleteProfile) && (
        <div className="space-y-2">
          {pendingCount > 0 && (
            <Link
              href="/dashboard/business/bookings?status=pending"
              className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 hover:bg-amber-100 transition-colors"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{ot.pendingBookings(pendingCount)}</p>
                <p className="text-xs text-amber-700">{ot.pendingBookingsDesc}</p>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0 text-amber-600" />
            </Link>
          )}
          {hasIncompleteProfile && (
            <Link
              href="/dashboard/business/settings"
              className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 hover:bg-blue-100 transition-colors"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{ot.completeProfile}</p>
                <p className="text-xs text-blue-700">{ot.completeProfileDesc}</p>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0 text-blue-600" />
            </Link>
          )}
        </div>
      )}

      {/* All-clear bar */}
      {pendingCount === 0 && !hasIncompleteProfile && (
        <div className="flex items-center gap-3 px-4 py-3 bg-brand-50 border border-brand-200 rounded-xl text-brand-800">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="font-medium text-sm">
            {recentBookings.length > 0 ? ot.allCaughtUp : ot.readyToReceive}
          </p>
        </div>
      )}

      {/* Key stats */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label={ot.stats.totalBookings}
            value={analytics.bookings.total}
            sub={ot.stats.pending(analytics.bookings.pending)}
            accent="text-gray-900"
          />
          <StatCard
            label={ot.stats.revenue}
            value={analytics.revenue?.total != null ? `$${analytics.revenue.total.toLocaleString()}` : '—'}
            sub={analytics.revenue?.thisMonth != null ? ot.stats.thisMonth(`$${analytics.revenue.thisMonth.toLocaleString()}`) : undefined}
            accent="text-brand-600"
          />
          <StatCard
            label={ot.stats.monthBookings}
            value={analytics.revenue?.thisMonthCount ?? 0}
            sub={ot.stats.monthCount}
            accent="text-gray-900"
          />
          <StatCard
            label={ot.stats.reviews}
            value={analytics.reviews?.total ?? 0}
            sub={analytics.reviews?.avgRating != null ? ot.stats.avgRating(analytics.reviews.avgRating.toFixed(1)) : undefined}
            accent="text-amber-600"
          />
        </div>
      )}

      {/* Quick actions */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">{ot.quickActions}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map(qa => (
            <Link
              key={qa.href}
              href={qa.href}
              className={`flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md ${qa.border} transition-all text-center group`}
            >
              <div className={`w-10 h-10 rounded-xl ${qa.bg} ${qa.hbg} flex items-center justify-center transition-colors`}>
                <qa.icon className={`w-5 h-5 ${qa.iconCls}`} />
              </div>
              <span className="text-xs font-semibold text-gray-700">{qa.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Recent bookings */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">{ot.recentBookings}</h2>
          {recentBookings.length > 0 && (
            <Link
              href="/dashboard/business/bookings"
              className="text-xs font-medium text-brand-600 hover:text-brand-700 flex items-center gap-1"
            >
              {ot.viewAll} <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>

        {recentBookings.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            {recentBookings.slice(0, 5).map(b => {
              const name = b.user ? `${b.user.firstName} ${b.user.lastName}`.trim() : '—'
              const date = fmtDate(b.startDate)
              const sc = statusColors[b.bookingStatus] ?? 'bg-gray-100 text-gray-600'
              const statusLabel = (t.statusLabels as Record<string, string>)[b.bookingStatus] ?? b.bookingStatus
              return (
                <div key={b.id} className="flex items-center gap-4 px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                    <p className="text-xs text-gray-400">
                      {b.bookingCode} · {date} · {b.guests}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full shrink-0 ${sc}`}>
                    {statusLabel}
                  </span>
                  <span className="text-sm font-semibold text-gray-900 shrink-0">
                    {b.currency} {b.totalAmount.toLocaleString()}
                  </span>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-10 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-gray-50 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-gray-300" />
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-1">{ot.noBookings}</p>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">{ot.noBookingsDesc}</p>
            <Link
              href="/dashboard/business/services"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              <Compass className="w-3.5 h-3.5" /> {ot.manageListings}
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
