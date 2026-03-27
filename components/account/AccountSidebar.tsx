'use client'

import { User, Settings, MapPin, Star, ChevronRight } from 'lucide-react'
import type { UserProfile } from '@/lib/mock-data/account'

export type AccountSection = 'profile' | 'settings' | 'trips' | 'reviews'

const NAV: { id: AccountSection; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: 'profile',  label: 'Profile',   icon: <User className="w-4 h-4" />,     desc: 'Personal info & avatar' },
  { id: 'settings', label: 'Settings',  icon: <Settings className="w-4 h-4" />, desc: 'Password & notifications' },
  { id: 'trips',    label: 'My Trips',  icon: <MapPin className="w-4 h-4" />,   desc: 'Bookings & upcoming tours' },
  { id: 'reviews',  label: 'Reviews',   icon: <Star className="w-4 h-4" />,     desc: 'Your written reviews' },
]

interface AccountSidebarProps {
  user: UserProfile
  active: AccountSection
  onSelect: (s: AccountSection) => void
}

export function AccountSidebar({ user, active, onSelect }: AccountSidebarProps) {
  return (
    <aside className="w-full lg:w-64 shrink-0">
      {/* User card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-3">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 shrink-0 ring-2 ring-brand-100">
            <img src={user.avatar} alt={user.firstName} className="w-full h-full object-cover" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-bold text-gray-900 leading-tight">{user.firstName} {user.lastName}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
        <p className="text-xs text-gray-400">Member since {new Date(user.memberSince).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</p>
      </div>

      {/* Nav */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {NAV.map((item, i) => (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className={`w-full flex items-center justify-between px-4 py-3.5 text-left transition-colors ${i > 0 ? 'border-t border-gray-50' : ''} ${active === item.id ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
          >
            <div className="flex items-center gap-3">
              <span className={`p-1.5 rounded-lg ${active === item.id ? 'bg-brand-100 text-brand-600' : 'bg-gray-100 text-gray-500'}`}>
                {item.icon}
              </span>
              <div>
                <p className={`text-sm font-semibold ${active === item.id ? 'text-brand-700' : 'text-gray-900'}`}>{item.label}</p>
                <p className="text-xs text-gray-400">{item.desc}</p>
              </div>
            </div>
            <ChevronRight className={`w-3.5 h-3.5 transition-colors ${active === item.id ? 'text-brand-500' : 'text-gray-300'}`} />
          </button>
        ))}
      </div>
    </aside>
  )
}
