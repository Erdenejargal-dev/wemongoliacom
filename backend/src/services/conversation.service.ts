import { prisma } from '../lib/prisma'
import { AppError } from '../middleware/error'

function toSenderRole(role: string): 'traveler' | 'provider' {
  return role === 'traveler' ? 'traveler' : 'provider'
}

// ─────────────────────────────────────────────────────────────────────────────
// List conversations for the current user
// ─────────────────────────────────────────────────────────────────────────────

export async function listConversations(userId: string, role: string) {
  const where = role === 'provider_owner'
    ? {
        provider: {
          ownerUserId: userId,
        },
      }
    : { travelerId: userId }

  const conversations = await prisma.conversation.findMany({
    where,
    orderBy: { lastMessageAt: 'desc' },
    take: 50,
    include: {
      traveler: {
        select: { id: true, firstName: true, lastName: true, avatarUrl: true },
      },
      provider: {
        select: { id: true, name: true, slug: true, logoUrl: true },
      },
    },
  })

  return conversations
}

// ─────────────────────────────────────────────────────────────────────────────
// Start or get existing conversation
// ─────────────────────────────────────────────────────────────────────────────

export interface StartConversationInput {
  travelerId:     string
  providerId:     string
  listingType?:   string
  listingId?:     string
  initialMessage: string
}

export async function startConversation(input: StartConversationInput) {
  // Verify provider exists
  const provider = await prisma.provider.findUnique({ where: { id: input.providerId } })
  if (!provider) throw new AppError('Provider not found.', 404)

  // Re-use existing conversation between same traveler + provider
  let conversation = await prisma.conversation.findFirst({
    where: {
      travelerId: input.travelerId,
      providerId: input.providerId,
    },
  })

  if (!conversation) {
    conversation = await prisma.conversation.create({
      data: {
        travelerId:   input.travelerId,
        providerId:   input.providerId,
        listingType:  input.listingType as any,
        listingId:    input.listingId,
        lastMessageAt: new Date(),
        travelerUnreadCount: 0,
        providerUnreadCount: 1,  // provider has unread from traveler
      },
    })
  }

  // Create the first message
  const message = await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId:       input.travelerId,
      senderRole:     'traveler',
      text:           input.initialMessage,
    },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
  })

  // Non-blocking email notification to provider
  void import('./email.service')
    .then(({ notifyMessageSent }) =>
      notifyMessageSent({
        conversationId: conversation.id,
        senderRole:     'traveler',
        messagePreview: input.initialMessage.slice(0, 200),
      }),
    )
    .catch((err) => console.error('[email] notifyMessageSent (start) failed:', err))

  return { conversation, message }
}

// ─────────────────────────────────────────────────────────────────────────────
// Get messages in a conversation (paginated, newest-first)
// ─────────────────────────────────────────────────────────────────────────────

export async function getMessages(conversationId: string, userId: string, role: string, cursor?: string) {
  // Access control: must be a participant
  await assertParticipant(conversationId, userId, role)

  const take = 30
  const messages = await prisma.message.findMany({
    where:   { conversationId },
    orderBy: { createdAt: 'desc' },
    take,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
  })

  return {
    messages,
    nextCursor: messages.length === take ? messages[messages.length - 1].id : null,
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Send a message
// ─────────────────────────────────────────────────────────────────────────────

export interface SendMessageInput {
  conversationId: string
  senderUserId:   string
  senderRole:     string
  text:           string
  attachments?:   string[]
}

export async function sendMessage(input: SendMessageInput) {
  const { conversationId, senderUserId, senderRole, text, attachments } = input

  // Access control
  await assertParticipant(conversationId, senderUserId, senderRole)

  // Create the message
  const message = await prisma.message.create({
    data: {
      conversationId,
      senderId:   senderUserId,
      senderRole: toSenderRole(senderRole),
      text,
      attachments: attachments ?? [],
    },
    include: {
      sender: { select: { id: true, firstName: true, lastName: true, avatarUrl: true } },
    },
  })

  // Update conversation preview + unread counter for the OTHER party
  const updateData: Record<string, unknown> = {
    lastMessagePreview: text.slice(0, 100),
    lastMessageAt:      new Date(),
  }
  if (senderRole === 'traveler') {
    updateData.providerUnreadCount = { increment: 1 }
  } else {
    updateData.travelerUnreadCount = { increment: 1 }
  }

  await prisma.conversation.update({
    where: { id: conversationId },
    data:  updateData as any,
  })

  // Non-blocking email notification to the OTHER party
  void import('./email.service')
    .then(({ notifyMessageSent }) =>
      notifyMessageSent({
        conversationId,
        senderRole:     toSenderRole(senderRole),
        messagePreview: text.slice(0, 200),
      }),
    )
    .catch((err) => console.error('[email] notifyMessageSent (send) failed:', err))

  return message
}

// ─────────────────────────────────────────────────────────────────────────────
// Mark conversation as read (reset unread count for current user)
// ─────────────────────────────────────────────────────────────────────────────

export async function markConversationRead(conversationId: string, userId: string, role: string) {
  await assertParticipant(conversationId, userId, role)

  const data: Record<string, unknown> = role === 'traveler'
    ? { travelerUnreadCount: 0 }
    : { providerUnreadCount: 0 }

  return prisma.conversation.update({
    where: { id: conversationId },
    data:  data as any,
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// Helper: check user is a participant (throws 403 if not)
// ─────────────────────────────────────────────────────────────────────────────

async function assertParticipant(conversationId: string, userId: string, role: string) {
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { provider: { select: { ownerUserId: true } } },
  })
  if (!conv) throw new AppError('Conversation not found.', 404)

  const isTraveler = conv.travelerId === userId
  const isProvider = conv.provider?.ownerUserId === userId

  if (!isTraveler && !isProvider) throw new AppError('Forbidden.', 403)
}
