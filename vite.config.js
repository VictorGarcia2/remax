import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss()],
  server: {
    proxy: {
      '/api': { // Redirigir las solicitudes que empiezan con /api
        target: 'http://localhost:5173/', // Cambia esto por la URL de tu backend
        changeOrigin: true,
        secure: false, // Si tu backend usa HTTPS con un certificado autofirmado
        rewrite: (path) => path.replace(/^\/api/, '') // Opcional: reescribe la ruta
      }
    }
  }
 
})
