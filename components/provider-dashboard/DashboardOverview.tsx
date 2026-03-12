'use client'

import { BookOpen, DollarSign, CalendarCheck, Star } from 'lucide-react'
import { StatCard } from '@/components/dashboard/ui/StatCard'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { DataTable, type Column } from '@/components/dashboard/ui/DataTable'
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge'
import { RevenueChart } from '@/components/dashboard/domain/RevenueChart'
import { BookingChart } from '@/components/dashboard/domain/BookingChart'
import { mockBookings, type Booking } from '@/lib/mock-data/bookings'
import { summaryStats } from '@/lib/mock-data/analytics'
import type { ProviderType } from '@/lib/mock-data/provider'
import { SECTION_LABELS } from '@/lib/provider-menu'

const recentBookingColumns: Column<Booking>[] = [
  { key: 'id',           header: 'ID',       render: r => <span className="font-mono text-xs text-gray-500">{r.id}</span> },
  { key: 'customerName', header: 'Customer', sortable: true, render: r => (
    <div>
      <p className="font-medium text-gray-900 text-sm">{r.customerName}</p>
      <p className="text-xs text-gray-400">{r.customerEmail}</p>
    </div>
  )},
  { key: 'serviceName', header: 'Service',  sortable: true },
  { key: 'date',         header: 'Date',     sortable: true },
  { key: 'guests',       header: 'Guests',   render: r => `${r.guests} guest${r.guests > 1 ? 's' : ''}` },
  { key: 'status',       header: 'Status',   render: r => <StatusBadge status={r.status} /> },
  { key: 'amount',       header: 'Amount',   sortable: true, render: r => <span className="font-semibold">${r.amount.toLocaleString()}</span> },
]

interface DashboardOverviewProps {
  providerName?: string
  providerTypes?: ProviderType[]
}

export function DashboardOverview({ providerName, providerTypes = ['tour_operator'] }: DashboardOverviewProps) {
  const typeLabels = providerTypes.map(t => SECTION_LABELS[t]).join(' · ')

  return (
    <div className="space-y-6">
      <PageHeader
        title="Overview"
        description={`Welcome back${providerName ? `, ${providerName}` : ''}! ${typeLabels} — here's what's happening with your business.`}
      />

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Bookings"
          value={summaryStats.totalBookings}
          icon={BookOpen}
          trend={12}
          trendLabel="vs last month"
          iconColor="text-blue-600"
          iconBg="bg-blue-50"
        />
        <StatCard
          title="Monthly Revenue"
          value={`$${(summaryStats.monthlyRevenue / 1000).toFixed(1)}k`}
          icon={DollarSign}
          trend={8}
          trendLabel="vs last month"
          iconColor="text-green-600"
          iconBg="bg-green-50"
        />
        <StatCard
          title="Active Listings"
          value={summaryStats.upcomingTours}
          icon={CalendarCheck}
          trend={-3}
          trendLabel="vs last month"
          iconColor="text-purple-600"
          iconBg="bg-purple-50"
        />
        <StatCard
          title="Avg. Rating"
          value={summaryStats.averageRating}
          icon={Star}
          trend={2}
          trendLabel="vs last month"
          iconColor="text-amber-600"
          iconBg="bg-amber-50"
        />
      </div>

      {/* Provider type badges */}
      <div className="flex flex-wrap gap-2">
        {providerTypes.map(t => (
          <span key={t} className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 bg-gray-100 px-3 py-1.5 rounded-full">
            {t === 'tour_operator' ? '🗺️' : t === 'car_rental' ? '🚐' : '🏕️'}
            {SECTION_LABELS[t]}
          </span>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueChart />
        <BookingChart />
      </div>

      {/* Recent Bookings */}
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Recent Bookings</h2>
        <DataTable
          columns={recentBookingColumns}
          data={mockBookings.slice(0, 5)}
          keyExtractor={r => r.id}
          pageSize={5}
        />
      </div>
    </div>
  )
}
