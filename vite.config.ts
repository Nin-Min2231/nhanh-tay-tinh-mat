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
      // 'prompt': SW mới chỉ báo cờ updateAvailable, bé/phụ huynh bấm “Cập nhật” mới tải lại (src/app/pwa.ts).
      registerType: 'prompt',
      injectRegister: false, // tự đăng ký trong src/app/pwa.ts (tránh đăng ký hai lần)
      includeManifestIcons: false, // icon đã nằm trong globPatterns bên dưới
      manifest: {
        id: base,
        name: 'Nhanh Tay Tinh Mắt',
        short_name: 'Nhanh Tay',
        description: 'Mini-game rèn tập trung, phản xạ, tính nhẩm và tư duy logic cho bé lớp 2.',
        lang: 'vi',
        dir: 'ltr',
        categories: ['education', 'games', 'kids'],
        display: 'standalone',
        orientation: 'any',
        start_url: base,
        scope: base,
        background_color: '#FFF4D6',
        theme_color: '#29B6F6',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: 'icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        // Precache MỌI tài nguyên của bản build (kể cả font Nunito, icon, svg) để mở offline vẫn đủ.
        // Chỉ lấy woff2 (Chrome/Samsung Internet đều hỗ trợ); bỏ woff cho nhẹ.
        globPatterns: ['**/*.{js,css,html,woff2,svg,png,webmanifest}'],
        cleanupOutdatedCaches: true,
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
