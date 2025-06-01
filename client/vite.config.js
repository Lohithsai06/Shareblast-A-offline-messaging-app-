import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // Allow connections from any IP address
    port: 5173,      // Fixed port for predictability
    strictPort: true // Fail if port is already in use
  }
})
