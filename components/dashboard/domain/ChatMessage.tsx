import type { Message } from '@/lib/mock-data/messages'

interface ChatMessageProps {
  message: Message
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function getInitials(name: string) {
  return name.split(' ').map(n => n[0]).join('').toUpperCase()
}

export function ChatMessage({ message }: ChatMessageProps) {
  if (message.isOwn) {
    return (
      <div className="flex justify-end gap-2 mb-3">
        <div className="max-w-[75%]">
          <div className="bg-gray-900 text-white text-sm px-4 py-2.5 rounded-2xl rounded-br-sm shadow-sm">
            {message.text}
          </div>
          <p className="text-[10px] text-gray-400 mt-1 text-right">{formatTime(message.timestamp)}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-brand-500 flex items-center justify-center text-white text-xs font-semibold shrink-0 self-end">
          WM
        </div>
      </div>
    )
  }

  return (
    <div className="flex gap-2 mb-3">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-semibold shrink-0 self-end">
        {getInitials(message.senderName)}
      </div>
      <div className="max-w-[75%]">
        <div className="bg-white border border-gray-100 text-gray-800 text-sm px-4 py-2.5 rounded-2xl rounded-bl-sm shadow-sm">
          {message.text}
        </div>
        <p className="text-[10px] text-gray-400 mt-1">{formatTime(message.timestamp)}</p>
      </div>
    </div>
  )
}
