import type { TravelTip } from '@/lib/mock-data/destinations'

interface TravelTipsProps {
  tips: TravelTip[]
}

export function TravelTips({ tips }: TravelTipsProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Travel Tips</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tips.map((tip, i) => (
          <div key={i} className="flex gap-4 p-4 rounded-xl bg-gray-50 hover:bg-green-50/50 transition-colors">
            <span className="text-2xl shrink-0 leading-none mt-0.5">{tip.icon}</span>
            <div>
              <p className="text-sm font-bold text-gray-900 mb-1">{tip.title}</p>
              <p className="text-xs text-gray-600 leading-relaxed">{tip.body}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
