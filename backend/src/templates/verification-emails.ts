/**
 * backend/src/templates/verification-emails.ts
 * Transactional email templates for the provider verification workflow.
 *
 * Four templates:
 *  1. buildVerificationSubmittedProvider — confirmation to provider on submit
 *  2. buildVerificationSubmittedAdmin   — alert to WeMongolia admin on submit
 *  3. buildVerificationApproved         — approval confirmation to provider
 *  4. buildVerificationRejected         — rejection notice + reason to provider
 */

import { escapeHtml } from '../utils/email-format'
import { wrapEmailHtml, wrapEmailText } from './email-layout'

const SUPPORT = 'info@wemongolia.com'

// ── Param types ─────────────────────────────────────────────────────────────

export interface VerificationSubmittedProviderParams {
  ownerName:    string
  businessName: string
  providerTypes: string[]
}

export interface VerificationSubmittedAdminParams {
  ownerName:    string
  ownerEmail:   string
  businessName: string
  providerTypes: string[]
  adminUrl:     string
}

export interface VerificationApprovedParams {
  ownerName:    string
  businessName: string
  dashboardUrl: string
}

export interface VerificationRejectedParams {
  ownerName:          string
  businessName:       string
  rejectionReason:    string
  profileSettingsUrl: string
}

// ── Builders ────────────────────────────────────────────────────────────────

/** Email 1: to provider — confirms the review request was received */
export function buildVerificationSubmittedProvider(p: VerificationSubmittedProviderParams) {
  const title   = 'We received your verification request'
  const subject = `[WeMongolia] Verification request received — ${p.businessName}`
  const typeLabel = p.providerTypes.map(t => t.replace(/_/g, ' ')).join(', ')

  const html = wrapEmailHtml(title, `
<p style="margin:0 0 16px 0;">Hi ${escapeHtml(p.ownerName)},</p>
<p style="margin:0 0 16px 0;">
  We have received your verification request for
  <strong>${escapeHtml(p.businessName)}</strong>.
  Your submission is now under review.
</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 16px 0;">
  <tr>
    <td style="padding:6px 0;color:#71717a;width:120px;vertical-align:top;">Business</td>
    <td style="padding:6px 0;color:#18181b;">${escapeHtml(p.businessName)}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;color:#71717a;vertical-align:top;">Type</td>
    <td style="padding:6px 0;color:#18181b;">${escapeHtml(typeLabel)}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;color:#71717a;vertical-align:top;">Status</td>
    <td style="padding:6px 0;color:#18181b;">Pending review</td>
  </tr>
</table>
<p style="margin:0 0 12px 0;">
  The WeMongolia team will review your profile and respond within 1–2 business days.
  You will receive an email when a decision has been made.
</p>
<p style="margin:0;font-size:12px;color:#71717a;">
  Questions? Contact us at
  <a href="mailto:${SUPPORT}" style="color:#0285C9;text-decoration:none;">${SUPPORT}</a>
</p>
`)

  const text = wrapEmailText(title, [
    `Hi ${p.ownerName},`,
    '',
    `We received your verification request for ${p.businessName}.`,
    '',
    `Business: ${p.businessName}`,
    `Type: ${typeLabel}`,
    `Status: Pending review`,
    '',
    'The WeMongolia team will review your profile and respond within 1–2 business days.',
    `Questions: ${SUPPORT}`,
  ])

  return { subject, html, text }
}

/** Email 2: to info@wemongolia.com — new verification submission alert for admin */
export function buildVerificationSubmittedAdmin(p: VerificationSubmittedAdminParams) {
  const title   = `New verification submission — ${p.businessName}`
  const subject = `[WeMongolia Admin] New verification: ${p.businessName}`
  const typeLabel   = p.providerTypes.map(t => t.replace(/_/g, ' ')).join(', ')
  const safeUrl = escapeHtml(p.adminUrl)

  const html = wrapEmailHtml(title, `
<p style="margin:0 0 16px 0;">
  A provider has submitted their profile for verification and is awaiting your review.
</p>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:8px 0 20px 0;">
  <tr>
    <td style="padding:6px 0;color:#71717a;width:140px;vertical-align:top;">Business</td>
    <td style="padding:6px 0;color:#18181b;font-weight:600;">${escapeHtml(p.businessName)}</td>
  </tr>
  <tr>
    <td style="padding:6px 0;color:#71717a;vertical-align:top;">Owner</td>
    <td style="padding:6px 0;color:#18181b;">${escapeHtml(p.ownerName)} &lt;${escapeHtml(p.ownerEmail)}&gt;</td>
  </tr>
  <tr>
    <td style="padding:6px 0;color:#71717a;vertical-align:top;">Type</td>
    <td style="padding:6px 0;color:#18181b;">${escapeHtml(typeLabel)}</td>
  </tr>
</table>
<p style="margin:0 0 8px 0;">
  <a href="${safeUrl}" style="display:inline-block;background:#0285C9;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">
    Review in Admin Console
  </a>
</p>
<p style="margin:8px 0 0 0;font-size:12px;color:#71717a;">
  Link: <span style="word-break:break-all;">${safeUrl}</span>
</p>
`)

  const text = wrapEmailText(title, [
    'A provider submitted for verification.',
    '',
    `Business: ${p.businessName}`,
    `Owner: ${p.ownerName} <${p.ownerEmail}>`,
    `Type: ${typeLabel}`,
    '',
    `Review: ${p.adminUrl}`,
  ])

  return { subject, html, text }
}

