/* global axe, document, location */
// Quét accessibility bằng axe-core trên các màn hình chính ở 2 khung hình (điện thoại 360×740, tablet ngang 1280×800).
// axe-core KHÔNG nằm trong package.json (quy tắc dự án: không thêm thư viện): cài vào một thư mục tạm riêng, ví dụ
//   mkdir %TEMP%\qa-tools && cd %TEMP%\qa-tools && npm init -y && npm install --ignore-scripts axe-core lighthouse
// Cách chạy (bản build giống GitHub Pages, xem docs/QA_REPORT.md mục 9):
//   npm run build:pages
//   (PowerShell) $env:BASE_PATH='/nhanh-tay-tinh-mat/'; npx vite preview --port 4190 --strictPort --host 127.0.0.1
//   node scripts/qa-axe.mjs http://127.0.0.1:4190/nhanh-tay-tinh-mat/ <thư mục cài axe-core> [kết-quả.json]
// Script tự tạo một hồ sơ bằng giao diện rồi nâng cấp dữ liệu (nhiều sao, mở khóa hết, chưa sao lưu → Home có chấm nhắc);
// chỉ dùng data-testid/role nên không phụ thuộc chữ tiếng Việt. Thoát với mã 1 nếu còn vi phạm.
import { chromium } from '@playwright/test';
import fs from 'node:fs';
import path from 'node:path';

const [baseUrl, toolsDir, outFile] = process.argv.slice(2);
if (!baseUrl || !toolsDir) {
  console.error('Dùng: node scripts/qa-axe.mjs <baseUrl> <thư mục cài axe-core> [kết-quả.json]');
  process.exit(2);
}
const axeDir = path.join(toolsDir, 'node_modules', 'axe-core');
const axeSrc = fs.readFileSync(path.join(axeDir, 'axe.min.js'), 'utf8');
const axeVersion = JSON.parse(fs.readFileSync(path.join(axeDir, 'package.json'), 'utf8')).version;

const VIEWPORTS = [
  { name: 'phone-360x740', width: 360, height: 740, isMobile: true },
  { name: 'tablet-1280x800', width: 1280, height: 800, isMobile: false },
];
const ALL_UNLOCKED = [
  'frame-rainbow',
  'outfit-pilot',
  'bg-candy',
  'sound-percussion',
  'outfit-hero',
  'bg-sea',
  'mascot-owl',
  'badge-gold',
];

const results = [];

async function scan(page, vp, label) {
  await page.addScriptTag({ content: axeSrc }).catch(() => undefined);
  const violations = await page.evaluate(async () => {
    const res = await axe.run(document, { resultTypes: ['violations'] });
    return res.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      help: v.help,
      nodes: v.nodes.length,
      targets: v.nodes.slice(0, 3).map((n) => n.target.join(' ')),
    }));
  });
  results.push({ viewport: vp.name, screen: label, violations });
  const ids = violations.map((v) => `${v.id} (${v.impact}) ${v.targets[0] ?? ''}`).join('; ');
  console.log(`${vp.name} · ${label}: ${violations.length} vi phạm${ids ? ' → ' + ids : ''}`);
}

/** Đọc phép nhân ở khóa phụ huynh rồi bấm phím. */
async function solveGate(page) {
  const text = (await page.getByTestId('gate-question').textContent()) ?? '';
  const m = /(\d+)\s*×\s*(\d+)/.exec(text);
  if (!m) throw new Error(`Không đọc được phép tính: ${text}`);
  for (const d of String(Number(m[1]) * Number(m[2])))
    await page.getByTestId(`gate-key-${d}`).click();
  await page.getByTestId('gate-ok').click();
  await page.getByTestId('parent-area').waitFor();
}

