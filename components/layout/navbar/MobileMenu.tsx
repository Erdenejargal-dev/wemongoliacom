'use client'

/**
 * components/layout/navbar/MobileMenu.tsx
 *
 * Mobile/tablet navigation drawer (visible below lg breakpoint).
 *
 * Visual structure (signed-in traveler):
 *   ① User block — avatar + name + role badge
 *   ② Primary actions — Trips, Messages
 *   ③ Discover — Tours, Stays, Destinations (top 4 + view all)
 *   ④ Account — My Account, Become a Host
 *   ⑤ System — Sign out
 *
 * Provider order: Business first → Messages → Discover → Settings → Sign out
 * Admin order:    Admin Console → My Account → Discover → Sign out
 * Guest order:    Discover → Sign in / Get Started / Become a Host
 */

import { useState } from 'react'
import {
  ChevronRight, ChevronDown, LogOut, Sparkles,
  ShieldCheck, Building2, MessageSquare, CalendarCheck,
  Settings, CircleUserRound, Compass, BedDouble, MapPin, ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import { AuthModal } from '@/components/AuthModal'
import { Button } from '@/components/ui/button'
import { showBecomeAHost } from '@/lib/navigation'

// ── Top destinations shown in mobile accordion (max 4 — keeps it scannable) ──

const FEATURED_DESTINATIONS = [
  { label: 'Gobi Desert',     href: '/destinations/gobi-desert'    },
  { label: 'Lake Khövsgöl',   href: '/destinations/lake-khovsgol'  },
  { label: 'Altai Mountains', href: '/destinations/altai-mountains' },
  { label: 'Ulaanbaatar',     href: '/destinations/ulaanbaatar'    },
]

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-4 pt-5 pb-1.5 text-[10px] font-semibold text-gray-400 uppercase tracking-widest select-none">
      {children}
    </p>
  )
}

// ── Menu row ──────────────────────────────────────────────────────────────────

interface RowProps {
  href:       string
  label:      string
  icon?:      React.ElementType
  onClick:    () => void
  variant?:   'default' | 'primary' | 'admin' | 'danger' | 'brand'
}

