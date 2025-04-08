import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from "flowbite-react/plugin/vite";

export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: {
    proxy: {
      '/api': {
        target: 'https://localhost:3001', // ✅ Puerto de Express
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // Opcional pero recomendado
      }
    }
  }
})