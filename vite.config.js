import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  base: '/',
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 700,
    rollupOptions: { output: { manualChunks: { react: ['react', 'react-dom', 'react-router-dom'], motion: ['motion/react'] } } },
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      includeAssets: ['favicon.ico', 'favicon.svg', 'favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png'],
      manifest: {
        name: 'Nikah Community Center',
        short_name: 'Nikah CC',
        description: 'Book weddings, receptions, milad and corporate events at Nikah Community Center, Chattogram.',
        id: 'nikah-community-center',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait-primary',
        lang: 'en',
        categories: ['lifestyle', 'business', 'events'],
        background_color: '#ffffff',
        theme_color: '#3f87f5',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'pwa-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
          { src: 'pwa-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
          { src: 'favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
        shortcuts: [
          { name: 'Book a date', short_name: 'Book', url: '/booking', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
          { name: 'My bookings', short_name: 'Bookings', url: '/my-bookings', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
          { name: 'Packages', short_name: 'Packages', url: '/packages', icons: [{ src: 'pwa-192.png', sizes: '192x192' }] },
        ],
      },
      workbox: {
        // JS, CSS, fonts, images and icons are precached, so the whole site opens offline.
        globPatterns: ['**/*.{js,css,html,ico,png,svg,webp,woff2,webmanifest}'],
        navigateFallback: 'index.html',
        cleanupOutdatedCaches: true,
        maximumFileSizeToCacheInBytes: 5 * 1024 * 1024,
        // The photo gallery (~12 MB) is cached as it is viewed instead of being downloaded up front.
        globIgnores: ['images/gallery/**'],
        runtimeCaching: [{
          urlPattern: ({ url }) => url.pathname.includes('/images/gallery/'),
          handler: 'CacheFirst',
          options: { cacheName: 'gallery-photos', expiration: { maxEntries: 260, maxAgeSeconds: 60 * 60 * 24 * 90 }, cacheableResponse: { statuses: [0, 200] } },
        }],
      },
    }),
  ],
})
