'use client'

import { useState } from 'react'
import { ChevronDown, Search, CalendarDays, Building2, Sparkles, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import { navItems } from './mega-menu-data'
import { AuthModal } from '@/components/AuthModal'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'

interface MobileMenuProps {
  session: Session | null
  onClose: () => void
}

export function MobileMenu({ session, onClose }: MobileMenuProps) {
  const [expandedKey, setExpandedKey] = useState<string | null>(null)

  const role       = session?.user?.role
  const isAdmin    = role === 'admin'
  const isProvider = role === 'provider_owner'

  return (
    <div className="md:hidden border-t border-gray-100 bg-white max-h-[80vh] overflow-y-auto">
      {/* Search bar */}
      <div className="p-4 border-b border-gray-50">
        <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5">
          <Search className="w-4 h-4 text-gray-400" />
          <input
            placeholder="Search destinations, tours…"
            className="flex-1 text-sm bg-transparent focus:outline-none placeholder:text-gray-400"
          />
        </div>
        <div className="flex gap-2 mt-2 flex-wrap">
          {['Gobi Desert', 'Lake Khövsgöl', 'Terelj'].map(s => (
            <span key={s} className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full">{s}</span>
          ))}
        </div>
      </div>

      {/* Nav sections */}
      <div className="py-2">
        {navItems.map(item => {
          const hasMenu   = 'menu' in item
          const isExpanded = expandedKey === item.key

          if (!hasMenu) return (
            <Link
              key={item.key}
              href={'href' in item ? item.href : '#'}
              onClick={onClose}
              className="flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {item.label}
            </Link>
          )

          return (
            <div key={item.key}>
              <button
                onClick={() => setExpandedKey(isExpanded ? null : item.key)}
                className="flex items-center justify-between w-full px-5 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                {item.label}
                <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
              </button>

              {isExpanded && (
                <div className="bg-gray-50/70 border-y border-gray-100 py-3">
                  {'menu' in item && item.menu.sections.map(section => (
                    <div key={section.title} className="px-5 mb-4">
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                        {section.title}
                      </p>
                      <ul className="space-y-1">
                        {section.items.map(menuItem => (
                          <li key={menuItem.label}>
                            <Link
                              href={menuItem.href}
                              onClick={onClose}
                              className="flex items-center justify-between py-2 text-sm text-gray-700 hover:text-brand-600 transition-colors"
                            >
                              <span>{menuItem.label}</span>
                              {'description' in menuItem && (
                                <span className="text-xs text-gray-400 hidden xs:block">{menuItem.description}</span>
                              )}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Auth section */}
      <div className="border-t border-gray-100 p-4 space-y-2">
        {session ? (
          <>
            {/* Admin: show Admin Console link, not provider portal */}
            {isAdmin ? (
              <Link
                href="/admin"
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 hover:bg-amber-100 transition-colors"
              >
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                Admin Console
              </Link>
            ) : isProvider ? (
              <Link
                href="/dashboard/business"
                onClick={onClose}
                className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <Building2 className="w-4 h-4 text-gray-400" />
                Business Portal
              </Link>
            ) : (
              <>
                <Link
                  href="/account/trips"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <CalendarDays className="w-4 h-4 text-gray-400" />
                  My Trips
                </Link>
                <Link
                  href="/onboarding"
                  onClick={onClose}
                  className="flex items-center gap-3 p-3 rounded-xl text-sm font-medium text-brand-700 hover:bg-brand-50 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-brand-500" />
                  Become a Host
                </Link>
              </>
            )}

            <button
              onClick={() => { signOut(); onClose() }}
              className="flex items-center gap-3 w-full p-3 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              Sign out
            </button>
          </>
        ) : (
          <div className="flex flex-col gap-2">
            <AuthModal defaultTab="login" trigger={
              <button onClick={onClose} className="w-full py-2.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                Sign in
              </button>
            } />
            <AuthModal defaultTab="register" trigger={
              <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-2.5 text-sm font-medium flex items-center justify-center gap-2">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            } />
            <Link
              href="/auth/login?callbackUrl=%2Fonboarding"
              onClick={onClose}
              className="w-full py-2.5 text-sm font-medium text-center text-brand-700 border border-brand-200 rounded-xl hover:bg-brand-50 transition-colors"
            >
              Become a Host
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
