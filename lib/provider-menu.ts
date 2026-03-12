import type { ProviderType } from '@/lib/mock-data/provider'

export interface MenuItem {
  id: string          // unique stable key for active-state tracking
  label: string
  href: string
  icon: string
}

// Base items every provider always sees
const SHARED_ITEMS: MenuItem[] = [
  { id: 'overview',   label: 'Overview',  href: '/dashboard',                       icon: 'LayoutDashboard' },
  { id: 'messages',   label: 'Messages',  href: '/dashboard/business/messages',     icon: 'MessageSquare'   },
  { id: 'analytics',  label: 'Analytics', href: '/dashboard/business/analytics',    icon: 'BarChart2'       },
  { id: 'settings',   label: 'Settings',  href: '/dashboard/business/settings',     icon: 'Settings'        },
]

// Type-specific items — every item gets a unique id
const TYPE_ITEMS: Record<ProviderType, MenuItem[]> = {
  tour_operator: [
    { id: 'tour-create',   label: 'Create Tour',   href: '/dashboard/business/services',  icon: 'Plus'          },
    { id: 'tour-manage',   label: 'Manage Tours',  href: '/dashboard/business/services',  icon: 'Compass'       },
    { id: 'tour-bookings', label: 'Bookings',      href: '/dashboard/business/bookings',  icon: 'CalendarCheck' },
    { id: 'tour-calendar', label: 'Calendar',      href: '/dashboard/business/calendar',  icon: 'CalendarDays'  },
    { id: 'tour-reviews',  label: 'Reviews',       href: '/dashboard/business/reviews',   icon: 'Star'          },
    { id: 'tour-payments', label: 'Payments',      href: '/dashboard/business/payments',  icon: 'CreditCard'    },
  ],
  car_rental: [
    { id: 'car-create',    label: 'Add Vehicle',      href: '/dashboard/business/services',  icon: 'Plus'          },
    { id: 'car-manage',    label: 'Manage Vehicles',  href: '/dashboard/business/services',  icon: 'Car'           },
    { id: 'car-reserve',   label: 'Reservations',     href: '/dashboard/business/bookings',  icon: 'CalendarCheck' },
    { id: 'car-avail',     label: 'Availability',     href: '/dashboard/business/calendar',  icon: 'CalendarDays'  },
    { id: 'car-payments',  label: 'Payments',         href: '/dashboard/business/payments',  icon: 'CreditCard'    },
  ],
  accommodation: [
    { id: 'acc-create',    label: 'Add Property',   href: '/dashboard/business/services',  icon: 'Plus'          },
    { id: 'acc-rooms',     label: 'Manage Rooms',   href: '/dashboard/business/services',  icon: 'BedDouble'     },
    { id: 'acc-reserve',   label: 'Reservations',   href: '/dashboard/business/bookings',  icon: 'CalendarCheck' },
    { id: 'acc-calendar',  label: 'Calendar',       href: '/dashboard/business/calendar',  icon: 'CalendarDays'  },
    { id: 'acc-reviews',   label: 'Reviews',        href: '/dashboard/business/reviews',   icon: 'Star'          },
    { id: 'acc-payments',  label: 'Payments',       href: '/dashboard/business/payments',  icon: 'CreditCard'    },
  ],
}

// Section display names per type
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
 * Returns an array of sections, each with a label and items.
 */
export function buildProviderMenu(providerTypes: ProviderType[]): MenuSection[] {
  const sections: MenuSection[] = []

  // 1. Always: Dashboard overview
  sections.push({
    key: 'dashboard',
    label: '',
    items: [SHARED_ITEMS[0]],
  })

  // 2. Per-type sections
  for (const type of providerTypes) {
    sections.push({
      key: type,
      label: SECTION_LABELS[type],
      items: TYPE_ITEMS[type],
    })
  }

  // 3. Always: Shared bottom section
  sections.push({
    key: 'shared',
    label: 'General',
    items: SHARED_ITEMS.slice(1),
  })

  return sections
}
