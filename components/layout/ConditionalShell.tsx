'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import Footer from '@/components/sections/Footer'

/**
 * ConditionalShell
 * Wraps public-facing pages with Navbar + Footer.
 * Admin routes (/admin/*) get neither — they provide their own layout.
 */
export function ConditionalShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isAdmin  = pathname?.startsWith('/admin')

  if (isAdmin) {
    return <>{children}</>
  }

  return (
    <>
      <Navbar />
      {children}
      <Footer />
    </>
  )
}
