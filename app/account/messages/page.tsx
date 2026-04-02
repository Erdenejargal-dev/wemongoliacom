'use client'

/**
 * app/account/messages/page.tsx
 *
 * Traveler-facing real messaging page — uses the live backend conversations API.
 *
 * Architecture note:
 *   useSearchParams() requires a <Suspense> boundary in Next.js App Router.
 *   We split into a thin page export (provides Suspense) and the real
 *   MessagesContent component that owns all state and logic.
 */

import { Suspense, useState, useEffect, useCallback, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  MessageSquare, ArrowLeft, Loader2, Send, RefreshCw, Compass,
} from 'lucide-react'
import {
  fetchConversations,
  fetchMessages,
  sendConversationMessage,
  markConversationRead,
  type Conversation,
  type Message,
} from '@/lib/api/conversations'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Loading fallback (also used as Suspense fallback) ─────────────────────────

function PageSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
    </div>
  )
}

// ── Inner component (uses useSearchParams — must be inside Suspense) ──────────

function MessagesContent() {
  const { data: session } = useSession()
  const router            = useRouter()
  const searchParams      = useSearchParams()
  const token             = session?.user?.accessToken

  const [conversations,   setConversations]   = useState<Conversation[]>([])
  const [loading,         setLoading]         = useState(true)
  const [error,           setError]           = useState<string | null>(null)
  const [activeId,        setActiveId]        = useState<string | null>(null)
  const [mobileView,      setMobileView]      = useState<'list' | 'chat'>('list')
  const [messages,        setMessages]        = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending,         setSending]         = useState(false)
  const [sendError,       setSendError]       = useState<string | null>(null)
  const [replyText,       setReplyText]       = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const active = conversations.find(c => c.id === activeId) ?? null

  // ── Load conversation list ─────────────────────────────────────────────────

  const loadConversations = useCallback(async () => {
    const ft = token ? await getFreshAccessToken() : null
    if (!ft) { setLoading(false); return }
    setLoading(true)
    setError(null)
    try {
      const list = await fetchConversations(ft)
      setConversations(list)
      const convId = searchParams.get('convId')
      if (convId && list.some(c => c.id === convId)) {
        setActiveId(convId)
        setMobileView('chat')
      } else if (list.length > 0) {
        setActiveId(prev => prev ?? list[0].id)
      }
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut({ redirect: false })
        router.push('/auth/login')
      } else {
        setError(e instanceof Error ? e.message : 'Failed to load conversations.')
      }
    } finally {
      setLoading(false)
    }
  }, [token, searchParams, router])

  // ── Load messages for active conversation ─────────────────────────────────

  const loadMessages = useCallback(async (convId: string) => {
    const ft = token ? await getFreshAccessToken() : null
    if (!ft) return
    setMessagesLoading(true)
    setSendError(null)
    try {
      const { messages: msgs } = await fetchMessages(convId, ft)
      setMessages(msgs.reverse())
      await markConversationRead(convId, ft)
      setConversations(prev =>
        prev.map(c => c.id === convId ? { ...c, travelerUnreadCount: 0 } : c),
      )
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) {
        await signOut({ redirect: false })
        router.push('/auth/login')
      } else {
        setSendError(e instanceof Error ? e.message : 'Failed to load messages.')
      }
    } finally {
      setMessagesLoading(false)
    }
  }, [token, router])

  useEffect(() => { loadConversations() }, [loadConversations])
  useEffect(() => { if (activeId) loadMessages(activeId); else setMessages([]) }, [activeId, loadMessages])
  useEffect(() => { setReplyText(''); setSendError(null) }, [activeId])
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages.length])

  function handleSelect(id: string) { setActiveId(id); setMobileView('chat') }

  // ── Send message ──────────────────────────────────────────────────────────

  async function handleSend(text: string) {
    if (!activeId || !text.trim()) return
    const ft = await getFreshAccessToken()
    if (!ft) { await signOut({ redirect: false }); router.push('/auth/login'); return }
    setSending(true)
    setSendError(null)
    setReplyText('')
    try {
      const newMsg = await sendConversationMessage(activeId, text.trim(), ft)
      if (newMsg) {
        setMessages(prev => [...prev, newMsg])
        setConversations(prev =>
          prev.map(c => c.id === activeId
            ? { ...c, lastMessagePreview: text.slice(0, 100), lastMessageAt: new Date().toISOString() }
            : c,
          ),
        )
      } else {
        setSendError('Failed to send. Please try again.')
        setReplyText(text)
      }
    } catch {
      setSendError('Failed to send. Please try again.')
      setReplyText(text)
    } finally {
      setSending(false)
    }
  }

  // ── Guards ────────────────────────────────────────────────────────────────

  if (!token && !loading) {
    return (
      <div className="min-h-screen bg-gray-50/40 flex flex-col items-center justify-center px-4 py-20 text-center">
        <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-base font-bold text-gray-900 mb-1">Sign in to view messages</h2>
        <Link href="/auth/login" className="text-sm font-semibold text-brand-600 hover:text-brand-700">
          Sign in →
        </Link>
      </div>
    )
  }

  if (loading && conversations.length === 0) return <PageSpinner />

  if (!loading && conversations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/40 flex flex-col items-center justify-center px-4 py-20 text-center">
        <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-base font-bold text-gray-900 mb-1">No conversations yet</h2>
        <p className="text-sm text-gray-500 mb-5">
          Book a tour or stay, then use &quot;Contact Host&quot; from your trips to start a conversation.
        </p>
        <Link
          href="/tours"
          className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-md"
        >
          <Compass className="w-4 h-4" />Explore Tours
        </Link>
      </div>
    )
  }

  const providerName = active?.provider.name ?? ''

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-500" />
            <h1 className="text-base font-bold text-gray-900">Messages</h1>
          </div>
          <button
            onClick={loadConversations}
            disabled={loading}
            className="flex items-center gap-1.5 text-xs font-medium text-gray-500 hover:text-gray-800 disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>
        </div>
      )}

      {/* Chat layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div
          className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
          style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}
        >
          <div className="flex h-full">

            {/* ── Conversation list ───────────────────── */}
            <div className={`w-full lg:w-72 shrink-0 border-r border-gray-100 flex flex-col h-full ${mobileView === 'chat' ? 'hidden lg:flex' : 'flex'}`}>
              <div className="p-4 border-b border-gray-100 shrink-0">
                <h2 className="text-sm font-bold text-gray-900">Conversations</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                </p>
              </div>

              <div className="flex-1 overflow-y-auto">
                {conversations.map(conv => {
                  const unread  = conv.travelerUnreadCount ?? 0
                  const name    = conv.provider.name
                  const logoUrl = conv.provider.logoUrl
                  return (
                    <button
                      key={conv.id}
                      onClick={() => handleSelect(conv.id)}
                      className={`w-full text-left px-4 py-3.5 border-b border-gray-50 flex items-start gap-3 transition-colors touch-manipulation ${activeId === conv.id ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
                    >
                      <div className="relative shrink-0">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                          {logoUrl
                            ? <img src={logoUrl} alt={name} className="w-full h-full object-cover" />
                            : <span className="text-gray-500 font-semibold text-sm">{name.charAt(0)}</span>
                          }
                        </div>
                        {unread > 0 && (
                          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                            {unread > 99 ? '99+' : unread}
                          </span>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <p className={`text-sm truncate ${activeId === conv.id ? 'font-semibold text-brand-800' : 'font-medium text-gray-900'}`}>
                            {name}
                          </p>
                          <span className="text-[10px] text-gray-400 shrink-0 ml-2">{formatTime(conv.lastMessageAt)}</span>
                        </div>
                        {conv.listingType && (
                          <p className="text-[10px] text-gray-400 capitalize mb-0.5">{conv.listingType} inquiry</p>
                        )}
                        <p className={`text-xs truncate ${unread > 0 ? 'font-medium text-gray-700' : 'text-gray-500'}`}>
                          {conv.lastMessagePreview || 'No messages yet'}
                        </p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ── Thread view ─────────────────────────── */}
            <div className={`flex-1 flex flex-col min-w-0 ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}`}>
              {active ? (
                <>
                  {/* Thread header */}
                  <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shrink-0">
                    <button
                      onClick={() => setMobileView('list')}
                      className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg"
                      aria-label="Back to list"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center shrink-0">
                      {active.provider.logoUrl
                        ? <img src={active.provider.logoUrl} alt={providerName} className="w-full h-full object-cover" />
                        : <span className="text-gray-500 font-semibold">{providerName.charAt(0)}</span>
                      }
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900">{providerName}</p>
                      {active.listingType && (
                        <p className="text-xs text-gray-500 capitalize">{active.listingType} inquiry</p>
                      )}
                    </div>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 bg-gray-50/50">
                    {messagesLoading ? (
                      <div className="flex justify-center py-12">
                        <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
                      </div>
                    ) : (
                      <>
                        {messages.map(msg => {
                          const isTraveler = msg.senderRole === 'traveler'
                          return (
                            <div key={msg.id} className={`flex items-end gap-2 ${isTraveler ? 'flex-row-reverse' : 'flex-row'}`}>
                              <div className={`max-w-[85%] sm:max-w-[75%] flex flex-col gap-0.5 ${isTraveler ? 'items-end' : 'items-start'}`}>
                                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                                  isTraveler
                                    ? 'bg-brand-600 text-white rounded-br-sm'
                                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
                                }`}>
                                  {msg.text}
                                </div>
                                <span className="text-[10px] text-gray-400 px-1">{formatTime(msg.createdAt)}</span>
                              </div>
                            </div>
                          )
                        })}
                        <div ref={messagesEndRef} />
                      </>
                    )}
                  </div>

                  {/* Reply input */}
                  <div className="border-t border-gray-100 bg-white px-4 py-3 shrink-0">
                    {sendError && <p className="text-xs text-red-600 mb-2">{sendError}</p>}
                    <div className="flex items-end gap-2">
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Type your message…"
                        rows={1}
                        maxLength={2000}
                        onKeyDown={e => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault()
                            const text = replyText.trim()
                            if (text) handleSend(text)
                          }
                        }}
                        disabled={sending || messagesLoading}
                        className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none max-h-32 overflow-y-auto min-h-[44px] disabled:opacity-60"
                      />
                      <button
                        type="button"
                        onClick={() => { const text = replyText.trim(); if (text) handleSend(text) }}
                        disabled={sending || messagesLoading || !replyText.trim()}
                        className="w-11 h-11 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center shrink-0 transition-colors"
                      >
                        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                      </button>
                    </div>
                    <p className="text-[10px] text-gray-400 mt-1.5">Enter to send · Shift+Enter for new line</p>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <MessageSquare className="w-12 h-12 text-gray-200 mb-3" />
                  <p className="text-sm font-medium text-gray-500">Select a conversation to start messaging</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// ── Page export — provides the required Suspense boundary ─────────────────────

export default function TravelerMessagesPage() {
  return (
    <Suspense fallback={<PageSpinner />}>
      <MessagesContent />
    </Suspense>
  )
}
