'use client'

import { useState } from 'react'
import { CheckCircle2 } from 'lucide-react'

interface Toggle { id: string; label: string; desc: string; defaultOn: boolean }

const TOGGLES: Toggle[] = [
  { id: 'email',    label: 'Email Notifications',  desc: 'Receive emails about your account activity',    defaultOn: true  },
  { id: 'booking',  label: 'Booking Updates',       desc: 'Updates about reservation status changes',      defaultOn: true  },
  { id: 'reminder', label: 'Tour Reminders',        desc: 'Reminders sent 3 days before your tour starts', defaultOn: true  },
  { id: 'marketing',label: 'Marketing Emails',      desc: 'New tours, promotions, and travel inspiration', defaultOn: false },
]

export function NotificationSettings() {
  const [prefs, setPrefs] = useState(() =>
    Object.fromEntries(TOGGLES.map(t => [t.id, t.defaultOn]))
  )
  const [saved, setSaved] = useState(false)

  function toggle(id: string) { setPrefs(p => ({ ...p, [id]: !p[id] })) }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h3 className="text-sm font-bold text-gray-900 mb-1">Notification Preferences</h3>
      <p className="text-xs text-gray-500 mb-5">Choose what you&apos;d like to be notified about.</p>
      <div className="space-y-4">
        {TOGGLES.map(t => (
          <div key={t.id} className="flex items-center justify-between gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div>
              <p className="text-sm font-semibold text-gray-900">{t.label}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.desc}</p>
            </div>
            <button
              type="button"
              onClick={() => toggle(t.id)}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors duration-200 focus:outline-none ${prefs[t.id] ? 'bg-green-500' : 'bg-gray-200'}`}
            >
              <span className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm transition-transform duration-200 mt-0.5 ${prefs[t.id] ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-3 mt-5 pt-5 border-t border-gray-50">
        <button type="button" onClick={handleSave}
          className="px-5 py-2.5 bg-green-500 hover:bg-green-600 text-white font-bold text-sm rounded-xl transition-colors">
          Save Preferences
        </button>
        {saved && (
          <span className="flex items-center gap-1.5 text-sm text-green-600 font-medium">
            <CheckCircle2 className="w-4 h-4" />Preferences saved!
          </span>
        )}
      </div>
    </div>
  )
}
