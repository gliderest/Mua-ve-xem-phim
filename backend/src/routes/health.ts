import { Router } from 'express'
import { ok } from '../lib/api.js'

export const healthRouter = Router()

healthRouter.get('/health', (_req, res) => {
  ok(res, {
    service: 'cinega-backend',
    status: 'ok',
    time: new Date().toISOString(),
  })
})

// Public health check endpoint for load balancers / monitoring (no auth required)
healthRouter.get('/api/health', (_req, res) => {
  ok(res, {
    service: 'cinega-backend',
    status: 'ok',
    time: new Date().toISOString(),
    message: 'This endpoint is public (no authentication required)',
  })
})