'use client'

import { CalendarDays, Route, Users, MessageSquare } from 'lucide-react'
import type { Guide } from '@/lib/api/guides'
import { useTranslations } from '@/lib/i18n'

interface GuideStatsProps {
  guide: Guide
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="flex flex-col items-center text-center p-4 bg-gray-50 rounded-2xl hover:bg-brand-50/50 transition-colors">
      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center mb-3">
        {icon}
      </div>
      <p className="text-xl font-bold text-gray-900 mb-0.5">{value}</p>
      <p className="text-xs text-gray-500 font-medium">{label}</p>
    </div>
  )
}

export function GuideStats({ guide }: GuideStatsProps) {
  const { t } = useTranslations()
  const g = t.guideDetail

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4">{g.atAGlance}</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Stat
          icon={<CalendarDays className="w-5 h-5 text-brand-500" />}
          label={g.statYears}
          value={`${guide.yearsExperience}+`}
        />
        <Stat
          icon={<Route className="w-5 h-5 text-brand-500" />}
          label={g.statToursLed}
          value={guide.totalGuests > 0 ? `${guide.totalGuests}+` : '—'}
        />
        <Stat
          icon={<Users className="w-5 h-5 text-brand-500" />}
          label={g.statGuests}
          value={guide.totalGuests.toLocaleString() + '+'}
        />
        <Stat
          icon={<MessageSquare className="w-5 h-5 text-brand-500" />}
          label={g.statReviews}
          value={guide.reviewsCount.toString()}
        />
      </div>
    </div>
  )
}