/** Email 3: to provider — verification approved */
export function buildVerificationApproved(p: VerificationApprovedParams) {
  const title       = 'Your business has been verified'
  const subject     = `[WeMongolia] Verified — ${p.businessName}`
  const safeDashUrl = escapeHtml(p.dashboardUrl)

  const html = wrapEmailHtml(title, `
<p style="margin:0 0 16px 0;">Hi ${escapeHtml(p.ownerName)},</p>
<p style="margin:0 0 16px 0;">
  We are pleased to confirm that <strong>${escapeHtml(p.businessName)}</strong>
  has been verified on WeMongolia.
</p>
<p style="margin:0 0 12px 0;">Your business profile has passed our review. You can now:</p>
<ul style="margin:0 0 16px 0;padding-left:20px;">
  <li style="margin-bottom:6px;">Manage and publish listings in the Business Portal</li>
  <li style="margin-bottom:6px;">Appear in traveler search results when your profile is active</li>
  <li style="margin-bottom:6px;">Receive and confirm bookings</li>
</ul>
<p style="margin:0 0 16px 0;padding:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;font-size:13px;color:#15803d;">
  <strong>Note:</strong> Verification confirms your profile has been reviewed.
  Your operational listing status (active / draft) is managed separately in your Business Portal settings.
</p>
<p style="margin:0 0 8px 0;">
  <a href="${safeDashUrl}" style="display:inline-block;background:#16a34a;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">
    Open Business Portal
  </a>
</p>
`)

  const text = wrapEmailText('Your business is verified', [
    `Hi ${p.ownerName},`,
    '',
    `${p.businessName} has been verified on WeMongolia.`,
    '',
    'You can now manage listings, appear in traveler search, and receive bookings.',
    '',
    'Note: verification confirms profile review. Operational status is managed separately in your portal.',
    '',
    `Business Portal: ${p.dashboardUrl}`,
  ])

  return { subject, html, text }
}

/** Email 4: to provider — verification rejected with reason */
export function buildVerificationRejected(p: VerificationRejectedParams) {
  const title          = `Verification update for ${p.businessName}`
  const subject        = `[WeMongolia] Verification update — ${p.businessName}`
  const safeProfileUrl = escapeHtml(p.profileSettingsUrl)

  const html = wrapEmailHtml('Verification update', `
<p style="margin:0 0 16px 0;">Hi ${escapeHtml(p.ownerName)},</p>
<p style="margin:0 0 16px 0;">
  We have reviewed the verification request for
  <strong>${escapeHtml(p.businessName)}</strong>
  and were unable to approve it at this time.
</p>
<div style="background:#fef2f2;border:1px solid #fecaca;border-radius:8px;padding:14px 16px;margin:0 0 16px 0;">
  <p style="margin:0;font-size:13px;font-weight:600;color:#991b1b;">Reason:</p>
  <p style="margin:6px 0 0 0;font-size:13px;color:#7f1d1d;line-height:1.5;">${escapeHtml(p.rejectionReason)}</p>
</div>
<p style="margin:0 0 8px 0;font-weight:600;">What you can do:</p>
<ol style="margin:0 0 16px 0;padding-left:20px;">
  <li style="margin-bottom:6px;">Review and update your business profile to address the reason above</li>
  <li style="margin-bottom:6px;">Once your changes are complete, resubmit from your dashboard</li>
</ol>
<p style="margin:0 0 8px 0;">
  <a href="${safeProfileUrl}" style="display:inline-block;background:#18181b;color:#ffffff;text-decoration:none;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;">
    Update Profile &amp; Resubmit
  </a>
</p>
<p style="margin:12px 0 0 0;font-size:12px;color:#71717a;">
  Questions? <a href="mailto:${SUPPORT}" style="color:#0285C9;text-decoration:none;">${SUPPORT}</a>
</p>
`)

  const text = wrapEmailText('Verification update', [
    `Hi ${p.ownerName},`,
    '',
    `We reviewed the verification for ${p.businessName} and were unable to approve it.`,
    '',
    `Reason: ${p.rejectionReason}`,
    '',
    'What to do:',
    '1. Update your business profile to address the reason above',
    '2. Resubmit from your dashboard',
    '',
    `Profile settings: ${p.profileSettingsUrl}`,
    `Questions: ${SUPPORT}`,
  ])

  return { subject, html, text }
}
