import { escapeHtml } from '../utils/email-format'

const SUPPORT = 'info@wemongolia.com'

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
              <p style="margin:0;font-size:15px;font-weight:600;color:#16a34a;letter-spacing:-0.02em;">WeMongolia</p>
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
              Questions? Contact us at <a href="mailto:${SUPPORT}" style="color:#16a34a;text-decoration:none;">${SUPPORT}</a>
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
