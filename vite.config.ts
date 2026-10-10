/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import preact from '@preact/preset-vite';
import { VitePWA } from 'vite-plugin-pwa';
import pkg from './package.json' with { type: 'json' };

// base đọc từ biến môi trường BASE_PATH (workflow deploy đặt thành /<tên-repo>/)
const base = process.env.BASE_PATH ?? '/';

export default defineConfig({
  base,
  define: { __APP_VERSION__: JSON.stringify(pkg.version) },
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
        background_color: '#FFF4D6',
        theme_color: '#29B6F6',
        icons: [],
      },
    }),
  ],
  server: { port: 5173, strictPort: true },
  test: {
    include: ['src/**/*.test.{ts,tsx}'],
    testTimeout: 30_000, // test sinh 1.000 câu mỗi dạng (G6/G7)
    environment: 'node',
  },
});
