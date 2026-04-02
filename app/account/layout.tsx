import { TravelerLocaleProvider } from '@/lib/i18n/traveler/context'

/**
 * app/account/layout.tsx
 * Account pages layout — wraps /account/* pages.
 * Injects TravelerLocaleProvider so account pages use the correct locale
 * (English for traveler role, Mongolian for provider/admin).
 */
export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <TravelerLocaleProvider>
      {children}
    </TravelerLocaleProvider>
  )
}
