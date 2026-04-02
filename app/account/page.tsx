'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { fetchMyProfile } from '@/lib/api/account'
import { ApiError } from '@/lib/api/client'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { fetchMyBookings } from '@/lib/api/bookings'
import { fetchMyTourReviews } from '@/lib/api/reviews'
import { mapBackendBookingToUserTrip } from '@/lib/account/mapBookingToTrips'
import type { UserProfile, UserTrip, UserReview } from '@/lib/mock-data/account'
import { AccountSidebar, type AccountSection } from '@/components/account/AccountSidebar'
import { ProfileForm } from '@/components/account/ProfileForm'
import { SecuritySettings } from '@/components/account/SecuritySettings'
import { NotificationSettings } from '@/components/account/NotificationSettings'
import { TripsSection } from '@/components/account/TripsSection'
import { ReviewsSection } from '@/components/account/ReviewsSection'
import { useTravelerLocale } from '@/lib/i18n/traveler/context'
import { Languages } from 'lucide-react'

export default function AccountPage() {
  const { t, lang, setLang } = useTravelerLocale()
  const at = t.account

  const [section, setSection] = useState<AccountSection>('profile')

  const router       = useRouter()
  const { data: session } = useSession()
  const token        = session?.user?.accessToken

  const [profile,  setProfile]  = useState<UserProfile | null>(null)
  const [trips,    setTrips]    = useState<UserTrip[]>([])
  const [reviews,  setReviews]  = useState<UserReview[]>([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState<string | null>(null)

  useEffect(() => {
    let alive = true
    async function load() {
      const freshToken = token ? await getFreshAccessToken() : null
      if (!freshToken) {
        if (!alive) return
        setLoading(false); setError(at.notSignedIn); return
      }
      setLoading(true); setError(null)
      try {
        const p = await fetchMyProfile(freshToken)
        const mapped: UserProfile = {
          id: p.id, firstName: p.firstName, lastName: p.lastName,
          email: p.email, phone: p.phone ?? '', country: p.country ?? '',
          avatar: p.avatarUrl ?? '', bio: p.bio ?? '', memberSince: p.createdAt,
        }
        const bookings    = await fetchMyBookings(freshToken)
        const mappedTrips = bookings.map(mapBackendBookingToUserTrip).filter((tt): tt is UserTrip => Boolean(tt))
        const backendReviews = await fetchMyTourReviews(freshToken)
        const mappedReviews: UserReview[] = backendReviews.map(r => ({
          id: r.id, tourSlug: r.tourSlug, tourTitle: r.tourTitle,
          tourImage: r.tourImage ?? '', rating: r.rating, comment: r.comment ?? '', date: r.date,
        }))
        if (!alive) return
        setProfile(mapped); setTrips(mappedTrips); setReviews(mappedReviews)
      } catch (e: unknown) {
        if (!alive) return
        if (e instanceof ApiError && e.status === 401) { await signOut({ redirect: false }); router.push('/auth/login') }
        else setError(e instanceof Error ? e.message : 'Failed to load account.')
      } finally { if (alive) setLoading(false) }
    }
    load()
    return () => { alive = false }
  }, [token])

  // Section-specific title + description from locale
  const sectionTitles: Record<AccountSection, { title: string; desc: string }> = {
    profile:  at.sections.profile,
    settings: at.sections.settings,
    trips:    at.sections.trips,
    reviews:  at.sections.reviews,
  }
  const { title, desc } = sectionTitles[section]

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Top bar */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">{at.title}</h1>
            <p className="text-xs text-gray-500 mt-0.5">{at.subtitle}</p>
          </div>
          {/* Language toggle */}
          <button
            onClick={() => setLang(lang === 'mn' ? 'en' : 'mn')}
            className="shrink-0 flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-100 border border-gray-200 hover:border-gray-300 rounded-lg transition-colors"
            title={lang === 'mn' ? 'Switch to English' : 'Монгол хэл рүү шилжих'}
          >
            <Languages className="w-3.5 h-3.5" />
            {t.langToggleLabel}
          </button>
        </div>
      </div>

      {/* Mobile section pills */}
      <div className="lg:hidden bg-white border-b border-gray-100 px-4 py-2 flex gap-2 overflow-x-auto">
        {(['profile','settings','trips','reviews'] as AccountSection[]).map(s => (
          <button key={s} onClick={() => setSection(s)}
            className={`shrink-0 text-xs font-semibold px-3 py-1.5 rounded-full transition-colors capitalize ${section === s ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>
            {sectionTitles[s].title}
          </button>
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-7">
          {/* Sidebar — hidden on mobile */}
          <div className="hidden lg:block">
            <div className="sticky top-6">
              {profile ? (
                <AccountSidebar user={profile} active={section} onSelect={setSection} />
              ) : (
                <div className="w-64 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                  <p className="text-xs text-gray-500">
                    {loading ? at.loadingAccount : error ?? at.profileUnavailable}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            <div className="mb-5">
              <h2 className="text-base font-bold text-gray-900">{title}</h2>
              <p className="text-xs text-gray-500">{desc}</p>
            </div>

            {section === 'profile' && (
              profile ? (
                <ProfileForm initial={profile} accessToken={token ?? ''} onSaved={updated => setProfile(updated)} />
              ) : (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <p className="text-sm font-semibold text-gray-900">
                    {loading ? at.loadingProfile : error ?? at.profileUnavailable}
                  </p>
                </div>
              )
            )}

            {section === 'settings' && (
              <div className="space-y-5">
                <SecuritySettings accessToken={token ?? ''} />
                <NotificationSettings />
              </div>
            )}

            {section === 'trips' && (
              loading ? (
                <div className="text-sm text-gray-500 py-6">{at.loadingAccount}</div>
              ) : (
                <TripsSection trips={trips} />
              )
            )}

            {section === 'reviews' && (
              <ReviewsSection
                initialReviews={reviews}
                accessToken={token ?? ''}
                onReviewsChange={next => setReviews(next)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
