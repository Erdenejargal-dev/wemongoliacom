'use client'

import { useState } from 'react'
import { Menu, X, Search, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { AuthModal } from '@/components/AuthModal'
import { MegaMenu } from './navbar/MegaMenu'
import { SearchBar } from './navbar/SearchBar'
import { UserMenu } from './navbar/UserMenu'
import { MobileMenu } from './navbar/MobileMenu'
import { navItems } from './navbar/mega-menu-data'
import { cn } from '@/lib/utils'
import { WeMongoliaLogo } from '@/components/brand/WeMongoliaLogo'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const { data: session, status } = useSession()
  const isLoading = status === 'loading'
  const role      = session?.user?.role

  return (
    <nav className="bg-white sticky top-0 z-50 border-b border-gray-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">

          {/* ── LEFT: Logo ──────────────────────────────────────────── */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <WeMongoliaLogo className="h-9 w-auto" fetchPriority="high" />
          </Link>

          {/* ── CENTER: Main Nav (desktop only, lg+) ────────────────── */}
          <div className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {navItems.map(item => {
              const hasMenu = 'menu' in item

              if (!hasMenu) return (
                <Link
                  key={item.key}
                  href={'href' in item ? item.href : '#'}
                  className="px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  {item.label}
                </Link>
              )

              return (
                <div key={item.key} className="relative group">
                  <button className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors group-hover:text-gray-900 group-hover:bg-gray-50">
                    {item.label}
                    <svg
                      className="w-3.5 h-3.5 text-gray-400 transition-transform duration-150 group-hover:rotate-180"
                      fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {'menu' in item && (
                    <MegaMenu sections={item.menu.sections as Parameters<typeof MegaMenu>[0]['sections']} />
                  )}
                </div>
              )
            })}
          </div>

          {/* ── RIGHT: Actions ──────────────────────────────────────── */}
          <div className="flex items-center gap-1 shrink-0">

            {/* Search toggle */}
            <button
              onClick={() => setSearchOpen(v => !v)}
              className={cn(
                'p-2 rounded-lg transition-colors text-gray-500',
                searchOpen ? 'bg-gray-100 text-gray-900' : 'hover:bg-gray-50 hover:text-gray-700',
              )}
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Auth-aware right section */}
            {isLoading ? (
              <div className="h-9 w-20 bg-gray-100 animate-pulse rounded-xl" />
            ) : session ? (
              /* Signed-in state */
              <div className="ml-1">
                <UserMenu
                  name={session.user?.name}
                  email={session.user?.email}
                  role={role}
                />
              </div>
            ) : (
              /* Signed-out state */
              <>
                <div className="hidden sm:flex items-center gap-2 ml-1">
                  <AuthModal defaultTab="login" trigger={
                    <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors">
                      Sign in
                    </button>
                  } />
                  <AuthModal defaultTab="register" trigger={
                    <Button className="bg-brand-500 hover:bg-brand-600 text-white rounded-xl px-4 py-1.5 text-sm font-medium flex items-center gap-1.5 h-auto">
                      Get Started
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  } />
                </div>

                {/* Become a Host — desktop only, guests only */}
                <Link
                  href="/auth/login?callbackUrl=%2Fonboarding"
                  className="hidden md:block text-xs font-medium text-gray-500 hover:text-gray-700 ml-2 border-l border-gray-200 pl-3 transition-colors whitespace-nowrap"
                >
                  Харилцагч болох
                </Link>
              </>
            )}

            {/* Mobile hamburger — visible below lg only */}
            <button
              className="lg:hidden ml-1 p-2 rounded-lg hover:bg-gray-100 transition-colors text-gray-600"
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Search Bar (expanded) ──────────────────────────────────── */}
      {searchOpen && (
        <div className="relative border-t border-gray-100">
          <SearchBar onClose={() => setSearchOpen(false)} />
        </div>
      )}

      {/* ── Mobile Menu ────────────────────────────────────────────── */}
      {mobileOpen && (
        <MobileMenu session={session} onClose={() => setMobileOpen(false)} />
      )}
    </nav>
  )
}
