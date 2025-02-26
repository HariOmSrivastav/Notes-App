import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // Allows external access
  },
  preview: {
    allowedHosts: ['notes-app-frontend-a3mv.onrender.com'], // Allow your Render host
  }
})