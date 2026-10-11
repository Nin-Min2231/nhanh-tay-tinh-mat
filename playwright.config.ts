import { defineConfig, devices } from '@playwright/test';

// Chỉ Chromium (không hỗ trợ iOS/Safari). Cả 3 khung hình đều cảm ứng.
const chromium = devices['Desktop Chrome'];

// Đường dẫn con giống bản GitHub Pages thật (tests/e2e/pwa.spec.ts kiểm bản này chạy được dưới /<tên-repo>/).
const SUB_PATH = '/nhanh-tay-tinh-mat/';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: { baseURL: 'http://localhost:4173', trace: 'retain-on-failure' },
  projects: [
    {
      name: 'phone',
      use: { ...chromium, viewport: { width: 360, height: 740 }, hasTouch: true, isMobile: true },
    },
    {
      name: 'tablet',
      use: { ...chromium, viewport: { width: 1280, height: 800 }, hasTouch: true },
    },
    {
      name: 'tablet-portrait',
      use: { ...chromium, viewport: { width: 800, height: 1280 }, hasTouch: true },
    },
  ],
  webServer: [
    {
      command:
        'cross-env VITE_E2E=true vite build --outDir dist-e2e && vite preview --outDir dist-e2e --port 4173 --strictPort',
      url: 'http://localhost:4173',
      reuseExistingServer: true,
      timeout: 120_000,
    },
    {
      command: `cross-env VITE_E2E=true BASE_PATH=${SUB_PATH} vite build --outDir dist-e2e-base && cross-env BASE_PATH=${SUB_PATH} vite preview --outDir dist-e2e-base --port 4174 --strictPort`,
      url: `http://localhost:4174${SUB_PATH}`,
      reuseExistingServer: true,
      timeout: 120_000,
    },
  ],
});
