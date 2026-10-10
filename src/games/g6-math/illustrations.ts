// G6 – hình minh họa khi sai (docs/02_GAMES.md): khung 10 ô chấm tròn · lưới chấm hàng × cột · đặt tính dọc có tô chữ số nhớ.
// Sinh chuỗi HTML/SVG; số liệu lấy từ question.ts (illustrationFor, columnModel) nên có test ở đó.
import { vi } from '../../i18n/vi';
import { cmpSymbol, columnModel, type Illustration } from './question';

const ROW_HUES: readonly (readonly [string, string, string])[] = [
  ['#ffb199', '#ff5a3c', '#b8280f'],
  ['#a9dcff', '#2b9bff', '#0b5ca8'],
  ['#c5f29a', '#52c235', '#2a7a16'],
  ['#ffe28a', '#ffb300', '#a86e00'],
];

/** Gradient chấm tròn dùng chung cho một hình minh họa (id có tiền tố g6i để không trùng). */
function dotDefs(): string {
  const grads = ROW_HUES.map(
    ([l, m, d], i) =>
      `<radialGradient id="g6i${i}" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="${l}"/><stop offset="0.55" stop-color="${m}"/><stop offset="1" stop-color="${d}"/></radialGradient>`,
  ).join('');
  return `<defs>${grads}<radialGradient id="g6i-x" cx="35%" cy="30%" r="75%"><stop offset="0" stop-color="#f1f3f4"/><stop offset="1" stop-color="#b0bec5"/></radialGradient></defs>`;
}

function dot(cx: number, cy: number, r: number, fill: string): string {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#${fill})" stroke="rgba(38,50,56,0.5)" stroke-width="1.6"/><circle cx="${cx - r * 0.35}" cy="${cy - r * 0.38}" r="${r * 0.28}" fill="#fff" fill-opacity="0.65"/>`;
}

/** Khung 10 ô (2 hàng × 5): cộng = a chấm màu 1 + b chấm màu 2; trừ = còn lại màu 1, bị bớt đi màu xám gạch chéo. */
function frames(op: 'add' | 'sub', a: number, b: number): string {
  const cell = 30;
  const total = op === 'add' ? a + b : a;
  const nFrames = Math.max(1, Math.ceil(total / 10));
  const fw = cell * 5 + 12;
  const fh = cell * 2 + 12;
  const gap = 14;
  const w = nFrames * fw + (nFrames - 1) * gap;
  let out = `<svg class="g6-ill-svg" viewBox="0 0 ${w} ${fh}" role="img" aria-label="${vi.g6.illusLabel}">${dotDefs()}`;
  const kept = op === 'add' ? a : a - b;
  for (let f = 0; f < nFrames; f++) {
    const x0 = f * (fw + gap);
    out += `<rect x="${x0 + 1.5}" y="1.5" width="${fw - 3}" height="${fh - 3}" rx="10" fill="#fff" stroke="#263238" stroke-width="3"/>`;
    for (let i = 0; i < 10; i++) {
      const idx = f * 10 + i;
      if (idx >= total) break;
      const cx = x0 + 6 + cell / 2 + (i % 5) * cell;
      const cy = 6 + cell / 2 + Math.floor(i / 5) * cell;
      const second = idx >= kept;
      if (op === 'add') out += dot(cx, cy, 11.5, second ? 'g6i1' : 'g6i0');
      else if (second) {
        out += dot(cx, cy, 11.5, 'g6i-x');
        out += `<path d="M${cx - 8} ${cy - 8} L${cx + 8} ${cy + 8} M${cx + 8} ${cy - 8} L${cx - 8} ${cy + 8}" stroke="#d32f2f" stroke-width="3.5" stroke-linecap="round"/>`;
      } else out += dot(cx, cy, 11.5, 'g6i0');
    }
  }
  return `${out}</svg>`;
}

/** Lưới chấm rows × cols, mỗi hàng một màu. */
function grid(rows: number, cols: number): string {
  const cell = 28;
  const w = cols * cell + 8;
  const h = rows * cell + 8;
  let out = `<svg class="g6-ill-svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${vi.g6.illusLabel}">${dotDefs()}`;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      out += dot(4 + cell / 2 + c * cell, 4 + cell / 2 + r * cell, 11, `g6i${r % ROW_HUES.length}`);
    }
  }
  return `${out}</svg>`;
}

