'use client'

/**
 * components/layout/navbar/MobileMenu.tsx
 *
 * Mobile/tablet navigation drawer (below lg breakpoint).
 *
 * Key fixes in this version:
 * 1. Breakpoint: lg:hidden (was md:hidden — tablets saw nothing)
 * 2. Auth modal triggers do NOT have onClick={onClose} — that was
 *    unmounting the AuthModal before it could open
 * 3. Premium UX: tiled discovery section, 2-col action grid, clean hierarchy
 *
 * Visual structure:
 *   Guest:    Discovery tiles → Auth CTAs
 *   Traveler: User block → Action grid → Discovery → Account → Sign out
 *   Provider: User block → Business grid → Discovery → Settings → Sign out
 *   Admin:    User block → Admin panel → Discovery → Sign out
 */

import { useState } from 'react'
import {
  ChevronDown, LogOut, Sparkles,
  ShieldCheck, Building2, MessageSquare, CalendarCheck,
  Settings, CircleUserRound, Compass, BedDouble, MapPin,
  ArrowRight, BarChart2,
} from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import type { Session } from 'next-auth'
import { AuthModal } from '@/components/AuthModal'
import { Button } from '@/components/ui/button'
import { showBecomeAHost } from '@/lib/navigation'
import { PreferenceSwitcher } from './PreferenceSwitcher'
import { usePublicLocale } from '@/lib/i18n/public/context'

// ── Featured destinations (max 4 in accordion) ───────────────────────────────

const FEATURED_DESTINATIONS = [
  { label: 'Gobi Desert',     href: '/destinations/gobi-desert'    },
  { label: 'Lake Khövsgöl',   href: '/destinations/lake-khovsgol'  },
  { label: 'Altai Mountains', href: '/destinations/altai-mountains' },
  { label: 'Ulaanbaatar',     href: '/destinations/ulaanbaatar'    },
]

// ── Discovery tile — Tours / Stays / Destinations ─────────────────────────────

interface TileProps {
  href:    string
  label:   string
  icon:    React.ElementType
  onClick: () => void
}

function DiscoveryTile({ href, label, icon: Icon, onClick }: TileProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-2 py-5 rounded-2xl bg-gray-50 hover:bg-gray-100 active:scale-[0.97] transition-all"
    >
      <Icon className="w-5 h-5 text-gray-600" />
      <span className="text-xs font-semibold text-gray-700">{label}</span>
    </Link>
  )
}

// ── Action tile — primary user actions ───────────────────────────────────────

interface ActionTileProps {
  href:      string
  label:     string
  icon:      React.ElementType
  onClick:   () => void
  variant?:  'default' | 'primary'
}

