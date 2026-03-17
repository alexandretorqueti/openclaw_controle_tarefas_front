import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true, // Permite acesso pela rede
    open: true,
    hmr: {
      overlay: false
    },
    proxy: {
      '/api': {
        target: 'http://localhost:4001',
        changeOrigin: true,
        secure: false
      },
      '/uploads': {
        target: 'http://localhost:4001',
        changeOrigin: true,
        secure: false
      }
    }
  }
})