/** Khối chục (thanh dọc) và đơn vị (ô vuông) cho so sánh số. */
function blocksOf(n: number): string {
  const tens = Math.floor(n / 10);
  const ones = n % 10;
  const rod = 13;
  const rodGap = 4;
  const h = 84;
  const wTens = Math.max(0, tens * (rod + rodGap) - rodGap);
  const cube = 14;
  const x1 = wTens + (tens > 0 ? 12 : 0);
  const w = x1 + (ones > 0 ? Math.min(ones, 5) * (cube + 2) : 0) + 4;
  let out = `<svg class="g6-ill-blk" viewBox="0 0 ${Math.max(w, 24)} ${h + 4}" aria-hidden="true">`;
  for (let t = 0; t < tens; t++) {
    const x = t * (rod + rodGap);
    out += `<rect x="${x}" y="2" width="${rod}" height="${h}" rx="4" fill="url(#g6b-t)" stroke="#0d5b9c" stroke-width="2"/>`;
    for (let k = 1; k < 10; k++) {
      out += `<line x1="${x + 1.5}" x2="${x + rod - 1.5}" y1="${2 + (h / 10) * k}" y2="${2 + (h / 10) * k}" stroke="#0d5b9c" stroke-opacity="0.35"/>`;
    }
  }
  for (let o = 0; o < ones; o++) {
    const x = x1 + (o % 5) * (cube + 2);
    const y = 2 + h - cube - Math.floor(o / 5) * (cube + 2);
    out += `<rect x="${x}" y="${y}" width="${cube}" height="${cube}" rx="3" fill="url(#g6b-o)" stroke="#a85a00" stroke-width="2"/>`;
  }
  return `${out}</svg>`;
}

const BLOCK_DEFS = `<svg width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute"><defs><linearGradient id="g6b-t" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7fd0ff"/><stop offset="1" stop-color="#1c8ee0"/></linearGradient><linearGradient id="g6b-o" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffe27a"/><stop offset="1" stop-color="#ff9d1c"/></linearGradient></defs></svg>`;

function blocks(a: number, b: number): string {
  const side = (n: number) => `<div class="g6-ill-num">${blocksOf(n)}<strong>${n}</strong></div>`;
  return `<div class="g6-ill-cmp" role="img" aria-label="${vi.g6.illusLabel}">${BLOCK_DEFS}${side(a)}<span class="g6-ill-sign">${cmpSymbol(Math.sign(a - b))}</span>${side(b)}<p class="g6-ill-legend"><i class="lg-t"></i>${vi.g6.tens} <i class="lg-o"></i>${vi.g6.ones}</p></div>`;
}

/** Đặt tính dọc: chữ số nhớ tô màu (chip). Phép chia hiển thị dạng kiểm tra bằng phép nhân. */
function column(op: 'add' | 'sub' | 'mul', a: number, b: number, check: boolean): string {
  const m = columnModel(op, a, b);
  const sym = op === 'add' ? '+' : op === 'sub' ? '−' : '×';
  const cols = m.width + 1;
  const cell = (v: number | null, cls = ''): string =>
    `<span class="g6-d ${cls}">${v === null ? '' : v}</span>`;
  const chips = `<span class="g6-d"></span>${m.carry
    .map(
      (c) =>
        `<span class="g6-d">${c > 0 ? `<i class="g6-chip" title="${vi.g6.carry}">${c}</i>` : ''}</span>`,
    )
    .join('')}`;
  const top = `<span class="g6-d"></span>${m.top.map((d) => cell(d)).join('')}`;
  const bottom = `<span class="g6-d g6-op">${sym}</span>${m.bottom.map((d) => cell(d)).join('')}`;
  const rows = m.carryAbove === 'top' ? [chips, top, bottom] : [top, chips, bottom];
  const result = `<span class="g6-d"></span>${m.result.map((d) => cell(d, 'g6-res')).join('')}`;
  return `<div class="g6-col" style="--cols:${cols}" role="img" aria-label="${vi.g6.illusLabel}">
    ${rows.join('')}<span class="g6-line" style="grid-column:1 / -1"></span>${result}
    ${check ? `<p class="g6-col-note">${vi.g6.checkByMul}</p>` : ''}
  </div>`;
}

export function illustrationHtml(ill: Illustration): string {
  switch (ill.kind) {
    case 'frames':
      return frames(ill.op, ill.a, ill.b);
    case 'grid':
      return grid(ill.rows, ill.cols);
    case 'column':
      return column(ill.op, ill.a, ill.b, ill.check);
    case 'blocks':
      return blocks(ill.a, ill.b);
  }
}
