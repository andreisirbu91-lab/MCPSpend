// Internal-only routes called by our own infra (mainly CI/CD).
//
// /redeploy lets the deploy workflow trigger a Coolify deployment without
// needing SSH tunnels into the VPS — Coolify isn't exposed publicly, but the
// API container shares the `coolify` Docker network so it can reach the
// Coolify API directly. CI hits this endpoint with a shared secret in
// X-Deploy-Token; we proxy the call internally.
//
// This is the canonical "deploy" path going forward. SSH-tunnel fallback
// in .github/workflows/deploy.yml can stay as a safety net but should not
// be the primary trigger.

import { Router } from 'express'
import { z } from 'zod'
import { createHash } from 'node:crypto'
import { prisma } from '../lib/prisma'

const router = Router()

const COOLIFY_INTERNAL = process.env.COOLIFY_INTERNAL_URL || 'http://coolify:8080'

router.post('/redeploy', async (req, res) => {
  const sharedSecret = process.env.DEPLOY_SECRET
  if (!sharedSecret) {
    res.status(503).json({ error: 'DEPLOY_SECRET not configured on this server' })
    return
  }
  const provided = (req.headers['x-deploy-token'] as string | undefined)?.trim()
  if (!provided || provided !== sharedSecret) {
    res.status(403).json({ error: 'Invalid deploy token' })
    return
  }

  const schema = z.object({
    uuid: z.string().min(1),
    force: z.boolean().default(false),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'uuid is required' })
    return
  }

  const coolifyToken = process.env.COOLIFY_TOKEN
  if (!coolifyToken) {
    res.status(503).json({ error: 'COOLIFY_TOKEN not configured' })
    return
  }

  try {
    const url = `${COOLIFY_INTERNAL}/api/v1/deploy?uuid=${encodeURIComponent(parsed.data.uuid)}&force=${parsed.data.force}`
    // POST, not GET: Coolify changed this endpoint and now answers a GET with
    // `405 This endpoint has changed to a POST request.` The switch went
    // unnoticed because the token we were sending had been revoked, so every
    // call died at `401` — before routing ever ran. Two faults, the first
    // hiding the second.
    const r = await fetch(url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${coolifyToken}` },
    })
    const body = await r.text()
    if (!r.ok) {
      res.status(502).json({ error: 'Coolify rejected the deploy', status: r.status, body })
      return
    }
    res.json({ triggered: true, coolifyStatus: r.status, body: body.slice(0, 500) })
  } catch (err) {
    res.status(502).json({ error: 'Could not reach Coolify', detail: (err as Error).message })
  }
})

// POST /api/internal/compat-report — anonymous schema-drift telemetry from the
// mcpspend CLI (init / doctor). No auth: this is intentionally public so users
// who never logged in can still help us spot schema changes in the wild. Rate
// limiting is provided by the global limiter in index.ts; we also hash the
// caller IP so we can spot pathological clients without storing PII.
router.post('/compat-report', async (req, res) => {
  const schema = z.object({
    cliVersion: z.string().max(40),
    platform: z.string().max(40),
    reports: z.array(z.object({
      id: z.string().max(40),
      status: z.string().max(40),
      configFormat: z.string().max(40).optional(),
      topLevelKeysFingerprint: z.string().max(64).optional(),
      serverCount: z.number().int().nonnegative().optional(),
      wrappedCount: z.number().int().nonnegative().optional(),
    })).max(20),
    errorSummary: z.string().max(500).optional(),
  })
  const parsed = schema.safeParse(req.body)
  if (!parsed.success) {
    res.status(400).json({ error: 'invalid payload' })
    return
  }

  const ip = (req.headers['x-forwarded-for']?.toString().split(',')[0]?.trim()) || req.socket.remoteAddress || ''
  const ipHash = ip ? createHash('sha256').update(ip).digest('hex').slice(0, 16) : null

  // Persist one row per reported client. createMany is atomic at the DB level
  // and we want each (client, fingerprint) tuple queryable.
  try {
    await prisma.compatReport.createMany({
      data: parsed.data.reports.map(r => ({
        cliVersion: parsed.data.cliVersion,
        platform: parsed.data.platform,
        clientId: r.id,
        status: r.status,
        configFormat: r.configFormat ?? null,
        fingerprint: r.topLevelKeysFingerprint ?? null,
        serverCount: r.serverCount ?? null,
        wrappedCount: r.wrappedCount ?? null,
        errorSummary: parsed.data.errorSummary ?? null,
        ipHash,
      })),
    })
  } catch (err) {
    // Telemetry must never break the caller — log and 204.
    console.error('[compat-report] failed:', err)
  }
  res.status(204).send()
})

export { router as internalRouter }
