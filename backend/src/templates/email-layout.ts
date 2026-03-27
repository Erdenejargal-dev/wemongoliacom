import { escapeHtml } from '../utils/email-format'
import { env } from '../config/env'

const SUPPORT = 'info@wemongolia.com'

function emailLogoAbsoluteUrl(): string {
  const override = env.EMAIL_LOGO_URL
  if (override) return override
  const base = env.PUBLIC_APP_URL.replace(/\/$/, '')
  return `${base}/brand/wemongolia.png`
}

function emailHomeUrl(): string {
  return `${env.PUBLIC_APP_URL.replace(/\/$/, '')}/`
}

/** Table-based header: PNG logo + absolute URL for broad client support; alt text when images are blocked. */
function emailBrandHeaderHtml(): string {
  const logoUrl = escapeHtml(emailLogoAbsoluteUrl())
  const homeUrl = escapeHtml(emailHomeUrl())
  return `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 4px 0;">
  <tr>
    <td>
      <a href="${homeUrl}" style="text-decoration:none;border:0;display:inline-block;">
        <img src="${logoUrl}" alt="WeMongolia" width="168" style="display:block;border:0;outline:none;text-decoration:none;width:168px;max-width:100%;height:auto;" />
      </a>
    </td>
  </tr>
</table>`
}

export function wrapEmailHtml(title: string, bodyHtml: string): string {
  const safeTitle = escapeHtml(title)
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${safeTitle}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:#f4f4f5;padding:24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;background:#ffffff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
          <tr>
            <td style="padding:24px 28px 8px 28px;">
              ${emailBrandHeaderHtml()}
              <h1 style="margin:12px 0 0 0;font-size:20px;font-weight:600;color:#18181b;line-height:1.3;">${safeTitle}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 28px 24px 28px;font-size:14px;line-height:1.6;color:#3f3f46;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:16px 28px 24px 28px;border-top:1px solid #f4f4f5;font-size:12px;line-height:1.5;color:#71717a;">
              Questions? Contact us at <a href="mailto:${SUPPORT}" style="color:#0285C9;text-decoration:none;">${SUPPORT}</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

export function wrapEmailText(title: string, bodyLines: string[]): string {
  const lines = [title, '', ...bodyLines, '', `— WeMongolia`, `Support: ${SUPPORT}`]
  return lines.join('\n')
}
