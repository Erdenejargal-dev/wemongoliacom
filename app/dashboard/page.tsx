import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { TravelerDashboardContent } from '@/components/dashboard/TravelerDashboardContent'

/**
 * app/dashboard/page.tsx  (server component)
 *
 * Provider owners are redirected to the business portal immediately.
 * Everyone else (traveler, admin) gets the traveler dashboard.
 * UI strings come from TravelerDashboardContent (client) via useTravelerLocale().
 */
export default async function DashboardPage() {
  const session = await auth()
  const role    = session?.user?.role

  if (role === 'provider_owner') redirect('/dashboard/business')

  return <TravelerDashboardContent role={role} />
}
