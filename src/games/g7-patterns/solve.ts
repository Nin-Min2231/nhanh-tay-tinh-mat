// G7 – bộ giải độc lập với bộ sinh câu: liệt kê MỌI phần tử lấp vào ô “?” mà vẫn thỏa ít nhất một quy luật hợp lý.
// Câu hợp lệ khi và chỉ khi tập này có đúng 1 phần tử (= đáp án đúng) → “đúng 1 đáp án” (docs/02_GAMES.md, G7).
import {
  ATTRS,
  ATTR_DOMAIN,
  glyph,
  num,
  type Attr,
  type Glyph,
  type Item,
  type Rotation,
  type Shape,
  type SizeLevel,
} from './elements';

type V = number | string;

/** Thuộc tính số có thể theo quy luật cộng đều: đếm chấm, cỡ, hướng xoay (theo mod 360). */
const ARITHMETIC_ATTRS: ReadonlySet<Attr> = new Set<Attr>(['count', 'size', 'rot']);
const ATTR_MOD: Partial<Record<Attr, number>> = { rot: 360 };

// ---------- dãy hình ----------

function periodic(seq: readonly V[]): boolean {
  const L = seq.length;
  for (let p = 1; p <= Math.floor(L / 2); p++) {
    let ok = true;
    for (let i = p; i < L && ok; i++) if (seq[i] !== seq[i - p]) ok = false;
    if (ok) return true;
  }
  return false;
}

function arithmetic(seq: readonly number[], mod?: number): boolean {
  if (seq.length < 3) return false;
  const norm = (x: number) => (mod ? ((x % mod) + mod) % mod : x);
  const d = norm((seq[1] as number) - (seq[0] as number));
  for (let i = 2; i < seq.length; i++) {
    if (norm((seq[i] as number) - (seq[i - 1] as number)) !== d) return false;
  }
  return true;
}

/** Các giá trị của một thuộc tính có thể điền vào ô “?” (ô trống = null). */
function attrCandidates(values: readonly (V | null)[], hole: number, attr: Attr): V[] {
  const out: V[] = [];
  const isArith = ARITHMETIC_ATTRS.has(attr);
  for (const v of ATTR_DOMAIN[attr]) {
    const seq = values.map((x, i) => (i === hole ? v : (x as V)));
    if (periodic(seq) || (isArith && arithmetic(seq as number[], ATTR_MOD[attr]))) {
      out.push(v);
    }
  }
  return out;
}

function solveGlyphSeq(cells: readonly (Item | null)[], hole: number): Glyph[] {
  const glyphs = cells.map((c) => (c && c.kind === 'glyph' ? c : null));
  const perAttr: V[][] = ATTRS.map((attr) =>
    attrCandidates(
      glyphs.map((g) => (g ? g[attr] : null)),
      hole,
      attr,
    ),
  );
  return product(perAttr);
}

function product(perAttr: V[][]): Glyph[] {
  if (perAttr.some((l) => l.length === 0)) return [];
  let combos: V[][] = [[]];
  for (const list of perAttr) combos = combos.flatMap((c) => list.map((v) => [...c, v]));
  return combos.map(([shape, color, size, rot, count]) =>
    glyph(shape as Shape, color as number, {
      size: size as SizeLevel,
      rot: rot as Rotation,
      count: count as number,
    }),
  );
}

// ---------- dãy số ----------

/** Ứng viên số duyệt đến ~3 lần số lớn nhất đang hiện (đủ cho dãy ×2 và cộng đều). */
const numLimit = (max: number): number => 3 * max + 20;

function numFits(seq: readonly number[]): boolean {
  const L = seq.length;
  // cộng/trừ đều hoặc xen kẽ (+a, +b, +a, +b…): d[i] = d[i+2]
  const d: number[] = [];
  for (let i = 0; i + 1 < L; i++) d.push((seq[i + 1] as number) - (seq[i] as number));
  let alt = d.length >= 3;
  for (let i = 0; i + 2 < d.length && alt; i++) if (d[i] !== d[i + 2]) alt = false;
  if (alt) return true;
  // nhân đều: mỗi số gấp số trước r lần (r nguyên ≥ 2)
  const a0 = seq[0] as number;
  const a1 = seq[1] as number;
  if (a0 > 0 && a1 % a0 === 0 && a1 / a0 >= 2) {
    const r = a1 / a0;
    let geo = true;
    for (let i = 1; i < L && geo; i++) if (seq[i] !== (seq[i - 1] as number) * r) geo = false;
    if (geo) return true;
  }
  return periodic(seq);
}

