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
  BCRYPT_ROUNDS:               z.string().default('10'),
  PLATFORM_FEE_PERCENT:        z.string().default('5'),
  // Pending booking expiry
  PENDING_EXPIRY_MINUTES:      z.string().default('15').transform(Number),
  EXPIRY_JOB_INTERVAL_MINUTES: z.string().default('10').transform(Number),
  CRON_SECRET:                 z.string().optional(),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('❌  Invalid environment variables:')
  console.error(parsed.error.flatten().fieldErrors)
  process.exit(1)
}

export const env = {
  ...parsed.data,
  PORT:                 parseInt(parsed.data.PORT, 10),
  BCRYPT_ROUNDS:        parseInt(parsed.data.BCRYPT_ROUNDS, 10),
  PLATFORM_FEE_PERCENT: parseFloat(parsed.data.PLATFORM_FEE_PERCENT),
} as const
