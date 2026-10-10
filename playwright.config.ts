import { defineConfig, devices } from '@playwright/test';

// Chỉ Chromium (không hỗ trợ iOS/Safari). Cả 3 khung hình đều cảm ứng.
const chromium = devices['Desktop Chrome'];

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
  webServer: {
    command: 'npm run build && npm run preview -- --port 4173 --strictPort',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
