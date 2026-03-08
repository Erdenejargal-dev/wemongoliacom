'use client'

import { User, Mail, Phone, Globe, MessageSquare } from 'lucide-react'

export interface TravelerData {
  name: string
  email: string
  phone: string
  country: string
  specialRequests: string
}

interface TravelerFormProps {
  data: TravelerData
  onChange: (patch: Partial<TravelerData>) => void
  errors: Partial<Record<keyof TravelerData, string>>
}

const COUNTRIES = [
  'Mongolia', 'United States', 'United Kingdom', 'Germany', 'France', 'Japan',
  'South Korea', 'Australia', 'Canada', 'China', 'Russia', 'Italy', 'Spain',
  'Netherlands', 'Sweden', 'Norway', 'Switzerland', 'Austria', 'Brazil',
  'Mexico', 'India', 'Singapore', 'New Zealand', 'Other',
]

interface FieldProps {
  label: string
  required?: boolean
  icon: React.ReactNode
  error?: string
  children: React.ReactNode
}

function Field({ label, required, icon, error, children }: FieldProps) {
  return (
    <div>
      <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </label>
      <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 transition-all ${error ? 'border-red-300 bg-red-50/30' : 'border-gray-200 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-400/10'}`}>
        <span className="text-gray-400 shrink-0">{icon}</span>
        {children}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export function TravelerForm({ data, onChange, errors }: TravelerFormProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-bold text-gray-900 mb-1">Traveler Details</h2>
      <p className="text-xs text-gray-500 mb-5">Lead traveler information for this booking</p>

      <div className="space-y-4">
        {/* Full name */}
        <Field label="Full Name" required icon={<User className="w-4 h-4" />} error={errors.name}>
          <input
            type="text"
            value={data.name}
            onChange={e => onChange({ name: e.target.value })}
            placeholder="As it appears on your passport"
            className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none placeholder-gray-400"
          />
        </Field>

        {/* Email */}
        <Field label="Email Address" required icon={<Mail className="w-4 h-4" />} error={errors.email}>
          <input
            type="email"
            value={data.email}
            onChange={e => onChange({ email: e.target.value })}
            placeholder="you@example.com"
            className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none placeholder-gray-400"
          />
        </Field>

        {/* Phone */}
        <Field label="Phone Number" required icon={<Phone className="w-4 h-4" />} error={errors.phone}>
          <input
            type="tel"
            value={data.phone}
            onChange={e => onChange({ phone: e.target.value })}
            placeholder="+1 555 000 0000"
            className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none placeholder-gray-400"
          />
        </Field>

        {/* Country */}
        <Field label="Country" required icon={<Globe className="w-4 h-4" />} error={errors.country}>
          <select
            value={data.country}
            onChange={e => onChange({ country: e.target.value })}
            className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none appearance-none cursor-pointer"
          >
            <option value="">Select your country</option>
            {COUNTRIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </Field>

        {/* Special requests */}
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
            Special Requests <span className="text-gray-400 font-normal normal-case">(optional)</span>
          </label>
          <div className="flex gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-green-400 focus-within:ring-2 focus-within:ring-green-400/10 transition-all">
            <MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <textarea
              value={data.specialRequests}
              onChange={e => onChange({ specialRequests: e.target.value })}
              placeholder="Dietary requirements, accessibility needs, or any other requests…"
              rows={3}
              className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none placeholder-gray-400 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Consent note */}
      <p className="text-xs text-gray-400 mt-4 leading-relaxed">
        By confirming your booking you agree to our{' '}
        <a href="#" className="underline hover:text-gray-600">Terms & Conditions</a> and{' '}
        <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
        Your details will only be used to manage your booking.
      </p>
    </div>
  )
}
