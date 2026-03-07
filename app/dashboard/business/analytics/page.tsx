'use client'

import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { RevenueChart } from '@/components/dashboard/domain/RevenueChart'
import { BookingChart } from '@/components/dashboard/domain/BookingChart'
import { topServices } from '@/lib/mock-data/analytics'
import { Star } from 'lucide-react'

export default function AnalyticsPage() {
  const maxBookings = Math.max(...topServices.map(s => s.bookings))

  return (
    <div className="space-y-6">
      <PageHeader title="Analytics" description="Performance overview and trends" />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <RevenueChart />
        <BookingChart />
      </div>

      {/* Top performing services */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-4">Top Performing Services</h3>
        <div className="space-y-4">
          {topServices.map((s, i) => (
            <div key={s.name} className="flex items-center gap-4">
              <span className="text-xs font-semibold text-gray-400 w-4">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{s.name}</p>
                  <div className="flex items-center gap-3 shrink-0 ml-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span className="text-xs text-gray-600">{s.rating}</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-900">${s.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-green-400 to-blue-500 rounded-full transition-all"
                    style={{ width: `${(s.bookings / maxBookings) * 100}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">{s.bookings} bookings</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
