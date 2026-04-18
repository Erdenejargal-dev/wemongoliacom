import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import compression from 'compression'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { env } from './config/env'
import router from './routes/index'
import bonumWebhookRoutes from './routes/bonum.webhook.routes'
import { errorHandler } from './middleware/error'

const app = express()

// ── Security ───────────────────────────────────────────────────────────────
app.use(helmet())
app.use(cors({
  origin:      env.CORS_ORIGIN,
  credentials: true,
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
}))

// ── Rate limiting ─────────────────────────────────────────────────────────
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,   // 15 minutes
  max:      300,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, error: 'Too many requests. Please try again later.' },
}))

// Tighter limit for auth endpoints
app.use(`${env.API_PREFIX}/auth`, rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      20,
  message: { success: false, error: 'Too many auth attempts. Please try again later.' },
}))

// ── Bonum webhook (raw body for signature verification) — must run before express.json ──
app.use(`${env.API_PREFIX}/webhooks`, bonumWebhookRoutes)

// ── Body parsing ──────────────────────────────────────────────────────────
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(compression())

// ── Logging ───────────────────────────────────────────────────────────────
if (env.NODE_ENV !== 'test') {
  app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'))
}

// ── Health check ──────────────────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', env: env.NODE_ENV, ts: new Date().toISOString() })
})

// ── API routes ────────────────────────────────────────────────────────────
app.use(env.API_PREFIX, router)

// ── 404 ───────────────────────────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ success: false, error: 'Route not found.' })
})

// ── Global error handler (must be last) ───────────────────────────────────
app.use(errorHandler)

export default app
