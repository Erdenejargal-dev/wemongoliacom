import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { DashboardShell } from './shell'

export default async function BusinessPortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.accessToken) redirect('/auth/login')

  // Provider readiness: provider_owner/admin must have a provider profile.
  // We validate this server-side by calling backend /provider/profile.
  const base = process.env.API_URL ?? 'http://localhost:4000/api/v1'
  const res = await fetch(`${base}/provider/profile`, {
    headers: { Authorization: `Bearer ${session.user.accessToken}` },
    cache: 'no-store',
  })

  if (res.status === 404 || res.status === 403) redirect('/onboarding')
  if (res.status === 401) redirect('/auth/login')
  if (!res.ok) {
    // If backend is failing, keep user in portal shell but show a simple error page.
    // (Avoid looping redirects.)
    return (
      <DashboardShell>
        <div className="py-16 text-center">
          <p className="text-sm text-red-600">Failed to load Business Portal.</p>
          <p className="text-xs text-gray-500 mt-2">Please try again in a moment.</p>
        </div>
      </DashboardShell>
    )
  }

  return <DashboardShell>{children}</DashboardShell>
}

