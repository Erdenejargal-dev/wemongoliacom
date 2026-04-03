/**
 * components/destinations/TravelTips.tsx
 *
 * Renders destination tips as plain text items.
 * The backend stores tips as String[] (not structured objects with icons),
 * so we render them as simple tip cards with a generic icon.
 */

import { Lightbulb } from 'lucide-react'

interface TravelTipsProps {
  tips: string[]
}

export function TravelTips({ tips }: TravelTipsProps) {
  if (tips.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-5">Travel Tips</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {tips.map((tip, i) => (
          <div
            key={i}
            className="flex gap-4 p-4 rounded-xl bg-gray-50 hover:bg-brand-50/50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center shrink-0 mt-0.5">
              <Lightbulb className="w-4 h-4 text-brand-600" />
            </div>
            <p className="text-sm text-gray-700 leading-relaxed">{tip}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
