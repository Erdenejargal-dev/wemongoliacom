'use client'

import { useEffect, useRef } from 'react'
import type { Conversation } from '@/lib/mock-data/conversations'
import { ChatHeader } from './ChatHeader'
import { MessageBubble } from './MessageBubble'
import { MessageInput } from './MessageInput'

const USER_AVATAR = 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&h=80&fit=crop'

interface ChatWindowProps {
  conversation: Conversation
  onSend: (convId: string, text: string) => void
  onBack?: () => void
}

export function ChatWindow({ conversation, onSend, onBack }: ChatWindowProps) {
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom when messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [conversation.messages.length])

  return (
    <div className="flex flex-col h-full bg-gray-50/40">
      {/* Header */}
      <ChatHeader conversation={conversation} onBack={onBack} />

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-4">
        {conversation.messages.map(msg => (
          <MessageBubble
            key={msg.id}
            message={msg}
            userAvatar={USER_AVATAR}
            hostAvatar={conversation.hostAvatar}
          />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <MessageInput onSend={text => onSend(conversation.id, text)} />
    </div>
  )
}
