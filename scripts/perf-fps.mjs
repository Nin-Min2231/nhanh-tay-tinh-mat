/* global document, requestAnimationFrame */
// Đo nhịp khung hình (FPS) của game canvas G1, G3, G5 ở cấp 10 (nặng nhất) trên 3 khung hình, có/không giả lập CPU chậm.
// Cách chạy:  npm run perf      (script tự build bản THẬT (không có cờ test) vào dist-perf rồi mở máy chủ xem thử ở cổng 4175)
// Đo bản thật vì bản e2e ghi thuộc tính data-* mỗi khung hình (G3) nên chậm hơn bản deploy.
// Kết quả là số đo trên MÁY CHẠY SCRIPT – chỉ để so sánh/phát hiện hồi quy; FPS thật trên điện thoại/tablet phải xem bằng
// `?debug=1` trên máy thật. LƯU Ý: Chromium của Playwright KHÔNG có GPU nên vẽ canvas bằng phần mềm trên main thread
// (hơn 85% thời gian nằm ở “(program)”, không phải JS) → số fps ở CPU ×4 bị thấp hơn thực tế, nhất là G3 (nhiều hình
// xoay). Muốn sát thiết bị thật hơn: dùng Chrome cài sẵn có GPU bằng `--gpu` (tự tìm Chrome/Edge) hoặc `--chrome=<đường dẫn>`
// (hoặc biến môi trường CHROME_PATH). Cột “main thread bận” là thước đo bền hơn fps vì fps bị chặn ở 60.
import { spawn, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = 4175;
const BASE = `http://localhost:${PORT}`;
// Bộ lọc tùy chọn:  npm run perf -- --games=G5 --viewports=tablet-portrait --cpu=4 --no-build [--gpu | --chrome=<đường dẫn>]
const arg = (name) =>
  process.argv
    .find((a) => a.startsWith(`--${name}=`))
    ?.split('=')[1]
    ?.split(',');
const CHROME_CANDIDATES = [
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];
function chromePath() {
  const given = process.argv.find((a) => a.startsWith('--chrome='))?.slice('--chrome='.length);
  if (given) return given;
  if (process.env.CHROME_PATH) return process.env.CHROME_PATH;
  if (process.argv.includes('--gpu')) return CHROME_CANDIDATES.find((p) => existsSync(p));
  return undefined;
}
const ALL_VIEWPORTS = [
  { name: 'phone', width: 360, height: 740 },
  { name: 'tablet', width: 1280, height: 800 },
  { name: 'tablet-portrait', width: 800, height: 1280 },
];
const GAMES = arg('games') ?? ['G1', 'G3', 'G5'];
const VIEWPORTS = ALL_VIEWPORTS.filter(
  (v) => !arg('viewports') || arg('viewports').includes(v.name),
);
const THROTTLES = (arg('cpu') ?? ['1', '4']).map(Number);
const ROUNDS = 2;
const SAMPLE_MS = 6000; // lấy mẫu 6 giây đầu của lượt thật (60 giây), sau đó đóng trang

const viteBin = path.join(root, 'node_modules', 'vite', 'bin', 'vite.js');

function build() {
  console.log('Build bản thật vào dist-perf…');
  const r = spawnSync(process.execPath, [viteBin, 'build', '--outDir', 'dist-perf'], {
    cwd: root,
    stdio: 'inherit',
    env: { ...process.env, VITE_E2E: '' },
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

/** Thời gian main thread đã làm việc (giây) + mốc thời gian (giây) theo bộ đếm của trình duyệt. */
async function mainThread(cdp) {
  const { metrics } = await cdp.send('Performance.getMetrics');
  const get = (name) => metrics.find((m) => m.name === name)?.value ?? 0;
  return { task: get('TaskDuration'), at: get('Timestamp') };
}

function stats(deltas, busy) {
  const d = deltas.filter((x) => x > 0).sort((a, b) => a - b);
  const q = (p) => d[Math.min(d.length - 1, Math.floor(d.length * p))] ?? 0;
  const mean = d.reduce((s, x) => s + x, 0) / Math.max(1, d.length);
  return {
    frames: d.length,
    fps: 1000 / mean,
    busy: (100 * busy.task) / Math.max(1e-9, busy.wall),
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
  const busy = { task: 0, wall: 0 };
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
    await cdp.send('Performance.enable');
    await page.goto(`${BASE}/`);
    await page.getByTestId(`game-${game}`).click();
    await page.getByTestId('start-game').click();
    await page.getByTestId('countdown').waitFor({ state: 'hidden', timeout: 15000 });
    const before = await mainThread(cdp);
    all.push(...(await page.evaluate(sampleFrames, SAMPLE_MS)));
    const after = await mainThread(cdp);
    busy.task += after.task - before.task;
    busy.wall += after.at - before.at;
    await context.close();
  }
  return stats(all, busy);
}

if (!process.argv.includes('--no-build')) build();
const server = await startServer();
const exe = chromePath();
if ((process.argv.includes('--gpu') || arg('chrome')) && !exe) {
  console.warn('Không tìm thấy Chrome/Edge cài sẵn → dùng Chromium của Playwright (không GPU).');
}
console.log(
  exe
    ? `Trình duyệt: ${exe} (dùng GPU của máy)`
    : 'Trình duyệt: Chromium của Playwright (KHÔNG GPU – vẽ canvas bằng phần mềm, số fps ở CPU ×4 thấp hơn thực tế; thêm --gpu để dùng Chrome cài sẵn)',
);
const browser = await chromium.launch(exe ? { executablePath: exe, headless: true } : {});
const rows = [];
try {
  for (const throttle of THROTTLES) {
    for (const vp of VIEWPORTS) {
      for (const game of GAMES) {
        const s = await measure(browser, vp, game, throttle);
        rows.push({ cpu: `×${throttle}`, viewport: vp.name, game, ...s });
        console.log(
          `CPU ${`×${throttle}`.padEnd(3)} ${vp.name.padEnd(15)} ${game}: ${s.fps.toFixed(1)} fps · p95 ${s.p95.toFixed(1)} ms · p99 ${s.p99.toFixed(1)} ms · max ${s.max.toFixed(0)} ms · >20ms ${s.over20.toFixed(1)}% · >33ms ${s.over33.toFixed(1)}% · main thread bận ${s.busy.toFixed(0)}% (${s.frames} khung)`,
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
      rows.map((r) => ({ ...r, fps: +r.fps.toFixed(1), busy: +r.busy.toFixed(0) })),
      null,
      1,
    ),
);
