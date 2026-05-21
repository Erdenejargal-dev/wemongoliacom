'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Loader2, Send, CheckCircle, XCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  fetchGuideInquiries,
  replyToGuideInquiry,
  type GuideInquiry,
  type GuideInquiryStatus,
} from '@/lib/api/guides'

const TABS: { label: string; status?: GuideInquiryStatus }[] = [
  { label: 'All' },
  { label: 'New',      status: 'new' },
  { label: 'Replied',  status: 'replied' },
  { label: 'Accepted', status: 'accepted' },
  { label: 'Declined', status: 'declined' },
]

const STATUS_COLORS: Record<GuideInquiryStatus, string> = {
  new:      'bg-blue-100 text-blue-700',
  replied:  'bg-gray-100 text-gray-600',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-600',
}

export function GuideInquiryList() {
  const { data: session } = useSession()
  const token = session?.user?.accessToken

  const [activeTab,  setActiveTab]  = useState<GuideInquiryStatus | undefined>(undefined)
  const [inquiries,  setInquiries]  = useState<GuideInquiry[]>([])
  const [loading,    setLoading]    = useState(true)
  const [replyOpen,  setReplyOpen]  = useState<string | null>(null)
  const [replyText,  setReplyText]  = useState('')
  const [sending,    setSending]    = useState(false)

  useEffect(() => {
    let alive = true
    setLoading(true)
    if (!token) { setLoading(false); return }
    fetchGuideInquiries(token, { status: activeTab, limit: 50 })
      .then(r => { if (alive) { setInquiries(r.data); setLoading(false) } })
      .catch(() => { if (alive) setLoading(false) })
    return () => { alive = false }
  }, [token, activeTab])

  async function sendReply(id: string, status: GuideInquiryStatus = 'replied') {
    if (!token || !replyText.trim()) return
    setSending(true)
    try {
      const updated = await replyToGuideInquiry(token, id, replyText.trim(), status)
      setInquiries(prev => prev.map(i => i.id === id ? updated : i))
      setReplyOpen(null)
      setReplyText('')
    } catch { /* non-fatal */ }
    finally { setSending(false) }
  }

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Traveler Inquiries</h1>

      {/* Tabs */}
      <div className="flex gap-2 flex-wrap">
        {TABS.map(tab => (
          <button
            key={tab.label}
            onClick={() => setActiveTab(tab.status)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
              activeTab === tab.status
                ? 'bg-gray-900 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50',
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-12 justify-center">
          <Loader2 className="w-4 h-4 animate-spin" /> Loading…
        </div>
      ) : inquiries.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-gray-400 text-sm">No inquiries yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {inquiries.map(inq => (
            <div key={inq.id} className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{inq.travelerName}</p>
                  <p className="text-xs text-gray-400">{inq.travelerEmail}{inq.travelerCountry ? ` · ${inq.travelerCountry}` : ''}</p>
                </div>
                <span className={cn('text-xs px-2 py-0.5 rounded-full font-medium shrink-0', STATUS_COLORS[inq.status])}>
                  {inq.status.charAt(0).toUpperCase() + inq.status.slice(1)}
                </span>
              </div>

              <p className="mt-3 text-sm text-gray-700 leading-relaxed">{inq.message}</p>

              {(inq.tripType || inq.daysRequested || inq.preferredStart) && (
                <div className="mt-2 flex gap-3 text-xs text-gray-400 flex-wrap">
                  {inq.tripType       && <span>Type: {inq.tripType}</span>}
                  {inq.daysRequested  && <span>{inq.daysRequested} days</span>}
                  {inq.preferredStart && <span>Start: {new Date(inq.preferredStart).toLocaleDateString()}</span>}
                </div>
              )}

              {inq.guideReply && (
                <div className="mt-3 px-3 py-2 bg-gray-50 rounded-xl text-sm text-gray-600 border-l-2 border-brand-400">
                  <p className="text-xs font-medium text-brand-600 mb-1">Your reply</p>
                  {inq.guideReply}
                </div>
              )}

              <div className="mt-3 text-xs text-gray-300">
                {new Date(inq.createdAt).toLocaleDateString()}
              </div>

              {inq.status === 'new' && (
                <div className="mt-3">
                  {replyOpen === inq.id ? (
                    <div className="space-y-2">
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm resize-none focus:ring-2 focus:ring-brand-500 outline-none"
                        placeholder="Write your reply…"
                        autoFocus
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => sendReply(inq.id, 'replied')}
                          disabled={sending || !replyText.trim()}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                        >
                          {sending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3" />}
                          Send reply
                        </button>
                        <button
                          onClick={() => sendReply(inq.id, 'accepted')}
                          disabled={sending || !replyText.trim()}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-xs font-medium rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-3 h-3" /> Accept
                        </button>
                        <button
                          onClick={() => sendReply(inq.id, 'declined')}
                          disabled={sending}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 text-xs font-medium rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-3 h-3" /> Decline
                        </button>
                        <button
                          onClick={() => { setReplyOpen(null); setReplyText('') }}
                          className="px-3 py-1.5 text-gray-400 text-xs hover:text-gray-600"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setReplyOpen(inq.id)}
                      className="text-xs font-medium text-brand-600 hover:text-brand-700 transition-colors"
                    >
                      Reply
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
