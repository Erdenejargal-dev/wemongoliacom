export default function BusinessRootLayout({ children }: { children: React.ReactNode }) {
  // IMPORTANT: do NOT put provider-only guards here.
  // This layout wraps BOTH:
  // - /dashboard/business/register (onboarding)
  // - /dashboard/business/(portal)/* (provider portal)
  // Provider-only guards live inside /dashboard/business/(portal)/layout.tsx.
  return <>{children}</>
}
