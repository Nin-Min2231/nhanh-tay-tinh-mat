// Sinh file mẫu nội dung để chủ dự án duyệt: `npm run samples` → docs/samples/G6.md, G7.md, G7.html.
// Bình thường (npm test) file này bị bỏ qua; chỉ chạy khi có biến môi trường GEN_SAMPLES=1.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { describe, it } from 'vitest';
import { mulberry32, seedFromString } from '../app/rng';
import { levelsConfig } from './levels';
import { resolveG6Params } from './g6-math/config';
import { optionLabel, questionText } from './g6-math/format';
import { illustrationFor, buildQuestion, type Illustration } from './g6-math/question';
import { TOPICS } from './g6-math/topics';
import { describeItem, glyphDefs, itemHtml } from './g7-patterns/art';
import type { Glyph, Item } from './g7-patterns/elements';
import { ALL_TYPES, TYPE_DEFS, buildPuzzle, type Puzzle, type TypeId } from './g7-patterns/puzzles';

const OUT = path.join(process.cwd(), 'docs', 'samples');
const SAMPLES = 20;

// ---------------------------------------------------------------- G6

const ILLUSTRATION_NAME: Record<Illustration['kind'], (i: Illustration) => string> = {
  frames: () => 'khung 10 ô',
  grid: (i) => (i.kind === 'grid' ? `lưới chấm ${i.rows}×${i.cols}` : ''),
  column: (i) =>
    i.kind === 'column' && i.check ? 'đặt tính dọc (kiểm tra bằng nhân)' : 'đặt tính dọc',
  blocks: () => 'khối chục / đơn vị',
};

function g6Table(code: string, count: number, level: number, missingRatio: number): string {
  const params = { ...resolveG6Params(level), missingRatio };
  const def = TOPICS[code]!;
  const rows: string[] = [
    '| # | Đề bài | Các quả táo | Đáp án đúng | Hình minh họa khi sai |',
    '|---|---|---|---|---|',
  ];
  for (let i = 0; i < count; i++) {
    const rng = mulberry32(seedFromString(`G6-${code}-${level}-${i}`));
    const core = def.gen(rng, params.easy);
    const q = buildQuestion(rng, code, core, { optionCount: params.options, missingRatio });
    const apples = q.options.map((o) => optionLabel(q, o)).join(' · ');
    const right = optionLabel(q, q.answer);
    rows.push(
      `| ${i + 1} | ${questionText(q)} | ${apples} | **${right}** | ${ILLUSTRATION_NAME[illustrationFor(core).kind](illustrationFor(core))} |`,
    );
  }
  return rows.join('\n');
}

function g6Markdown(): string {
  const out: string[] = [
    '# G6 – Mẫu câu hỏi Hái Táo Tính Nhẩm',
    '',
    '> File này được sinh tự động bằng `npm run samples` (seed cố định) để **chủ dự án duyệt nội dung có phù hợp bé lớp 2 không**.',
    '> Mỗi chủ đề có 20 câu (10 câu “nửa dễ” dùng ở cấp 1–3, 10 câu phạm vi đầy đủ dùng từ cấp 4) và 5 câu dạng **tìm số thiếu** (từ cấp 8).',
    '> Chủ đề mặc định của Lớp 2: M02, M05, M06, M07, M08.',
    '',
  ];
  for (const t of levelsConfig.mathTopics) {
    const def = TOPICS[t.code]!;
    out.push(
      `## ${t.code} · ${t.name} (Lớp ${t.grade})`,
      '',
      `Ví dụ trong tài liệu: ${t.example}`,
      '',
    );
    out.push('**Cấp 1–3 – phạm vi “nửa dễ” (3 quả táo)**', '', g6Table(t.code, 10, 2, 0), '');
    out.push('**Cấp 4 trở lên – phạm vi đầy đủ (4 quả táo)**', '', g6Table(t.code, 10, 5, 0), '');
    if (def.canMiss || def.forceMissing) {
      out.push(
        '**Dạng tìm số thiếu – từ cấp 8 (6 quả táo)**',
        '',
        g6Table(t.code, 5, 9, def.forceMissing ? 1 : 1),
        '',
      );
    } else if (t.code === 'M03') {
      out.push('_M03 luôn có đúng 3 quả táo `>`, `<`, `=`; không có dạng tìm số thiếu._', '');
    } else {
      out.push('_M14 viết dạng lời nên không có dạng tìm số thiếu._', '');
    }
  }
  return out.join('\n');
}

