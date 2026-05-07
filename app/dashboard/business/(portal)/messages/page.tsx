'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { MessageSquare, ArrowLeft, Loader2, Send, Search, ChevronDown } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { EmptyState } from '@/components/dashboard/ui/EmptyState'
import {
  fetchConversations, fetchMessages, sendConversationMessage,
  markConversationRead, type Conversation, type Message,
} from '@/lib/api/conversations'
import { getFreshAccessToken } from '@/lib/auth-utils'
import { ApiError } from '@/lib/api/client'
import { useProviderLocale } from '@/lib/i18n/provider/context'

const MESSAGES_POLL_MS      = 8000
const CONVERSATIONS_POLL_MS = 30000

function formatTime(dateStr: string, dateLocale: string, yesterday: string): string {
  const d       = new Date(dateStr)
  const now     = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return d.toLocaleTimeString(dateLocale, { hour: 'numeric', minute: '2-digit' })
  if (diffDays === 1) return yesterday
  if (diffDays < 7)  return d.toLocaleDateString(dateLocale, { weekday: 'short' })
  return d.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric' })
}

function formatDateSeparator(dateStr: string, dateLocale: string, todayLabel: string, yesterdayLabel: string): string {
  const d        = new Date(dateStr)
  const now      = new Date()
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000)
  if (diffDays === 0) return todayLabel
  if (diffDays === 1) return yesterdayLabel
  return d.toLocaleDateString(dateLocale, { month: 'long', day: 'numeric' })
}

function groupMessagesByDate(messages: Message[]): Array<{ date: string; messages: Message[] }> {
  const groups: Record<string, Message[]> = {}
  for (const msg of messages) {
    const key = new Date(msg.createdAt).toDateString()
    if (!groups[key]) groups[key] = []
    groups[key].push(msg)
  }
  return Object.entries(groups).map(([date, messages]) => ({ date, messages }))
}

