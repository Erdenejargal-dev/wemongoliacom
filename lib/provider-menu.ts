export type ProviderType = 'tour_operator' | 'car_rental' | 'accommodation'

export interface MenuItem {
  id: string          // unique stable key for active-state tracking
  label: string
  href: string
  icon: string
}

/**
 * Phase 1–3: Sections with real backend support.
 * Hidden (404): Services, Calendar, Payments.
 */
const SHARED_ITEMS: MenuItem[] = [
  { id: 'overview',   label: 'Overview',   href: '/dashboard/business',            icon: 'LayoutDashboard' },
  { id: 'services',   label: 'Services',   href: '/dashboard/business/services',   icon: 'Compass'         },
  { id: 'bookings',   label: 'Bookings',   href: '/dashboard/business/bookings',   icon: 'CalendarCheck'   },
  { id: 'messages',   label: 'Messages',   href: '/dashboard/business/messages',   icon: 'MessageSquare'   },
  { id: 'reviews',    label: 'Reviews',    href: '/dashboard/business/reviews',    icon: 'Star'            },
  { id: 'analytics',  label: 'Analytics',  href: '/dashboard/business/analytics',  icon: 'BarChart2'       },
  { id: 'settings',   label: 'Settings',   href: '/dashboard/business/settings',   icon: 'Settings'        },
]

// Section display names per type (used for provider badges, not nav in Phase 1)
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

/**
 * Build the full sidebar menu for a provider based on their providerTypes.
 * Phase 1: Flat menu with only real, supported sections (Overview, Bookings, Analytics, Settings).
 */
export function buildProviderMenu(providerTypes: ProviderType[]): MenuSection[] {
  // Phase 1: Single section with all supported items (no per-type subnav to avoid duplicates)
  return [
    {
      key: 'main',
      label: '',
      items: SHARED_ITEMS,
    },
  ]
}