// ---------------------------------------------------------------- G7

const SHAPE_CHAR: Record<string, string> = {
  circle: '●',
  square: '■',
  triangle: '▲',
  star: '★',
  heart: '♥',
  arrow: '↑',
};
const COLOR_SHORT = ['đỏ', 'dương', 'lá', 'vàng', 'tím'];

/** Mô tả ngắn một phần tử: ▲đỏ, ●lá (to), ★vàng ×3, ↑tím ↻90. */
function short(it: Item | null): string {
  if (!it) return '**?**';
  if (it.kind === 'num') return String(it.n);
  const g = it as Glyph;
  let s = `${SHAPE_CHAR[g.shape]}${COLOR_SHORT[g.color]}`;
  if (g.size === 0) s += ' (nhỏ)';
  if (g.size === 2) s += ' (to)';
  if (g.count > 1) s += ` ×${g.count}`;
  if (g.shape === 'arrow' && g.rot !== 0) s += ` ↻${g.rot}`;
  return s;
}

function g7Text(p: Puzzle): string {
  const opts = p.options
    .map((o, i) => `${String.fromCharCode(65 + i)}) ${short(o)}${i === p.correctIndex ? ' ✔' : ''}`)
    .join(' · ');
  if (p.layout === 'odd') return `Chọn hình khác loại: ${opts}`;
  let body: string;
  if (p.layout === 'seq') body = p.cells.map(short).join(' , ');
  else {
    const n = p.layout === 'matrix2' ? 2 : 3;
    body = Array.from({ length: n }, (_, r) =>
      p.cells
        .slice(r * n, r * n + n)
        .map(short)
        .join(' | '),
    ).join('<br>');
  }
  return `${body}<br>${opts}`;
}

function samplePuzzles(type: TypeId): Puzzle[] {
  const options = TYPE_DEFS[type].level <= 3 ? 3 : 4;
  return Array.from({ length: SAMPLES }, (_, i) =>
    buildPuzzle(mulberry32(seedFromString(`G7-${type}-${i}`)), type, options),
  );
}

const TYPE_NAME: Record<TypeId, string> = {
  'ab-color': 'AB (chỉ đổi màu)',
  ab: 'AB (hình + màu)',
  aab: 'AAB',
  abb: 'ABB',
  abc: 'ABC',
  'size-alt': 'To – nhỏ xen kẽ',
  'num-step': 'Dãy số +1, +2, +5, +10',
  'arrow-rot': 'Mũi tên xoay 90°',
  'two-attr': 'Mẫu 2 thuộc tính (màu và hình đổi độc lập)',
  'num-down': 'Dãy số giảm dần',
  'num-skip': 'Đếm cách 3 / 4',
  'grow-dots': 'Tăng dần số chấm (1, 2, 3…)',
  matrix2: 'Ma trận 2×2 (A : B = C : ?)',
  'matrix3-row': 'Ma trận 3×3 (một quy luật theo hàng)',
  'odd-one': 'Tìm hình khác loại',
  'num-double': 'Dãy ×2 (1, 2, 4, 8…)',
  'num-alt': 'Dãy xen kẽ (+1, +2, +1…)',
  'matrix3-two': 'Ma trận 3×3 (hai quy luật)',
};

function g7Markdown(): string {
  const out: string[] = [
    '# G7 – Mẫu câu hỏi Tìm Quy Luật',
    '',
    '> File này được sinh tự động bằng `npm run samples` (seed cố định) để **chủ dự án duyệt nội dung có phù hợp bé lớp 2 không**.',
    '> Mỗi dạng câu có 20 câu mẫu. Ký hiệu: ● tròn · ■ vuông · ▲ tam giác · ★ sao · ♥ tim · ↑ mũi tên; màu: đỏ / dương / lá / vàng / tím; **?** là ô cần tìm; ✔ là đáp án đúng.',
    '> Xem **hình thật** (màu sắc, hoa văn) trong file `G7.html`: bấm đúp để mở bằng trình duyệt.',
    '',
  ];
  for (const type of ALL_TYPES) {
    const def = TYPE_DEFS[type];
    out.push(`## Cấp ${def.level} · ${TYPE_NAME[type]}`, '', '| # | Câu hỏi |', '|---|---|');
    samplePuzzles(type).forEach((p, i) => out.push(`| ${i + 1} | ${g7Text(p)} |`));
    out.push('');
  }
  return out.join('\n');
}

