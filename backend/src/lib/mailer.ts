import nodemailer from 'nodemailer'
import { env } from '../config/env'

export function isSmtpConfigured(): boolean {
  return Boolean(env.SMTP_USER?.trim() && env.SMTP_PASS)
}

let transporter: nodemailer.Transporter | null = null

export function getMailTransporter(): nodemailer.Transporter | null {
  if (!isSmtpConfigured()) return null
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host:   env.SMTP_HOST,
      port:   env.SMTP_PORT,
      secure: env.SMTP_SECURE,
      auth:   {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })
  }
  return transporter
}

/**
 * Verifies SMTP credentials / connectivity. Does not log secrets.
 */
export async function verifyMailTransport(): Promise<boolean> {
  const t = getMailTransporter()
  if (!t) {
    console.info('[mailer] SMTP not configured (SMTP_USER / SMTP_PASS missing); skipping verify')
    return false
  }
  try {
    await t.verify()
    return true
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[mailer] SMTP verification failed:', msg)
    return false
  }
}

export interface SendMailOptions {
  to:      string
  subject: string
  text:    string
  html:    string
}

export async function sendMailMessage(opts: SendMailOptions): Promise<void> {
  const t = getMailTransporter()
  if (!t) {
    console.info('[mailer] Skipping send — SMTP not configured')
    return
  }
  await t.sendMail({
    from:    env.EMAIL_FROM,
    to:      opts.to,
    subject: opts.subject,
    text:    opts.text,
    html:    opts.html,
  })
}
