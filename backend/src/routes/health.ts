import { Router } from 'express'
import { ok } from '../lib/api.js'
import { env } from '../config/env.js'

export const healthRouter = Router()

healthRouter.get('/health', (_req, res) => {
  ok(res, {
    service: 'cinega-backend',
    status: 'ok',
    time: new Date().toISOString(),
    env: env.NODE_ENV,
  })
})