function MessageBubble({ msg, isProvider }: { msg: Message; isProvider: boolean }) {
  const { t } = useProviderLocale()
  const time  = formatTime(msg.createdAt, t.dateLocale, t.messages.yesterday)
  return (
    <div className={`flex items-end gap-2 ${isProvider ? 'flex-row-reverse' : 'flex-row'}`}>
      <div className={`max-w-[85%] sm:max-w-[72%] flex flex-col gap-0.5 ${isProvider ? 'items-end' : 'items-start'}`}>
        <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words ${
          isProvider
            ? 'bg-brand-600 text-white rounded-br-sm'
            : 'bg-white border border-gray-200 text-gray-800 rounded-bl-sm shadow-sm'
        }`}>
          {msg.text}
        </div>
        <span className="text-[10px] text-gray-400 px-1">{time}</span>
      </div>
    </div>
  )
}

function DateSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 py-1">
      <div className="flex-1 h-px bg-gray-100" />
      <span className="text-[10px] font-medium text-gray-400 shrink-0">{label}</span>
      <div className="flex-1 h-px bg-gray-100" />
    </div>
  )
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const router            = useRouter()
  const token             = session?.user?.accessToken
  const { t }             = useProviderLocale()
  const mt                = t.messages

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
  const [search,          setSearch]          = useState('')
  const [showScrollBtn,   setShowScrollBtn]   = useState(false)

  const messagesEndRef  = useRef<HTMLDivElement>(null)
  const scrollAreaRef   = useRef<HTMLDivElement>(null)
  const textareaRef     = useRef<HTMLTextAreaElement>(null)
  const lastMsgIdRef    = useRef<string | null>(null)
  const activeIdRef     = useRef<string | null>(null)
  const tokenRef        = useRef<string | undefined>(token)

  useEffect(() => { tokenRef.current = token }, [token])
  useEffect(() => { activeIdRef.current = activeId }, [activeId])

  const active = conversations.find(c => c.id === activeId) ?? null

  const filteredConversations = search.trim()
    ? conversations.filter(c => {
        const name = `${c.traveler.firstName} ${c.traveler.lastName}`.toLowerCase()
        return name.includes(search.toLowerCase()) || c.lastMessagePreview?.toLowerCase().includes(search.toLowerCase())
      })
    : conversations

  function scrollToBottom(behavior: ScrollBehavior = 'smooth') {
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  function handleScroll() {
    const el = scrollAreaRef.current
    if (!el) return
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    setShowScrollBtn(distFromBottom > 120)
  }

  function autoResizeTextarea() {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 128) + 'px'
  }

  const loadConversations = useCallback(async (silent = false) => {
    const ft = tokenRef.current ? await getFreshAccessToken() : null
    if (!ft) { if (!silent) setLoading(false); return }
    if (!silent) { setLoading(true); setError(null) }
    try {
      const list = await fetchConversations(ft)
      setConversations(list)
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) { await signOut({ redirect: false }); router.push('/auth/login') }
      else if (!silent) setError(e instanceof Error ? e.message : mt.errorLoading)
    } finally { if (!silent) setLoading(false) }
  }, [])

  const loadMessages = useCallback(async (convId: string, silent = false) => {
    const ft = tokenRef.current ? await getFreshAccessToken() : null
    if (!ft) return
    if (!silent) { setMessagesLoading(true); setSendError(null) }
    try {
      const { messages: msgs } = await fetchMessages(convId, ft)
      const ordered = msgs.reverse()

      if (silent) {
        const newLastId = ordered[ordered.length - 1]?.id ?? null
        if (newLastId && newLastId !== lastMsgIdRef.current) {
          lastMsgIdRef.current = newLastId
          setMessages(ordered)
          await markConversationRead(convId, ft)
          setConversations(prev => prev.map(c => c.id === convId ? { ...c, providerUnreadCount: 0 } : c))
          const el = scrollAreaRef.current
          if (el) {
            const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
            if (distFromBottom < 200) scrollToBottom()
          }
        }
      } else {
        lastMsgIdRef.current = ordered[ordered.length - 1]?.id ?? null
        setMessages(ordered)
        await markConversationRead(convId, ft)
        setConversations(prev => prev.map(c => c.id === convId ? { ...c, providerUnreadCount: 0 } : c))
      }
    } catch (e: unknown) {
      if (e instanceof ApiError && e.status === 401) { await signOut({ redirect: false }); router.push('/auth/login') }
      else if (!silent) setSendError(e instanceof Error ? e.message : mt.errorLoading)
    } finally { if (!silent) setMessagesLoading(false) }
  }, [])

  // Initial load
  useEffect(() => { loadConversations() }, [loadConversations])
  useEffect(() => { if (activeId) loadMessages(activeId); else setMessages([]) }, [activeId, loadMessages])
  useEffect(() => { setReplyText(''); setSendError(null) }, [activeId])
  useEffect(() => {
    if (!showScrollBtn) scrollToBottom('instant')
  }, [messages.length])

  // Poll conversations every 30s
  useEffect(() => {
    const id = setInterval(() => loadConversations(true), CONVERSATIONS_POLL_MS)
    return () => clearInterval(id)
  }, [loadConversations])

  // Poll active messages every 8s
  useEffect(() => {
    if (!activeId) return
    const id = setInterval(() => {
      if (activeIdRef.current) loadMessages(activeIdRef.current, true)
    }, MESSAGES_POLL_MS)
    return () => clearInterval(id)
  }, [activeId, loadMessages])

  function handleSelect(id: string) { setActiveId(id); setMobileView('chat') }

  async function handleSend(text: string) {
    if (!activeId || !text.trim()) return
    const ft = await getFreshAccessToken()
    if (!ft) { await signOut({ redirect: false }); router.push('/auth/login'); return }
    setSending(true); setSendError(null); setReplyText('')
    if (textareaRef.current) { textareaRef.current.style.height = 'auto' }
    try {
      const newMsg = await sendConversationMessage(activeId, text.trim(), ft)
      if (newMsg) {
        lastMsgIdRef.current = newMsg.id
        setMessages(prev => [...prev, newMsg])
        setConversations(prev => prev.map(c => c.id === activeId
          ? { ...c, lastMessagePreview: text.slice(0, 100), lastMessageAt: new Date().toISOString() }
          : c))
        scrollToBottom()
      } else {
        setSendError(mt.sendFailed); setReplyText(text)
      }
    } catch { setSendError(mt.sendFailed); setReplyText(text) }
    finally { setSending(false) }
  }

  if (!token && !loading) return (
    <div className="space-y-4">
      <PageHeader title={mt.title} description={mt.description} />
      <div className="px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl text-sm text-amber-700">{mt.signInNotice}</div>
    </div>
  )

  if (loading && conversations.length === 0) return (
    <div className="flex items-center justify-center py-24"><Loader2 className="w-5 h-5 text-brand-500 animate-spin" /></div>
  )

  if (conversations.length === 0) return (
    <div className="space-y-4">
      <PageHeader title={mt.title} description={mt.description} />
      <EmptyState icon={MessageSquare} title={mt.noMessages} description={mt.noMessagesDesc} />
    </div>
  )

  const travelerName = active ? `${active.traveler.firstName} ${active.traveler.lastName}`.trim() || 'Traveler' : ''
  const dateGroups   = groupMessagesByDate(messages)

  return (
    <div className="space-y-0 -mx-4 sm:-mx-6 lg:-mx-0">
      <div className="px-4 sm:px-6 lg:px-0 mb-4 flex items-start justify-between gap-4">
        <PageHeader title={mt.title} description={mt.description} />
        {/* Live indicator */}
        <div className="flex items-center gap-1.5 mt-1 shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
          </span>
          <span className="text-[10px] font-medium text-gray-400">Live</span>
        </div>
      </div>

      {error && <div className="mx-4 sm:mx-6 lg:mx-0 mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{error}</div>}

      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 200px)', minHeight: '520px', maxHeight: '700px' }}>
        <div className="flex h-full">

          {/* Conversation list */}
          <div className={`w-full lg:w-80 shrink-0 border-r border-gray-100 flex flex-col overflow-hidden ${mobileView === 'chat' ? 'hidden lg:flex' : 'flex'}`}>
            {/* Search */}
            <div className="p-3 border-b border-gray-100 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search…"
                  className="w-full pl-8 pr-3 py-2 text-xs bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 placeholder:text-gray-400"
                />
              </div>
              <p className="text-[10px] text-gray-400 mt-2 px-0.5">{mt.conversations(filteredConversations.length)}</p>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center px-4">
                  <Search className="w-7 h-7 text-gray-200 mb-2" />
                  <p className="text-xs text-gray-400">No conversations found</p>
                </div>
              ) : filteredConversations.map(conv => {
                const name   = `${conv.traveler.firstName} ${conv.traveler.lastName}`.trim() || 'Traveler'
                const unread = conv.providerUnreadCount ?? 0
                const isActive = activeId === conv.id
                return (
                  <button key={conv.id} onClick={() => handleSelect(conv.id)}
                    className={`w-full text-left px-4 py-3.5 border-b border-gray-50 flex items-start gap-3 transition-colors touch-manipulation ${isActive ? 'bg-brand-50 border-l-2 border-l-brand-500' : 'hover:bg-gray-50 border-l-2 border-l-transparent'}`}>
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                        {conv.traveler.avatarUrl
                          ? <img src={conv.traveler.avatarUrl} alt={name} className="w-full h-full object-cover" />
                          : <span className="text-gray-600 font-bold text-sm">{name.charAt(0) || '?'}</span>}
                      </div>
                      {unread > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-brand-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                          {unread > 99 ? '99+' : unread}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-0.5">
                        <p className={`text-sm truncate ${isActive ? 'font-semibold text-brand-800' : unread > 0 ? 'font-semibold text-gray-900' : 'font-medium text-gray-800'}`}>{name}</p>
                        <span className="text-[10px] text-gray-400 shrink-0">{formatTime(conv.lastMessageAt, t.dateLocale, mt.yesterday)}</span>
                      </div>
                      {conv.listingType && (
                        <p className="text-[10px] text-gray-400 capitalize mb-0.5">{mt.inquiry(conv.listingType)}</p>
                      )}
                      <p className={`text-xs truncate ${unread > 0 ? 'font-medium text-gray-700' : 'text-gray-400'}`}>
                        {conv.lastMessagePreview || mt.noMessagesInThread}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Thread view */}
          <div className={`flex-1 flex flex-col min-w-0 ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}`}>
            {active ? (
              <>
                {/* Chat header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100 bg-white shrink-0 shadow-sm">
                  <button onClick={() => setMobileView('list')} className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-900 rounded-lg" aria-label="Back">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-9 h-9 rounded-full overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shrink-0">
                    {active.traveler.avatarUrl
                      ? <img src={active.traveler.avatarUrl} alt={travelerName} className="w-full h-full object-cover" />
                      : <span className="text-gray-600 font-bold text-sm">{travelerName.charAt(0) || '?'}</span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{travelerName}</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      {active.listingType && (
                        <span className="text-[10px] text-gray-400 capitalize">{mt.inquiry(active.listingType)}</span>
                      )}
                      {active.bookingId && (
                        <span className="text-[10px] font-mono text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">
                          #{active.bookingId.slice(-6).toUpperCase()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Messages area */}
                <div
                  ref={scrollAreaRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto px-4 py-4 bg-gray-50/40"
                >
                  {messagesLoading ? (
                    <div className="flex justify-center py-12"><Loader2 className="w-5 h-5 text-gray-400 animate-spin" /></div>
                  ) : (
                    <div className="space-y-4">
                      {dateGroups.map(group => (
                        <div key={group.date} className="space-y-3">
                          <DateSeparator
                            label={formatDateSeparator(group.messages[0].createdAt, t.dateLocale, 'Today', 'Yesterday')}
                          />
                          {group.messages.map(msg => (
                            <MessageBubble key={msg.id} msg={msg} isProvider={msg.senderRole === 'provider'} />
                          ))}
                        </div>
                      ))}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Scroll to bottom button */}
                {showScrollBtn && (
                  <div className="absolute bottom-20 right-6 z-10">
                    <button
                      onClick={() => scrollToBottom()}
                      className="w-8 h-8 bg-white border border-gray-200 rounded-full shadow-md flex items-center justify-center hover:bg-gray-50 transition-colors"
                    >
                      <ChevronDown className="w-4 h-4 text-gray-600" />
                    </button>
                  </div>
                )}

                {/* Input */}
                <div className="border-t border-gray-100 bg-white px-4 py-3 shrink-0">
                  {sendError && <p className="text-xs text-red-600 mb-2">{sendError}</p>}
                  <div className="flex items-end gap-2">
                    <textarea
                      ref={textareaRef}
                      value={replyText}
                      onChange={e => { setReplyText(e.target.value); autoResizeTextarea() }}
                      placeholder={mt.typeReply}
                      rows={1}
                      maxLength={2000}
                      onKeyDown={e => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault()
                          if (replyText.trim()) handleSend(replyText.trim())
                        }
                      }}
                      disabled={sending || messagesLoading}
                      className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none overflow-y-auto min-h-[44px] disabled:opacity-60 bg-gray-50 focus:bg-white transition-colors"
                      style={{ maxHeight: '128px' }}
                    />
                    <button
                      type="button"
                      onClick={() => { if (replyText.trim()) handleSend(replyText.trim()) }}
                      disabled={sending || messagesLoading || !replyText.trim()}
                      className="w-11 h-11 bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center shrink-0 transition-colors"
                    >
                      {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1.5">{mt.enterToSend}</p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-center p-8 bg-gray-50/30">
                <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mb-4">
                  <MessageSquare className="w-8 h-8 text-gray-300" />
                </div>
                <p className="text-sm font-semibold text-gray-600 mb-1">{mt.selectConversation}</p>
                <p className="text-xs text-gray-400">Pick a conversation from the list</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
