import type { LucideIcon } from 'lucide-react'
import { TrendingUp, TrendingDown } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: number
  trendLabel?: string
  iconColor?: string
  iconBg?: string
}

export function StatCard({ title, value, icon: Icon, trend, trendLabel, iconColor = 'text-blue-600', iconBg = 'bg-blue-50' }: StatCardProps) {
  const isPositive = trend !== undefined && trend >= 0

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        <div className={`w-10 h-10 rounded-lg ${iconBg} flex items-center justify-center`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      <div className="flex items-end justify-between">
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 text-sm font-medium ${isPositive ? 'text-brand-600' : 'text-red-500'}`}>
            {isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            <span>{isPositive ? '+' : ''}{trend}%</span>
            {trendLabel && <span className="text-gray-400 font-normal ml-1">{trendLabel}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
