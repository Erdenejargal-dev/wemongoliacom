'use client'

import { useState } from 'react'
import { mockUser, mockTrips, mockReviews } from '@/lib/mock-data/account'
import { AccountSidebar, type AccountSection } from '@/components/account/AccountSidebar'
import { ProfileForm } from '@/components/account/ProfileForm'
import { SecuritySettings } from '@/components/account/SecuritySettings'
import { NotificationSettings } from '@/components/account/NotificationSettings'
import { TripsSection } from '@/components/account/TripsSection'
import { ReviewsSection } from '@/components/account/ReviewsSection'

const TITLES: Record<AccountSection, { title: string; desc: string }> = {
  profile:  { title: 'My Profile',    desc: 'Update your personal info and profile photo' },
  settings: { title: 'Settings',      desc: 'Password security and notification preferences' },
  trips:    { title: 'My Trips',      desc: 'Your upcoming and past bookings' },
  reviews:  { title: 'My Reviews',    desc: 'Reviews you have written for tours' },
}

export default function AccountPage() {
  const [section, setSection] = useState<AccountSection>('profile')
  const { title, desc } = TITLES[section]

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <h1 className="text-lg font-bold text-gray-900">My Account</h1>
          <p className="text-xs text-gray-500 mt-0.5">Manage your profile, trips, and preferences</p>
        </div>
      </div>

      {/* Mobile section selector */}
      <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto">
        {(['profile','settings','trips','reviews'] as AccountSection[]).map(s => (
          <button key={s} onClick={() => setSection(s)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors capitalize ${section === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {s === 'trips' ? 'My Trips' : s === 'reviews' ? 'Reviews' : s.charAt(0).toUpperCase() + s.slice(1)}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-7">

          {/* Sidebar — hidden on mobile (uses top pill nav instead) */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              <AccountSidebar user={mockUser} active={section} onSelect={setSection} />
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Section header */}
            <div className="mb-5">
              <h2 className="text-base font-bold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>

            {/* Section content */}
            {section === 'profile' && (
              <ProfileForm initial={mockUser} />
            )}

            {section === 'settings' && (
              <div className="space-y-5">
                <SecuritySettings />
                <NotificationSettings />
              </div>
            )}

            {section === 'trips' && (
              <TripsSection trips={mockTrips} />
            )}

            {section === 'reviews' && (
              <ReviewsSection initialReviews={mockReviews} />
            )}
          </div>

        </div>
      </div>
    </div>
  )
}
