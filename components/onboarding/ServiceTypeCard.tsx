import type { ProviderType } from '@/lib/mock-data/provider'
import { PROVIDER_TYPE_META } from '@/lib/mock-data/provider'
import { Check } from 'lucide-react'

const borderColor: Record<string, string> = {
  brand:  'border-brand-400 bg-brand-50/50',
  blue:   'border-blue-400 bg-blue-50/50',
  orange: 'border-orange-400 bg-orange-50/50',
}

const checkColor: Record<string, string> = {
  brand:  'bg-brand-500',
  blue:   'bg-blue-500',
  orange: 'bg-orange-500',
}

interface ServiceTypeCardProps {
  type: ProviderType
  selected: boolean
  onToggle: (t: ProviderType) => void
}

export function ServiceTypeCard({ type, selected, onToggle }: ServiceTypeCardProps) {
  const meta = PROVIDER_TYPE_META[type]
  return (
    <button
      type="button"
      onClick={() => onToggle(type)}
      className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 relative ${selected ? borderColor[meta.color] : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50'}`}
    >
      {/* Check mark */}
      {selected && (
        <div className={`absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center ${checkColor[meta.color]}`}>
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      )}

      <div className="flex items-start gap-4">
        <span className="text-3xl leading-none shrink-0">{meta.icon}</span>
        <div>
          <p className="text-sm font-bold text-gray-900 mb-1">{meta.label}</p>
          <p className="text-xs text-gray-500 leading-relaxed">{meta.description}</p>
        </div>
      </div>
    </button>
  )
}
