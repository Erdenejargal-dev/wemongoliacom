import type { Conversation } from '@/lib/mock-data/conversations'

interface ConversationListProps {
  conversations: Conversation[]
  activeId: string | null
  onSelect: (id: string) => void
}

export function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-gray-100">
        <h2 className="text-sm font-bold text-gray-900">Messages</h2>
        <p className="text-xs text-gray-400 mt-0.5">{conversations.length} conversation{conversations.length !== 1 ? 's' : ''}</p>
      </div>
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="p-6 text-center text-xs text-gray-400">No conversations yet</div>
        ) : (
          conversations.map(conv => (
            <button
              key={conv.id}
              onClick={() => onSelect(conv.id)}
              className={`w-full text-left px-4 py-3.5 border-b border-gray-50 flex items-start gap-3 transition-colors ${activeId === conv.id ? 'bg-brand-50' : 'hover:bg-gray-50'}`}
            >
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
                  <img src={conv.hostAvatar} alt={conv.hostName} className="w-full h-full object-cover" />
                </div>
                {conv.unread > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-brand-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                    {conv.unread}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <p className={`text-xs leading-tight truncate ${activeId === conv.id ? 'font-bold text-brand-700' : 'font-semibold text-gray-900'}`}>
                    {conv.hostName}
                  </p>
                  <span className="text-[10px] text-gray-400 shrink-0 ml-2">{conv.lastMessageTime}</span>
                </div>
                <p className="text-[10px] text-gray-400 truncate">{conv.tourTitle}</p>
                <p className={`text-xs mt-0.5 truncate ${conv.unread > 0 ? 'font-semibold text-gray-700' : 'text-gray-500'}`}>
                  {conv.lastMessage}
                </p>
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  )
}
