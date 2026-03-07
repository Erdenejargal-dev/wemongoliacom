'use client'

import { useState, useRef, useEffect } from 'react'
import { User, LogOut, LayoutDashboard, Heart, CalendarCheck, ChevronDown, Building2 } from 'lucide-react'
import Link from 'next/link'
import { signOut } from 'next-auth/react'

interface UserMenuProps {
  name?: string | null
  email?: string | null
}

export function UserMenu({ name, email }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const initials = name ? name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : 'U'

  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen(v => !v)}
        className="flex items-center gap-2 p-1 rounded-xl hover:bg-gray-50 transition-colors border border-gray-200 pr-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-xs font-bold">
          {initials}
        </div>
        <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate hidden sm:block">{name}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 overflow-hidden">
          <div className="h-0.5 bg-gradient-to-r from-green-400 to-teal-400 absolute top-0 inset-x-0" />

          {/* User info */}
          <div className="px-4 py-3 border-b border-gray-50">
            <p className="text-sm font-semibold text-gray-900 truncate">{name}</p>
            <p className="text-xs text-gray-400 truncate">{email}</p>
          </div>

          {[
            { href: '/dashboard', icon: LayoutDashboard, label: 'My Dashboard' },
            { href: '/dashboard/business/bookings', icon: CalendarCheck, label: 'My Trips' },
            { href: '#', icon: Heart, label: 'Saved Trips' },
            { href: '/dashboard/business', icon: Building2, label: 'Business Portal' },
          ].map(item => (
            <Link key={item.label} href={item.href} onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors">
              <item.icon className="w-4 h-4 text-gray-400" />
              {item.label}
            </Link>
          ))}

          <div className="border-t border-gray-100 mt-1 pt-1">
            <button onClick={() => { signOut(); setOpen(false) }}
              className="flex items-center gap-3 px-4 py-2.5 w-full text-sm text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
