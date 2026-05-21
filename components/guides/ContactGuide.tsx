'use client'

import { useState } from 'react'
import { Mail, Phone, MessageSquare, X, Send, CheckCircle2, DollarSign, Loader2 } from 'lucide-react'
import type { Guide } from '@/lib/api/guides'
import { createInquiry } from '@/lib/api/guides'
import { useTranslations } from '@/lib/i18n'

interface ContactGuideProps {
  guide: Guide
}

export function ContactGuide({ guide }: ContactGuideProps) {
  const { t } = useTranslations()
  const g = t.guideDetail
  const [open,     setOpen]     = useState(false)
  const [sent,     setSent]     = useState(false)
  const [sending,  setSending]  = useState(false)
  const [formErr,  setFormErr]  = useState<string | null>(null)
  const [form, setForm] = useState({ name: '', email: '', message: '' })

  async function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSending(true); setFormErr(null)
    try {
      await createInquiry(guide.slug, {
        travelerName:  form.name.trim(),
        travelerEmail: form.email.trim(),
        message:       form.message.trim(),
      })
      setSent(true)
      setTimeout(() => { setOpen(false); setSent(false); setForm({ name: '', email: '', message: '' }) }, 2500)
    } catch (err: unknown) {
      setFormErr(err instanceof Error ? err.message : 'Failed to send message')
    } finally { setSending(false) }
  }

  return (
    <>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {/* Daily rate */}
        {guide.dailyRate && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-brand-50 rounded-xl border border-brand-100">
            <DollarSign className="w-4 h-4 text-brand-600 shrink-0" aria-hidden />
            <div>
              <p className="text-xs font-semibold text-brand-700 uppercase tracking-wide">{g.dailyRate}</p>
              <p className="text-lg font-bold text-brand-900">
                {guide.dailyCurrency === 'USD' ? '$' : guide.dailyCurrency}
                {guide.dailyRate}
                <span className="text-sm font-normal text-brand-600 ml-0.5">{g.perDay}</span>
              </p>
            </div>
          </div>
        )}

        <h2 className="text-base font-bold text-gray-900 mb-4">{g.contactWidgetTitle(guide.name)}</h2>

        <div className="space-y-3 mb-5">
          <a href={`mailto:${guide.contactEmail}`}
            className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-brand-50 transition-colors group">
            <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0 group-hover:bg-brand-200 transition-colors">
              <Mail className="w-4 h-4 text-brand-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{g.labelEmail}</p>
              <p className="text-sm font-medium text-gray-900 truncate">{guide.contactEmail}</p>
            </div>
          </a>

          {guide.contactPhone && (
            <a href={`tel:${guide.contactPhone}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-gray-50 hover:bg-brand-50 transition-colors group">
              <div className="w-8 h-8 rounded-lg bg-brand-100 flex items-center justify-center shrink-0 group-hover:bg-brand-200 transition-colors">
                <Phone className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{g.labelPhone}</p>
                <p className="text-sm font-medium text-gray-900">{guide.contactPhone}</p>
              </div>
            </a>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2">
          <MessageSquare className="w-4 h-4" />
          {g.sendMessage}
        </button>
        <p className="text-xs text-gray-400 text-center mt-2">{g.respondsWithin}</p>
      </div>

      {/* Modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between p-5 border-b border-gray-100">
              <div>
                <p className="text-sm font-bold text-gray-900">{g.modalMessageTitle(guide.name)}</p>
                <p className="text-xs text-gray-500">{guide.contactEmail}</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                aria-label={t.common.close}>
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {sent ? (
              <div className="p-8 text-center">
                <CheckCircle2 className="w-12 h-12 text-brand-500 mx-auto mb-3" />
                <p className="font-bold text-gray-900 mb-1">{g.messageSent}</p>
                <p className="text-sm text-gray-500">{g.messageSentSub(guide.name)}</p>
              </div>
            ) : (
              <form onSubmit={handleSend} className="p-5 space-y-4">
                {formErr && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700">{formErr}</div>}
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">{g.formYourName}</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    placeholder={g.placeholderName}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">{g.formYourEmail}</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    placeholder={g.placeholderEmail}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/10"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-600 uppercase tracking-wide block mb-1.5">{g.yourMessage}</label>
                  <textarea
                    required
                    rows={4}
                    value={form.message}
                    onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                    placeholder={g.placeholderMessage}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-400/10 resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={sending}
                  className="w-full py-3 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50">
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  {g.contactSend}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
