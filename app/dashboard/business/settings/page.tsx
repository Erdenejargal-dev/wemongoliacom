import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { BusinessProfileForm } from '@/components/dashboard/forms/BusinessProfileForm'

export default function SettingsPage() {
  return (
    <div>
      <PageHeader title="Settings" description="Manage your business profile and preferences" />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-6">
        <BusinessProfileForm />
      </div>
    </div>
  )
}
