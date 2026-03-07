'use client'

import { monthlyData } from '@/lib/mock-data/analytics'

export function BookingChart() {
  const max = Math.max(...monthlyData.map(d => d.bookings))
  const barW = 20
  const gap = 12
  const H = 100
  const totalW = monthlyData.length * (barW + gap)

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Bookings</h3>
          <p className="text-xs text-gray-500 mt-0.5">Monthly booking count</p>
        </div>
        <span className="text-2xl font-bold text-gray-900">303</span>
      </div>
      <svg viewBox={`0 0 ${totalW} ${H + 20}`} className="w-full h-32" preserveAspectRatio="none">
        {monthlyData.map((d, i) => {
          const x = i * (barW + gap)
          const barH = (d.bookings / max) * H
          const y = H - barH
          const isMax = d.bookings === max
          return (
            <g key={d.month}>
              <rect x={x} y={y} width={barW} height={barH} rx="4"
                fill={isMax ? '#6366f1' : '#e0e7ff'} />
              <text x={x + barW / 2} y={H + 14} textAnchor="middle" fontSize="9" fill="#9ca3af">
                {d.month}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