function MenuRow({ href, label, icon: Icon, onClick, variant = 'default' }: RowProps) {
  const base   = 'flex items-center gap-3 w-full px-4 py-3 text-sm font-medium transition-colors active:opacity-70'
  const styles = {
    default: `${base} text-gray-700 hover:bg-gray-50`,
    primary: `${base} text-gray-900 font-semibold hover:bg-gray-50`,
    admin:   `${base} text-amber-700 bg-amber-50/80 hover:bg-amber-100`,
    danger:  `${base} text-red-600 hover:bg-red-50`,
    brand:   `${base} text-brand-700 hover:bg-brand-50`,
  }

  return (
    <Link href={href} onClick={onClick} className={styles[variant]}>
      {Icon && (
        <span className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          variant === 'admin'   ? 'bg-amber-100' :
          variant === 'primary' ? 'bg-gray-100'  :
          variant === 'brand'   ? 'bg-brand-50'  :
          'bg-gray-100'
        }`}>
          <Icon className={`w-4 h-4 ${
            variant === 'admin'   ? 'text-amber-500' :
            variant === 'primary' ? 'text-gray-600'  :
            variant === 'brand'   ? 'text-brand-500' :
            'text-gray-500'
          }`} />
        </span>
      )}
      <span className="flex-1">{label}</span>
      <ChevronRight className="w-3.5 h-3.5 text-gray-300 shrink-0" />
    </Link>
  )
}

// ── Discover section (shared across all roles) ────────────────────────────────

function DiscoverSection({
  onClose,
  showDestinations,
  onToggleDestinations,
}: {
  onClose:              () => void
  showDestinations:     boolean
  onToggleDestinations: () => void
}) {
  return (
    <>
      <SectionLabel>Discover</SectionLabel>

      <MenuRow href="/tours" label="Tours" icon={Compass} onClick={onClose} />
      <MenuRow href="/stays" label="Stays" icon={BedDouble} onClick={onClose} />

      {/* Destinations — accordion, top 4 only */}
      <div>
        <button
          onClick={onToggleDestinations}
          className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 active:opacity-70 transition-colors"
          aria-expanded={showDestinations}
        >
          <span className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
            <MapPin className="w-4 h-4 text-gray-500" />
          </span>
          <span className="flex-1">Destinations</span>
          <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${showDestinations ? 'rotate-180' : ''}`} />
        </button>

        {showDestinations && (
          <div className="bg-gray-50/70 border-y border-gray-100 py-2 px-4">
            <ul className="space-y-0.5">
              {FEATURED_DESTINATIONS.map(d => (
                <li key={d.href}>
                  <Link
                    href={d.href}
                    onClick={onClose}
                    className="block py-2.5 pl-11 text-sm text-gray-600 hover:text-brand-600 active:text-brand-700 transition-colors"
                  >
                    {d.label}
                  </Link>
                </li>
              ))}
              {/* View all link */}
              <li>
                <Link
                  href="/destinations"
                  onClick={onClose}
                  className="flex items-center gap-1.5 py-2.5 pl-11 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
                >
                  View all destinations
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </li>
            </ul>
          </div>
        )}
      </div>
    </>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface MobileMenuProps {
  session: Session | null
  onClose: () => void
}

export function MobileMenu({ session, onClose }: MobileMenuProps) {
  const [showDestinations, setShowDestinations] = useState(false)

  const role       = session?.user?.role
  const isAdmin    = role === 'admin'
  const isProvider = role === 'provider_owner'
  const name       = session?.user?.name
  const email      = session?.user?.email

  const initials = name
    ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    /**
     * lg:hidden — matches hamburger breakpoint.
     * (Old md:hidden caused the menu to be invisible on tablets.)
     */
    <div className="lg:hidden border-t border-gray-100 bg-white max-h-[90vh] overflow-y-auto shadow-lg">

      {/* ════════════════════════════════════════
          SIGNED-IN STATE
          ════════════════════════════════════════ */}
      {session && (
        <>
          {/* ① User block ─────────────────────── */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-gray-100">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 ${
              isAdmin ? 'bg-amber-500' : 'bg-gradient-to-br from-brand-400 to-brand-600'
            }`}>
              {isAdmin ? <ShieldCheck className="w-5 h-5" /> : initials}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 mb-0.5">
                <p className="text-sm font-bold text-gray-900 truncate">{name}</p>
                {isAdmin && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200">
                    ADMIN
                  </span>
                )}
                {isProvider && (
                  <span className="shrink-0 px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-50 text-brand-700 border border-brand-200">
                    HOST
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 truncate">{email}</p>
            </div>
          </div>

          {/* ══ TRAVELER ══════════════════════════ */}
          {!isAdmin && !isProvider && (
            <>
              {/* ② Primary actions */}
              <SectionLabel>My Activity</SectionLabel>
              <MenuRow href="/account/trips"    label="My Trips"  icon={CalendarCheck}  onClick={onClose} variant="primary" />
              <MenuRow href="/account/messages" label="Messages"  icon={MessageSquare}  onClick={onClose} variant="primary" />

              {/* ③ Discover */}
              <DiscoverSection
                onClose={onClose}
                showDestinations={showDestinations}
                onToggleDestinations={() => setShowDestinations(v => !v)}
              />

              {/* ④ Account */}
              <SectionLabel>Account</SectionLabel>
              <MenuRow href="/account" label="My Account" icon={CircleUserRound} onClick={onClose} />
              {showBecomeAHost(role) && (
                <MenuRow href="/onboarding" label="Become a Host" icon={Sparkles} onClick={onClose} variant="brand" />
              )}

              {/* ⑤ System */}
              <div className="border-t border-gray-100 mt-2">
                <button
                  onClick={() => { signOut(); onClose() }}
                  className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-medium text-red-600 hover:bg-red-50 active:opacity-70 transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <LogOut className="w-4 h-4 text-red-400" />
                  </span>
                  Sign out
                </button>
              </div>
            </>
          )}

          {/* ══ PROVIDER ══════════════════════════ */}
          {isProvider && (
            <>
              {/* ② Business actions (primary) */}
              <SectionLabel>Business</SectionLabel>
              <MenuRow href="/dashboard/business"          label="Business Portal" icon={Building2}    onClick={onClose} variant="primary" />
              <MenuRow href="/dashboard/business/bookings" label="Bookings"        icon={CalendarCheck} onClick={onClose} />
              <MenuRow href="/dashboard/business/messages" label="Messages"        icon={MessageSquare} onClick={onClose} variant="primary" />

              {/* ③ Discover */}
              <DiscoverSection
                onClose={onClose}
                showDestinations={showDestinations}
                onToggleDestinations={() => setShowDestinations(v => !v)}
              />

              {/* ④ Settings + Sign out */}
              <SectionLabel>Settings</SectionLabel>
              <MenuRow href="/dashboard/business/settings" label="Business Settings" icon={Settings} onClick={onClose} />
              <div className="border-t border-gray-100 mt-2">
                <button
                  onClick={() => { signOut(); onClose() }}
                  className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-medium text-red-600 hover:bg-red-50 active:opacity-70 transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <LogOut className="w-4 h-4 text-red-400" />
                  </span>
                  Sign out
                </button>
              </div>
            </>
          )}

          {/* ══ ADMIN ═════════════════════════════ */}
          {isAdmin && (
            <>
              {/* ② Admin console (highlighted) */}
              <SectionLabel>Admin</SectionLabel>
              <MenuRow href="/admin"   label="Admin Console" icon={ShieldCheck}     onClick={onClose} variant="admin" />
              <MenuRow href="/account" label="My Account"    icon={CircleUserRound} onClick={onClose} />

              {/* ③ Discover */}
              <DiscoverSection
                onClose={onClose}
                showDestinations={showDestinations}
                onToggleDestinations={() => setShowDestinations(v => !v)}
              />

              {/* ④ Sign out */}
              <div className="border-t border-gray-100 mt-2">
                <button
                  onClick={() => { signOut(); onClose() }}
                  className="flex items-center gap-3 w-full px-4 py-3.5 text-sm font-medium text-red-600 hover:bg-red-50 active:opacity-70 transition-colors"
                >
                  <span className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0">
                    <LogOut className="w-4 h-4 text-red-400" />
                  </span>
                  Sign out
                </button>
              </div>
            </>
          )}
        </>
      )}

      {/* ════════════════════════════════════════
          SIGNED-OUT STATE
          ════════════════════════════════════════ */}
      {!session && (
        <>
          {/* Discover first — give context before CTAs */}
          <DiscoverSection
            onClose={onClose}
            showDestinations={showDestinations}
            onToggleDestinations={() => setShowDestinations(v => !v)}
          />

          {/* Auth CTAs */}
          <div className="border-t border-gray-100 p-4 space-y-2.5 mt-2">
            <AuthModal defaultTab="login" trigger={
              <button
                onClick={onClose}
                className="w-full py-3 text-sm font-semibold text-gray-700 border border-gray-200 rounded-xl hover:bg-gray-50 active:opacity-70 transition-colors"
              >
                Sign in
              </button>
            } />
            <AuthModal defaultTab="register" trigger={
              <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2 h-auto">
                Get Started
                <ArrowRight className="w-4 h-4" />
              </Button>
            } />
            <Link
              href="/auth/login?callbackUrl=%2Fonboarding"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-brand-700 border border-brand-200 rounded-xl hover:bg-brand-50 active:opacity-70 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              Become a Host
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
