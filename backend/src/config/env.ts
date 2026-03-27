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
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌  Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

const data = parsed.data
const publicAppUrl = data.PUBLIC_APP_URL?.trim() || data.CORS_ORIGIN

export const env = {
  ...data,
  PORT:                 parseInt(data.PORT, 10),
  BCRYPT_ROUNDS:        parseInt(data.BCRYPT_ROUNDS, 10),
  PLATFORM_FEE_PERCENT: parseFloat(data.PLATFORM_FEE_PERCENT),
  /** Use for password-reset and welcome email links */
  PUBLIC_APP_URL:       publicAppUrl,
  EMAIL_LOGO_URL:       (data.EMAIL_LOGO_URL ?? '').trim(),
} as const
