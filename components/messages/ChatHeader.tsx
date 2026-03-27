import Link from 'next/link'
import { ExternalLink, ArrowLeft } from 'lucide-react'
import type { Conversation } from '@/lib/mock-data/conversations'

interface ChatHeaderProps {
  conversation: Conversation
  onBack?: () => void   // mobile back button
}

export function ChatHeader({ conversation, onBack }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-white">
      {/* Mobile back */}
      {onBack && (
        <button onClick={onBack} className="lg:hidden p-1 -ml-1 text-gray-500 hover:text-gray-900 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
      )}

      {/* Avatar */}
      <div className="w-9 h-9 rounded-full overflow-hidden bg-gray-200 shrink-0">
        <img src={conversation.hostAvatar} alt={conversation.hostName} className="w-full h-full object-cover" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 leading-tight">{conversation.hostName}</p>
        <p className="text-xs text-gray-400 truncate">{conversation.tourTitle}</p>
      </div>

      {/* View tour button */}
      <Link
        href={`/tours/${conversation.tourSlug}`}
        className="flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700 bg-brand-50 hover:bg-brand-100 px-3 py-1.5 rounded-xl transition-colors shrink-0"
      >
        <ExternalLink className="w-3.5 h-3.5" />
        View Tour
      </Link>
    </div>
  )
}
