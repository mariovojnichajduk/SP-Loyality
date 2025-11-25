import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    basicSsl(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['pwa.png'],
      devOptions: {
        enabled: true, // Enable in dev mode for testing
        type: 'module'
      },
      manifest: {
        name: 'Goodwill Loyalty',
        short_name: 'Goodwill',
        description: 'Goodwill Pharma Loyalty - Scan receipts and earn loyalty points',
        theme_color: '#C8102E',
        background_color: '#f5f5f5',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        icons: [
          {
            src: 'pwa.png',
            sizes: '200x200',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'pwa.png',
            sizes: '200x200',
            type: 'image/png',
            purpose: 'maskable'
          }
        ],
        categories: ['shopping', 'lifestyle'],
        prefer_related_applications: false
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.(?:png|jpg|jpeg|svg|gif)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 days
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    host: '0.0.0.0', // Expose to network
    // Enable HTTPS with basic-ssl plugin; remove or configure 'https' as an object if needed
    // https: true,
  },
})
