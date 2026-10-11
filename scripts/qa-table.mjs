// Dựng bảng kết quả theo mã test case (TC-001…TC-035) từ báo cáo JSON của Playwright – dùng cho docs/QA_REPORT.md.
// Cách chạy:
//   npx cross-env PLAYWRIGHT_JSON_OUTPUT_NAME=kq.json playwright test --reporter=line,json
//   node scripts/qa-table.mjs kq.json
// Mã TC được lấy từ tên khối describe + tên test (vd “TC-004 – G1: …”). Test không gắn mã TC được thống kê riêng.
import { readFileSync } from 'node:fs';

const file = process.argv[2];
if (!file) {
  console.error('Cách dùng: node scripts/qa-table.mjs <kết-quả-playwright.json>');
  process.exit(1);
}
const report = JSON.parse(readFileSync(file, 'utf8'));
const PROJECTS = ['phone', 'tablet', 'tablet-portrait'];

/** tests[] = { path: [tiêu đề…], project, status } */
const tests = [];
function walk(suite, trail) {
  const here = suite.title && !suite.title.endsWith('.ts') ? [...trail, suite.title] : trail;
  for (const spec of suite.specs ?? []) {
    for (const t of spec.tests ?? []) {
      tests.push({
        path: [...here, spec.title],
        file: suite.file ?? spec.file,
        project: t.projectName,
        status: t.status, // expected | unexpected | flaky | skipped
      });
    }
  }
  for (const child of suite.suites ?? []) walk(child, here);
}
for (const s of report.suites ?? []) walk(s, []);

const byTc = new Map();
let untagged = 0;
for (const t of tests) {
  const codes = [...new Set(t.path.join(' ').match(/TC-\d{3}/g) ?? [])];
  if (codes.length === 0) untagged++;
  for (const c of codes) {
    if (!byTc.has(c)) byTc.set(c, []);
    byTc.get(c).push(t);
  }
}

function cell(list, project) {
  const mine = list.filter((t) => t.project === project);
  if (mine.length === 0) return '–';
  const bad = mine.filter((t) => t.status === 'unexpected').length;
  const flaky = mine.filter((t) => t.status === 'flaky').length;
  if (bad > 0) return `**Fail** (${bad}/${mine.length})`;
  if (flaky > 0) return `Pass* (${mine.length}, chập chờn ${flaky})`;
  return `Pass (${mine.length})`;
}

console.log('| TC | ' + PROJECTS.join(' | ') + ' |');
console.log('|---|' + PROJECTS.map(() => '---').join('|') + '|');
for (let n = 1; n <= 35; n++) {
  const id = `TC-${String(n).padStart(3, '0')}`;
  const list = byTc.get(id) ?? [];
  console.log(`| ${id} | ${PROJECTS.map((p) => cell(list, p)).join(' | ')} |`);
}

const all = tests.length;
const failed = tests.filter((t) => t.status === 'unexpected').length;
const flaky = tests.filter((t) => t.status === 'flaky').length;
const skipped = tests.filter((t) => t.status === 'skipped').length;
console.log(
  `\nTổng: ${all} test · Pass ${all - failed - flaky - skipped} · Fail ${failed} · chập chờn ${flaky} · bỏ qua ${skipped} · không gắn mã TC ${untagged}`,
);
