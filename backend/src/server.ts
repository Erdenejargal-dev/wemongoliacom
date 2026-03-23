import 'dotenv/config'
import { env } from './config/env'
import app from './app'
import { prisma } from './lib/prisma'
import { expireStalePendingTourBookings } from './services/booking.service'

let expiryInterval: ReturnType<typeof setInterval> | null = null

async function runExpiryJob() {
  try {
    const expired = await expireStalePendingTourBookings(env.PENDING_EXPIRY_MINUTES)
    if (expired > 0) console.log(`[expiry] Expired ${expired} stale pending tour booking(s)`)
  } catch (err) {
    console.error('[expiry] Job failed:', err)
  }
}

async function start() {
  try {
    await prisma.$connect()
    console.log('✅  Database connected')

    // Run expiry on startup
    await runExpiryJob()

    const server = app.listen(env.PORT, () => {
      console.log(`🚀  Server running on http://localhost:${env.PORT}`)
      console.log(`📡  API prefix: ${env.API_PREFIX}`)
      console.log(`🌍  Environment: ${env.NODE_ENV}`)
      console.log(`⏱️  Expiry: every ${env.EXPIRY_JOB_INTERVAL_MINUTES} min (pending > ${env.PENDING_EXPIRY_MINUTES} min)`)
    })

    // Scheduled expiry (in-process) — runs every N minutes
    if (env.EXPIRY_JOB_INTERVAL_MINUTES > 0) {
      const ms = env.EXPIRY_JOB_INTERVAL_MINUTES * 60 * 1000
      expiryInterval = setInterval(runExpiryJob, ms)
    }

    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully…`)
      if (expiryInterval) clearInterval(expiryInterval)
      server.close(async () => {
        await prisma.$disconnect()
        console.log('Database disconnected. Bye.')
        process.exit(0)
      })
    }

    process.on('SIGINT',  () => shutdown('SIGINT'))
    process.on('SIGTERM', () => shutdown('SIGTERM'))
  } catch (err) {
    console.error('❌  Failed to start server:', err)
    await prisma.$disconnect()
    process.exit(1)
  }
}

start()
