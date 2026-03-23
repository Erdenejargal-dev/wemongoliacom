'use client'

import Link from 'next/link'
import { BookOpen, DollarSign, Star, CalendarCheck, AlertCircle, CheckCircle2 } from 'lucide-react'
import { StatCard } from '@/components/dashboard/ui/StatCard'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { DataTable, type Column } from '@/components/dashboard/ui/DataTable'
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge'
import { SECTION_LABELS, type ProviderType } from '@/lib/provider-menu'
import type { ProviderBooking, ProviderAnalytics } from '@/lib/api/provider'

interface DashboardOverviewProps {
  providerName?: string
  providerDescription?: string
  providerTypes?: ProviderType[]
  analytics: ProviderAnalytics | null
  recentBookings: ProviderBooking[]
}

const recentBookingColumns: Column<ProviderBooking>[] = [
  {
    key: 'bookingCode',
    header: 'ID',
    render: r => <span className="font-mono text-xs text-gray-500">{r.bookingCode}</span>,
  },
  {
    key: 'user',
    header: 'Customer',
    render: r => (
      <div>
        <p className="font-medium text-gray-900 text-sm">
          {r.user ? `${r.user.firstName} ${r.user.lastName}`.trim() : '—'}
        </p>
        <p className="text-xs text-gray-400">{r.user?.email ?? ''}</p>
      </div>
    ),
  },
  { key: 'listingType', header: 'Type', render: r => <span className="capitalize">{r.listingType}</span> },
  {
    key: 'startDate',
    header: 'Date',
    render: r => new Date(r.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
  },
  { key: 'guests', header: 'Guests', render: r => `${r.guests}` },
  {
    key: 'bookingStatus',
    header: 'Status',
    render: r => {
      const s = r.bookingStatus as 'pending' | 'confirmed' | 'cancelled' | 'completed'
      return <StatusBadge status={s} />
    },
  },
  {
    key: 'totalAmount',
    header: 'Amount',
    render: r => (
      <span className="font-semibold text-gray-900">
        {r.currency} {r.totalAmount.toLocaleString()}
      </span>
    ),
  },
]

export function DashboardOverview({
  providerName,
  providerDescription,
  providerTypes = ['tour_operator'],
  analytics,
  recentBookings,
}: DashboardOverviewProps) {
  const pendingCount = analytics?.bookings?.pending ?? 0
  const hasIncompleteProfile = !providerDescription || providerDescription.trim().length < 50

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description={`Welcome back${providerName ? `, ${providerName}` : ''}! Here&apos;s what&apos;s happening with your business.`}
      />

      {/* Action cards — what needs attention */}
      <div className="space-y-3">
        {pendingCount > 0 && (
          <Link
            href="/dashboard/business/bookings?status=pending"
            className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 hover:bg-amber-100 transition-colors"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">
                {pendingCount} booking{pendingCount !== 1 ? 's' : ''} waiting for your review
              </p>
              <p className="text-xs text-amber-700">Confirm or decline in Bookings</p>
            </div>
          </Link>
        )}
        {pendingCount === 0 && recentBookings.length > 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-800">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">You&apos;re all caught up</p>
              <p className="text-xs text-green-700">No booking requests waiting for review</p>
            </div>
          </div>
        )}
        {pendingCount === 0 && recentBookings.length === 0 && (
          <div className="flex items-center gap-3 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-700">
            <CheckCircle2 className="w-5 h-5 shrink-0 text-gray-400" />
            <div>
              <p className="font-semibold text-sm">You&apos;re ready to receive bookings</p>
              <p className="text-xs text-gray-600">Bookings will appear here when travelers reserve your services</p>
            </div>
          </div>
        )}
        {hasIncompleteProfile && (
          <Link
            href="/dashboard/business/settings"
            className="flex items-center gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-800 hover:bg-blue-100 transition-colors"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Complete your business profile</p>
              <p className="text-xs text-blue-700">Add your details to build trust with travelers</p>
            </div>
          </Link>
        )}
      </div>

      {/* Key stats — from real analytics only */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Bookings"
            value={analytics.bookings.total}
            icon={BookOpen}
            iconColor="text-blue-600"
            iconBg="bg-blue-50"
          />
          <StatCard
            title="Total Revenue"
            value={`${analytics.revenue?.total != null ? `$${analytics.revenue.total.toLocaleString()}` : '—'}`}
            icon={DollarSign}
            iconColor="text-green-600"
            iconBg="bg-green-50"
          />
          <StatCard
            title="This Month"
            value={
              analytics.revenue?.thisMonthCount != null
                ? `${analytics.revenue.thisMonthCount} booking${analytics.revenue.thisMonthCount !== 1 ? 's' : ''}`
                : '—'
            }
            icon={CalendarCheck}
            iconColor="text-purple-600"
            iconBg="bg-purple-50"
          />
          <StatCard
            title="Reviews"
            value={
              analytics.reviews?.total != null
                ? `${analytics.reviews.total} (${analytics.reviews.avgRating?.toFixed(1) ?? '—'} avg)`
                : '—'
            }
            icon={Star}
            iconColor="text-amber-600"
            iconBg="bg-amber-50"
          />
        </div>
      )}

      {/* Provider type badges */}
      <div className="flex flex-wrap gap-2">
        {providerTypes.map(t => (
          <span
            key={t}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full"
          >
            {t === 'tour_operator' ? '🗺️' : t === 'car_rental' ? '🚐' : '🏕️'}
            {SECTION_LABELS[t]}
          </span>
        ))}
      </div>

      {/* Recent Bookings — real data */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Recent Bookings</h2>
          {recentBookings.length > 0 && (
            <Link
              href="/dashboard/business/bookings"
              className="text-xs font-medium text-green-600 hover:text-green-700"
            >
              View all →
            </Link>
          )}
        </div>
        {recentBookings.length > 0 ? (
          <DataTable
            columns={recentBookingColumns}
            data={recentBookings}
            keyExtractor={r => r.id}
            pageSize={5}
          />
        ) : (
          <div className="py-12 text-center bg-white border border-gray-100 rounded-xl">
            <BookOpen className="w-10 h-10 text-gray-300 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-600">No bookings yet</p>
            <p className="text-xs text-gray-400 mt-1">Bookings will appear here when customers reserve your services.</p>
          </div>
        )}
      </div>
    </div>
  )
}
