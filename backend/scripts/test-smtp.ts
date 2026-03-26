/**
 * One-off: verify Zoho SMTP and send a test message to SMTP_USER.
 * Usage from backend/: npx ts-node --transpile-only scripts/test-smtp.ts
 */
import 'dotenv/config'
import { isSmtpConfigured, verifyMailTransport } from '../src/lib/mailer'
import { sendSmtpTest } from '../src/services/email.service'

async function main() {
  if (!isSmtpConfigured()) {
    console.error('Set SMTP_USER and SMTP_PASS in backend/.env first.')
    process.exit(1)
  }
  const ok = await verifyMailTransport()
  if (!ok) {
    console.error('SMTP verify failed — check host, port, secure, and credentials.')
    process.exit(1)
  }
  console.log('SMTP verify: OK')
  const to = process.env.SMTP_USER!.trim()
  await sendSmtpTest(to)
  console.log('Test email sent to:', to)
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e)
  process.exit(1)
})
