import 'dotenv/config'
import { env } from './config/env'
import app from './app'
import { prisma } from './lib/prisma'

async function start() {
  try {
    await prisma.$connect()
    console.log('✅  Database connected')

    const server = app.listen(env.PORT, () => {
      console.log(`🚀  Server running on http://localhost:${env.PORT}`)
      console.log(`📡  API prefix: ${env.API_PREFIX}`)
      console.log(`🌍  Environment: ${env.NODE_ENV}`)
    })

    const shutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down gracefully…`)
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
