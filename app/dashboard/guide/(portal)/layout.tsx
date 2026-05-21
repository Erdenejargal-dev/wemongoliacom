import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { GuidePortalShell, type InitialGuideProfile } from './shell'

export default async function GuidePortalLayout({ children }: { children: React.ReactNode }) {
  const session = await auth()
  if (!session?.user?.accessToken) redirect('/auth/login')

  const role = (session.user as { role?: string }).role
  if (role !== 'guide_owner' && role !== 'admin') {
    redirect('/guide-onboarding')
  }

  const base = process.env.API_URL ?? 'http://localhost:4000/api/v1'
  const res = await fetch(`${base}/guide-portal/profile`, {
    headers: { Authorization: `Bearer ${session.user.accessToken}` },
    cache: 'no-store',
  })

  if (res.status === 404 || res.status === 403) redirect('/guide-onboarding')
  if (res.status === 401) redirect('/auth/login')
  if (!res.ok) {
    return (
      <GuidePortalShell>
        <div className="py-16 text-center">
          <p className="text-sm text-red-600">Failed to load Guide Portal.</p>
          <p className="text-xs text-gray-500 mt-2">Please try again in a moment.</p>
        </div>
      </GuidePortalShell>
    )
  }

  let initialProfile: InitialGuideProfile | undefined
  try {
    const json = await res.json()
    const g = json?.data ?? json
    initialProfile = { id: g.id, name: g.name, photo: g.photo ?? null, status: g.status }
  } catch { /* non-fatal */ }

  return <GuidePortalShell initialProfile={initialProfile}>{children}</GuidePortalShell>
}
