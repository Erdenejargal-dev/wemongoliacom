import { TravelerLocaleProvider } from '@/lib/i18n/traveler/context'

/**
 * app/dashboard/layout.tsx
 * Traveler dashboard layout — wraps /dashboard/* pages.
 * Injects TravelerLocaleProvider (default: English for traveler role).
 * Provider_owner redirect is handled inside /dashboard/page.tsx (server).
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <TravelerLocaleProvider>
      <div className="min-h-screen bg-gray-50/40">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </div>
    </TravelerLocaleProvider>
  )
}
