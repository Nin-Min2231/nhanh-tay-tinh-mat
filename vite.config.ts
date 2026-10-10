/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';

// base đọc từ biến môi trường BASE_PATH (workflow deploy đặt thành /<tên-repo>/)
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  plugins: [
    preact(),
    VitePWA({
      registerType: 'prompt',
      // TODO (TASK-08): manifest đầy đủ, icon 192/512/maskable, precache hoàn chỉnh
      manifest: {
        name: 'Nhanh Tay Tinh Mắt',
        short_name: 'Nhanh Tay',
        display: 'standalone',
        orientation: 'any',
        start_url: base,
        scope: base,
        background_color: '#FFF8EC',
        theme_color: '#4FC3F7',
        icons: [],
      },
    }),
  ],
  server: { port: 5173, strictPort: true },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    environment: 'node',
  },
});
