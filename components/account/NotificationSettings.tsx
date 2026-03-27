'use client'

import { CheckCircle2 } from 'lucide-react'

interface Toggle { id: string; label: string; desc: string; defaultOn: boolean }

const TOGGLES: Toggle[] = [
  { id: 'email',    label: 'Email Notifications',  desc: 'Receive emails about your account activity',    defaultOn: true  },
  { id: 'booking',  label: 'Booking Updates',       desc: 'Updates about reservation status changes',      defaultOn: true  },
  { id: 'reminder', label: 'Tour Reminders',        desc: 'Reminders sent 3 days before your tour starts', defaultOn: true  },
  { id: 'marketing',label: 'Marketing Emails',      desc: 'New tours, promotions, and travel inspiration', defaultOn: false },
]

export function NotificationSettings() {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-bold text-gray-900 mb-1">Notification Preferences</h3>
      <p className="text-xs text-gray-500 mb-5">
        Notification preferences aren&apos;t configurable in the backend yet. You&apos;ll still receive account and booking updates through system notifications.
      </p>

      <div className="space-y-4">
        {TOGGLES.map(t => (
          <div key={t.id} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-gray-50/40">
            <div>
              <p className="text-sm font-semibold text-gray-900">{t.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
            </div>
            <button
              type="button"
              disabled
              aria-disabled="true"
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${
                t.defaultOn ? 'bg-brand-500' : 'bg-gray-200'
              } opacity-70 cursor-not-allowed`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ${
                  t.defaultOn ? 'translate-x-5' : 'translate-x-0.5'
                }`}
              />
            </button>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-2 mt-5 pt-5 border-t border-gray-50 text-xs text-gray-500">
        <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
        Preferences save action will be enabled when backend support is added.
      </div>
    </div>
  )
}
