import { z } from 'zod'

const envSchema = z.object({
  NODE_ENV:                    z.enum(['development', 'production', 'test']).default('development'),
  PORT:                        z.string().default('4000'),
  API_PREFIX:                  z.string().default('/api/v1'),
  DATABASE_URL:                z.string().min(1, 'DATABASE_URL is required'),
  JWT_ACCESS_SECRET:           z.string().min(32, 'JWT_ACCESS_SECRET must be at least 32 chars'),
  JWT_REFRESH_SECRET:          z.string().min(32, 'JWT_REFRESH_SECRET must be at least 32 chars'),
  JWT_ACCESS_EXPIRES_IN:       z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN:      z.string().default('7d'),
  CORS_ORIGIN:                 z.string().default('http://localhost:3000'),
  /** Public web app URL for email links; defaults to CORS_ORIGIN when empty */
  PUBLIC_APP_URL:              z.string().optional().default(''),
  /** Optional absolute URL for the logo in HTML emails (CDN). If empty, uses PUBLIC_APP_URL + /brand/wemongolia.png */
  EMAIL_LOGO_URL:              z.string().optional().default(''),
  PASSWORD_RESET_EXPIRES_MINUTES: z.string().default('60').transform((v) => parseInt(v, 10)),
  BCRYPT_ROUNDS:               z.string().default('10'),
  PLATFORM_FEE_PERCENT:        z.string().default('5'),
  // Pending booking expiry
  PENDING_EXPIRY_MINUTES:      z.string().default('15').transform(Number),
  EXPIRY_JOB_INTERVAL_MINUTES: z.string().default('10').transform(Number),
  CRON_SECRET:                 z.string().optional(),
  // Cloudinary (auto-configured via CLOUDINARY_URL or individual vars)
  CLOUDINARY_URL:              z.string().optional(),
  CLOUDINARY_CLOUD_NAME:       z.string().optional(),
  CLOUDINARY_API_KEY:          z.string().optional(),
  CLOUDINARY_API_SECRET:       z.string().optional(),
  // SMTP (Zoho Mail) — optional; leave SMTP_USER/SMTP_PASS empty to disable sending
  SMTP_HOST:                   z.string().default('smtp.zoho.com'),
  SMTP_PORT:                   z.string().default('465').transform((v) => parseInt(v, 10)),
  SMTP_SECURE:                 z
    .string()
    .default('true')
    .transform((v) => v.toLowerCase() !== 'false' && v !== '0'),
  SMTP_USER:                   z.string().optional().default(''),
  SMTP_PASS:                   z.string().optional().default(''),
  EMAIL_FROM:                  z.string().default('WeMongolia <info@wemongolia.com>'),
  // Bonum PSP — merchant guide (ecommerce gateway + invoices)
  BONUM_API_BASE_URL:          z.string().optional().default(''),
  /** App secret for Authorization: AppSecret {APP_SECRET} on auth/create */
  BONUM_APP_SECRET:            z.string().optional().default(''),
  /** Legacy alias for BONUM_APP_SECRET */
  BONUM_API_KEY:               z.string().optional().default(''),
  /** X-TERMINAL-ID header (default terminal) */
  BONUM_TERMINAL_ID:           z.string().optional().default(''),
  /** Webhook HMAC key for x-checksum-v2 (raw body, HMAC-SHA256) */
  BONUM_MERCHANT_CHECKSUM_KEY: z.string().optional().default(''),
  /** Legacy alias for BONUM_MERCHANT_CHECKSUM_KEY */
  BONUM_CHECKSUM_SECRET:       z.string().optional().default(''),
  /** Min milliseconds between auth/create calls (guide ~25 min) */
  BONUM_TOKEN_MIN_CREATE_INTERVAL_MS: z.string().default(String(25 * 60 * 1000)).transform(Number),
  /** Optional invoice expiresIn (seconds) for POST .../invoices */
  BONUM_INVOICE_EXPIRES_IN_SECONDS: z
    .string()
    .optional()
    .default('')
    .transform((v) => {
      if (!v?.trim()) return 0
      const n = Number(v)
      return Number.isFinite(n) ? n : 0
    }),
  /** Optional JSON array of provider codes e.g. ["QPAY"] — omit env to let Bonum show all */
  BONUM_INVOICE_PROVIDERS_JSON: z.string().optional().default(''),
  /** Optional refund path relative to BONUM_API_BASE_URL — only when documented by Bonum */
  BONUM_REFUND_RELATIVE_PATH: z.string().optional().default(''),
  /** When true, skip real Bonum HTTP (local only). */
  BONUM_USE_STUB:              z.string().optional().default('false'),
  /** Max minutes from booking creation that payment can ever complete (hard cap). */
  MAX_HOLD_MINUTES_FROM_BOOKING: z.string().default('45').transform(Number),
  /** Extra minutes added to hold on each initiate/retry (capped by max hold). */
  PAYMENT_SESSION_EXTENSION_MINUTES: z.string().default('15').transform(Number),
  /** Max payment initiate/retry calls per booking per rolling hour (sliding window approximated in-process). */
  PAYMENT_MAX_RETRIES_PER_HOUR: z.string().default('8').transform(Number),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌  Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

const data = parsed.data
const publicAppUrl = data.PUBLIC_APP_URL?.trim() || data.CORS_ORIGIN

const bonumAppSecret = data.BONUM_APP_SECRET?.trim() || data.BONUM_API_KEY?.trim() || ''
const bonumChecksumKey = data.BONUM_MERCHANT_CHECKSUM_KEY?.trim() || data.BONUM_CHECKSUM_SECRET?.trim() || ''

export const env = {
  ...data,
  PORT:                 parseInt(data.PORT, 10),
  BCRYPT_ROUNDS:        parseInt(data.BCRYPT_ROUNDS, 10),
  PLATFORM_FEE_PERCENT: parseFloat(data.PLATFORM_FEE_PERCENT),
  /** Use for password-reset and welcome email links */
  PUBLIC_APP_URL:       publicAppUrl,
  EMAIL_LOGO_URL:       (data.EMAIL_LOGO_URL ?? '').trim(),
  /** Resolved Bonum credentials (aliases applied) */
  BONUM_APP_SECRET:     bonumAppSecret,
  BONUM_MERCHANT_CHECKSUM_KEY: bonumChecksumKey,
} as const
