// Redirect legacy /dashboard/business → unified /dashboard
import { redirect } from 'next/navigation'

export default function LegacyBusinessDashboardPage() {
  redirect('/dashboard')
}