function g7Html(): string {
  const css = readFileSync(path.join(process.cwd(), 'src', 'ui', 'games2.css'), 'utf-8');
  const g7Css = css.slice(
    css.indexOf('/* ---------- G7 ---------- */'),
    css.indexOf('/* ---------- Hình động giới thiệu'),
  );
  const cell = (it: Item | null, cls = ''): string =>
    it
      ? `<div class="g7-cell ${cls}">${itemHtml(it)}</div>`
      : '<div class="g7-cell g7-hole" style="animation:none"><span>?</span></div>';
  const card = (p: Puzzle, n: number): string => {
    let stage = '';
    if (p.layout === 'seq')
      stage = `<div class="g7-seq">${p.cells.map((c) => cell(c)).join('')}</div>`;
    else if (p.layout === 'matrix2')
      stage = `<div class="g7-grid g7-m2" style="--cols:2">${p.cells.map((c) => cell(c)).join('')}</div>`;
    else if (p.layout === 'matrix3')
      stage = `<div class="g7-grid g7-m3">${p.cells.map((c) => cell(c)).join('')}</div>`;
    const opts = p.options
      .map(
        (o, i) =>
          `<div class="g7-opt${i === p.correctIndex ? ' is-correct' : ''}" aria-label="${describeItem(o)}">${itemHtml(o)}</div>`,
      )
      .join('');
    return `<article class="card"><h3>${n}${p.layout === 'odd' ? ' · chọn hình khác loại' : ''}</h3>${stage}<div class="g7-options" style="--g7-opt-cols:${p.options.length}">${opts}</div></article>`;
  };
  const sections = ALL_TYPES.map((type) => {
    const cards = samplePuzzles(type)
      .map((p, i) => card(p, i + 1))
      .join('');
    return `<section><h2>Cấp ${TYPE_DEFS[type].level} · ${TYPE_NAME[type]}</h2><div class="cards">${cards}</div></section>`;
  }).join('');
  return `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>G7 – Mẫu câu hỏi (có hình)</title>
<style>
:root{--ink:#263238;--border:3px solid #263238}
body{margin:0;padding:16px;font-family:system-ui,'Nunito',sans-serif;background:#f3efff;color:#263238}
h1{margin:0 0 4px} p.note{margin:0 0 16px;max-width:820px}
h2{margin:28px 0 10px;padding:6px 14px;border:var(--border);border-radius:999px;background:#fff;display:inline-block}
.cards{display:grid;grid-template-columns:repeat(auto-fill,minmax(360px,1fr));gap:14px}
.card{padding:10px 12px 14px;border:var(--border);border-radius:18px;background:linear-gradient(180deg,#e6f7ff,#f6e8ff);display:flex;flex-direction:column;gap:12px;align-items:center}
.card h3{margin:0;align-self:flex-start;font-size:16px;color:#5a3fb8}
.g7{--g7-cell:46px;--g7-opt:62px}
.g7-seq{gap:8px 4px}
.g7-m3,.g7-m2{gap:6px}
.g7-m2{gap:6px}
.g7-opt{cursor:default}
${g7Css.replace(/\.g7 \{[^}]*\}/, '')}
.g7-defs{position:absolute}
</style></head>
<body>
${glyphDefs()}
<div class="g7" style="display:block;height:auto;padding:0;background:none;overflow:visible">
<h1>G7 – Tìm Quy Luật: mẫu câu hỏi (có hình)</h1>
<p class="note">Sinh tự động bằng <code>npm run samples</code>. Mỗi dạng có 20 câu. Thẻ có <b>viền xanh lá</b> là đáp án đúng. Mỗi màu có hoa văn riêng (sọc chéo, chấm, lưới, sọc ngang, lượn sóng) để bé không phụ thuộc vào màu.</p>
${sections}
</div>
</body></html>`;
}

describe.runIf(process.env.GEN_SAMPLES === '1')('sinh file mẫu nội dung', () => {
  it('ghi docs/samples/G6.md, G7.md, G7.html', () => {
    mkdirSync(OUT, { recursive: true });
    writeFileSync(path.join(OUT, 'G6.md'), g6Markdown(), 'utf-8');
    writeFileSync(path.join(OUT, 'G7.md'), g7Markdown(), 'utf-8');
    writeFileSync(path.join(OUT, 'G7.html'), g7Html(), 'utf-8');
  });
});
