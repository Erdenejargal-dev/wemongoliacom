export interface Message {
  id: string
  senderId: string
  senderName: string
  text: string
  timestamp: string
  isOwn: boolean
}

export interface Conversation {
  id: string
  customerName: string
  customerEmail: string
  lastMessage: string
  lastMessageTime: string
  unread: number
  messages: Message[]
}

export const mockConversations: Conversation[] = [
  {
    id: 'c1',
    customerName: 'Liam Chen',
    customerEmail: 'liam@email.com',
    lastMessage: 'What should I pack for the Gobi trip?',
    lastMessageTime: '2025-06-18T14:30:00',
    unread: 2,
    messages: [
      { id: 'm1', senderId: 'liam', senderName: 'Liam Chen', text: 'Hi! I just booked the Gobi Desert Adventure.', timestamp: '2025-06-18T14:00:00', isOwn: false },
      { id: 'm2', senderId: 'biz', senderName: 'We Mongolia', text: 'Welcome Liam! We\'re excited to have you. Is there anything you need to know before the trip?', timestamp: '2025-06-18T14:10:00', isOwn: true },
      { id: 'm3', senderId: 'liam', senderName: 'Liam Chen', text: 'What should I pack for the Gobi trip?', timestamp: '2025-06-18T14:30:00', isOwn: false },
    ],
  },
  {
    id: 'c2',
    customerName: 'Sofia Müller',
    customerEmail: 'sofia@email.com',
    lastMessage: 'Can we extend the trek by one day?',
    lastMessageTime: '2025-06-17T09:15:00',
    unread: 1,
    messages: [
      { id: 'm4', senderId: 'sofia', senderName: 'Sofia Müller', text: 'Hello, I have a question about the lake trek.', timestamp: '2025-06-17T09:00:00', isOwn: false },
      { id: 'm5', senderId: 'biz', senderName: 'We Mongolia', text: 'Of course! What would you like to know?', timestamp: '2025-06-17T09:05:00', isOwn: true },
      { id: 'm6', senderId: 'sofia', senderName: 'Sofia Müller', text: 'Can we extend the trek by one day?', timestamp: '2025-06-17T09:15:00', isOwn: false },
    ],
  },
  {
    id: 'c3',
    customerName: 'James Park',
    customerEmail: 'james@email.com',
    lastMessage: 'Perfect, see you in August!',
    lastMessageTime: '2025-06-16T18:00:00',
    unread: 0,
    messages: [
      { id: 'm7', senderId: 'james', senderName: 'James Park', text: 'Is the eagle hunting suitable for beginners?', timestamp: '2025-06-16T17:30:00', isOwn: false },
      { id: 'm8', senderId: 'biz', senderName: 'We Mongolia', text: 'Absolutely! No prior experience needed. Our eagle hunter family guides you through everything.', timestamp: '2025-06-16T17:45:00', isOwn: true },
      { id: 'm9', senderId: 'james', senderName: 'James Park', text: 'Perfect, see you in August!', timestamp: '2025-06-16T18:00:00', isOwn: false },
    ],
  },
  {
    id: 'c4',
    customerName: 'Zara Ahmed',
    customerEmail: 'zara@email.com',
    lastMessage: 'Is there a group discount available?',
    lastMessageTime: '2025-06-15T11:20:00',
    unread: 3,
    messages: [
      { id: 'm10', senderId: 'zara', senderName: 'Zara Ahmed', text: 'Hi, we are a group of 6 people interested in the Gobi tour.', timestamp: '2025-06-15T11:00:00', isOwn: false },
      { id: 'm11', senderId: 'zara', senderName: 'Zara Ahmed', text: 'Is there a group discount available?', timestamp: '2025-06-15T11:20:00', isOwn: false },
    ],
  },
]
