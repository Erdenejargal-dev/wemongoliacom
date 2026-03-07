'use client'

import { useState } from 'react'
import { Upload, Plus, X } from 'lucide-react'

const LANGUAGES = ['English', 'Mongolian', 'Chinese', 'Japanese', 'Korean', 'Russian', 'German', 'French']

export function BusinessProfileForm() {
  const [form, setForm] = useState({
    businessName: 'We Mongolia Tours',
    description: 'Authentic Mongolian travel experiences led by local guides.',
    email: 'hello@wemongolia.com',
    phone: '+976 9900 0000',
    location: 'Ulaanbaatar, Mongolia',
    languages: ['English', 'Mongolian'],
    website: 'https://wemongolia.com',
  })
  const [saved, setSaved] = useState(false)

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const toggleLang = (lang: string) => {
    set('languages', form.languages.includes(lang)
      ? form.languages.filter(l => l !== lang)
      : [...form.languages, lang])
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      {/* Logo Upload */}
      <div>
        <label className={labelCls}>Business Logo</label>
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-xl bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white text-xl font-bold">
            WM
          </div>
          <div className="border-2 border-dashed border-gray-200 rounded-xl px-6 py-4 text-center hover:border-gray-300 transition-colors cursor-pointer flex-1">
            <Upload className="w-5 h-5 text-gray-300 mx-auto mb-1" />
            <p className="text-xs text-gray-500">Upload new logo</p>
          </div>
        </div>
      </div>

      {/* Business Name + Website */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Business Name *</label>
          <input className={inputCls} value={form.businessName} onChange={e => set('businessName', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Website</label>
          <input className={inputCls} type="url" value={form.website} onChange={e => set('website', e.target.value)} />
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Business Description</label>
        <textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={e => set('description', e.target.value)} />
      </div>

      {/* Email + Phone */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Contact Email *</label>
          <input className={inputCls} type="email" value={form.email} onChange={e => set('email', e.target.value)} required />
        </div>
        <div>
          <label className={labelCls}>Phone Number</label>
          <input className={inputCls} type="tel" value={form.phone} onChange={e => set('phone', e.target.value)} />
        </div>
      </div>

      {/* Location */}
      <div>
        <label className={labelCls}>Business Location</label>
        <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} />
      </div>

      {/* Languages */}
      <div>
        <label className={labelCls}>Languages Spoken</label>
        <div className="flex flex-wrap gap-2">
          {LANGUAGES.map(lang => (
            <button
              key={lang} type="button" onClick={() => toggleLang(lang)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-colors ${
                form.languages.includes(lang)
                  ? 'bg-gray-900 text-white border-gray-900'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              {lang}
            </button>
          ))}
        </div>
      </div>

      {/* Save Button */}
      <div className="flex items-center gap-3 pt-2">
        <button type="submit" className="px-6 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors">
          {saved ? '✓ Saved!' : 'Save Changes'}
        </button>
        <p className="text-xs text-gray-400">Changes are saved to your profile</p>
      </div>
    </form>
  )
}
