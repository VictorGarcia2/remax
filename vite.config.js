import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import fs from 'node:fs'; // <-- Agrega "node:" antes de fs
import path from 'node:path'; // <-- Agrega "node:" antes de path

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    https: {
      key: fs.readFileSync(path.resolve("ssl/key.pem")),
      cert: fs.readFileSync(path.resolve("ssl/cert.pem")),
    },
    proxy: {
      "/api": {
        target: "https://us-central1-remax-api.cloudfunctions.net",
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
        // Agrega estos headers:
        headers: {
          "Access-Control-Allow-Origin": "https://localhost:5173",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      },
    },
  },
})