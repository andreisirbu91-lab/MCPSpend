import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import { authRouter } from './routes/auth'
import { ingestRouter } from './routes/ingest'
import { statsRouter } from './routes/stats'
import { projectsRouter } from './routes/projects'
import { organizationsRouter } from './routes/organizations'
import { invitationsRouter } from './routes/invitations'
import { apiKeysRouter } from './routes/apiKeys'
import { billingRouter, billingPublicRouter } from './routes/billing'
import { exportRouter } from './routes/export'
import { adminRouter } from './routes/admin'
import { auditRouter } from './routes/audit'
import { accountRouter } from './routes/account'
import { webhookSubscriptionsRouter } from './routes/webhooks-mgmt'
import { publicStatusRouter } from './routes/public-status'
import { liveRouter } from './routes/live'
import { slackRouter } from './routes/slack'
import { internalRouter } from './routes/internal'
import { mcpRouter } from './routes/mcp'
import { webhookRouter } from './routes/webhooks'
import { authMiddleware } from './middleware/auth'

const app = express()
const PORT = process.env.PORT || 4000

app.set('trust proxy', 1) // behind Coolify / Caddy reverse proxy

app.use(helmet())

// CORS: union of (a) our own production origins, hardcoded so a misconfigured
// DASHBOARD_URL env var can never block the landing page from calling the API
// (caught us once when /api/billing/start broke from mcpspend.com), and (b)
// anything else operators add via the env var (e.g. preview deploys, custom
// domains, localhost variants).
const HARDCODED_ALLOWED_ORIGINS = [
  'https://mcpspend.com',
  'https://www.mcpspend.com',
  'https://dashboard.mcpspend.com',
  'http://localhost:3000',
  'http://localhost:3001',
]
const envOrigins = (process.env.DASHBOARD_URL || '')
  .split(',').map(s => s.trim()).filter(Boolean)
const allowedOrigins = Array.from(new Set([...HARDCODED_ALLOWED_ORIGINS, ...envOrigins]))

app.use(cors({
  origin: (origin, cb) => {
    // Same-origin requests + curl / server-to-server have no Origin header — allow.
    if (!origin) return cb(null, true)
    if (allowedOrigins.includes(origin)) return cb(null, true)
    cb(new Error(`CORS: origin ${origin} not allowed`))
  },
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Organization-Id'],
}))

// Stripe webhooks need raw body — before json middleware
app.use('/api/webhooks', express.raw({ type: 'application/json' }), webhookRouter)

app.use(express.json({ limit: '2mb' }))

// Global rate limit: 1000 req/minute per IP
app.use(rateLimit({
  windowMs: 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests' },
}))

// Tighter limit for auth endpoints (prevent credential stuffing / brute force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 attempts per IP per 15 min
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many auth attempts — try again in a few minutes' },
})

// Higher limit for ingest (high-volume writes)
const ingestLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 5000,
  standardHeaders: true,
  legacyHeaders: false,
})

app.get('/health', (_req, res) => res.json({
  status: 'ok',
  version: '0.2.0',
  ts: new Date().toISOString(),
}))

app.use('/api/auth', authLimiter, authRouter)
app.use('/api/ingest', ingestLimiter, authMiddleware, ingestRouter)
app.use('/api/stats', authMiddleware, statsRouter)
app.use('/api/projects', authMiddleware, projectsRouter)
app.use('/api/organizations', authMiddleware, organizationsRouter)
app.use('/api/invitations', authMiddleware, invitationsRouter)
app.use('/api/keys', authMiddleware, apiKeysRouter)
app.use('/api/billing', billingPublicRouter)            // /start is public
app.use('/api/billing', authMiddleware, billingRouter)  // /checkout, /portal require auth
app.use('/api/export', authMiddleware, exportRouter)    // CSV (Pro+)
app.use('/api/admin', authMiddleware, adminRouter)      // platform-owner view (SUPER_ADMIN_EMAILS)
app.use('/api/audit', authMiddleware, auditRouter)      // org-scoped audit log (Team+)
app.use('/api/account', authMiddleware, accountRouter)  // GDPR Art. 15/17/20 — export + delete (all plans)
app.use('/api/webhook-subscriptions', authMiddleware, webhookSubscriptionsRouter)  // customer-defined webhooks for events
app.use('/api/public/status', publicStatusRouter)        // public uptime data (no auth) for /status page
// Also expose at /api/public so /api/public/pricing-models works — the price
// table route is in the same router file and several landing pages link to
// the short URL. Both paths resolve the same handlers (status returns the
// '/' route, pricing returns the '/pricing-models' route).
app.use('/api/public', publicStatusRouter)               // canonical /api/public/pricing-models for landing pages
app.use('/api/stats/live', authMiddleware, liveRouter)   // SSE — live tool call stream for dashboard ticker
app.use('/api/slack', slackRouter)                       // Slack slash commands — auth via ?key= in URL
app.use('/api/internal', internalRouter)                // CI/CD: redeploy via DEPLOY_SECRET header (no JWT)
// MCP-over-HTTP endpoint. Auth is handled INSIDE the router because the
// `initialize` and `tools/list` methods are part of the public handshake (any
// client probes them before sending an API key). Only `tools/call` requires a
// valid Bearer key.
app.use('/api/mcp', mcpRouter)

app.listen(PORT, () => {
  console.log(`MCPSpend API v0.2.0 running on port ${PORT}`)
})

export default app
