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
  confirmed:  'bg-brand-50  text-brand-700  border-brand-200',
  completed:  'bg-blue-50   text-blue-700   border-blue-200',
  pending:    'bg-yellow-50 text-yellow-700 border-yellow-200',
  cancelled:  'bg-red-50    text-red-700    border-red-200',
  active:     'bg-brand-50  text-brand-700  border-brand-200',
  draft:      'bg-gray-50   text-gray-600   border-gray-200',
  paused:     'bg-orange-50 text-orange-700 border-orange-200',
  paid:       'bg-brand-50  text-brand-700  border-brand-200',
  unpaid:     'bg-red-50    text-red-700    border-red-200',
  authorized: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  failed:     'bg-red-50    text-red-700    border-red-200',
  refunded:   'bg-purple-50 text-purple-700 border-purple-200',
  partial:    'bg-yellow-50 text-yellow-700 border-yellow-200',
}

interface StatusBadgeProps {
  status:    Variant
  /** Optional translated label. Falls back to capitalised status value if not provided. */
  label?:    string
  className?: string
}

/**
 * StatusBadge — shows a coloured pill for a booking/payment status.
 *
 * Pass a `label` prop from your locale dictionary to show a translated string:
 *   <StatusBadge status="pending" label={t.statusLabels.pending} />
 *
 * If `label` is omitted the raw status value is shown (capitalize via CSS).
 */
export function StatusBadge({ status, label, className }: StatusBadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
      !label && 'capitalize',
      variantStyles[status],
      className,
    )}>
      {label ?? status}
    </span>
  )
}
