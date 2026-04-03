'use client'

import { useState, useRef, useEffect } from 'react'
import {
  LogOut, ChevronDown, ShieldCheck, Building2, MessageSquare,
  CalendarCheck, Settings, CircleUserRound, Sparkles,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'
import { getUserNavItems, showBecomeAHost } from '@/lib/navigation'

// ── Icon resolver ─────────────────────────────────────────────────────────────
// Maps iconName strings (from navigation.ts) → Lucide component references

const ICON_MAP: Record<string, LucideIcon> = {
  ShieldCheck, Building2, MessageSquare, CalendarCheck, Settings, CircleUserRound,
}

function NavIcon({ name, className }: { name: string; className?: string }) {
  const Icon = ICON_MAP[name] ?? CircleUserRound
  return <Icon className={className} />
}

// ── Component ─────────────────────────────────────────────────────────────────

interface UserMenuProps {
  name?:  string | null
  email?: string | null
  role?:  string | null
}

export function UserMenu({ name, email, role }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const isAdmin    = role === 'admin'
  const isProvider = role === 'provider_owner'

  const initials = name
    ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U'

  // Shared config — single source of truth (same data as MobileMenu)
  const items = getUserNavItems(role)

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 pr-3"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${
          isAdmin ? 'bg-amber-500' : 'bg-gradient-to-br from-brand-400 to-brand-600'
        }`}>
          {isAdmin ? <ShieldCheck className="w-4 h-4" /> : initials}
        </div>
        <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden sm:block">
          {name}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-150 ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
          {/* Role accent bar */}
          <div className={`h-0.5 absolute top-0 inset-x-0 ${isAdmin ? 'bg-amber-400' : 'bg-gradient-to-r from-brand-400 to-brand-500'}`} />

          {/* User identity header */}
          <div className="px-4 py-3 border-b border-gray-50">
            <div className="flex items-center gap-2 mb-0.5">
              <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
              {isAdmin && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 text-amber-700 border border-amber-200 shrink-0">
                  ADMIN
                </span>
              )}
              {isProvider && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-brand-50 text-brand-700 border border-brand-200 shrink-0">
                  HOST
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 truncate">{email}</p>
          </div>

          {/* Role-specific nav items */}
          {items.map(item => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
            >
              <NavIcon
                name={item.iconName}
                className={`w-4 h-4 ${isAdmin && item.href === '/admin' ? 'text-amber-500' : 'text-gray-400'}`}
              />
              {item.label}
            </Link>
          ))}

          {/* Become a Host — traveler only */}
          {showBecomeAHost(role) && (
            <Link
              href="/onboarding"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-brand-700 hover:bg-brand-50 transition-colors"
            >
              <Sparkles className="w-4 h-4 text-brand-500" />
              Become a Host
            </Link>
          )}

          {/* Sign out */}
          <div className="border-t border-gray-100 mt-1 pt-1">
            <button
              onClick={() => { signOut(); setOpen(false) }}
              className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
