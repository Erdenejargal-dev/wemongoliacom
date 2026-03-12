export type ProviderType = 'tour_operator' | 'car_rental' | 'accommodation'

export interface Provider {
  id: string
  name: string
  description: string
  location: string
  phone: string
  email: string
  website?: string
  languages: string[]
  logo?: string
  coverImage?: string
  providerTypes: ProviderType[]
  completedOnboarding: boolean
  createdAt: string
}

export interface OnboardingState {
  // Step 1
  name: string
  description: string
  location: string
  phone: string
  email: string
  // Step 2
  providerTypes: ProviderType[]
  // Step 3
  logo: string
  coverImage: string
  website: string
  languages: string[]
}

export const PROVIDER_TYPE_META: Record<ProviderType, {
  label: string
  description: string
  icon: string
  color: string
  menuItems: { label: string; href: string; icon: string }[]
}> = {
  tour_operator: {
    label: 'Tours & Experiences',
    description: 'Offer guided tours, excursions, cultural experiences, and outdoor adventures.',
    icon: '🗺️',
    color: 'green',
    menuItems: [
      { label: 'Dashboard',    href: '/host/dashboard',           icon: 'LayoutDashboard' },
      { label: 'Create Tour',  href: '/host/tours/create',        icon: 'Plus' },
      { label: 'Manage Tours', href: '/host/tours',               icon: 'Compass' },
      { label: 'Bookings',     href: '/host/bookings',            icon: 'CalendarCheck' },
      { label: 'Reviews',      href: '/host/reviews',             icon: 'Star' },
      { label: 'Messages',     href: '/host/messages',            icon: 'MessageSquare' },
    ],
  },
  car_rental: {
    label: 'Car Rentals / Drivers',
    description: 'Rent vehicles, offer driver services, or provide transport for travelers.',
    icon: '🚐',
    color: 'blue',
    menuItems: [
      { label: 'Dashboard',          href: '/host/dashboard',           icon: 'LayoutDashboard' },
      { label: 'Add Vehicle',        href: '/host/vehicles/create',     icon: 'Plus' },
      { label: 'Manage Vehicles',    href: '/host/vehicles',            icon: 'Car' },
      { label: 'Reservations',       href: '/host/reservations',        icon: 'CalendarCheck' },
      { label: 'Availability',       href: '/host/availability',        icon: 'CalendarDays' },
      { label: 'Messages',           href: '/host/messages',            icon: 'MessageSquare' },
    ],
  },
  accommodation: {
    label: 'Camps / Hotels / Lodges',
    description: 'List ger camps, hotels, lodges, or any type of accommodation for travelers.',
    icon: '🏕️',
    color: 'orange',
    menuItems: [
      { label: 'Dashboard',       href: '/host/dashboard',           icon: 'LayoutDashboard' },
      { label: 'Add Property',    href: '/host/properties/create',   icon: 'Plus' },
      { label: 'Manage Rooms',    href: '/host/rooms',               icon: 'BedDouble' },
      { label: 'Reservations',    href: '/host/reservations',        icon: 'CalendarCheck' },
      { label: 'Calendar',        href: '/host/calendar',            icon: 'CalendarDays' },
      { label: 'Reviews',         href: '/host/reviews',             icon: 'Star' },
      { label: 'Messages',        href: '/host/messages',            icon: 'MessageSquare' },
    ],
  },
}

// Example existing providers
export const mockProviders: Provider[] = [
  {
    id: 'provider-101',
    name: 'Gobi Adventure Tours',
    description: 'We organize adventure tours across the Gobi Desert and the wider Mongolia.',
    location: 'Ulaanbaatar',
    phone: '+976 9911 2233',
    email: 'info@gobiadventure.mn',
    website: 'https://gobiadventure.mn',
    languages: ['English', 'Mongolian'],
    providerTypes: ['tour_operator'],
    completedOnboarding: true,
    createdAt: '2024-01-15',
  },
  {
    id: 'provider-102',
    name: 'Steppe Riders & Nomad Camps',
    description: 'Traditional ger camps and horseback tours in Central Mongolia.',
    location: 'Kharkhorin',
    phone: '+976 9955 7788',
    email: 'info@stepperiders.mn',
    languages: ['English', 'Mongolian', 'Russian'],
    providerTypes: ['tour_operator', 'accommodation'],
    completedOnboarding: true,
    createdAt: '2024-03-20',
  },
]

export const DEFAULT_ONBOARDING: OnboardingState = {
  name: '',
  description: '',
  location: '',
  phone: '',
  email: '',
  providerTypes: [],
  logo: '',
  coverImage: '',
  website: '',
  languages: [],
}
