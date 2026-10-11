/* global document, requestAnimationFrame */
// Đo nhịp khung hình (FPS) của game canvas G1, G3, G5 ở cấp 10 (nặng nhất) trên 3 khung hình, có/không giả lập CPU chậm.
// Cách chạy:  npm run perf      (script tự build bản e2e vào dist-perf rồi mở máy chủ xem thử ở cổng 4175)
// Kết quả là số đo trên MÁY CHẠY SCRIPT (Chromium không có GPU) – chỉ để so sánh/phát hiện hồi quy; FPS thật trên
// điện thoại/tablet phải xem bằng `?debug=1` trên máy thật.
import { spawn, spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4175;
const BASE = `http://localhost:${PORT}`;
const GAMES = ['G1', 'G3', 'G5'];
const VIEWPORTS = [
  { name: 'phone', width: 360, height: 740 },
  { name: 'tablet', width: 1280, height: 800 },
  { name: 'tablet-portrait', width: 800, height: 1280 },
];
const THROTTLES = [1, 4];
const ROUNDS = 3;

const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

function build() {
  console.log('Build bản e2e (có cờ ?e2e=1) vào dist-perf…');
  const r = spawnSync(process.execPath, [viteBin, 'build', '--outDir', 'dist-perf'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, VITE_E2E: 'true' },
  });
  if (r.status !== 0) throw new Error('Build thất bại');
}

async function startServer() {
  const child = spawn(
    process.execPath,
    [viteBin, 'preview', '--outDir', 'dist-perf', '--port', String(PORT), '--strictPort'],
    { cwd: root, stdio: 'ignore' },
  );
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(BASE)).ok) return child;
    } catch {
      /* chưa sẵn sàng */
    }
    await new Promise((r) => setTimeout(r, 250));
  }
  child.kill();
  throw new Error('Không khởi động được máy chủ xem thử');
}

const state = (game) =>
  JSON.stringify({
    schemaVersion: 2,
    deviceId: 'perf',
    activeProfileId: 'p1',
    // hồ sơ tối thiểu: lớp kiểm tra dữ liệu (validate.ts) tự điền các trường còn thiếu
    profiles: [{ id: 'p1', name: 'An', games: { [game]: { mode: 'fixed', level: 10 } } }],
    settings: { sound: false, music: false, vibration: false, allowKidDifficultyChoice: true },
    lastBackupAt: null,
    installedVersion: '0.0.0',
  });

/** Chạy trong trang: ghi khoảng cách giữa các khung hình cho tới khi vùng chơi biến mất. */
function sampleFrames(maxMs) {
  return new Promise((resolve) => {
    const deltas = [];
    let last = performance.now();
    const t0 = last;
    const tick = (now) => {
      deltas.push(now - last);
      last = now;
      const alive = document.querySelector('[data-testid="game-host"]');
      if (!alive || now - t0 > maxMs) resolve(deltas);
      else requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  });
}

function stats(deltas) {
  const d = deltas.filter((x) => x > 0).sort((a, b) => a - b);
  const q = (p) => d[Math.min(d.length - 1, Math.floor(d.length * p))] ?? 0;
  const mean = d.reduce((s, x) => s + x, 0) / Math.max(1, d.length);
  return {
    frames: d.length,
    fps: 1000 / mean,
    p50: q(0.5),
    p95: q(0.95),
    p99: q(0.99),
    max: d[d.length - 1] ?? 0,
    over20: (100 * d.filter((x) => x > 20).length) / Math.max(1, d.length),
    over33: (100 * d.filter((x) => x > 33.4).length) / Math.max(1, d.length),
  };
}

async function measure(browser, vp, game, throttle) {
  const all = [];
  for (let i = 0; i < ROUNDS; i++) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      screen: { width: vp.width, height: vp.height },
      hasTouch: true,
      isMobile: vp.name === 'phone',
    });
    await context.addInitScript((json) => {
      if (!localStorage.getItem('ntm.state')) localStorage.setItem('ntm.state', json);
    }, state(game));
    const page = await context.newPage();
    const cdp = await context.newCDPSession(page);
    await cdp.send('Emulation.setCPUThrottlingRate', { rate: throttle });
    await page.goto(`${BASE}/?e2e=1&seed=${12345 + i}`);
    await page.getByTestId(`game-${game}`).click();
    await page.getByTestId('start-game').click();
    await page.getByTestId('countdown').waitFor({ state: 'hidden', timeout: 15000 });
    all.push(...(await page.evaluate(sampleFrames, 9000)));
    await context.close();
  }
  return stats(all);
}

build();
const server = await startServer();
const browser = await chromium.launch();
const rows = [];
try {
  for (const throttle of THROTTLES) {
    for (const vp of VIEWPORTS) {
      for (const game of GAMES) {
        const s = await measure(browser, vp, game, throttle);
        rows.push({ cpu: `×${throttle}`, viewport: vp.name, game, ...s });
        console.log(
          `CPU ${`×${throttle}`.padEnd(3)} ${vp.name.padEnd(15)} ${game}: ${s.fps.toFixed(1)} fps · p95 ${s.p95.toFixed(1)} ms · p99 ${s.p99.toFixed(1)} ms · max ${s.max.toFixed(0)} ms · >20ms ${s.over20.toFixed(1)}% · >33ms ${s.over33.toFixed(1)}% (${s.frames} khung)`,
        );
      }
    }
  }
} finally {
  await browser.close();
  server.kill();
}
console.log(
  '\nJSON:\n' +
    JSON.stringify(
      rows.map((r) => ({ ...r, fps: +r.fps.toFixed(1) })),
      null,
      1,
    ),
);
