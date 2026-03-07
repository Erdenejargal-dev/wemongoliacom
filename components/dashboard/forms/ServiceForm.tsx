'use client'

import { useState } from 'react'
import { X, Plus, Upload } from 'lucide-react'
import type { Service } from '@/lib/mock-data/services'

interface ServiceFormProps {
  initial?: Partial<Service>
  onSubmit: (data: Partial<Service>) => void
  onCancel: () => void
}

export function ServiceForm({ initial = {}, onSubmit, onCancel }: ServiceFormProps) {
  const [form, setForm] = useState({
    title: initial.title ?? '',
    description: initial.description ?? '',
    price: String(initial.price ?? ''),
    duration: initial.duration ?? '',
    location: initial.location ?? '',
    groupSize: String(initial.groupSize ?? ''),
    category: initial.category ?? 'Adventure',
    includedItems: initial.includedItems ?? [],
    available: initial.available ?? true,
  })
  const [newItem, setNewItem] = useState('')

  const set = (k: string, v: unknown) => setForm(f => ({ ...f, [k]: v }))

  const addItem = () => {
    if (newItem.trim()) { set('includedItems', [...form.includedItems, newItem.trim()]); setNewItem('') }
  }
  const removeItem = (i: number) => set('includedItems', form.includedItems.filter((_, idx) => idx !== i))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ ...form, price: Number(form.price), groupSize: Number(form.groupSize) })
  }

  const inputCls = 'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10'
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1'

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className={labelCls}>Service Title *</label>
          <input className={inputCls} value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Gobi Desert Adventure" required />
        </div>
        <div>
          <label className={labelCls}>Category</label>
          <select className={inputCls} value={form.category} onChange={e => set('category', e.target.value)}>
            {['Adventure', 'Trekking', 'Cultural', 'City Tour', 'Wildlife', 'Photography'].map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelCls}>Description *</label>
        <textarea className={`${inputCls} resize-none`} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="Describe the experience…" required />
      </div>

      {/* Price / Duration / Location / Group */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div>
          <label className={labelCls}>Price (USD) *</label>
          <input className={inputCls} type="number" min="0" value={form.price} onChange={e => set('price', e.target.value)} placeholder="0" required />
        </div>
        <div>
          <label className={labelCls}>Duration *</label>
          <input className={inputCls} value={form.duration} onChange={e => set('duration', e.target.value)} placeholder="e.g. 3 days" required />
        </div>
        <div className="col-span-2 sm:col-span-1">
          <label className={labelCls}>Location *</label>
          <input className={inputCls} value={form.location} onChange={e => set('location', e.target.value)} placeholder="Region, Mongolia" required />
        </div>
        <div>
          <label className={labelCls}>Max Group Size</label>
          <input className={inputCls} type="number" min="1" value={form.groupSize} onChange={e => set('groupSize', e.target.value)} placeholder="10" />
        </div>
      </div>

      {/* Included Items */}
      <div>
        <label className={labelCls}>What&apos;s Included</label>
        <div className="flex gap-2 mb-2">
          <input className={`${inputCls} flex-1`} value={newItem} onChange={e => setNewItem(e.target.value)} placeholder="e.g. Meals, Guide, Transport…"
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addItem())} />
          <button type="button" onClick={addItem} className="px-3 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors">
            <Plus className="w-4 h-4" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {form.includedItems.map((item, i) => (
            <span key={i} className="flex items-center gap-1 px-2.5 py-1 bg-green-50 text-green-700 text-xs rounded-full border border-green-200">
              {item}
              <button type="button" onClick={() => removeItem(i)}><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      </div>

      {/* Image Upload (UI only) */}
      <div>
        <label className={labelCls}>Images</label>
        <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-gray-300 transition-colors cursor-pointer">
          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">Drop images here or <span className="text-gray-900 font-medium">browse</span></p>
          <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB each</p>
        </div>
      </div>

      {/* Availability toggle */}
      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
        <div>
          <p className="text-sm font-medium text-gray-700">Available for booking</p>
          <p className="text-xs text-gray-500">Toggle to enable/disable this service</p>
        </div>
        <button
          type="button"
          onClick={() => set('available', !form.available)}
          className={`relative w-11 h-6 rounded-full transition-colors ${form.available ? 'bg-green-500' : 'bg-gray-300'}`}
        >
          <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.available ? 'translate-x-5' : 'translate-x-0.5'}`} />
        </button>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button type="button" onClick={onCancel} className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        <button type="submit" className="px-4 py-2 text-sm bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors font-medium">
          Save Service
        </button>
      </div>
    </form>
  )
}
