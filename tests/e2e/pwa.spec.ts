// TASK-08: PWA (manifest, icon, service worker, offline), chạy được dưới đường dẫn con của GitHub Pages,
// luồng cập nhật. Test case: TC-001/002 (phần tự kiểm), TC-012 (tự động), TC-029 (phần tự kiểm).
import { readFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import path from 'node:path';
import { expect, test, type Page } from '@playwright/test';
import type { GameId } from '../../src/app/types';
import { vi } from '../../src/i18n/vi';
import { lastRound, makeProfile, playG2, seedProfiles, startGame } from './helpers';

const SUB_BASE = 'http://localhost:4174/nhanh-tay-tinh-mat/';
/** Mở app ở chế độ test, có đăng ký service worker (bản e2e chỉ đăng ký khi có `sw=1`). */
const APP = './?e2e=1&seed=12345&sw=1';
const ALL_GAMES: GameId[] = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'];

const targets = [
  { name: 'gốc /', baseURL: null, scope: '/', games: ALL_GAMES },
  {
    name: 'đường dẫn con /nhanh-tay-tinh-mat/',
    baseURL: SUB_BASE,
    scope: '/nhanh-tay-tinh-mat/',
    games: ['G2'] as GameId[],
  },
];

const MIME: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
};

/**
 * Máy chủ tĩnh tối giản phục vụ bản build e2e (`dist-e2e`) để giả lập “deploy lần 2”:
 * `setNextDeploy(code)` nối thêm đoạn mã vào sw.js → trình duyệt thấy service worker khác byte → có bản mới.
 */
