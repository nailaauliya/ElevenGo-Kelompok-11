import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'ElevenGo - Flight Booking',
        short_name: 'ElevenGo',
        description: 'Booking flights easily with ElevenGo',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          {
            src: 'web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
           {
            src: 'apple-touch-icon.png',
            sizes: '512x512',
            type: 'image/png'
          },
           {
            src: 'favicon-96x96.png',
            sizes: '512x512',
            type: 'image/png'
          }
          
        ]
      }
    }) as any 
  ],
  base:'/kelompok11'
});