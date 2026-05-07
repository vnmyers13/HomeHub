import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/*.png'],
      manifest: {
        name: 'HomeHub',
        short_name: 'HomeHub',
        theme_color: '#4F46E5',
        background_color: '#ffffff',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-180.png',
            sizes: '180x180',
            type: 'image/png',
            purpose: 'apple-touch-icon',
          },
        ],
      },
      workbox: {
        navigateFallback: '/index.html',
        navigateFallbackDenylist: [/^\/api/, /^\/photos/],
        runtimeCaching: [
          {
            urlPattern: /^\/api\/auth\/me$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'auth-cache',
            },
          },
          {
            urlPattern: /^\/api\/users$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'users-cache',
            },
          },
          {
            urlPattern: /^\/api\/calendar\/events$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'events-cache',
            },
          },
          {
            urlPattern: /^\/api\/calendar\/sources$/,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'sources-cache',
            },
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
      '/photos': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
});
