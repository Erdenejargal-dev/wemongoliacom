import type { TripStatus } from '@/lib/mock-data/trips'

const styles: Record<TripStatus, string> = {
  Upcoming:  'bg-brand-50 text-brand-700 border border-brand-100',
  Completed: 'bg-blue-50 text-blue-700 border border-blue-100',
  Cancelled: 'bg-red-50 text-red-600 border border-red-100',
}

const dots: Record<TripStatus, string> = {
  Upcoming:  'bg-brand-500',
  Completed: 'bg-blue-500',
  Cancelled: 'bg-red-400',
}

interface TripStatusBadgeProps {
  status: TripStatus
  size?: 'sm' | 'md'
}

export function TripStatusBadge({ status, size = 'sm' }: TripStatusBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-1.5 font-bold rounded-full ${styles[status]} ${size === 'md' ? 'text-xs px-3 py-1.5' : 'text-[10px] px-2.5 py-1'}`}>
      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dots[status]}`} />
      {status}
    </span>
  )
}
