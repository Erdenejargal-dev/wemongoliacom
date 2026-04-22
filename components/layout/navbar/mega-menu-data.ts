/**
 * Main navigation structure: hrefs + icons. Labels come from `PublicTranslations.megaNav`
 * via `buildNavItems(megaNav)` so EN/MN stay in sync.
 */

import { MapPin, Compass } from 'lucide-react'
import type { MegaNavBundle } from '@/lib/i18n/public/megaNav'

/** First N items match `megaNav.popular` order for mobile featured list */
export const POPULAR_DESTINATION_HREFS = [
  '/destinations/gobi-desert',
  '/destinations/lake-khovsgol',
  '/destinations/altai-mountains',
  '/destinations/ulaanbaatar',
  '/destinations/terelj-national-park',
  '/destinations/orkhon-valley',
] as const

const BROWSE_HREFS = ['/destinations', '/tours', '/stays'] as const

export function buildNavItems(m: MegaNavBundle) {
  return [
    {
      key: 'destinations' as const,
      label: m.rootDestinations,
      menu: {
        sections: [
          {
            title: m.popularTitle,
            icon: MapPin,
            items: m.popular.map((item, i) => ({
              label: item.label,
              description: item.description,
              href: POPULAR_DESTINATION_HREFS[i],
            })),
          },
          {
            title: m.browseTitle,
            icon: Compass,
            items: m.browse.map((item, i) => ({
              label: item.label,
              description: item.description,
              href: BROWSE_HREFS[i],
            })),
          },
        ],
      },
    },
    { key: 'tours' as const, label: m.rootTours, href: '/tours' },
    { key: 'stays' as const, label: m.rootStays, href: '/stays' },
  ]
}

export type BuiltNavItem = (ReturnType<typeof buildNavItems>)[number]
