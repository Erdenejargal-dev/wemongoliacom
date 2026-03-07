'use client'

import { useState } from 'react'
import { Plus, Compass } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { TableToolbar } from '@/components/dashboard/ui/TableToolbar'
import { EmptyState } from '@/components/dashboard/ui/EmptyState'
import { DataTable, type Column } from '@/components/dashboard/ui/DataTable'
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge'
import { ServiceForm } from '@/components/dashboard/forms/ServiceForm'
import { mockServices, type Service } from '@/lib/mock-data/services'

type View = 'table' | 'create' | 'edit'

export default function ServicesPage() {
  const [services, setServices] = useState(mockServices)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [view, setView] = useState<View>('table')
  const [editing, setEditing] = useState<Service | null>(null)

  const filtered = services.filter(s => {
    const matchSearch = s.title.toLowerCase().includes(search.toLowerCase()) || s.location.toLowerCase().includes(search.toLowerCase())
    const matchStatus = statusFilter === 'all' || s.status === statusFilter
    return matchSearch && matchStatus
  })

  const columns: Column<Service>[] = [
    { key: 'title', header: 'Service Name', sortable: true, render: r => (
      <div>
        <p className="font-medium text-gray-900">{r.title}</p>
        <p className="text-xs text-gray-400">{r.category}</p>
      </div>
    )},
    { key: 'location', header: 'Location', sortable: true },
    { key: 'price', header: 'Price', sortable: true, render: r => `$${r.price}/person` },
    { key: 'status', header: 'Status', render: r => <StatusBadge status={r.status} /> },
    { key: 'totalBookings', header: 'Bookings', sortable: true },
    { key: 'actions', header: '', render: r => (
      <div className="flex items-center gap-2">
        <button onClick={() => { setEditing(r); setView('edit') }} className="px-2.5 py-1 text-xs text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Edit</button>
        <button onClick={() => setServices(s => s.filter(x => x.id !== r.id))} className="px-2.5 py-1 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors">Delete</button>
      </div>
    )},
  ]

  if (view === 'create' || view === 'edit') return (
    <div className="max-w-2xl">
      <PageHeader title={view === 'create' ? 'Create Service' : 'Edit Service'} description="Fill in the details for this service." />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <ServiceForm
          initial={editing ?? {}}
          onSubmit={data => {
            if (view === 'edit' && editing) setServices(s => s.map(x => x.id === editing.id ? { ...x, ...data } as Service : x))
            else setServices(s => [...s, { id: `s${Date.now()}`, rating: 0, images: [], ...data } as Service])
            setView('table')
          }}
          onCancel={() => setView('table')}
        />
      </div>
    </div>
  )

  return (
    <div>
      <PageHeader title="Services" description={`${services.length} services`} actions={
        <button onClick={() => { setEditing(null); setView('create') }} className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
          <Plus className="w-4 h-4" /> New Service
        </button>
      } />
      <TableToolbar
        searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search services…"
        filters={[{ label: 'Status', value: statusFilter, onChange: setStatusFilter, options: [
          { label: 'All Status', value: 'all' },
          { label: 'Active', value: 'active' },
          { label: 'Draft', value: 'draft' },
          { label: 'Paused', value: 'paused' },
        ]}]}
      />
      <DataTable
        columns={columns} data={filtered} keyExtractor={r => r.id} pageSize={8}
        emptyState={<EmptyState icon={Compass} title="No services found" description="Create your first service to start receiving bookings." action={
          <button onClick={() => setView('create')} className="px-4 py-2 bg-gray-900 text-white text-sm rounded-lg hover:bg-gray-700">Create Service</button>
        } />}
      />
    </div>
  )
}
