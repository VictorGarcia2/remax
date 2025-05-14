import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ command }) => {
  const isDev = command === 'serve'

  return {
    plugins: [react(), tailwindcss()],
    server: isDev
      ? {
          https: {
            key: fs.readFileSync(path.resolve(__dirname, 'ssl/key.pem')),
            cert: fs.readFileSync(path.resolve(__dirname, 'ssl/cert.pem'))
          },
          proxy: {
            '/api': {
              target: 'https://localhost:3000',
              secure: false,
              changeOrigin: true,
              rewrite: (path) => path.replace(/^\/api/, '')
            }
          }
        }
      : undefined
  }
})
