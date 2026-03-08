import { CalendarDays, Compass, Users, MessageSquare } from 'lucide-react'
import type { Host } from '@/lib/mock-data/hosts'

interface HostStatsProps {
  host: Host
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl hover:bg-green-50/50 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  )
}

export function HostStats({ host }: HostStatsProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">At a Glance</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat
          icon={<CalendarDays className="w-5 h-5 text-green-500" />}
          label="Years Experience"
          value={`${host.yearsExperience}+`}
        />
        <Stat
          icon={<Compass className="w-5 h-5 text-green-500" />}
          label="Tours Offered"
          value={host.totalTours.toString()}
        />
        <Stat
          icon={<Users className="w-5 h-5 text-green-500" />}
          label="Guests Hosted"
          value={host.totalGuests.toLocaleString() + '+'}
        />
        <Stat
          icon={<MessageSquare className="w-5 h-5 text-green-500" />}
          label="Reviews"
          value={host.reviewsCount.toString()}
        />
      </div>
    </div>
  )
}
