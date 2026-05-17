import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
import fs from 'fs';
import path from 'path';

export default defineConfig(({ command }) => {
  const isDev = command === 'serve';

  return {
    base: '/',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
        manifest: {
          name: 'REMAX CIN',
          short_name: 'REMAX CIN',
          theme_color: '#ffffff',
          icons: [
            {
              src: 'logo.webp',
              sizes: '192x192',
              type: 'image/webp'
            }
          ]
        }
      })
    ],
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'react-vendor': ['react', 'react-dom', 'react-router-dom'],
            'ui-vendor': ['@fortawesome/react-fontawesome', 'lucide-react'],
            'utils-vendor': ['axios']
          }
        }
      },
      chunkSizeWarningLimit: 1000,
      cssCodeSplit: true,
      sourcemap: false,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    },
    server: isDev
      ? {
          https: {
            key: fs.readFileSync(path.resolve(__dirname, '../backend/ssl/key.pem')),
            cert: fs.readFileSync(path.resolve(__dirname, '../backend/ssl/cert.pem'))
          },
          proxy: {
            '/api': {
              target: 'http://localhost:3001',
              secure: false,
              changeOrigin: true
            }
          }
        }
      : undefined
  };
});
