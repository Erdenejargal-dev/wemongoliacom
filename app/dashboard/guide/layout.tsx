export default function GuideRootLayout({ children }: { children: React.ReactNode }) {
  // Auth guard lives in (portal)/layout.tsx — this wrapper exists for Next routing only.
  return <>{children}</>
}
