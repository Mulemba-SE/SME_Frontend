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
      '/auth/': { target: 'http://localhost:8081', changeOrigin: true },
      '/me': { target: 'http://localhost:8081', changeOrigin: true },
      '/api': { target: 'http://localhost:8081', changeOrigin: true },
      '/customer': { target: 'http://localhost:8081', changeOrigin: true },
    },
  },
})