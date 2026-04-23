/**
 * Mobile navigation drawer – section labels and role-specific links.
 * Role badges (ADMIN / HOST) stay ASCII for recognition; can translate later.
 */

export type PublicMobileNavCopy = {
  allDestinations: string
  discover: string
  account: string
  settings: string
  myTrips: string
  messages: string
  places: string
  exploreMongolia: string
  myAccount: string
  portal: string
  bookings: string
  analytics: string
  businessSettings: string
  adminConsole: string
  signOut: string
  badgeAdmin: string
  badgeHost: string
}

export const mobileNavEn: PublicMobileNavCopy = {
  allDestinations: 'All destinations',
  discover: 'Discover',
  account: 'Account',
  settings: 'Settings',
  myTrips: 'My Trips',
  messages: 'Messages',
  places: 'Places',
  exploreMongolia: 'Explore Mongolia',
  myAccount: 'My Account',
  portal: 'Portal',
  bookings: 'Bookings',
  analytics: 'Analytics',
  businessSettings: 'Business Settings',
  adminConsole: 'Admin Console',
  signOut: 'Sign out',
  badgeAdmin: 'ADMIN',
  badgeHost: 'HOST',
}

export const mobileNavMn: PublicMobileNavCopy = {
  allDestinations: 'Бүх чиглэл',
  discover: 'Нээх',
  account: 'Данс',
  settings: 'Тохиргоо',
  myTrips: 'Аяллын захиалга',
  messages: 'Мессеж',
  places: 'Газар',
  exploreMongolia: 'Монгол орноор аялах',
  myAccount: 'Миний бүртгэл',
  portal: 'Портал',
  bookings: 'Захиалга',
  analytics: 'Статистик',
  businessSettings: 'Бизнес тохиргоо',
  adminConsole: 'Админ самбар',
  signOut: 'Гарах',
  badgeAdmin: 'АДМИН',
  badgeHost: 'ХӨТӨЧ',
}
