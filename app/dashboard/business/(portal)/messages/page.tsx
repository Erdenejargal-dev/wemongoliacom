'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import {
  MessageSquare,
  ArrowLeft,
  Loader2,
  Send,
  RefreshCw,
} from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { EmptyState } from '@/components/dashboard/ui/EmptyState'
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

function formatTime(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 7) return d.toLocaleDateString('en-US', { weekday: 'short' })
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

function MessageBubble({ msg, isProvider }: { msg: Message; isProvider: boolean }) {
  const time = formatTime(msg.createdAt)
  return (
    <div className={`flex items-end gap-2 ${isProvider ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`max-w-[85%] sm:max-w-[75%] ${isProvider ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
            isProvider
              ? 'bg-brand-600 text-white rounded-br-sm'
              : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
          }`}
        >
          {msg.text}
        </div>
        <span className="text-[10px] text-gray-400 px-1">{time}</span>
      </div>
    </div>
  )
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const token = session?.user?.accessToken

  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')

  const [messages, setMessages] = useState<Message[]>([])
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState<string | null>(null)
  const [replyText, setReplyText] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const active = conversations.find((c) => c.id === activeId) ?? null

  const loadConversations = useCallback(async () => {
    const freshToken = token ? await getFreshAccessToken() : null
    if (!freshToken) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      const list = await fetchConversations(freshToken)
      setConversations(list)
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
  }, [token])

  const loadMessages = useCallback(
    async (convId: string) => {
      const freshToken = token ? await getFreshAccessToken() : null
      if (!freshToken) return
      setMessagesLoading(true)
      setSendError(null)
      try {
        const { messages: msgs } = await fetchMessages(convId, freshToken)
        setMessages(msgs.reverse())
        await markConversationRead(convId, freshToken)
        setConversations((prev) =>
          prev.map((c) =>
            c.id === convId ? { ...c, providerUnreadCount: 0 } : c
          )
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
    },
    [token]
  )

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (activeId) loadMessages(activeId)
    else setMessages([])
  }, [activeId, loadMessages])

  useEffect(() => {
    setReplyText('')
    setSendError(null)
  }, [activeId])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages.length])

  function handleSelect(id: string) {
    setActiveId(id)
    setMobileView('chat')
  }

  async function handleSend(text: string) {
    if (!activeId || !text.trim()) return
    const freshToken = await getFreshAccessToken()
    if (!freshToken) {
      await signOut({ redirect: false })
      router.push('/auth/login')
      return
    }
    setSending(true)
    setSendError(null)
    setReplyText('')
    try {
      const newMsg = await sendConversationMessage(activeId, text.trim(), freshToken)
      if (newMsg) {
        setMessages((prev) => [...prev, newMsg])
        setConversations((prev) =>
          prev.map((c) =>
            c.id === activeId
              ? {
                  ...c,
                  lastMessagePreview: text.slice(0, 100),
                  lastMessageAt: new Date().toISOString(),
                }
              : c
          )
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

  if (!token && !loading) {
    return (
      <div className="space-y-4">
        <PageHeader title="Messages" description="Talk with travelers" />
        <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">
          Sign in to view your messages.
        </div>
      </div>
    )
  }

  if (loading && conversations.length === 0) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-5 h-5 text-brand-500 animate-spin" />
      </div>
    )
  }

  if (conversations.length === 0) {
    return (
      <div className="space-y-4">
        <PageHeader title="Messages" description="Talk with travelers" />
        <EmptyState
          icon={MessageSquare}
          title="No messages yet"
          description="Travelers can message you when they're interested in your services."
        />
      </div>
    )
  }

  const travelerName = active
    ? `${active.traveler.firstName} ${active.traveler.lastName}`.trim() || 'Traveler'
    : ''

  return (
    <div className="space-y-0 -mx-4 sm:-mx-6 lg:-mx-0">
      <div className="px-4 sm:px-6 lg:px-0 mb-4">
        <PageHeader
          title="Messages"
          description="Reply to inquiries — stay on top of conversations"
          actions={
            <button
              onClick={loadConversations}
              disabled={loading}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          }
        />
      </div>

      {error && (
        <div className="mx-4 sm:mx-6 lg:mx-0 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      <div
        className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden"
        style={{ minHeight: 'calc(100vh - 220px)', maxHeight: '600px' }}
      >
        <div className="flex h-full" style={{ minHeight: '500px' }}>
          {/* Conversation list */}
          <div
            className={`w-full lg:w-80 shrink-0 border-r border-gray-100 flex flex-col overflow-hidden ${
              mobileView === 'chat' ? 'hidden lg:flex' : 'flex'
            }`}
          >
            <div className="p-3 border-b border-gray-100 shrink-0">
              <p className="text-xs text-gray-500">
                {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
              </p>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => {
                const name = `${conv.traveler.firstName} ${conv.traveler.lastName}`.trim() || 'Traveler'
                const unread = conv.providerUnreadCount ?? 0
                return (
                  <button
                    key={conv.id}
                    onClick={() => handleSelect(conv.id)}
                    className={`w-full text-left px-4 py-3.5 border-b border-gray-50 flex items-start gap-3 transition-colors touch-manipulation ${
                      activeId === conv.id ? 'bg-brand-50' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className="relative shrink-0">
                      <div className="w-11 h-11 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
                        {conv.traveler.avatarUrl ? (
                          <img
                            src={conv.traveler.avatarUrl}
                            alt={name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-gray-500 font-semibold text-sm">
                            {name.charAt(0) || '?'}
                          </span>
                        )}
                      </div>
                      {unread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p
                          className={`text-sm truncate ${
                            activeId === conv.id ? 'font-semibold text-brand-800' : 'font-medium text-gray-900'
                          }`}
                        >
                          {name}
                        </p>
                        <span className="text-[10px] text-gray-400 shrink-0">
                          {formatTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      {conv.listingType && (
                        <p className="text-[10px] text-gray-400 capitalize mb-0.5">
                          {conv.listingType} inquiry
                        </p>
                      )}
                      <p
                        className={`text-xs truncate ${
                          unread > 0 ? 'font-medium text-gray-700' : 'text-gray-500'
                        }`}
                      >
                        {conv.lastMessagePreview || 'No messages yet'}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Thread view */}
          <div
            className={`flex-1 flex flex-col min-w-0 ${
              mobileView === 'list' ? 'hidden lg:flex' : 'flex'
            }`}
          >
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
                    {active.traveler.avatarUrl ? (
                      <img
                        src={active.traveler.avatarUrl}
                        alt={travelerName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-500 font-semibold">
                        {travelerName.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{travelerName}</p>
                    {active.listingType && (
                      <p className="text-xs text-gray-500 capitalize">
                        {active.listingType} inquiry
                      </p>
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
                      {messages.map((msg) => (
                        <MessageBubble
                          key={msg.id}
                          msg={msg}
                          isProvider={msg.senderRole === 'provider'}
                        />
                      ))}
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Reply box */}
                <div className="border-t border-gray-100 bg-white px-4 py-3 shrink-0">
                  {sendError && (
                    <p className="text-xs text-red-600 mb-2">{sendError}</p>
                  )}
                  <div className="flex items-end gap-2">
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder="Type your reply…"
                      rows={1}
                      maxLength={2000}
                      onKeyDown={(e) => {
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
                      onClick={() => {
                        const text = replyText.trim()
                        if (text) handleSend(text)
                      }}
                      disabled={sending || messagesLoading || !replyText.trim()}
                      className="w-11 h-11 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center shrink-0 transition-colors"
                    >
                      {sending ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">
                    Enter to send · Shift+Enter for new line
                  </p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                <MessageSquare className="w-12 h-12 text-gray-200 mb-3" />
                <p className="text-sm font-medium text-gray-500">
                  Select a conversation to view messages
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
