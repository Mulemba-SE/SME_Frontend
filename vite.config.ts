import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 5173,
    },
    proxy: {
      '/auth/': {
  target: 'http://localhost:8081',
  changeOrigin: true,
  bypass: (req) => {
    if (req.method === 'GET') {
      return req.url // tell Vite to serve this locally instead of proxying
    }
  },
},
      '/me': { target: 'http://localhost:8081', changeOrigin: true },
      '/api': { target: 'http://localhost:8081', changeOrigin: true },
      '/customer': { target: 'http://localhost:8081', changeOrigin: true },
      '/invoices': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('[proxy] forwarding ->', req.method, req.url)
          })
          proxy.on('error', (err, req) => {
            console.log('[proxy] ERROR on', req.url, err.message)
          })
        },
      },
      '/payments': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('[proxy] forwarding ->', req.method, req.url)
          })
          proxy.on('error', (err, req) => {
            console.log('[proxy] ERROR on', req.url, err.message)
          })
        },
      },
      '/reports': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('[proxy] forwarding ->', req.method, req.url)
          })
          proxy.on('error', (err, req) => {
            console.log('[proxy] ERROR on', req.url, err.message)
          })
        },
      },
      '/admin': {
        target: 'http://localhost:8081',
        changeOrigin: true,
        configure: (proxy) => {
          proxy.on('proxyReq', (_proxyReq, req) => {
            console.log('[proxy] forwarding ->', req.method, req.url)
          })
          proxy.on('error', (err, req) => {
            console.log('[proxy] ERROR on', req.url, err.message)
          })
        },
      },
    },
  },
})