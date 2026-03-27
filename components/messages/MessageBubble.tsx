import type { Message } from '@/lib/mock-data/conversations'

interface MessageBubbleProps {
  message: Message
  userAvatar: string
  hostAvatar: string
}

export function MessageBubble({ message, userAvatar, hostAvatar }: MessageBubbleProps) {
  const isUser = message.sender === 'user'

  return (
    <div className={`flex items-end gap-2 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
      {/* Avatar */}
      <div className="w-7 h-7 rounded-full overflow-hidden bg-gray-200 shrink-0 mb-0.5">
        <img src={isUser ? userAvatar : hostAvatar} alt={isUser ? 'You' : 'Host'} className="w-full h-full object-cover" />
      </div>

      {/* Bubble */}
      <div className={`max-w-[72%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
        <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${
          isUser
            ? 'bg-brand-500 text-white rounded-br-sm'
            : 'bg-white border border-gray-100 text-gray-800 rounded-bl-sm shadow-sm'
        }`}>
          {message.text}
        </div>
        <span className="text-[10px] text-gray-400 px-1">{message.timestamp}</span>
      </div>
    </div>
  )
}
