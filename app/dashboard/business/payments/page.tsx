'use client'

import { DollarSign, Clock, Percent } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { StatCard } from '@/components/dashboard/ui/StatCard'
import { DataTable, type Column } from '@/components/dashboard/ui/DataTable'
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge'
import { summaryStats, payoutHistory } from '@/lib/mock-data/analytics'

type Payout = typeof payoutHistory[number]

const columns: Column<Payout>[] = [
  { key: 'id', header: 'Payout ID', render: r => <span className="font-mono text-xs text-gray-500">{r.id}</span> },
  { key: 'date', header: 'Date', sortable: true },
  { key: 'amount', header: 'Amount', sortable: true, render: r => <span className="font-semibold text-gray-900">${r.amount.toLocaleString()}</span> },
  { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status as 'paid' | 'pending'} /> },
]

export default function PaymentsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Payments" description="Earnings and payout history" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Earnings" value={`$${(summaryStats.totalRevenue / 1000).toFixed(1)}k`} icon={DollarSign} iconColor="text-green-600" iconBg="bg-green-50" />
        <StatCard title="Pending Payout" value={`$${summaryStats.pendingPayouts.toLocaleString()}`} icon={Clock} iconColor="text-orange-600" iconBg="bg-orange-50" />
        <StatCard title="Platform Fee" value={`$${summaryStats.platformFee.toLocaleString()}`} icon={Percent} iconColor="text-purple-600" iconBg="bg-purple-50" />
      </div>
      <div>
        <h2 className="text-sm font-semibold text-gray-900 mb-3">Payout History</h2>
        <DataTable columns={columns} data={payoutHistory} keyExtractor={r => r.id} />
      </div>
    </div>
  )
}
