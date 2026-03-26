export type ProviderType = 'tour_operator' | 'car_rental' | 'accommodation'

export interface MenuItem {
  id: string
  label: string
  href: string
  icon: string
  badge?: string
}

export const SECTION_LABELS: Record<ProviderType, string> = {
  tour_operator: 'Tours & Experiences',
  car_rental:    'Car Rentals',
  accommodation: 'Accommodation',
}

export interface MenuSection {
  key: string
  label: string
  items: MenuItem[]
}

const CORE_ITEMS: MenuItem[] = [
  { id: 'overview',  label: 'Overview',  href: '/dashboard/business',           icon: 'LayoutDashboard' },
  { id: 'services',  label: 'Listings',  href: '/dashboard/business/services',  icon: 'Compass'         },
  { id: 'bookings',  label: 'Bookings',  href: '/dashboard/business/bookings',  icon: 'CalendarCheck'   },
  { id: 'messages',  label: 'Messages',  href: '/dashboard/business/messages',  icon: 'MessageSquare'   },
  { id: 'reviews',   label: 'Reviews',   href: '/dashboard/business/reviews',   icon: 'Star'            },
  { id: 'analytics', label: 'Analytics', href: '/dashboard/business/analytics', icon: 'BarChart2'       },
  { id: 'settings',  label: 'Settings',  href: '/dashboard/business/settings',  icon: 'Settings'        },
]

/**
 * Build the sidebar menu for a provider.
 * Currently all providers share the same core navigation.
 * When type-specific sub-routes are added (e.g. /services/tours,
 * /services/accommodations), this function will use providerTypes
 * to show only relevant listing sub-nav items.
 */
export function buildProviderMenu(_providerTypes: ProviderType[]): MenuSection[] {
  return [
    {
      key: 'main',
      label: '',
      items: CORE_ITEMS,
    },
  ]
}
