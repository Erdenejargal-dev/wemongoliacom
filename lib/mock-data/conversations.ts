export type Sender = 'user' | 'host'

export interface Message {
  id: string
  sender: Sender
  text: string
  timestamp: string   // display string e.g. "10:32 AM"
}

export interface Conversation {
  id: string
  hostSlug: string
  hostName: string
  hostAvatar: string
  tourSlug: string
  tourTitle: string
  lastMessage: string
  lastMessageTime: string
  unread: number
  messages: Message[]
}

export const mockConversations: Conversation[] = [
  {
    id: 'conv-1',
    hostSlug: 'gobi-adventure-tours',
    hostName: 'Gobi Adventure Tours',
    hostAvatar: 'https://images.unsplash.com/photo-1516912481808-3406841bd33c?w=80&h=80&fit=crop',
    tourSlug: 'gobi-desert-camel-trek',
    tourTitle: 'Gobi Desert Camel Trek',
    lastMessage: 'Looking forward to hosting you next October!',
    lastMessageTime: '10:32 AM',
    unread: 2,
    messages: [
      { id: 'm1', sender: 'user', text: 'Hi! I just booked the Gobi Desert Camel Trek for October and I had a couple of questions about what to pack.', timestamp: 'Sep 5, 9:14 AM' },
      { id: 'm2', sender: 'host', text: 'Hello Alex! Welcome aboard — we\'re thrilled to have you joining us. Happy to help with packing!', timestamp: 'Sep 5, 9:28 AM' },
      { id: 'm3', sender: 'host', text: 'For October, the desert nights can get quite cold — we recommend a mid-layer fleece and a windproof jacket. Temperatures can drop to 5°C at night.', timestamp: 'Sep 5, 9:30 AM' },
      { id: 'm4', sender: 'user', text: 'That\'s really helpful, thank you. Should we bring our own sleeping bags or will they be provided?', timestamp: 'Sep 5, 9:45 AM' },
      { id: 'm5', sender: 'host', text: 'Great question! We provide high-quality sleeping bags rated to -10°C. You\'re very welcome to bring your own if you prefer, but ours should be more than comfortable.', timestamp: 'Sep 5, 9:52 AM' },
      { id: 'm6', sender: 'user', text: 'Perfect, that saves us packing space. One more thing — is there any opportunity to see the Milky Way from the camp?', timestamp: 'Sep 5, 10:15 AM' },
      { id: 'm7', sender: 'host', text: 'Absolutely — the Gobi has some of the darkest skies in the world. October is actually an excellent month for stargazing. Our guides will point out constellations and there\'s usually a dedicated 30-minute stargazing session each evening.', timestamp: 'Sep 5, 10:28 AM' },
      { id: 'm8', sender: 'host', text: 'Looking forward to hosting you next October! 🐪', timestamp: 'Sep 5, 10:32 AM' },
    ],
  },
  {
    id: 'conv-2',
    hostSlug: 'altai-expeditions',
    hostName: 'Altai Expeditions',
    hostAvatar: 'https://images.unsplash.com/photo-1470770903676-69b98201ea1c?w=80&h=80&fit=crop',
    tourSlug: 'altai-eagle-hunter-expedition',
    tourTitle: 'Altai Eagle Hunter Expedition',
    lastMessage: 'Your booking is confirmed. See you in October!',
    lastMessageTime: 'Yesterday',
    unread: 0,
    messages: [
      { id: 'm1', sender: 'user', text: 'Hello Davaadorj! I\'m incredibly excited about the Eagle Hunter Expedition. Is there anything special I should do to prepare photographically?', timestamp: 'Oct 1, 2:00 PM' },
      { id: 'm2', sender: 'host', text: 'Hello Alex! I\'m so glad you chose this tour. For photography, I recommend a telephoto lens — at least 300mm — for capturing the eagles in flight. The light in the Altai is best in the early morning golden hour.', timestamp: 'Oct 1, 3:15 PM' },
      { id: 'm3', sender: 'user', text: 'That\'s perfect, I have a 400mm. What about camera protection from the dust and cold?', timestamp: 'Oct 1, 3:30 PM' },
      { id: 'm4', sender: 'host', text: 'Good thinking! Bring a dry bag or camera rain cover, and silica gel sachets for condensation when moving between warm ger and cold outside. Extra batteries are a must — cold drains them fast.', timestamp: 'Oct 1, 4:00 PM' },
      { id: 'm5', sender: 'host', text: 'Your booking is confirmed. See you in October! 🦅', timestamp: 'Oct 1, 4:05 PM' },
    ],
  },
  {
    id: 'conv-3',
    hostSlug: 'ub-culture-tours',
    hostName: 'UB Culture Tours',
    hostAvatar: 'https://images.unsplash.com/photo-1596178060671-7a80dc8059ea?w=80&h=80&fit=crop',
    tourSlug: 'naadam-festival-special',
    tourTitle: 'Naadam Festival Special',
    lastMessage: 'Thank you for the wonderful review!',
    lastMessageTime: 'Jul 20',
    unread: 0,
    messages: [
      { id: 'm1', sender: 'user', text: 'Hi! We just completed the Naadam Festival tour and it was absolutely incredible. Thank you so much!', timestamp: 'Jul 14, 8:00 PM' },
      { id: 'm2', sender: 'host', text: 'Thank you so much, Alex! We\'re so happy you enjoyed Naadam. The archery finals were particularly exciting this year!', timestamp: 'Jul 14, 8:30 PM' },
      { id: 'm3', sender: 'user', text: 'The horse race was my highlight. Our guide Min was extraordinary — incredibly knowledgeable and so warm. Please pass on our thanks!', timestamp: 'Jul 14, 8:45 PM' },
      { id: 'm4', sender: 'host', text: 'I will absolutely pass that along to Min — she\'ll be so touched. We hope to see you in Mongolia again soon!', timestamp: 'Jul 14, 9:00 PM' },
      { id: 'm5', sender: 'host', text: 'Thank you for the wonderful review! 🙏', timestamp: 'Jul 20, 10:15 AM' },
    ],
  },
]
