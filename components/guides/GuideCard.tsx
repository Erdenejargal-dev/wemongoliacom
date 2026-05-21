'use client'

import Link from 'next/link'
import { MapPin, Star, BadgeCheck, Award } from 'lucide-react'
import type { GuideListItem } from '@/lib/api/guides'
import { useTranslations } from '@/lib/i18n'

const specialtyColor: Record<string, string> = {
  Wildlife:     'bg-green-50 text-green-700',
  Trekking:     'bg-orange-50 text-orange-700',
  Cultural:     'bg-purple-50 text-purple-700',
  Photography:  'bg-pink-50 text-pink-700',
  BirdWatching: 'bg-teal-50 text-teal-700',
  Winter:       'bg-blue-50 text-blue-700',
  Fishing:      'bg-cyan-50 text-cyan-700',
  History:      'bg-amber-50 text-amber-700',
  Adventure:    'bg-red-50 text-red-700',
}

interface GuideCardProps {
  guide: GuideListItem
}

export function GuideCard({ guide }: GuideCardProps) {
  const { t } = useTranslations()
  const g = t.guidesBrowse

  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      {/* Cover strip */}
      <div className="relative h-28 overflow-hidden bg-gray-200">
        <img
          src={guide.coverImage}
          alt={guide.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
        {guide.certified && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-brand-700 px-2 py-0.5 rounded-full shadow-sm">
            <Award className="w-3 h-3" aria-hidden />
            {g.certifiedBadge}
          </div>
        )}
      </div>

      <div className="p-4">
        {/* Avatar + name row */}
        <div className="flex items-start gap-3 mb-3 -mt-8 relative">
          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-md bg-gray-100 shrink-0">
            <img src={guide.photo} alt={guide.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0 mt-6">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-brand-700 transition-colors">
                {guide.name}
              </h3>
              {guide.verified && (
                <BadgeCheck className="w-3.5 h-3.5 text-blue-500 shrink-0" aria-label={g.verifiedBadge} />
              )}
            </div>
          </div>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <MapPin className="w-3 h-3 text-brand-500 shrink-0" aria-hidden />
          {guide.location}
        </div>

        {/* Bio */}
        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-3">{guide.bio}</p>

        {/* Specialty chips */}
        <div className="flex flex-wrap gap-1 mb-3">
          {guide.specialties.slice(0, 2).map(s => (
            <span key={s} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${specialtyColor[s] ?? 'bg-gray-100 text-gray-600'}`}>
              {s}
            </span>
          ))}
          {guide.languages.slice(0, 2).map(l => (
            <span key={l} className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
              {l}
            </span>
          ))}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden />
            <span className="text-sm font-bold text-gray-900">{guide.ratingAverage.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({guide.reviewsCount})</span>
          </div>
          <div className="text-right">
            {guide.dailyRate ? (
              <span className="text-sm font-bold text-gray-900">
                ${guide.dailyRate}
                <span className="text-xs font-normal text-gray-400 ml-0.5">{g.perDay}</span>
              </span>
            ) : (
              <span className="text-xs text-gray-400">{g.yearsExp(guide.yearsExperience)}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}
