'use client'

import Link from 'next/link'
import {
  BookOpen,
  DollarSign,
  Star,
  CalendarCheck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Plus,
  MessageSquare,
  Settings,
  Compass,
} from 'lucide-react'
import { SECTION_LABELS, type ProviderType } from '@/lib/provider-menu'
import type { ProviderBooking, ProviderAnalytics } from '@/lib/api/provider'

interface DashboardOverviewProps {
  providerName?: string
  providerDescription?: string | null
  providerTypes?: ProviderType[]
  analytics: ProviderAnalytics | null
  recentBookings: ProviderBooking[]
}

function StatCard({
  label,
  value,
  sub,
  accent,
}: {
  label: string
  value: string | number
  sub?: string
  accent: string
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
  analytics,
  recentBookings,
}: DashboardOverviewProps) {
  const pendingCount = analytics?.bookings?.pending ?? 0
  const hasIncompleteProfile =
    !providerDescription || providerDescription.trim().length < 50

  const typeLabel = providerTypes
    .map(t => SECTION_LABELS[t])
    .join(' · ')

  return (
    <div className="space-y-6">
      {/* ── Welcome banner ─────────────────────────────────────────── */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-6 sm:p-8 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.04]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        <div className="relative">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            {providerTypes.map(t => (
              <span
                key={t}
                className="text-[10px] font-semibold text-green-300 bg-green-500/15 border border-green-500/20 px-2.5 py-1 rounded-full"
              >
                {t === 'tour_operator' ? '🗺️' : t === 'car_rental' ? '🚐' : '🏕️'} {SECTION_LABELS[t]}
              </span>
            ))}
          </div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1">
            {providerName ? `${providerName}` : 'Your Business'}
          </h1>
          <p className="text-sm text-gray-300 max-w-lg">
            {typeLabel} · Manage your listings, bookings, and traveler communications from here.
          </p>
        </div>
      </div>

      {/* ── Action alerts ──────────────────────────────────────────── */}
      {(pendingCount > 0 || hasIncompleteProfile) && (
        <div className="space-y-2">
          {pendingCount > 0 && (
            <Link
              href="/dashboard/business/bookings?status=pending"
              className="flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 hover:bg-amber-100 transition-colors"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">
                  {pendingCount} booking{pendingCount !== 1 ? 's' : ''} waiting for review
                </p>
                <p className="text-xs text-amber-700">Open Bookings to confirm or decline</p>
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
                <p className="font-semibold text-sm">Complete your business profile</p>
                <p className="text-xs text-blue-700">Add a description to build trust with travelers</p>
              </div>
              <ArrowRight className="w-4 h-4 shrink-0 text-blue-600" />
            </Link>
          )}
        </div>
      )}

      {/* ── Status bar — no alerts ─────────────────────────────────── */}
      {pendingCount === 0 && !hasIncompleteProfile && (
        <div className="flex items-center gap-3 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-green-800">
          <CheckCircle2 className="w-5 h-5 shrink-0" />
          <p className="font-medium text-sm">
            {recentBookings.length > 0
              ? "You're all caught up — no pending actions"
              : "You're ready to receive bookings"}
          </p>
        </div>
      )}

      {/* ── Key stats ──────────────────────────────────────────────── */}
      {analytics && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard
            label="Total Bookings"
            value={analytics.bookings.total}
            sub={`${analytics.bookings.pending} pending`}
            accent="text-gray-900"
          />
          <StatCard
            label="Revenue"
            value={analytics.revenue?.total != null ? `$${analytics.revenue.total.toLocaleString()}` : '—'}
            sub={analytics.revenue?.thisMonth != null ? `$${analytics.revenue.thisMonth.toLocaleString()} this month` : undefined}
            accent="text-green-600"
          />
          <StatCard
            label="This Month"
            value={analytics.revenue?.thisMonthCount ?? 0}
            sub="bookings"
            accent="text-gray-900"
          />
          <StatCard
            label="Reviews"
            value={analytics.reviews?.total ?? 0}
            sub={analytics.reviews?.avgRating != null ? `${analytics.reviews.avgRating.toFixed(1)} avg rating` : undefined}
            accent="text-amber-600"
          />
        </div>
      )}

      {/* ── Quick actions ──────────────────────────────────────────── */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Link
            href="/dashboard/business/services"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-green-200 transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center group-hover:bg-green-100 transition-colors">
              <Plus className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-xs font-semibold text-gray-700">Add Listing</span>
          </Link>
          <Link
            href="/dashboard/business/bookings"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-blue-200 transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center group-hover:bg-blue-100 transition-colors">
              <CalendarCheck className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-semibold text-gray-700">Bookings</span>
          </Link>
          <Link
            href="/dashboard/business/messages"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-purple-200 transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-50 flex items-center justify-center group-hover:bg-purple-100 transition-colors">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-semibold text-gray-700">Messages</span>
          </Link>
          <Link
            href="/dashboard/business/settings"
            className="flex flex-col items-center gap-2 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center group-hover:bg-gray-200 transition-colors">
              <Settings className="w-5 h-5 text-gray-600" />
            </div>
            <span className="text-xs font-semibold text-gray-700">Settings</span>
          </Link>
        </div>
      </div>

      {/* ── Recent Bookings ────────────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900">Recent Bookings</h2>
          {recentBookings.length > 0 && (
            <Link
              href="/dashboard/business/bookings"
              className="text-xs font-medium text-green-600 hover:text-green-700 flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        {recentBookings.length > 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
            {recentBookings.slice(0, 5).map(b => {
              const name = b.user
                ? `${b.user.firstName} ${b.user.lastName}`.trim()
                : '—'
              const date = new Date(b.startDate).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
              })
              const statusColors: Record<string, string> = {
                pending: 'bg-amber-100 text-amber-700',
                confirmed: 'bg-green-100 text-green-700',
                completed: 'bg-blue-100 text-blue-700',
                cancelled: 'bg-red-100 text-red-700',
              }
              const sc = statusColors[b.bookingStatus] ?? 'bg-gray-100 text-gray-600'

              return (
                <div key={b.id} className="flex items-center gap-4 px-4 py-3.5">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{name}</p>
                    <p className="text-xs text-gray-400">
                      {b.bookingCode} · {date} · {b.guests} guest{b.guests !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full capitalize shrink-0 ${sc}`}>
                    {b.bookingStatus}
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
            <p className="text-sm font-semibold text-gray-700 mb-1">No bookings yet</p>
            <p className="text-xs text-gray-400 max-w-xs mx-auto">
              Bookings will appear here when travelers reserve your services. Make sure you have active listings.
            </p>
            <Link
              href="/dashboard/business/services"
              className="inline-flex items-center gap-1.5 mt-4 text-xs font-semibold text-green-600 hover:text-green-700"
            >
              <Compass className="w-3.5 h-3.5" /> Manage your listings
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
