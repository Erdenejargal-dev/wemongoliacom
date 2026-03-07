'use client'

import { MapPin, Clock, Users, Star, Edit, Trash2, MoreHorizontal } from 'lucide-react'
import { useState } from 'react'
import type { Service } from '@/lib/mock-data/services'
import { StatusBadge } from '@/components/dashboard/ui/StatusBadge'

interface ServiceCardProps {
  service: Service
  onEdit?: (id: string) => void
  onDelete?: (id: string) => void
}

export function ServiceCard({ service, onEdit, onDelete }: ServiceCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow p-5 relative">
      {/* Category pill */}
      <span className="inline-block text-xs font-medium bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full mb-3">
        {service.category}
      </span>

      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 truncate">{service.title}</h3>
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-xs text-gray-500 truncate">{service.location}</span>
          </div>
        </div>
        <div className="relative">
          <button
            onClick={() => setMenuOpen(v => !v)}
            className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-white border border-gray-100 shadow-lg rounded-xl w-36 py-1 z-10">
              <button onClick={() => { onEdit?.(service.id); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50">
                <Edit className="w-3.5 h-3.5" /> Edit
              </button>
              <button onClick={() => { onDelete?.(service.id); setMenuOpen(false) }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
        <div className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {service.duration}</div>
        <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> Up to {service.groupSize}</div>
        {service.rating > 0 && (
          <div className="flex items-center gap-1"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> {service.rating}</div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50">
        <div>
          <span className="text-lg font-bold text-gray-900">${service.price}</span>
          <span className="text-xs text-gray-400 ml-1">/ person</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">{service.totalBookings} bookings</span>
          <StatusBadge status={service.status} />
        </div>
      </div>
    </div>
  )
}
