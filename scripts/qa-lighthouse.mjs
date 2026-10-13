// Chạy Lighthouse (di động, mô phỏng 4G chậm, lần tải đầu) bằng Chrome cài sẵn và in điểm 4 nhóm + các mục chưa đạt.
// Lighthouse KHÔNG nằm trong package.json (quy tắc dự án: không thêm thư viện): cài vào một thư mục tạm riêng (xem đầu
// scripts/qa-axe.mjs). Cách chạy trên bản build giống GitHub Pages (docs/QA_REPORT.md mục 9):
//   npm run build:pages
//   (PowerShell) $env:BASE_PATH='/nhanh-tay-tinh-mat/'; npx vite preview --port 4190 --strictPort --host 127.0.0.1
//   (PowerShell) $env:CHROME_PATH='C:\Program Files (x86)\Google\Chrome\Application\chrome.exe'
//   node scripts/qa-lighthouse.mjs http://127.0.0.1:4190/nhanh-tay-tinh-mat/ <thư mục cài lighthouse> [kết-quả.json]
// Dùng Chrome của máy (CHROME_PATH): Chromium của Playwright báo lỗi `spawn UNKNOWN` với Lighthouse.
import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [url, toolsDir, outArg] = process.argv.slice(2);
if (!url || !toolsDir) {
  console.error(
    'Dùng: node scripts/qa-lighthouse.mjs <url> <thư mục cài lighthouse> [kết-quả.json]',
  );
  process.exit(2);
}
if (!process.env.CHROME_PATH) {
  console.error('Đặt biến môi trường CHROME_PATH = đường dẫn chrome.exe cài sẵn trên máy.');
  process.exit(2);
}
const cli = path.join(toolsDir, 'node_modules', 'lighthouse', 'cli', 'index.js');
const outFile = outArg ?? path.join(os.tmpdir(), 'ntm-lighthouse.json');

const run = spawnSync(
  process.execPath,
  [
    cli,
    url,
    '--output=json',
    `--output-path=${outFile}`,
    '--chrome-flags=--headless=new --no-sandbox',
    '--quiet',
  ],
  { stdio: 'inherit', env: process.env },
);
if (run.status !== 0) process.exit(run.status ?? 1);

const lhr = JSON.parse(fs.readFileSync(outFile, 'utf8'));
console.log(`Lighthouse ${lhr.lighthouseVersion} (${lhr.configSettings.formFactor})`);
for (const c of Object.values(lhr.categories))
  console.log(`${c.title}: ${Math.round((c.score ?? 0) * 100)}`);
console.log('Mục nhị phân chưa đạt:');
for (const a of Object.values(lhr.audits)) {
  if (a.scoreDisplayMode === 'binary' && a.score !== null && a.score < 1)
    console.log(` - ${a.id}: ${a.title}`);
}
console.log(`meta-viewport: ${lhr.audits['meta-viewport']?.score}`);
