'use client'

import { MapPin, Star, BadgeCheck, Award, Mail, Globe, Phone } from 'lucide-react'
import type { Guide } from '@/lib/api/guides'
import { useTranslations } from '@/lib/i18n'

interface GuideHeroProps {
  guide: Guide
}

export function GuideHero({ guide }: GuideHeroProps) {
  const { t } = useTranslations()
  const g = t.guideDetail

  return (
    <div className="relative">
      {/* Cover image */}
      <div className="h-52 sm:h-64 overflow-hidden bg-gray-200">
        <img src={guide.coverImage} alt={guide.name} className="w-full h-full object-cover" />
        <div className="absolute inset-0 h-52 sm:h-64 bg-gradient-to-b from-black/10 to-black/50" />
      </div>

      {/* Profile card */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative -mt-16 bg-white rounded-2xl shadow-md border border-gray-100 p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row gap-5">
            {/* Headshot */}
            <div className="shrink-0">
              <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md bg-gray-100">
                <img src={guide.photo} alt={guide.name} className="w-full h-full object-cover" />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-start gap-2 mb-1">
                <h1 className="text-xl font-bold text-gray-900 leading-tight">{guide.name}</h1>
                {guide.verified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                    <BadgeCheck className="w-3 h-3" aria-hidden />
                    {g.verifiedBadge}
                  </span>
                )}
                {guide.certified && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded-full">
                    <Award className="w-3 h-3" aria-hidden />
                    {g.certifiedBadge}
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mb-3">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-brand-500" aria-hidden />
                  {guide.location}
                </span>
                {guide.website && (
                  <a href={guide.website} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 hover:text-brand-600 transition-colors">
                    <Globe className="w-3.5 h-3.5 text-brand-500" aria-hidden />
                    {g.labelWebsite}
                  </a>
                )}
                <a href={`mailto:${guide.contactEmail}`} className="flex items-center gap-1 hover:text-brand-600 transition-colors">
                  <Mail className="w-3.5 h-3.5 text-brand-500" aria-hidden />
                  {guide.contactEmail}
                </a>
                {guide.contactPhone && (
                  <a href={`tel:${guide.contactPhone}`} className="flex items-center gap-1 hover:text-brand-600 transition-colors">
                    <Phone className="w-3.5 h-3.5 text-brand-500" aria-hidden />
                    {guide.contactPhone}
                  </a>
                )}
              </div>

              <p className="text-sm text-gray-600 leading-relaxed mb-3">{guide.bio}</p>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" aria-hidden />
                  <span className="text-sm font-bold text-gray-900">{guide.ratingAverage.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({guide.reviewsCount})</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {guide.languages.map(lang => (
                    <span key={lang} className="text-[10px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-full">
                      {lang}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
