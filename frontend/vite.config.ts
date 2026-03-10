import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  envDir: '../', // Cargar el .env desde la raíz del proyecto
  server: {
    port: 5173,
    host: '0.0.0.0', // Útil para Docker
  }
})
