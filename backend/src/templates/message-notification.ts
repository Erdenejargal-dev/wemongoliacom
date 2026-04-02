/**
 * backend/src/templates/message-notification.ts
 *
 * Email template for new message notifications.
 * Sent to the OTHER participant when a message is sent in a conversation.
 */

import { wrapEmailHtml, wrapEmailText } from './email-layout'

export interface MessageNotificationPayload {
  /** Full name of the recipient */
  recipientName:  string
  /** Full name of the sender */
  senderName:     string
  /** Preview of the message (truncated to ~200 chars) */
  messagePreview: string
  /** Optional listing context */
  listingTitle?:  string
  listingType?:   string
  /** Deep-link URL to open the exact conversation */
  conversationUrl: string
}

export function buildMessageNotificationEmail(p: MessageNotificationPayload): {
  subject: string
  html:    string
  text:    string
} {
  const listingContext = p.listingTitle
    ? `<p style="margin:0 0 8px;font-size:13px;color:#6b7280;">
         Re: ${p.listingType ? p.listingType.charAt(0).toUpperCase() + p.listingType.slice(1) + ' · ' : ''}${p.listingTitle}
       </p>`
    : ''

  const preview = p.messagePreview.length > 200
    ? p.messagePreview.slice(0, 200) + '…'
    : p.messagePreview

  const subject = `New message from ${p.senderName}`

  const bodyHtml = `
    <h2 style="margin:0 0 16px;font-size:20px;font-weight:700;color:#111827;">
      New message from ${p.senderName}
    </h2>

    ${listingContext}

    <blockquote style="margin:0 0 24px;padding:14px 18px;background:#f9fafb;border-left:4px solid #f97316;border-radius:0 8px 8px 0;">
      <p style="margin:0;font-size:14px;color:#374151;line-height:1.6;font-style:italic;">
        "${preview}"
      </p>
    </blockquote>

    <div style="text-align:center;margin-bottom:24px;">
      <a href="${p.conversationUrl}"
         style="display:inline-block;padding:12px 28px;background:#f97316;color:#ffffff;text-decoration:none;border-radius:10px;font-weight:700;font-size:14px;">
        View Conversation
      </a>
    </div>

    <p style="margin:0;font-size:12px;color:#9ca3af;text-align:center;">
      Reply directly from the WeMongolia messages page.
    </p>
  `

  const textBody = [
    `New message from ${p.senderName}`,
    p.listingTitle ? `Re: ${p.listingTitle}` : '',
    '',
    `"${preview}"`,
    '',
    `View conversation: ${p.conversationUrl}`,
  ].filter(Boolean).join('\n')

  return {
    subject,
    html: wrapEmailHtml(subject, bodyHtml),
    text: wrapEmailText(subject, textBody.split('\n')),
  }
}