function solveNumSeq(cells: readonly (Item | null)[], hole: number): Item[] {
  const seq: number[] = [];
  let max = 0;
  for (const c of cells) {
    if (c === null) seq.push(0);
    else if (c.kind === 'num') {
      seq.push(c.n);
      max = Math.max(max, c.n);
    } else return [];
  }
  const out: Item[] = [];
  for (let v = 0; v <= numLimit(max); v++) {
    seq[hole] = v;
    if (numFits(seq)) out.push(num(v));
  }
  return out;
}

/** Mọi phần tử lấp được vào ô `hole` của một dãy (hình hoặc số). */
export function solveSeq(cells: readonly (Item | null)[], hole: number): Item[] {
  const first = cells.find((c) => c !== null);
  if (!first) return [];
  return first.kind === 'num' ? solveNumSeq(cells, hole) : solveGlyphSeq(cells, hole);
}

// ---------- ma trận 2×2 (A : B = C : ?) ----------

export function solveMatrix2(cells: readonly (Item | null)[]): Glyph[] {
  const [A, B, C] = cells as [Glyph, Glyph, Glyph];
  const perAttr: V[][] = ATTRS.map((attr) => {
    const dom = ATTR_DOMAIN[attr];
    const a = A[attr];
    const b = B[attr];
    const c = C[attr];
    const numeric = typeof a === 'number' && attr !== 'color';
    const preds = new Set<V>();
    // đọc theo hàng: A → B thì C → ?
    if (a === b) preds.add(c);
    else if (c === a) preds.add(b);
    else if (numeric) preds.add((c as number) + ((b as number) - (a as number)));
    // đọc theo cột: A → C thì B → ?
    if (a === c) preds.add(b);
    else if (b === a) preds.add(c);
    else if (numeric) preds.add((b as number) + ((c as number) - (a as number)));
    return [...preds].filter((v) => dom.includes(v));
  });
  return product(perAttr);
}

// ---------- ma trận 3×3 (quy luật theo hàng/cột) ----------

type Line = readonly V[];

const famConst = (lines: readonly Line[]) => lines.every((l) => l.every((x) => x === l[0]));
const famAllDiff = (lines: readonly Line[]) => {
  const key = (l: Line) => [...l].map(String).sort().join('|');
  return (
    lines.every((l) => new Set(l).size === l.length) &&
    lines.every((l) => key(l) === key(lines[0] as Line))
  );
};
const famArith = (lines: readonly Line[]) => lines.every((l) => arithmetic(l as number[]));

function matrixAttr(grid: readonly (readonly (V | null)[])[], attr: Attr): V[] {
  const out: V[] = [];
  const numeric = attr === 'count';
  for (const v of ATTR_DOMAIN[attr]) {
    const g = grid.map((row, r) => row.map((x, c) => (r === 2 && c === 2 ? v : (x as V))));
    const rows: Line[] = g;
    const cols: Line[] = [0, 1, 2].map((c) => g.map((row) => row[c] as V));
    const ok = [famConst, famAllDiff, ...(numeric ? [famArith] : [])].some(
      (fam) => fam(rows) || fam(cols),
    );
    if (ok) out.push(v);
  }
  return out;
}

export function solveMatrix3(cells: readonly (Item | null)[]): Glyph[] {
  const perAttr: V[][] = ATTRS.map((attr) => {
    const grid = [0, 1, 2].map((r) =>
      [0, 1, 2].map((c) => {
        const it = cells[r * 3 + c];
        return it && it.kind === 'glyph' ? it[attr] : null;
      }),
    );
    return matrixAttr(grid, attr);
  });
  return product(perAttr);
}

// ---------- tìm hình khác loại ----------

/** Chỉ số các hình “lẻ”: một thuộc tính mà 3 hình cùng giá trị, 1 hình khác. */
export function solveOdd(items: readonly Item[]): number[] {
  const odd = new Set<number>();
  for (const attr of ATTRS) {
    const vals = items.map((it) => (it.kind === 'glyph' ? it[attr] : null));
    for (let i = 0; i < vals.length; i++) {
      const others = vals.filter((_, j) => j !== i);
      if (others.every((x) => x === others[0]) && vals[i] !== others[0]) odd.add(i);
    }
  }
  return [...odd].sort((a, b) => a - b);
}
