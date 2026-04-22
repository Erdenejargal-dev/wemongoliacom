'use client'

import Link from 'next/link'
import { MapPin, Star, Compass, BadgeCheck } from 'lucide-react'
import type { Host } from '@/lib/mock-data/hosts'
import { useTranslations } from '@/lib/i18n'
import type { HostDetailMessages } from '@/lib/i18n/messages/hostDetail'

function typeLabelFor(host: Host, h: HostDetailMessages): string {
  switch (host.type) {
    case 'company':
      return h.typeCompany
    case 'guide':
      return h.typeGuide
    case 'driver':
      return h.typeDriver
    case 'experience':
      return h.typeProvider
    default:
      return h.typeProvider
  }
}

const typeColor: Record<string, string> = {
  company:    'bg-blue-50 text-blue-700',
  guide:      'bg-purple-50 text-purple-700',
  driver:     'bg-orange-50 text-orange-700',
  experience: 'bg-brand-50 text-brand-700',
}

interface HostCardProps {
  host: Host
  featured?: boolean
}

export function HostCard({ host, featured = false }: HostCardProps) {
  const { t } = useTranslations()
  const h = t.hostDetail

  return (
    <Link href={`/hosts/${host.slug}`}
      className="group block bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">

      {/* Cover image strip */}
      <div className={`relative overflow-hidden bg-gray-200 ${featured ? 'h-36' : 'h-28'}`}>
        <img
          src={host.coverImage}
          alt={host.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/40" />
        {host.verified && (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-white/90 backdrop-blur-sm text-[10px] font-bold text-blue-600 px-2 py-0.5 rounded-full shadow-sm">
            <BadgeCheck className="w-3 h-3" aria-hidden />
            {h.verifiedBadge}
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start gap-3 mb-3 -mt-8 relative">
          <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-white shadow-md bg-gray-100 shrink-0">
            <img src={host.logo} alt={host.name} className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0 mt-6">
            <div className="flex items-start gap-1.5 flex-wrap">
              <h3 className="text-sm font-bold text-gray-900 leading-tight group-hover:text-brand-700 transition-colors">
                {host.name}
              </h3>
            </div>
            <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 ${typeColor[host.type] ?? 'bg-gray-100 text-gray-600'}`}>
              {typeLabelFor(host, h)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <MapPin className="w-3 h-3 text-brand-500 shrink-0" aria-hidden />
          {host.location}
        </div>

        <p className="text-xs text-gray-600 leading-relaxed line-clamp-2 mb-3">
          {host.description}
        </p>

        <div className="flex items-center justify-between pt-3 border-t border-gray-50">
          <div className="flex items-center gap-1">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" aria-hidden />
            <span className="text-sm font-bold text-gray-900">{host.rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({host.reviewsCount})</span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Compass className="w-3 h-3 text-brand-500" aria-hidden />
            <span className="font-semibold text-gray-700">{h.toursOfferedCount(host.totalTours)}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
