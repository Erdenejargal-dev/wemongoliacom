'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { PageHeader } from '@/components/dashboard/ui/PageHeader'
import { ChatMessage } from '@/components/dashboard/domain/ChatMessage'
import { mockConversations, type Conversation, type Message } from '@/lib/mock-data/messages'
import { cn } from '@/lib/utils'

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function MessagesPage() {
  const [conversations, setConversations] = useState(mockConversations)
  const [activeId, setActiveId] = useState(conversations[0]?.id)
  const [input, setInput] = useState('')

  const active = conversations.find(c => c.id === activeId)

  const sendMessage = () => {
    if (!input.trim() || !activeId) return
    const msg: Message = { id: `m${Date.now()}`, senderId: 'biz', senderName: 'We Mongolia', text: input.trim(), timestamp: new Date().toISOString(), isOwn: true }
    setConversations(cs => cs.map(c => c.id === activeId ? { ...c, messages: [...c.messages, msg], lastMessage: msg.text, lastMessageTime: msg.timestamp, unread: 0 } : c))
    setInput('')
  }

  return (
    <div>
      <PageHeader title="Messages" description="Customer conversations" />
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden" style={{ height: '70vh' }}>
        <div className="flex h-full">
          {/* Conversation list */}
          <div className="w-72 border-r border-gray-100 flex flex-col shrink-0">
            <div className="p-3 border-b border-gray-100">
              <input placeholder="Search conversations…" className="w-full text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 focus:outline-none" />
            </div>
            <ul className="flex-1 overflow-y-auto divide-y divide-gray-50">
              {conversations.map(c => (
                <li key={c.id}>
                  <button
                    onClick={() => { setActiveId(c.id); setConversations(cs => cs.map(x => x.id === c.id ? { ...x, unread: 0 } : x)) }}
                    className={cn('w-full text-left p-3 hover:bg-gray-50 transition-colors', activeId === c.id && 'bg-gray-50')}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold shrink-0">
                        {c.customerName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900 truncate">{c.customerName}</p>
                          {c.unread > 0 && <span className="w-5 h-5 bg-gray-900 text-white text-[10px] rounded-full flex items-center justify-center shrink-0">{c.unread}</span>}
                        </div>
                        <p className="text-xs text-gray-500 truncate">{c.lastMessage}</p>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Chat window */}
          {active ? (
            <div className="flex-1 flex flex-col">
              <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold">
                  {active.customerName.split(' ').map(n => n[0]).join('')}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">{active.customerName}</p>
                  <p className="text-xs text-gray-400">{active.customerEmail}</p>
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 bg-gray-50/50">
                {active.messages.map(m => <ChatMessage key={m.id} message={m} />)}
              </div>
              <div className="p-3 border-t border-gray-100 bg-white flex gap-2">
                <input
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), sendMessage())}
                  placeholder="Type a message…"
                  className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                />
                <button onClick={sendMessage} className="p-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-700 transition-colors">
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400 text-sm">Select a conversation</div>
          )}
        </div>
      </div>
    </div>
  )
}