async function startStaticServer() {
  const root = path.resolve('dist-e2e');
  let swExtra = '';
  const server = createServer((req, res) => {
    const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://x').pathname);
    const file = path.join(root, pathname === '/' ? 'index.html' : pathname);
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    readFile(file).then(
      (buf) => {
        const body = pathname === '/sw.js' ? Buffer.concat([buf, Buffer.from(swExtra)]) : buf;
        res.writeHead(200, {
          'content-type': MIME[path.extname(file)] ?? 'application/octet-stream',
          'cache-control': 'no-cache',
        });
        res.end(body);
      },
      () => res.writeHead(404).end('not found'),
    );
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  const addr = server.address();
  if (!addr || typeof addr === 'string') throw new Error('Không mở được máy chủ thử');
  return {
    url: `http://127.0.0.1:${addr.port}/`,
    setNextDeploy: (swCode: string) => {
      swExtra = `\n${swCode}\n`;
    },
    close: () => new Promise<void>((resolve) => server.close(() => resolve())),
  };
}

/** Đợi service worker kích hoạt (precache xong, vì kích hoạt chỉ xảy ra sau khi cài + precache xong). */
async function swReady(page: Page): Promise<string> {
  return page.evaluate(async () => (await navigator.serviceWorker.ready).scope);
}

function pngSize(buf: Buffer): { w: number; h: number } {
  expect(buf.subarray(1, 4).toString('latin1')).toBe('PNG');
  return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
}

for (const t of targets) {
  test.describe(`PWA – ${t.name}`, () => {
    if (t.baseURL) test.use({ baseURL: t.baseURL });

    test('manifest đầy đủ, icon 192/512/maskable hợp lệ (TC-001, TC-002)', async ({ page }) => {
      await page.goto(APP);
      const href = await page.locator('link[rel="manifest"]').getAttribute('href');
      expect(href).toBeTruthy();
      const manifestUrl = new URL(href!, page.url()).href;
      const res = await page.request.get(manifestUrl);
      expect(res.ok()).toBe(true);
      const m = await res.json();
      expect(m.name).toBe(vi.app.title);
      expect(m.short_name).toBe('Nhanh Tay');
      expect(m.display).toBe('standalone');
      expect(m.orientation).toBe('any');
      expect(m.lang).toBe('vi');
      expect(m.background_color).toBeTruthy();
      expect(m.theme_color).toBeTruthy();
      // start_url / scope / id nằm đúng đường dẫn con (nếu có)
      expect(new URL(m.start_url, manifestUrl).pathname).toBe(t.scope);
      expect(new URL(m.scope, manifestUrl).pathname).toBe(t.scope);

      const icons: { src: string; sizes: string; type: string; purpose?: string }[] = m.icons;
      const find = (size: string, purpose: string) =>
        icons.find((i) => i.sizes === size && (i.purpose ?? 'any') === purpose);
      for (const [size, purpose] of [
        ['192x192', 'any'],
        ['512x512', 'any'],
        ['512x512', 'maskable'],
      ] as const) {
        const icon = find(size, purpose);
        expect(icon, `thiếu icon ${size} ${purpose}`).toBeTruthy();
        const r = await page.request.get(new URL(icon!.src, manifestUrl).href);
        expect(r.status()).toBe(200);
        expect(r.headers()['content-type']).toContain('image/png');
        const { w, h } = pngSize(await r.body());
        expect(`${w}x${h}`).toBe(size);
      }
      // favicon
      const fav = await page.locator('link[rel="icon"][type="image/svg+xml"]').getAttribute('href');
      expect((await page.request.get(new URL(fav!, page.url()).href)).status()).toBe(200);
      // không cho công cụ tìm kiếm lập chỉ mục
      await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
    });

    test('service worker đăng ký đúng phạm vi, precache cả font + icon + gói chính', async ({
      page,
    }) => {
      await page.goto(APP);
      const scope = new URL(await swReady(page));
      expect(scope.pathname).toBe(t.scope);
      const cached = await page.evaluate(async () => {
        const names = await caches.keys();
        const pre = names.find((n) => n.includes('precache'));
        if (!pre) return [];
        return (await (await caches.open(pre)).keys()).map((r) => new URL(r.url).pathname);
      });
      const has = (re: RegExp) => cached.some((p) => re.test(p));
      expect(has(/index\.html$|\/$/)).toBe(true);
      expect(has(/assets\/index-.*\.js$/)).toBe(true);
      expect(has(/assets\/index-.*\.css$/)).toBe(true);
      expect(has(/nunito-latin-800-normal-.*\.woff2$/)).toBe(true); // font Nunito (latin)
      expect(has(/nunito-vietnamese-800-normal-.*\.woff2$/)).toBe(true); // font Nunito (tiếng Việt)
      expect(has(/icons\/icon-192\.png$/)).toBe(true);
      expect(has(/icons\/maskable-512\.png$/)).toBe(true);
      expect(cached.every((p) => p.startsWith(t.scope))).toBe(true);
    });

    test(`offline sau lần tải đầu: ${t.games.length} game chạy được, 1 lượt lưu tiến độ, không request mạng (TC-012)`, async ({
      page,
      context,
    }) => {
      test.setTimeout(150_000);
      const p = makeProfile('An');
      await seedProfiles(page, [p]);

      // 1) Lần tải đầu (có mạng) → service worker cài + precache xong
      await page.goto(APP);
      await swReady(page);

      // 2) Mất mạng hoàn toàn
      await context.setOffline(true);
      const failed: string[] = [];
      const external: string[] = [];
      const errors: string[] = [];
      const origin = new URL(page.url()).origin;
      page.on('requestfailed', (r) => failed.push(r.url()));
      page.on('request', (r) => {
        if (!r.url().startsWith(origin) && !/^(data|blob):/.test(r.url())) external.push(r.url());
      });
      page.on('pageerror', (e) => errors.push(e.message));
      page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));

      for (const id of t.games) {
        await page.goto(APP); // mở lại app từ đầu khi đang offline
        await expect(page.getByTestId('greeting')).toBeVisible();
        await startGame(page, id);
        await expect(page.getByTestId('game-host')).toBeVisible();
        if (id === 'G2') {
          await playG2(page);
          await expect(page.getByTestId('result')).toBeVisible();
          // tiến độ vẫn lưu khi offline
          expect((await lastRound(page, p.id)).gameId).toBe('G2');
        }
      }

      // 3) Mọi tài nguyên (kể cả font Nunito) đến từ cache của service worker
      await page.goto(APP);
      await expect(page.getByTestId('greeting')).toBeVisible();
      const info = await page.evaluate(async () => {
        await document.fonts.ready;
        const nav = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          controlled: !!navigator.serviceWorker.controller,
          nunito: [...document.fonts].filter(
            (f) => f.family.includes('Nunito') && f.status === 'loaded',
          ).length,
          fcp: performance.getEntriesByName('first-contentful-paint')[0]?.startTime ?? -1,
          loaded: nav.loadEventEnd,
        };
      });
      expect(info.controlled).toBe(true);
      expect(info.nunito).toBeGreaterThan(0);
      test.info().annotations.push({
        type: 'khởi động offline (ms)',
        description: `FCP ${Math.round(info.fcp)} · load ${Math.round(info.loaded)}`,
      });
      expect(info.fcp).toBeGreaterThan(0);
      expect(info.fcp).toBeLessThan(2000); // SPEC mục 13: < 2 giây khi mở offline
      expect(failed).toEqual([]);
      expect(external).toEqual([]);
      expect(errors).toEqual([]);
    });
  });
}

