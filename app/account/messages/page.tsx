'use client'

import { useState } from 'react'
import Link from 'next/link'
import { MessageSquare, Compass } from 'lucide-react'
import { mockConversations, type Conversation, type Message } from '@/lib/mock-data/conversations'
import { ConversationList } from '@/components/messages/ConversationList'
import { ChatWindow } from '@/components/messages/ChatWindow'

export default function MessagesPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations)
  const [activeId, setActiveId] = useState<string | null>(
    mockConversations.length > 0 ? mockConversations[0].id : null
  )
  // Mobile: show list ('list') or chat ('chat')
  const [mobileView, setMobileView] = useState<'list' | 'chat'>('list')

  const active = conversations.find(c => c.id === activeId) ?? null

  function handleSelect(id: string) {
    setActiveId(id)
    // Clear unread
    setConversations(prev => prev.map(c => c.id === id ? { ...c, unread: 0 } : c))
    setMobileView('chat')
  }

  function handleSend(convId: string, text: string) {
    const now = new Date()
    const time = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: time,
    }
    setConversations(prev => prev.map(c =>
      c.id === convId
        ? { ...c, messages: [...c.messages, newMsg], lastMessage: text, lastMessageTime: time }
        : c
    ))
  }

  if (conversations.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50/40 flex flex-col items-center justify-center px-4 py-20 text-center">
        <MessageSquare className="w-12 h-12 text-gray-300 mb-4" />
        <h2 className="text-base font-bold text-gray-900 mb-1">You have no conversations yet</h2>
        <p className="text-sm text-gray-500 mb-5">Book a tour to start chatting with hosts.</p>
        <Link href="/tours"
          className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold text-sm px-6 py-3 rounded-xl transition-colors shadow-md">
          <Compass className="w-4 h-4" />Explore Tours
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50/40">
      {/* Page header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-green-500" />
          <h1 className="text-base font-bold text-gray-900">Messages</h1>
        </div>
      </div>

      {/* Chat layout */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: 'calc(100vh - 180px)', minHeight: '500px' }}>
          <div className="flex h-full">

            {/* ── Left: Conversation list ─────────── */}
            <div className={`w-full lg:w-72 shrink-0 border-r border-gray-100 flex flex-col h-full ${mobileView === 'chat' ? 'hidden lg:flex' : 'flex'}`}>
              <ConversationList
                conversations={conversations}
                activeId={activeId}
                onSelect={handleSelect}
              />
            </div>

            {/* ── Right: Chat window ──────────────── */}
            <div className={`flex-1 flex flex-col h-full ${mobileView === 'list' ? 'hidden lg:flex' : 'flex'}`}>
              {active ? (
                <ChatWindow
                  conversation={active}
                  onSend={handleSend}
                  onBack={() => setMobileView('list')}
                />
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <MessageSquare className="w-10 h-10 text-gray-200 mb-3" />
                  <p className="text-sm font-medium text-gray-400">Select a conversation</p>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}
