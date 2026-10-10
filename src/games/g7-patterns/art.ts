// G7 – hình vẽ SVG tự thiết kế: mỗi màu có hoa văn riêng (không phụ thuộc màu), chuyển sắc + vệt sáng + viền mềm.
import { vi } from '../../i18n/vi';
import type { Glyph, Item, Shape } from './elements';

/** [sáng, vừa, tối, viền, màu hoa văn]. 0 đỏ · 1 xanh dương · 2 xanh lá · 3 vàng · 4 tím. */
const PALETTE: readonly (readonly [string, string, string, string, string])[] = [
  ['#ff9a8f', '#ec3b3b', '#a61b27', '#7d1020', '#ffffff'],
  ['#9fd0ff', '#2f86e8', '#154c9e', '#0d3470', '#ffffff'],
  ['#c8f7a8', '#4cbf4a', '#23751f', '#17531a', '#ffffff'],
  ['#fff6a6', '#ffc928', '#e08a00', '#9a5a00', '#8a4b00'],
  ['#e2c9ff', '#9a5df0', '#5a2bb0', '#3e1d80', '#ffffff'],
];

/** Hoa văn: 0 sọc chéo · 1 chấm tròn · 2 ô lưới · 3 sọc ngang · 4 lượn sóng. */
function patterns(): string {
  const stroke = (i: number) => PALETTE[i]?.[4] ?? '#fff';
  return [
    `<pattern id="g7-p0" width="14" height="14" patternUnits="userSpaceOnUse" patternTransform="rotate(45)"><rect width="5" height="14" fill="${stroke(0)}" fill-opacity="0.5"/></pattern>`,
    `<pattern id="g7-p1" width="16" height="16" patternUnits="userSpaceOnUse"><circle cx="8" cy="8" r="3.4" fill="${stroke(1)}" fill-opacity="0.6"/></pattern>`,
    `<pattern id="g7-p2" width="18" height="18" patternUnits="userSpaceOnUse"><path d="M0 9H18M9 0V18" stroke="${stroke(2)}" stroke-opacity="0.5" stroke-width="3" fill="none"/></pattern>`,
    `<pattern id="g7-p3" width="14" height="14" patternUnits="userSpaceOnUse"><rect y="4" width="14" height="4.5" fill="${stroke(3)}" fill-opacity="0.38"/></pattern>`,
    `<pattern id="g7-p4" width="20" height="14" patternUnits="userSpaceOnUse"><path d="M0 10 L5 4 L10 10 L15 4 L20 10" stroke="${stroke(4)}" stroke-opacity="0.55" stroke-width="2.8" fill="none" stroke-linejoin="round"/></pattern>`,
  ].join('');
}

function starPoints(): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const a = (-90 + i * 36) * (Math.PI / 180);
    const r = i % 2 === 0 ? 43 : 19;
    pts.push(`${(50 + r * Math.cos(a)).toFixed(1)} ${(54 + r * Math.sin(a)).toFixed(1)}`);
  }
  return `M${pts.join(' L')} Z`;
}

const SHAPE_DEFS: Record<Shape, string> = {
  circle: '<circle id="g7-s-circle" cx="50" cy="50" r="38"/>',
  square: '<rect id="g7-s-square" x="14" y="14" width="72" height="72" rx="14"/>',
  triangle: '<path id="g7-s-triangle" d="M50 12 L91 85 L9 85 Z"/>',
  star: `<path id="g7-s-star" d="${starPoints()}"/>`,
  heart:
    '<path id="g7-s-heart" d="M50 88 C14 63 8 38 22 25 C33 15 47 20 50 33 C53 20 67 15 78 25 C92 38 86 63 50 88 Z"/>',
  arrow: '<path id="g7-s-arrow" d="M50 8 L89 50 L67 50 L67 90 L33 90 L33 50 L11 50 Z"/>',
};

/** Khối <defs> dùng chung (chèn 1 lần, ẩn). */
export function glyphDefs(): string {
  const grads = PALETTE.map(
    ([l, m, d], i) =>
      `<radialGradient id="g7-g${i}" cx="34%" cy="28%" r="85%"><stop offset="0" stop-color="${l}"/><stop offset="0.5" stop-color="${m}"/><stop offset="1" stop-color="${d}"/></radialGradient>`,
  ).join('');
  const shapes = Object.values(SHAPE_DEFS).join('');
  const clips = (Object.keys(SHAPE_DEFS) as Shape[])
    .map((s) => `<clipPath id="g7-c-${s}"><use href="#g7-s-${s}"/></clipPath>`)
    .join('');
  return `<svg class="g7-defs" width="0" height="0" aria-hidden="true" focusable="false" style="position:absolute"><defs>${grads}${patterns()}${shapes}${clips}</defs></svg>`;
}