function ActionTile({ href, label, icon: Icon, onClick, variant = 'default' }: ActionTileProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-2.5 p-3.5 rounded-2xl transition-all active:scale-[0.97] ${
        variant === 'primary'
          ? 'bg-brand-50 hover:bg-brand-100'
          : 'bg-gray-50 hover:bg-gray-100'
      }`}
    >
      <Icon className={`w-4 h-4 shrink-0 ${variant === 'primary' ? 'text-brand-600' : 'text-gray-600'}`} />
      <span className={`text-sm font-semibold ${variant === 'primary' ? 'text-brand-700' : 'text-gray-800'}`}>
        {label}
      </span>
    </Link>
  )
}

// ── Section label ──────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-5 pt-5 pb-2 text-[10px] font-semibold text-gray-400 uppercase tracking-[0.1em] select-none">
      {children}
    </p>
  )
}

// ── Destinations accordion ────────────────────────────────────────────────────

function DestinationsAccordion({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2.5 w-full py-3 px-5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        aria-expanded={open}
      >
        <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
        <span className="flex-1 text-left">Destinations</span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="px-5 pb-2 space-y-0.5">
          {FEATURED_DESTINATIONS.map(d => (
            <Link
              key={d.href}
              href={d.href}
              onClick={onClose}
              className="block py-2.5 pl-7 text-sm text-gray-600 hover:text-brand-600 transition-colors"
            >
              {d.label}
            </Link>
          ))}
          <Link
            href="/destinations"
            onClick={onClose}
            className="flex items-center gap-1.5 py-2.5 pl-7 text-sm font-semibold text-brand-600 hover:text-brand-700 transition-colors"
          >
            All destinations <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  )
}

// ── Simple nav link ───────────────────────────────────────────────────────────

function NavLink({ href, label, icon: Icon, onClick }: {
  href:    string
  label:   string
  icon:    React.ElementType
  onClick: () => void
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className="flex items-center gap-2.5 w-full py-3 px-5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 transition-colors"
    >
      <Icon className="w-4 h-4 text-gray-400 shrink-0" />
      {label}
    </Link>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

interface MobileMenuProps {
  session: Session | null
  onClose: () => void
}

export function MobileMenu({ session, onClose }: MobileMenuProps) {
  const role       = session?.user?.role
  const isAdmin    = role === 'admin'
  const isProvider = role === 'provider_owner'
  const name       = session?.user?.name
  const email      = session?.user?.email
  const { t }      = usePublicLocale()

  const initials = name
    ? name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  return (
    /**
     * CRITICAL: lg:hidden, not md:hidden.
     * Hamburger is also lg:hidden — they must match.
     * The old md:hidden caused the drawer to be invisible on tablet (768–1023px).
     */
    <div className="lg:hidden border-t border-gray-100 bg-white max-h-[92vh] overflow-y-auto">

      {/* Phase 6 — language + currency switcher surfaced on mobile so users
          without a desktop view can still set their preference. */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 bg-gray-50">
        <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide">
          {t.nav.languageAndCurrency}
        </span>
        <PreferenceSwitcher compact />
      </div>

      {/* ══════════════════════════════════════════
          SIGNED-IN
          ══════════════════════════════════════════ */}
      {session && (
        <>
          {/* User block */}
          <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0 ${
              isAdmin ? 'bg-amber-500' : 'bg-gradient-to-br from-brand-400 to-brand-600'
            }`}>
              {isAdmin ? <ShieldCheck className="w-5 h-5" /> : initials}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
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

          {/* ── TRAVELER ─────────────────────── */}
          {!isAdmin && !isProvider && (
            <>
              {/* Primary actions: 2-column action grid */}
              <div className="px-4 pt-4 pb-2 grid grid-cols-2 gap-2">
                <ActionTile href="/account/trips"    label="My Trips"  icon={CalendarCheck} onClick={onClose} variant="primary" />
                <ActionTile href="/account/messages" label="Messages"  icon={MessageSquare} onClick={onClose} variant="primary" />
              </div>

              {/* Discover */}
              <SectionLabel>Discover</SectionLabel>
              <div className="px-4 pb-2 grid grid-cols-3 gap-2">
                <DiscoveryTile href="/tours" label="Tours" icon={Compass} onClick={onClose} />
                <DiscoveryTile href="/stays" label="Stays" icon={BedDouble} onClick={onClose} />
                <DiscoveryTile href="/destinations" label="Places" icon={MapPin} onClick={onClose} />
              </div>
              <DestinationsAccordion onClose={onClose} />

              {/* Account */}
              <SectionLabel>Account</SectionLabel>
              <NavLink href="/account" label="My Account" icon={CircleUserRound} onClick={onClose} />
              {showBecomeAHost(role) && (
                <NavLink href="/onboarding" label="Become a Host" icon={Sparkles} onClick={onClose} />
              )}
            </>
          )}

          {/* ── PROVIDER ─────────────────────── */}
          {isProvider && (
            <>
              {/* Business grid */}
              <div className="px-4 pt-4 pb-2 grid grid-cols-2 gap-2">
                <ActionTile href="/dashboard/business"          label="Portal"    icon={Building2}    onClick={onClose} variant="primary" />
                <ActionTile href="/dashboard/business/messages" label="Messages"  icon={MessageSquare} onClick={onClose} variant="primary" />
                <ActionTile href="/dashboard/business/bookings" label="Bookings"  icon={CalendarCheck} onClick={onClose} />
                <ActionTile href="/dashboard/business/analytics" label="Analytics" icon={BarChart2}    onClick={onClose} />
              </div>

              {/* Discover */}
              <SectionLabel>Discover</SectionLabel>
              <div className="px-4 pb-2 grid grid-cols-3 gap-2">
                <DiscoveryTile href="/tours" label="Tours" icon={Compass} onClick={onClose} />
                <DiscoveryTile href="/stays" label="Stays" icon={BedDouble} onClick={onClose} />
                <DiscoveryTile href="/destinations" label="Places" icon={MapPin} onClick={onClose} />
              </div>

              {/* Settings */}
              <SectionLabel>Settings</SectionLabel>
              <NavLink href="/dashboard/business/settings" label="Business Settings" icon={Settings} onClick={onClose} />
            </>
          )}

          {/* ── ADMIN ────────────────────────── */}
          {isAdmin && (
            <>
              {/* Admin console */}
              <div className="px-4 pt-4 pb-2">
                <Link
                  href="/admin"
                  onClick={onClose}
                  className="flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 font-semibold text-sm hover:bg-amber-100 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-500" />
                  Admin Console
                  <ArrowRight className="w-3.5 h-3.5 ml-auto text-amber-400" />
                </Link>
              </div>

              <NavLink href="/account" label="My Account" icon={CircleUserRound} onClick={onClose} />

              {/* Discover */}
              <SectionLabel>Discover</SectionLabel>
              <div className="px-4 pb-2 grid grid-cols-3 gap-2">
                <DiscoveryTile href="/tours" label="Tours" icon={Compass} onClick={onClose} />
                <DiscoveryTile href="/stays" label="Stays" icon={BedDouble} onClick={onClose} />
                <DiscoveryTile href="/destinations" label="Places" icon={MapPin} onClick={onClose} />
              </div>
            </>
          )}

          {/* Sign out — always at bottom */}
          <div className="px-4 py-4 mt-1 border-t border-gray-100">
            <button
              onClick={() => { signOut(); onClose() }}
              className="flex items-center gap-2 text-sm font-medium text-gray-400 hover:text-red-500 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </>
      )}

      {/* ══════════════════════════════════════════
          SIGNED-OUT
          ══════════════════════════════════════════ */}
      {!session && (
        <>
          {/* Discovery tiles */}
          <SectionLabel>Explore Mongolia</SectionLabel>
          <div className="px-4 pb-4 grid grid-cols-3 gap-2">
            <DiscoveryTile href="/tours"        label="Tours"        icon={Compass}  onClick={onClose} />
            <DiscoveryTile href="/stays"        label="Stays"        icon={BedDouble} onClick={onClose} />
            <DiscoveryTile href="/destinations" label="Destinations" icon={MapPin}    onClick={onClose} />
          </div>

          {/* Auth CTAs
           * IMPORTANT: Do NOT add onClick={onClose} to the button trigger
           * inside AuthModal. That causes the MobileMenu to unmount before
           * the modal can open — the modal never appears.
           * The AuthModal handles its own open/close state independently.
           */}
          <div className="px-4 pb-6 space-y-2.5 border-t border-gray-100 pt-4">
            <AuthModal defaultTab="login" trigger={
              <button className="w-full py-3 text-sm font-semibold text-gray-700 border border-gray-200 rounded-2xl hover:bg-gray-50 active:opacity-70 transition-colors">
                {t.nav.signIn}
              </button>
            } />
            <AuthModal defaultTab="register" trigger={
              <Button className="w-full bg-brand-500 hover:bg-brand-600 text-white rounded-2xl py-3 text-sm font-semibold flex items-center justify-center gap-2 h-auto">
                {t.nav.getStarted} <ArrowRight className="w-4 h-4" />
              </Button>
            } />
            <Link
              href="/auth/login?callbackUrl=%2Fonboarding"
              onClick={onClose}
              className="flex items-center justify-center gap-2 w-full py-3 text-sm font-semibold text-brand-700 border border-brand-200 rounded-2xl hover:bg-brand-50 transition-colors"
            >
              <Sparkles className="w-4 h-4" />
              {t.nav.becomeHost}
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
