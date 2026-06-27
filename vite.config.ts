import { defineConfig, loadEnv, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import type { IncomingMessage } from 'node:http'

const apiRoutes: Record<string, string> = {
  '/api/generate-ai-hint': './api/generate-ai-hint.js',
  '/api/generate-custom-theme': './api/generate-custom-theme.js',
  '/api/generate-knowledge-node-summary': './api/generate-knowledge-node-summary.js',
  '/api/get-voice-clip': './api/get-voice-clip.js',
}

function readRequestBody(request: IncomingMessage): Promise<unknown> {
  return new Promise((resolve) => {
    const chunks: Buffer[] = []
    request.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)))
    request.on('end', () => {
      const rawBody = Buffer.concat(chunks).toString('utf8')
      if (!rawBody) {
        resolve({})
        return
      }
      try {
        resolve(JSON.parse(rawBody))
      } catch {
        resolve({})
      }
    })
    request.on('error', () => resolve({}))
  })
}

function localApiRoutesPlugin(): Plugin {
  return {
    name: 'local-api-routes',
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const pathname = request.url ? new URL(request.url, 'http://localhost').pathname : ''
        const routePath = apiRoutes[pathname]
        if (!routePath) {
          next()
          return
        }

        try {
          const { default: handler } = await import(new URL(routePath, import.meta.url).href)
          const body = await readRequestBody(request)
          const vercelRequest = { ...request, body, method: request.method }
          const vercelResponse = {
            status(statusCode: number) {
              response.statusCode = statusCode
              return this
            },
            json(payload: unknown) {
              response.setHeader('Content-Type', 'application/json')
              response.end(JSON.stringify(payload))
            },
          }

          await handler(vercelRequest, vercelResponse)
        } catch {
          response.statusCode = 500
          response.setHeader('Content-Type', 'application/json')
          response.end(JSON.stringify({ error: 'Local API route failed' }))
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  Object.entries(env).forEach(([key, value]) => {
    if (!process.env[key]) process.env[key] = value
  })

  return {
    plugins: [react(), localApiRoutesPlugin()],
  }
})
