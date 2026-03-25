import Link from 'next/link'
import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await auth()
  const role = session?.user?.role

  if (role === 'provider_owner') redirect('/dashboard/business')

  return (
    <div className="space-y-5">
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h1 className="text-lg font-bold text-gray-900">My Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Quick access to your trips, bookings, and account.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/account/trips" className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-gray-900">My Trips</p>
          <p className="text-xs text-gray-500 mt-1">View upcoming and past bookings.</p>
        </Link>
        <Link href="/account" className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-gray-900">Account</p>
          <p className="text-xs text-gray-500 mt-1">Profile, settings, and preferences.</p>
        </Link>
        <Link href="/tours" className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow">
          <p className="text-sm font-semibold text-gray-900">Explore Tours</p>
          <p className="text-xs text-gray-500 mt-1">Find your next adventure.</p>
        </Link>
      </div>

      {role === 'admin' ? (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Business Portal</p>
          <p className="text-xs text-gray-500 mt-1">Manage your listings, bookings, and messages.</p>
          <Link href="/dashboard/business" className="inline-block mt-3 text-sm font-semibold text-green-600 hover:text-green-700 underline">
            Go to Business Portal →
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <p className="text-sm font-semibold text-gray-900">Become a Host</p>
          <p className="text-xs text-gray-500 mt-1">Register your business and start listing tours, cars, or accommodation.</p>
          <Link href="/onboarding" className="inline-block mt-3 text-sm font-semibold text-green-600 hover:text-green-700 underline">
            Start onboarding →
          </Link>
        </div>
      )}
    </div>
  )
}
