// Redirect legacy /host/dashboard → unified /dashboard
import { redirect } from 'next/navigation'

export default function LegacyHostDashboardPage() {
  redirect('/dashboard')
}
