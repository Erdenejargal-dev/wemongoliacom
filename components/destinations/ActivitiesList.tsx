import { CheckCircle2 } from 'lucide-react'

interface ActivitiesListProps {
  activities: string[]
}

export function ActivitiesList({ activities }: ActivitiesListProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Things To Do</h2>
      <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {activities.map((activity, i) => (
          <li key={i} className="flex items-start gap-3 group">
            <div className="w-6 h-6 rounded-full bg-brand-50 flex items-center justify-center shrink-0 mt-0.5 group-hover:bg-brand-100 transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5 text-brand-500" />
            </div>
            <span className="text-sm text-gray-700 leading-relaxed">{activity}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
