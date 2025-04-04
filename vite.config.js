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
      key: fs.readFileSync(path.resolve("ssl/localhost-key.pem")),
      cert: fs.readFileSync(path.resolve("ssl/localhost.pem")),
    },
  },
})