/**
 * app/admin/layout.tsx
 * Server layout — guards the entire /admin area.
 * Non-admin users are redirected to login before the page renders.
 */

import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import { AdminLayout } from '@/components/admin/AdminLayout'

export const metadata = {
  title: 'Admin Console — WeMongolia',
}

export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  // Must be authenticated and have the admin role
  if (!session?.user) {
    redirect('/auth/login?callbackUrl=/admin')
  }

  if (session.user.role !== 'admin') {
    // Authenticated but not admin — send to home
    redirect('/')
  }

  return <AdminLayout>{children}</AdminLayout>
}
