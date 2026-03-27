'use client'

import { monthlyData } from '@/lib/mock-data/analytics'

export function RevenueChart() {
  const max = Math.max(...monthlyData.map(d => d.revenue))
  const H = 120
  const W = 400
  const pad = 8

  const points = monthlyData.map((d, i) => {
    const x = pad + (i / (monthlyData.length - 1)) * (W - pad * 2)
    const y = H - pad - ((d.revenue / max) * (H - pad * 2))
    return { x, y, ...d }
  })

  const path = points.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ')
  const area = `${path} L${points[points.length - 1].x},${H - pad} L${points[0].x},${H - pad} Z`

  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Revenue Overview</h3>
          <p className="text-xs text-gray-500 mt-0.5">Monthly earnings this year</p>
        </div>
        <span className="text-2xl font-bold text-gray-900">$178.8k</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-32" preserveAspectRatio="none">
        <defs>
          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0285C9" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#0285C9" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#revGrad)" />
        <path d={path} fill="none" stroke="#0285C9" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {points.map(p => (
          <circle key={p.month} cx={p.x} cy={p.y} r="3" fill="#0285C9" />
        ))}
      </svg>
      <div className="flex justify-between mt-2">
        {monthlyData.map(d => (
          <span key={d.month} className="text-[10px] text-gray-400">{d.month}</span>
        ))}
      </div>
    </div>
  )
}
