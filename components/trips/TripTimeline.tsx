import { Check } from 'lucide-react'
import type { TripStatus } from '@/lib/mock-data/trips'

const STEPS = ['Booking Confirmed', 'Trip Upcoming', 'Trip In Progress', 'Trip Completed']

function getActiveStep(status: TripStatus): number {
  if (status === 'Cancelled') return 0
  if (status === 'Upcoming')  return 1
  if (status === 'Completed') return 3
  return 2
}

interface TripTimelineProps {
  status: TripStatus
  date: string
}

export function TripTimeline({ status, date }: TripTimelineProps) {
  const active = getActiveStep(status)
  const cancelled = status === 'Cancelled'

  if (cancelled) {
    return (
      <div className="flex items-center gap-2 py-2">
        <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0">
          <span className="w-2 h-2 rounded-full bg-red-400" />
        </span>
        <span className="text-xs font-semibold text-red-500">Booking Cancelled</span>
      </div>
    )
  }

  return (
    <div className="flex items-start gap-0">
      {STEPS.map((step, i) => {
        const done    = i < active
        const current = i === active
        return (
          <div key={step} className="flex items-center flex-1">
            {/* Node */}
            <div className="flex flex-col items-center">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white shrink-0 transition-colors ${done ? 'bg-green-500' : current ? 'bg-green-400 ring-4 ring-green-100' : 'bg-gray-200'}`}>
                {done ? <Check className="w-3 h-3" /> : <span className={`text-[10px] font-bold ${current ? 'text-white' : 'text-gray-400'}`}>{i + 1}</span>}
              </div>
              <span className={`text-[9px] font-semibold mt-1 text-center leading-tight w-16 ${done ? 'text-green-600' : current ? 'text-green-500' : 'text-gray-400'}`}>
                {step}
              </span>
            </div>
            {/* Connector */}
            {i < STEPS.length - 1 && (
              <div className={`flex-1 h-0.5 mb-3 mx-0.5 ${i < active ? 'bg-green-400' : 'bg-gray-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}