test.describe('Cập nhật (TC-029, phần tự kiểm)', () => {
  test('nút “Có bản mới – Cập nhật” chỉ hiện ở Home, không bao giờ giữa lượt chơi', async ({
    page,
  }) => {
    const p = makeProfile('An');
    await seedProfiles(page, [p]);
    await page.goto('./?e2e=1&seed=12345&sw=1&update=1');
    const btn = page.getByTestId('update-button');
    await expect(btn).toBeVisible();
    await expect(btn).toHaveText(vi.home.updateAvailable);
    expect((await btn.boundingBox())!.height).toBeGreaterThanOrEqual(48);

    // Bấm nút khi chưa có bản chờ: không tải lại trang, không lỗi
    await page.evaluate(() => ((window as unknown as { __marker: number }).__marker = 7));
    await btn.click();
    await page.waitForTimeout(300);
    expect(await page.evaluate(() => (window as unknown as { __marker?: number }).__marker)).toBe(
      7,
    );

    // Đang chơi / màn Kết quả: không có nút
    await startGame(page, 'G2');
    await expect(page.getByTestId('update-button')).toHaveCount(0);
    await playG2(page);
    await expect(page.getByTestId('result')).toBeVisible();
    await expect(page.getByTestId('update-button')).toHaveCount(0);
    // quay về Home: nút lại hiện
    await page.getByTestId('to-home').click();
    await expect(page.getByTestId('update-button')).toBeVisible();
  });

  test('bản mới được phát hiện → chỉ báo, bấm mới cập nhật; dữ liệu giữ nguyên', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    const srv = await startStaticServer();
    try {
      const p = makeProfile('An', { totalStars: 7 });
      await seedProfiles(page, [p]);
      const swVersion = () =>
        page.evaluate(async () => {
          const r = await fetch('__sw-version');
          return r.ok ? await r.text() : `lỗi ${r.status}`;
        });

      // Lần mở 1 (bản cũ): cài service worker; lần mở 2: trang đã được service worker kiểm soát
      await page.goto(`${srv.url}${APP.slice(2)}`);
      await swReady(page);
      await page.reload();
      await expect(page.getByTestId('greeting')).toBeVisible();
      await expect(page.getByTestId('update-button')).toHaveCount(0);
      expect(await swVersion()).toBe('lỗi 404'); // bản cũ chưa có đường dẫn này

      // “Deploy bản mới”: sw.js khác byte, và bản mới trả lời đường dẫn __sw-version
      srv.setNextDeploy(
        `self.addEventListener('fetch', (e) => { if (e.request.url.endsWith('/__sw-version')) e.respondWith(new Response('bản mới')); });`,
      );
      await page.evaluate(async () => (await navigator.serviceWorker.getRegistration())?.update());

      // Chỉ hiện nút, KHÔNG tự tải lại; bản cũ vẫn đang chạy
      await expect(page.getByTestId('update-button')).toBeVisible({ timeout: 15_000 });
      await expect(page.getByTestId('total-stars')).toContainText('7');
      expect(await swVersion()).toBe('lỗi 404');

      // Đang chơi thì không có nút nào để lỡ tay bấm
      await startGame(page, 'G2');
      await expect(page.getByTestId('update-button')).toHaveCount(0);
      await page.goBack(); // Quay lại khi đang chơi = tạm dừng
      await expect(page.getByTestId('pause-overlay')).toBeVisible();
      await page.getByRole('button', { name: vi.play.exit }).click();
      await expect(page.getByTestId('update-button')).toBeVisible();

      // Bấm “Cập nhật” → trang tải lại với service worker mới, dữ liệu còn nguyên
      await Promise.all([page.waitForEvent('load'), page.getByTestId('update-button').click()]);
      await expect(page.getByTestId('greeting')).toBeVisible();
      await expect(page.getByTestId('total-stars')).toContainText('7');
      await expect(page.getByTestId('update-button')).toHaveCount(0);
      expect(await swVersion()).toBe('bản mới');
    } finally {
      await srv.close();
    }
  });
});