/** Vị trí các hình nhỏ khi count > 1 (toạ độ 0–1, tỷ lệ thu nhỏ). */
const LAYOUT: Record<number, { x: number; y: number; s: number }[]> = {
  1: [{ x: 0.5, y: 0.5, s: 1 }],
  2: [
    { x: 0.27, y: 0.5, s: 0.5 },
    { x: 0.73, y: 0.5, s: 0.5 },
  ],
  3: [
    { x: 0.5, y: 0.27, s: 0.46 },
    { x: 0.27, y: 0.73, s: 0.46 },
    { x: 0.73, y: 0.73, s: 0.46 },
  ],
  4: [
    { x: 0.27, y: 0.27, s: 0.46 },
    { x: 0.73, y: 0.27, s: 0.46 },
    { x: 0.27, y: 0.73, s: 0.46 },
    { x: 0.73, y: 0.73, s: 0.46 },
  ],
  5: [
    { x: 0.22, y: 0.22, s: 0.38 },
    { x: 0.78, y: 0.22, s: 0.38 },
    { x: 0.5, y: 0.5, s: 0.38 },
    { x: 0.22, y: 0.78, s: 0.38 },
    { x: 0.78, y: 0.78, s: 0.38 },
  ],
  6: [
    { x: 0.3, y: 0.2, s: 0.34 },
    { x: 0.7, y: 0.2, s: 0.34 },
    { x: 0.3, y: 0.5, s: 0.34 },
    { x: 0.7, y: 0.5, s: 0.34 },
    { x: 0.3, y: 0.8, s: 0.34 },
    { x: 0.7, y: 0.8, s: 0.34 },
  ],
};

const SIZE_SCALE = [0.52, 0.78, 1] as const;

/** Mô tả bằng chữ (nhãn cho trình đọc màn hình và file mẫu): “hình tròn đỏ, to”. */
export function describeItem(it: Item): string {
  if (it.kind === 'num') return String(it.n);
  const parts = [`${vi.g7.shapeNames[it.shape]} ${vi.g7.colorNames[it.color] ?? ''}`.trim()];
  if (it.size !== 1) parts.push(vi.g7.sizeNames[it.size] ?? '');
  if (it.rot !== 0 && it.shape === 'arrow') parts.push(vi.g7.rotation(it.rot));
  if (it.count > 1) parts.push(vi.g7.count(it.count));
  return parts.join(', ');
}

export function glyphSvg(g: Glyph): string {
  const [, , , line] = PALETTE[g.color % PALETTE.length] as (typeof PALETTE)[number];
  const c = g.color % PALETTE.length;
  const sz = SIZE_SCALE[g.size];
  const copies = (LAYOUT[Math.min(6, Math.max(1, g.count))] ?? []).map((p) => {
    const tf = `translate(${(p.x * 100).toFixed(1)} ${(p.y * 100).toFixed(1)}) scale(${p.s}) rotate(${g.rot}) translate(-50 -50)`;
    return `<g transform="${tf}">
      <use href="#g7-s-${g.shape}" fill="url(#g7-g${c})" stroke="${line}" stroke-width="4.5" stroke-linejoin="round"/>
      <use href="#g7-s-${g.shape}" fill="url(#g7-p${c})"/>
      <ellipse cx="35" cy="31" rx="15" ry="8" transform="rotate(-35 35 31)" fill="#fff" fill-opacity="0.45" clip-path="url(#g7-c-${g.shape})"/>
    </g>`;
  });
  return `<svg class="g7-glyph" viewBox="0 0 100 100" role="img" aria-label="${describeItem(g)}" focusable="false">
    <g transform="translate(50 50) scale(${sz}) translate(-50 -50)">${copies.join('')}</g>
  </svg>`;
}

/** Số trong ô: thẻ số tròn trịa nhiều màu. */
export function numberHtml(n: number): string {
  return `<span class="g7-num" data-len="${String(n).length}">${n}</span>`;
}

export function itemHtml(it: Item): string {
  return it.kind === 'num' ? numberHtml(it.n) : glyphSvg(it);
}
