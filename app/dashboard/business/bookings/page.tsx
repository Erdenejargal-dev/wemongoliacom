'use client'

import { useState } from 'react'
import { BookOpen } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { TableToolbar } from '@/components/dashboard/ui/TableToolbar'
import { DataTable, type Column } from '@/components/dashboard/ui/DataTable'
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge'
import { EmptyState } from '@/components/dashboard/ui/EmptyState'
import { mockBookings, type Booking } from '@/lib/mock-data/bookings'

export default function BookingsPage() {
  const [bookings] = useState(mockBookings)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [serviceFilter, setServiceFilter] = useState('all')

  const services = Array.from(new Set(bookings.map(b => b.serviceName)))

  const filtered = bookings.filter(b => {
    const matchSearch = b.customerName.toLowerCase().includes(search.toLowerCase()) || b.id.includes(search)
    const matchStatus = statusFilter === 'all' || b.status === statusFilter
    const matchService = serviceFilter === 'all' || b.serviceName === serviceFilter
    return matchSearch && matchStatus && matchService
  })

  const columns: Column<Booking>[] = [
    { key: 'id', header: 'Booking ID', render: r => <span className="font-mono text-xs text-gray-500">{r.id}</span> },
    { key: 'customerName', header: 'Customer', sortable: true, render: r => (
      <div>
        <p className="font-medium text-gray-900 text-sm">{r.customerName}</p>
        <p className="text-xs text-gray-400">{r.customerEmail}</p>
      </div>
    )},
    { key: 'serviceName', header: 'Service', sortable: true },
    { key: 'date', header: 'Date', sortable: true },
    { key: 'guests', header: 'Guests', render: r => `${r.guests}` },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'paymentStatus', header: 'Payment', render: r => <StatusBadge status={r.paymentStatus} /> },
    { key: 'amount', header: 'Amount', sortable: true, render: r => <span className="font-semibold text-gray-900">${r.amount.toLocaleString()}</span> },
    { key: 'actions', header: '', render: r => (
      <button className="px-2.5 py-1 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">View</button>
    )},
  ]

  return (
    <div>
      <PageHeader title="Bookings" description={`${filtered.length} bookings`} />
      <TableToolbar
        searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search by customer or ID…"
        filters={[
          { label: 'Status', value: statusFilter, onChange: setStatusFilter, options: [
            { label: 'All Status', value: 'all' },
            { label: 'Confirmed', value: 'confirmed' },
            { label: 'Pending', value: 'pending' },
            { label: 'Completed', value: 'completed' },
            { label: 'Cancelled', value: 'cancelled' },
          ]},
          { label: 'Service', value: serviceFilter, onChange: setServiceFilter, options: [
            { label: 'All Services', value: 'all' },
            ...services.map(s => ({ label: s, value: s })),
          ]},
        ]}
      />
      <DataTable
        columns={columns} data={filtered} keyExtractor={r => r.id} pageSize={8}
        emptyState={<EmptyState icon={BookOpen} title="No bookings found" description="Bookings will appear here once customers reserve your services." />}
      />
    </div>
  )
}
