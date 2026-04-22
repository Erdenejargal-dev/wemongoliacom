'use client'

import Link from 'next/link'
import { User, Mail, Phone, Globe, MessageSquare } from 'lucide-react'
import { useTranslations, getCountryFormDisplayLabel, COUNTRY_FORM_ENGLISH_NAMES } from '@/lib/i18n'

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
      <div className={`flex items-center gap-2 border rounded-xl px-3 py-2.5 transition-all ${error ? 'border-red-300 bg-red-50/30' : 'border-gray-200 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/10'}`}>
        <span className="text-gray-400 shrink-0">{icon}</span>
        {children}
      </div>
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}

export function TravelerForm({ data, onChange, errors }: TravelerFormProps) {
  const { t, lang } = useTranslations()
  const c = t.browse.checkout
  const appLang = lang

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="text-base font-bold text-gray-900 mb-1">{c.title}</h2>
      <p className="text-xs text-gray-500 mb-5">{c.subtitle}</p>

      <div className="space-y-4">
        {/* Full name */}
        <Field label={c.fullName} required icon={<User className="w-4 h-4" />} error={errors.name}>
          <input
            type="text"
            value={data.name}
            onChange={e => onChange({ name: e.target.value })}
            placeholder={c.placeholderName}
            className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none placeholder-gray-400"
            aria-invalid={Boolean(errors.name)}
          />
        </Field>

        {/* Email */}
        <Field label={c.email} required icon={<Mail className="w-4 h-4" />} error={errors.email}>
          <input
            type="email"
            value={data.email}
            onChange={e => onChange({ email: e.target.value })}
            placeholder={c.placeholderEmail}
            className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none placeholder-gray-400"
            aria-invalid={Boolean(errors.email)}
          />
        </Field>

        {/* Phone */}
        <Field label={c.phone} required icon={<Phone className="w-4 h-4" />} error={errors.phone}>
          <input
            type="tel"
            value={data.phone}
            onChange={e => onChange({ phone: e.target.value })}
            placeholder={c.placeholderPhone}
            className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none placeholder-gray-400"
            aria-invalid={Boolean(errors.phone)}
          />
        </Field>

        {/* Country */}
        <Field label={c.country} required icon={<Globe className="w-4 h-4" />} error={errors.country}>
          <select
            value={data.country}
            onChange={e => onChange({ country: e.target.value })}
            className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none appearance-none cursor-pointer"
            aria-invalid={Boolean(errors.country)}
          >
            <option value="">{c.selectCountry}</option>
            {COUNTRY_FORM_ENGLISH_NAMES.map((v) => (
              <option key={v} value={v}>
                {getCountryFormDisplayLabel(v, appLang, t.common.countryOther)}
              </option>
            ))}
          </select>
        </Field>

        {/* Special requests */}
        <div>
          <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">
            {c.specialLabel}{' '}
            <span className="text-gray-400 font-normal normal-case">{c.specialOptional}</span>
          </label>
          <div className="flex gap-2 border border-gray-200 rounded-xl px-3 py-2.5 focus-within:border-brand-400 focus-within:ring-2 focus-within:ring-brand-400/10 transition-all">
            <MessageSquare className="w-4 h-4 text-gray-400 shrink-0 mt-0.5" />
            <textarea
              value={data.specialRequests}
              onChange={e => onChange({ specialRequests: e.target.value })}
              placeholder={c.placeholderSpecial}
              rows={3}
              className="flex-1 text-sm text-gray-900 bg-transparent focus:outline-none placeholder-gray-400 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Consent note */}
      <p className="text-xs text-gray-400 mt-4 leading-relaxed">
        {c.consentBefore}{' '}
        <Link href="/terms" className="underline hover:text-gray-600">
          {c.terms}
        </Link>{' '}
        {c.consentBetween}{' '}
        <Link href="/privacy" className="underline hover:text-gray-600">
          {c.privacy}
        </Link>
        {c.consentAfter}
      </p>
    </div>
  )
}
