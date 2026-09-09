import { app } from './app.js'
import { env } from './config/env.js'

app.listen(env.PORT, () => {
  console.log(`CINEGA backend listening on :${env.PORT} (${env.NODE_ENV})`)
  console.log(`  Health:   http://localhost:${env.PORT}/health`)
})

// graceful shutdown
process.on('SIGTERM', () => process.exit(0))
process.on('SIGINT', () => process.exit(0))