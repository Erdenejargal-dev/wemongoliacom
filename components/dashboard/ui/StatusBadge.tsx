import { cn } from '@/lib/utils'

type Variant =
  | 'confirmed'
  | 'pending'
  | 'cancelled'
  | 'completed'
  | 'active'
  | 'draft'
  | 'paused'
  | 'paid'
  | 'unpaid'
  | 'authorized'
  | 'failed'
  | 'refunded'
  | 'partial'

const variantStyles: Record<Variant, string> = {
  confirmed:  'bg-green-50  text-green-700  border-green-200',
  completed:  'bg-blue-50   text-blue-700   border-blue-200',
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  cancelled:  'bg-red-50    text-red-700    border-red-200',
  active:     'bg-green-50  text-green-700  border-green-200',
  draft:      'bg-gray-50   text-gray-600   border-gray-200',
  paused:     'bg-orange-50 text-orange-700 border-orange-200',
  paid:       'bg-green-50  text-green-700  border-green-200',
  unpaid:     'bg-red-50    text-red-700    border-red-200',
  authorized: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  failed:     'bg-red-50    text-red-700    border-red-200',
  refunded:   'bg-purple-50 text-purple-700 border-purple-200',
  partial:    'bg-yellow-50 text-yellow-700 border-yellow-200',
}

interface StatusBadgeProps {
  status: Variant
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
      variantStyles[status],
      className
    )}>
      {status}
    </span>
  )
}
