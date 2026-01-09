import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,  // Standard Vite default port to match documentation
    host: true,   // Allow external connections (important for Codespaces)
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false  // Needed for self-signed certificates in development
      }
    }
  }
})