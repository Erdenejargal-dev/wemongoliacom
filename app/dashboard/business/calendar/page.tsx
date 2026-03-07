import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { CalendarGrid } from '@/components/dashboard/domain/CalendarGrid'

export default function CalendarPage() {
  return (
    <div>
      <PageHeader title="Availability Calendar" description="Click any date to toggle its availability state." />
      <div className="max-w-xl">
        <CalendarGrid />
      </div>
    </div>
  )
}
