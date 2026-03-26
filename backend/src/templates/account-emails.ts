import { escapeHtml } from '../utils/email-format'
import { wrapEmailHtml, wrapEmailText } from './email-layout'

export function buildPasswordResetEmail(payload: { firstName: string; resetUrl: string; expiresMinutes: number }) {
  const name = payload.firstName?.trim() ? escapeHtml(payload.firstName.trim()) : 'there'
  const linkSafe = escapeHtml(payload.resetUrl)
  const subject = '[WeMongolia] Reset your password'
  const title = 'Reset your password'
  const intro = `Hi ${name}, we received a request to reset your WeMongolia password. This link expires in ${payload.expiresMinutes} minutes.`
  const html = wrapEmailHtml(
    title,
    `<p style="margin:0 0 16px 0;">${escapeHtml(intro)}</p>
     <p style="margin:0 0 20px 0;"><a href="${linkSafe}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">Choose a new password</a></p>
     <p style="margin:0;font-size:12px;color:#71717a;word-break:break-all;">If the button does not work, copy and paste this link into your browser:<br>${linkSafe}</p>
     <p style="margin:16px 0 0 0;font-size:12px;color:#71717a;">If you did not request this, you can ignore this email. Your password will stay the same.</p>`,
  )
  const text = wrapEmailText(title, [
    intro,
    '',
    `Open this link to reset your password (expires in ${payload.expiresMinutes} minutes):`,
    payload.resetUrl,
    '',
    'If you did not request a reset, ignore this email.',
  ])
  return { subject, html, text }
}

export function buildWelcomeEmail(payload: { firstName: string; exploreUrl: string; tripsUrl: string; hostUrl: string }) {
  const name = payload.firstName?.trim() ? escapeHtml(payload.firstName.trim()) : 'there'
  const subject = 'Welcome to WeMongolia'
  const title = 'Welcome to WeMongolia'
  const html = wrapEmailHtml(
    title,
    `<p style="margin:0 0 12px 0;">Hi ${name},</p>
     <p style="margin:0 0 16px 0;">Thanks for joining. You can explore curated trips, manage your bookings anytime, and list your own experiences when you are ready.</p>
     <ul style="margin:0;padding-left:20px;color:#3f3f46;line-height:1.6;">
       <li><a href="${escapeHtml(payload.exploreUrl)}" style="color:#16a34a;">Browse tours and stays</a></li>
       <li><a href="${escapeHtml(payload.tripsUrl)}" style="color:#16a34a;">View your trips &amp; bookings</a></li>
       <li><a href="${escapeHtml(payload.hostUrl)}" style="color:#16a34a;">Become a host</a> — share Mongolia with travelers</li>
     </ul>
     <p style="margin:20px 0 0 0;font-size:13px;color:#71717a;">Need help? Reply to this email or write to info@wemongolia.com.</p>`,
  )
  const text = wrapEmailText(title, [
    `Hi ${payload.firstName?.trim() || 'there'},`,
    '',
    'Thanks for joining WeMongolia.',
    '',
    'Next steps:',
    `- Explore: ${payload.exploreUrl}`,
    `- Your trips: ${payload.tripsUrl}`,
    `- Become a host: ${payload.hostUrl}`,
    '',
    'Support: info@wemongolia.com',
  ])
  return { subject, html, text }
}
