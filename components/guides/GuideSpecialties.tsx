'use client'

import { Award } from 'lucide-react'
import type { Guide, GuideSpecialty } from '@/lib/api/guides'
import { useTranslations } from '@/lib/i18n'

const specialtyColor: Record<GuideSpecialty, string> = {
  Wildlife:     'bg-green-50 text-green-700 border-green-200',
  Trekking:     'bg-orange-50 text-orange-700 border-orange-200',
  Cultural:     'bg-purple-50 text-purple-700 border-purple-200',
  Photography:  'bg-pink-50 text-pink-700 border-pink-200',
  BirdWatching: 'bg-teal-50 text-teal-700 border-teal-200',
  Winter:       'bg-blue-50 text-blue-700 border-blue-200',
  Fishing:      'bg-cyan-50 text-cyan-700 border-cyan-200',
  History:      'bg-amber-50 text-amber-700 border-amber-200',
  Adventure:    'bg-red-50 text-red-700 border-red-200',
}

interface GuideSpecialtiesProps {
  guide: Guide
}

export function GuideSpecialties({ guide }: GuideSpecialtiesProps) {
  const { t } = useTranslations()
  const g = t.guideDetail

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
      {/* Specialties */}
      <div>
        <h2 className="text-base font-bold text-gray-900 mb-3">{g.specialtiesTitle}</h2>
        <div className="flex flex-wrap gap-2">
          {guide.specialties.map(s => (
            <span key={s} className={`text-xs font-semibold px-3 py-1 rounded-full border ${specialtyColor[s] ?? 'bg-gray-100 text-gray-600 border-gray-200'}`}>
              {s}
            </span>
          ))}
        </div>
      </div>

      {/* Languages */}
      <div>
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{g.languagesLabel}</h3>
        <div className="flex flex-wrap gap-2">
          {guide.languages.map(l => (
            <span key={l} className="text-xs font-semibold px-3 py-1 rounded-full bg-gray-100 text-gray-700 border border-gray-200">
              {l}
            </span>
          ))}
        </div>
      </div>

      {/* License */}
      {guide.certified && guide.licenseNumber && (
        <div className="flex items-center gap-2 p-3 bg-brand-50 rounded-xl border border-brand-100">
          <Award className="w-4 h-4 text-brand-600 shrink-0" aria-hidden />
          <div>
            <p className="text-xs font-semibold text-brand-700">{g.certifiedBadge}</p>
            <p className="text-[10px] text-brand-600">{g.licenseNumber}: {guide.licenseNumber}</p>
          </div>
        </div>
      )}
    </div>
  )
}
