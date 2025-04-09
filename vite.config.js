import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import flowbiteReact from "flowbite-react/plugin/vite";
import fs from 'fs'
import path from 'path'

export default defineConfig({
  plugins: [react(), tailwindcss(), flowbiteReact()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
      cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem'))
    },
    proxy: {
      '/api': {
        target: 'https://localhost:3000', // ✅ Puerto de Express
        secure: false,
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '') // Opcional pero recomendado
      }
    }
  }
})