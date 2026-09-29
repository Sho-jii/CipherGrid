import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import { VitePWA } from 'vite-plugin-pwa';
import { fileURLToPath, URL } from 'node:url';

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'CipherGrid', short_name: 'CipherGrid',
        description: 'Offline-first classical cipher workspace and cryptanalysis laboratory',
        theme_color: '#f2f0e9', background_color: '#f2f0e9', display: 'standalone', start_url: '/',
        icons: [{ src: '/assets/ciphergrid-app-icon.png', sizes: '1024x1024', type: 'image/png', purpose: 'any maskable' }],
      },
      workbox: { globPatterns: ['**/*.{js,css,html,png,jpg,svg,gz}'], maximumFileSizeToCacheInBytes: 4 * 1024 * 1024 },
    }),
  ],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  test: { environment: 'jsdom', include: ['src/tests/**/*.test.ts'] },
});