const browser = await chromium.launch();
try {
  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      screen: { width: vp.width, height: vp.height },
      isMobile: vp.isMobile,
      hasTouch: true,
      deviceScaleFactor: 2,
    });
    const page = await context.newPage();
    const pageErrors = [];
    page.on('pageerror', (e) => pageErrors.push(String(e)));
    await page.goto(baseUrl);

    // 1) màn tạo hồ sơ lần đầu → tạo hồ sơ bằng giao diện
    await page.locator('form input').first().waitFor();
    await scan(page, vp, 'Tạo hồ sơ');
    await page.locator('form input').first().fill('An');
    await page.locator('[role="radio"]').first().click(); // avatar đầu tiên
    await page.locator('[role="radio"]', { hasText: '2' }).first().click(); // lớp 2
    await page.locator('button[type="submit"]').click();
    await page.getByTestId('greeting').waitFor();

    // 2) nhiều sao, mở khóa hết, chưa sao lưu (có sao + chưa sao lưu → chấm nhắc ở Home)
    await page.evaluate((unlocked) => {
      const s = JSON.parse(localStorage.getItem('ntm.state'));
      const p = s.profiles[0];
      p.totalStars = 310;
      p.unlocked = unlocked;
      p.stickers = { 'stk-01': 2, 'stk-02': 1, 'stk-14': 1, 'stk-30': 1, 'stk-38': 1 };
      p.boxes = { pending: 1, openedTotal: 3, sinceLastRare: 1 };
      localStorage.setItem('ntm.state', JSON.stringify(s));
    }, ALL_UNLOCKED);
    await page.reload();
    await page.getByTestId('greeting').waitFor();
    await page.getByTestId('backup-dot').waitFor();
    await scan(page, vp, 'Home (có chấm nhắc sao lưu, Sóc Bo)');

    await page.evaluate(() => {
      const s = JSON.parse(localStorage.getItem('ntm.state'));
      s.profiles[0].mascotId = 'mascot-owl';
      s.profiles[0].soundSetId = 'sound-percussion';
      localStorage.setItem('ntm.state', JSON.stringify(s));
    });
    await page.reload();
    await page.getByTestId('greeting').waitFor();
    await scan(page, vp, 'Home (Cú Mèo + Nhạc Cụ Gõ)');

    // 3) Album, từng tab
    await page.getByTestId('open-album').click();
    for (const tab of await page.getByRole('tab').all()) {
      await tab.click();
      await scan(page, vp, `Album › ${((await tab.textContent()) ?? '').trim()}`);
    }
    await page.evaluate(() => (location.hash = '#/home'));
    await page.getByTestId('greeting').waitFor();

    // 4) màn Giới thiệu của 7 game
    for (const id of ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7']) {
      await page.evaluate((g) => (location.hash = `#/play/${g}/intro`), id);
      await page.getByTestId('start-game').waitFor();
      await scan(page, vp, `Giới thiệu ${id}`);
    }

    // 5) đang chơi G2 (DOM) + tạm dừng
    await page.evaluate(() => (location.hash = '#/play/G2/intro'));
    await page.getByTestId('start-game').click();
    await page.getByTestId('countdown').waitFor();
    await page.getByTestId('countdown').waitFor({ state: 'hidden', timeout: 8000 });
    await scan(page, vp, 'Đang chơi G2');
    await page.getByTestId('pause-button').click();
    await scan(page, vp, 'Tạm dừng');
    await page.evaluate(() => (location.hash = '#/home'));
    await page
      .getByTestId('greeting')
      .waitFor()
      .catch(() => undefined);

    // 6) khóa phụ huynh + 6 tab khu phụ huynh
    await page.evaluate(() => (location.hash = '#/parent-gate'));
    await page.getByTestId('gate-question').waitFor();
    await scan(page, vp, 'Khóa phụ huynh');
    await solveGate(page);
    for (const tab of ['progress', 'benchmark', 'settings', 'profiles', 'rewards', 'data']) {
      await page.getByTestId(`tab-${tab}`).click();
      await page.waitForTimeout(400); // biểu đồ (Chart.js) tải sau
      await scan(page, vp, `Khu phụ huynh › ${tab}`);
    }
    if (pageErrors.length) console.log(`  lỗi trang (${vp.name}): ${pageErrors.join(' | ')}`);
    await context.close();
  }
} finally {
  await browser.close();
}

const total = results.reduce((n, r) => n + r.violations.length, 0);
if (outFile) {
  fs.writeFileSync(
    outFile,
    JSON.stringify({ axeVersion, scans: results.length, total, results }, null, 2),
  );
}
console.log(
  `\naxe-core ${axeVersion}: ${results.length} lượt quét, ${total} vi phạm (cộng dồn các lượt)`,
);
process.exit(total > 0 ? 1 : 0);
