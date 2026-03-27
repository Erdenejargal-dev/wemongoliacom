'use client'

import { useState } from 'react'
import { Mail, Phone, MessageSquare, X, Send, CheckCircle2 } from 'lucide-react'
import type { Host } from '@/lib/mock-data/hosts'

interface ContactHostProps {
  host: Host
}

export function ContactHost({ host }: ContactHostProps) {
  const [open, setOpen] = useState(false)
  const [sent, setSent] = useState(false)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    // Mock send — just show success state
    setSent(true)
    setTimeout(() => { setOpen(false); setSent(false); setForm({ name: '', email: '', message: '' }) }, 2500)
  }

  return (
    <>
      {/* Contact card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h2 className="text-base font-bold text-gray-900 mb-4">Contact {host.name}</h2>
        <div className="space-y-3 mb-5">
          <a href={`mailto:${host.email}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-brand-50 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0 group-hover:bg-brand-200 transition-colors">
              <Mail className="w-4 h-4 text-brand-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</p>
              <p className="text-sm font-medium text-gray-900 truncate">{host.email}</p>
            </div>
          </a>
          <a href={`tel:${host.phone}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-brand-50 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0 group-hover:bg-brand-200 transition-colors">
              <Phone className="w-4 h-4 text-brand-600" />
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Phone</p>
              <p className="text-sm font-medium text-gray-900">{host.phone}</p>
            </div>
          </a>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
          <MessageSquare className="w-4 h-4" />
          Send a Message
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">Typically responds within 24 hours</p>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            {/* Modal header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-900">Message {host.name}</p>
                <p className="text-xs text-gray-500">{host.email}</p>
              </div>
              <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Success state */}
            {sent ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-brand-500 mx-auto mb-3" />
                <p className="font-bold text-gray-900 mb-1">Message Sent!</p>
                <p className="text-sm text-gray-500">{host.name} will get back to you within 24 hours.</p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="p-5 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Your Name</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder="Jane Smith"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Your Email</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder="you@example.com"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">Message</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder="Hi! I'm interested in your tours and have a few questions…"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/10 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
                  <Send className="w-4 h-4" />
                  Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
