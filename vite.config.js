import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Antes los formularios solo se podían probar con `vercel dev`. Ahora el
    // servidor de producción es `server.js`, así que en local se levanta aparte
    // (`npm run dev:api`) y el dev server de Vite le pasa las llamadas a /api.
    // Si no está levantado, el fetch falla y la página enseña el teléfono del
    // club, que es exactamente lo que hace en producción sin RESEND_API_KEY.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
