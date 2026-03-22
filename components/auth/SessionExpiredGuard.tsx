'use client'

import { useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'

/**
 * When token refresh fails, session.error is set.
 * This guard signs out and redirects to login so the user isn't stuck.
 */
export function SessionExpiredGuard() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status !== 'authenticated' || !session) return
    if ((session as { error?: string }).error === 'TokenRefreshFailed') {
      signOut({ redirect: false }).then(() => {
        router.push('/auth/login')
      })
    }
  }, [session, status, router])

  return null
}
