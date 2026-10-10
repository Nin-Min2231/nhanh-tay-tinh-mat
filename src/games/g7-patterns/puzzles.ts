// G7 – bộ sinh câu hỏi cho từng dạng. Mỗi câu sinh xong đều được bộ giải độc lập (solve.ts) kiểm tra “đúng 1 đáp án”.
import { pick, randInt, shuffle, type Rng } from '../../app/rng';
import {
  BASE_SHAPES,
  COLOR_COUNT,
  MAX_COUNT,
  ROTATIONS,
  ATTR_DOMAIN,
  diffAttrs,
  getAttr,
  glyph,
  itemEq,
  itemKey,
  num,
  pickDistinct,
  withAttr,
  type Attr,
  type Glyph,
  type Item,
  type Rotation,
  type Shape,
  type SizeLevel,
} from './elements';
import { solveMatrix2, solveMatrix3, solveOdd, solveSeq } from './solve';

export type Group = 'shapes' | 'numbers' | 'matrix';
export type Layout = 'seq' | 'matrix2' | 'matrix3' | 'odd';

export type TypeId =
  | 'ab-color'
  | 'ab'
  | 'aab'
  | 'abb'
  | 'abc'
  | 'size-alt'
  | 'num-step'
  | 'arrow-rot'
  | 'two-attr'
  | 'num-down'
  | 'num-skip'
  | 'grow-dots'
  | 'matrix2'
  | 'matrix3-row'
  | 'odd-one'
  | 'num-double'
  | 'num-alt'
  | 'matrix3-two';

/** Cách giải thích quy luật khi bé trả lời sai. */
export type Explain =
  /** Tô sáng đơn vị lặp lại (len = số ô của một đơn vị). */
  | { kind: 'unit'; len: number }
  /** Mũi tên giữa các ô liên tiếp kèm nhãn (+2, ×2, ↻90°…); labels.length = cells.length − 1. */
  | { kind: 'steps'; labels: string[] }
  /** Ma trận 2×2: hình bên trái đổi thành hình bên phải, làm giống ở hàng dưới. */
  | { kind: 'analogy' }
  /** Ma trận 3×3: tô sáng hàng chứa ô “?”. */
  | { kind: 'row'; row: number }
  /** Tìm hình khác loại: ba hình còn lại cùng một thuộc tính. */
  | { kind: 'odd'; attr: Attr; oddIndex: number };

export interface Puzzle {
  type: TypeId;
  /** Cấp đầu tiên có dạng này trong bảng (dùng cho `highestTypeCorrect`). */
  typeLevel: number;
  layout: Layout;
  /** Các ô của dãy/ma trận; ô “?” = null. Dạng `odd` không có ô (các hình nằm trong options). */
  cells: (Item | null)[];
  hole: number;
  options: Item[];
  correctIndex: number;
  explain: Explain;
}

export const TYPE_DEFS: Record<TypeId, { level: number; group: Group; layout: Layout }> = {
  'ab-color': { level: 1, group: 'shapes', layout: 'seq' },
  ab: { level: 2, group: 'shapes', layout: 'seq' },
  aab: { level: 2, group: 'shapes', layout: 'seq' },
  abb: { level: 2, group: 'shapes', layout: 'seq' },
  abc: { level: 3, group: 'shapes', layout: 'seq' },
  'size-alt': { level: 3, group: 'shapes', layout: 'seq' },
  'num-step': { level: 4, group: 'numbers', layout: 'seq' },
  'arrow-rot': { level: 4, group: 'shapes', layout: 'seq' },
  'two-attr': { level: 5, group: 'shapes', layout: 'seq' },
  'num-down': { level: 6, group: 'numbers', layout: 'seq' },
  'num-skip': { level: 6, group: 'numbers', layout: 'seq' },
  'grow-dots': { level: 6, group: 'shapes', layout: 'seq' },
  matrix2: { level: 7, group: 'matrix', layout: 'matrix2' },
  'matrix3-row': { level: 8, group: 'matrix', layout: 'matrix3' },
  'odd-one': { level: 9, group: 'shapes', layout: 'odd' },
  'num-double': { level: 9, group: 'numbers', layout: 'seq' },
  'num-alt': { level: 10, group: 'numbers', layout: 'seq' },
  'matrix3-two': { level: 10, group: 'matrix', layout: 'matrix3' },
};

export const ALL_TYPES = Object.keys(TYPE_DEFS) as TypeId[];

/** Dạng câu của một cấp, theo các nhóm đang bật. Nhóm bị tắt thì lấy dạng thuộc nhóm bật có cấp gần nhất. */
export function typesForLevel(level: number, groups: readonly Group[]): TypeId[] {
  const on = groups.length > 0 ? groups : (['shapes', 'numbers', 'matrix'] as Group[]);
  const enabled = ALL_TYPES.filter((t) => on.includes(TYPE_DEFS[t].group));
  const own = enabled.filter((t) => TYPE_DEFS[t].level === level);
  if (own.length > 0) return own;
  const dist = (t: TypeId) => Math.abs(TYPE_DEFS[t].level - level);
  const best = Math.min(...enabled.map(dist));
  // cùng khoảng cách: ưu tiên cấp thấp hơn
  const nearest = enabled.filter((t) => dist(t) === best);
  const lowest = Math.min(...nearest.map((t) => TYPE_DEFS[t].level));
  return nearest.filter((t) => TYPE_DEFS[t].level === lowest);
}

// ---------- bản nháp ----------

interface Draft {
  cells: (Item | null)[];
  hole: number;
  truth: Item;
  /** Thuộc tính ưu tiên đổi khi tạo đáp án nhiễu, rồi tới `extra` nếu chưa đủ. */
  main: Attr[];
  extra: Attr[];
  explain: Explain;
  /** Dạng `odd`: các hình (đã xáo) và vị trí hình lẻ. */
  oddItems?: Item[];
  oddIndex?: number;
  /** Dạng số: các bước/số lân cận để làm nhiễu. */
  numHints?: number[];
}

const COLORS = [0, 1, 2, 3, 4].slice(0, COLOR_COUNT);

const stepLabel = (d: number): string => (d >= 0 ? `+${d}` : `−${-d}`);

function repeatUnit(unit: readonly Item[], total: number): Item[] {
  return Array.from({ length: total }, (_, i) => unit[i % unit.length] as Item);
}

/** Dãy lặp: chọn ô “?” ở cuối, hoặc (từ cấp 5) đôi khi ở giữa dãy. */
function periodicDraft(
  rng: Rng,
  unit: Item[],
  total: number,
  level: number,
  main: Attr[],
  extra: Attr[],
  explainLen = unit.length,
): Draft {
  const full = repeatUnit(unit, total);
  const middle = level >= 5 && rng() < 0.4;
  const hole = middle ? randInt(rng, 2, total - 2) : total - 1;
  const cells = full.map((c, i) => (i === hole ? null : c));
  return {
    cells,
    hole,
    truth: full[hole] as Item,
    main,
    extra,
    explain: { kind: 'unit', len: explainLen },
  };
}

function genAbColor(rng: Rng): Draft {
  const shape = pick(rng, BASE_SHAPES);
  const [c0, c1] = pickDistinct(rng, COLORS, 2) as [number, number];
  const unit = [glyph(shape, c0), glyph(shape, c1)];
  return periodicDraft(rng, unit, 5 + (rng() < 0.5 ? 1 : 0), 1, ['color'], ['shape']);
}

function genAbVariant(pattern: 'ab' | 'aab' | 'abb') {
  return (rng: Rng): Draft => {
    const [s0, s1] = pickDistinct(rng, BASE_SHAPES, 2) as [Shape, Shape];
    const [c0, c1] = pickDistinct(rng, COLORS, 2) as [number, number];
    const A = glyph(s0, c0);
    const B = glyph(s1, c1);
    const unit = pattern === 'ab' ? [A, B] : pattern === 'aab' ? [A, A, B] : [A, B, B];
    const total = pattern === 'ab' ? 5 + (rng() < 0.5 ? 1 : 0) : 6 + (rng() < 0.5 ? 1 : 0);
    return periodicDraft(rng, unit, total, 2, ['shape', 'color'], []);
  };
}

function genAbc(rng: Rng): Draft {
  const shapes = pickDistinct(rng, BASE_SHAPES, 3);
  const colors = pickDistinct(rng, COLORS, 3);
  const unit = shapes.map((s, i) => glyph(s, colors[i] as number));
  return periodicDraft(rng, unit, 6 + (rng() < 0.5 ? 1 : 0), 3, ['shape', 'color'], []);
}

function genSizeAlt(rng: Rng): Draft {
  const shape = pick(rng, BASE_SHAPES);
  const color = pick(rng, COLORS);
  const [s0, s1]: [SizeLevel, SizeLevel] = rng() < 0.5 ? [2, 0] : [0, 2];
  const unit = [glyph(shape, color, { size: s0 }), glyph(shape, color, { size: s1 })];
  return periodicDraft(rng, unit, 5 + (rng() < 0.5 ? 1 : 0), 3, ['size'], ['color']);
}

function genTwoAttr(rng: Rng): Draft {
  const colorPeriod = rng() < 0.5 ? 2 : 3;
  const shapePeriod = colorPeriod === 2 ? 3 : 2;
  const colors = pickDistinct(rng, COLORS, colorPeriod);
  const shapes = pickDistinct(rng, BASE_SHAPES, shapePeriod);
  const total = 6 + (rng() < 0.5 ? 1 : 0);
  const full = Array.from({ length: total }, (_, i) =>
    glyph(shapes[i % shapePeriod] as Shape, colors[i % colorPeriod] as number),
  );
  const middle = rng() < 0.4;
  const hole = middle ? randInt(rng, 2, total - 2) : total - 1;
  return {
    cells: full.map((c, i) => (i === hole ? null : c)),
    hole,
    truth: full[hole] as Item,
    main: ['shape', 'color'],
    extra: [],
    explain: { kind: 'unit', len: 6 },
  };
}

function genArrowRot(rng: Rng): Draft {
  const color = pick(rng, COLORS);
  const dir = rng() < 0.5 ? 90 : -90;
  const r0 = pick(rng, ROTATIONS);
  const total = 5 + (rng() < 0.5 ? 1 : 0);
  const full = Array.from({ length: total }, (_, i) =>
    glyph('arrow', color, { rot: ((((r0 + i * dir) % 360) + 360) % 360) as Rotation }),
  );
  return {
    cells: full.map((c, i) => (i === total - 1 ? null : c)),
    hole: total - 1,
    truth: full[total - 1] as Item,
    main: ['rot'],
    extra: ['color'],
    explain: { kind: 'steps', labels: full.slice(1).map(() => (dir > 0 ? '↻90°' : '↺90°')) },
  };
}

function genGrowDots(rng: Rng): Draft {
  const shape = pick(rng, BASE_SHAPES);
  const color = pick(rng, COLORS);
  const visible = 3 + (rng() < 0.5 ? 1 : 0);
  const total = visible + 1;
  const start = randInt(rng, 1, MAX_COUNT - visible);
  const full = Array.from({ length: total }, (_, i) => glyph(shape, color, { count: start + i }));
  const middle = rng() < 0.3;
  const hole = middle ? randInt(rng, 1, total - 2) : total - 1;
  return {
    cells: full.map((c, i) => (i === hole ? null : c)),
    hole,
    truth: full[hole] as Item,
    main: ['count'],
    extra: ['color'],
    explain: { kind: 'steps', labels: full.slice(1).map(() => '+1') },
  };
}

// ---------- dãy số ----------

function numDraft(seq: number[], hole: number): Draft {
  const nums = seq.map(num);
  const diffs = seq.slice(1).map((v, i) => v - (seq[i] as number));
  const isGeo =
    diffs.length > 1 && seq[0]! > 0 && seq.every((v, i) => i === 0 || v === seq[i - 1]! * 2);
  const labels = isGeo ? diffs.map(() => '×2') : diffs.map(stepLabel);
  return {
    cells: nums.map((c, i) => (i === hole ? null : c)),
    hole,
    truth: nums[hole] as Item,
    main: [],
    extra: [],
    explain: { kind: 'steps', labels },
    numHints: [...new Set(diffs.map(Math.abs))],
  };
}

/** Vị trí ô “?” của dãy số: cuối dãy, hoặc (từ cấp 5) đôi khi ở giữa. */
function numHole(rng: Rng, total: number, level: number): number {
  return level >= 5 && rng() < 0.4 ? randInt(rng, 2, total - 2) : total - 1;
}

function genNumStep(rng: Rng): Draft {
  const step = pick(rng, [1, 2, 5, 10]);
  const start = step === 5 ? 5 * randInt(rng, 1, 4) : randInt(rng, 1, step === 10 ? 30 : 10);
  const total = 5 + (rng() < 0.5 ? 1 : 0);
  const seq = Array.from({ length: total }, (_, i) => start + i * step);
  return numDraft(seq, total - 1);
}

function genNumDown(rng: Rng): Draft {
  const step = pick(rng, [1, 2, 3, 5, 10]);
  const total = 5 + (rng() < 0.5 ? 1 : 0);
  const start = (total - 1) * step + randInt(rng, 0, 8);
  const seq = Array.from({ length: total }, (_, i) => start - i * step);
  return numDraft(seq, numHole(rng, total, 6));
}

function genNumSkip(rng: Rng): Draft {
  const step = pick(rng, [3, 4]);
  const start = rng() < 0.5 ? step : randInt(rng, 1, 8);
  const total = 5 + (rng() < 0.5 ? 1 : 0);
  const seq = Array.from({ length: total }, (_, i) => start + i * step);
  return numDraft(seq, numHole(rng, total, 6));
}

function genNumDouble(rng: Rng): Draft {
  const start = pick(rng, [1, 2, 3]);
  const total = 5 + (rng() < 0.5 ? 1 : 0);
  const seq = Array.from({ length: total }, (_, i) => start * 2 ** i);
  return numDraft(seq, numHole(rng, total, 9));
}

function genNumAlt(rng: Rng): Draft {
  const [a, b] = pick(rng, [
    [1, 2],
    [2, 1],
    [1, 3],
    [3, 1],
    [2, 3],
    [3, 2],
    [2, 4],
    [4, 2],
  ] as const);
  const start = randInt(rng, 1, 10);
  const total = 6;
  const seq = [start];
  for (let i = 1; i < total; i++) seq.push((seq[i - 1] as number) + (i % 2 === 1 ? a : b));
  return numDraft(seq, numHole(rng, total, 10));
}

// ---------- ma trận ----------

type GridRule = 'const-row' | 'latin' | 'latin2' | 'inc' | 'inc-row';

const ATTR_POOL: Record<Attr, readonly (number | string)[]> = {
  shape: BASE_SHAPES,
  color: COLORS,
  size: [0, 1, 2],
  rot: [0],
  count: [1, 2, 3, 4, 5, 6],
};

/** Lưới 3×3 giá trị của một thuộc tính theo quy luật. */
function attrGrid(rng: Rng, attr: Attr, rule: GridRule): (number | string)[][] {
  if (rule === 'inc' || rule === 'inc-row') {
    const start = rule === 'inc' ? randInt(rng, 1, 2) : randInt(rng, 1, 4);
    return [0, 1, 2].map((r) => [0, 1, 2].map((c) => start + c + (rule === 'inc' ? r : 0)));
  }
  const vals = pickDistinct(rng, ATTR_POOL[attr], 3) as (number | string)[];
  return [0, 1, 2].map((r) =>
    [0, 1, 2].map((c) => {
      if (rule === 'const-row') return vals[r] as number | string;
      return vals[(c + (rule === 'latin' ? r : 2 * r)) % 3] as number | string;
    }),
  );
}

function matrix3Draft(rng: Rng, rules: { attr: Attr; rule: GridRule }[]): Draft {
  const base = glyph(pick(rng, BASE_SHAPES), pick(rng, COLORS));
  const grids = rules.map((r) => ({ ...r, grid: attrGrid(rng, r.attr, r.rule) }));
  const cells: Glyph[] = [];
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      let g = base;
      for (const gr of grids)
        g = withAttr(g, gr.attr, (gr.grid[r] as (number | string)[])[c] as number | string);
      cells.push(g);
    }
  }
  const used = rules.map((r) => r.attr);
  const extra = (['shape', 'color', 'size', 'count'] as Attr[]).filter((a) => !used.includes(a));
  return {
    cells: cells.map((c, i) => (i === 8 ? null : c)),
    hole: 8,
    truth: cells[8] as Item,
    main: used,
    extra,
    explain: { kind: 'row', row: 2 },
  };
}

function genMatrix3Row(rng: Rng): Draft {
  const variant = pick(rng, ['latin-shape', 'inc-count', 'row-same'] as const);
  if (variant === 'latin-shape') return matrix3Draft(rng, [{ attr: 'shape', rule: 'latin' }]);
  if (variant === 'inc-count') {
    return matrix3Draft(rng, [{ attr: 'count', rule: pick(rng, ['inc', 'inc-row'] as const) }]);
  }
  return matrix3Draft(rng, [
    { attr: 'shape', rule: 'const-row' },
    { attr: 'color', rule: 'const-row' },
  ]);
}

function genMatrix3Two(rng: Rng): Draft {
  const combos: { attr: Attr; rule: GridRule }[][] = [
    [
      { attr: 'shape', rule: 'latin' },
      { attr: 'count', rule: 'inc-row' },
    ],
    [
      { attr: 'shape', rule: 'latin' },
      { attr: 'color', rule: 'const-row' },
    ],
    [
      { attr: 'color', rule: 'latin' },
      { attr: 'count', rule: 'inc' },
    ],
    [
      { attr: 'shape', rule: 'const-row' },
      { attr: 'count', rule: 'inc' },
    ],
    [
      { attr: 'shape', rule: 'latin' },
      { attr: 'color', rule: 'latin2' },
    ],
    [
      { attr: 'size', rule: 'latin' },
      { attr: 'color', rule: 'const-row' },
    ],
  ];
  return matrix3Draft(rng, pick(rng, combos));
}

/** Ma trận 2×2 “A : B = C : ?”: hàng đổi một thuộc tính, cột đổi một thuộc tính khác. */
function genMatrix2(rng: Rng): Draft {
  const attrs = pickDistinct(rng, ['shape', 'color', 'size', 'count'] as Attr[], 3) as [
    Attr,
    Attr,
    Attr,
  ];
  const [hAttr, vAttr, spare] = attrs;
  let A = glyph(pick(rng, BASE_SHAPES), pick(rng, COLORS));
  const alt = (g: Glyph, a: Attr): number | string => {
    switch (a) {
      case 'shape':
        return pick(
          rng,
          BASE_SHAPES.filter((s) => s !== g.shape),
        );
      case 'color':
        return pick(
          rng,
          COLORS.filter((c) => c !== g.color),
        );
      case 'size':
        return 2 - g.size;
      default:
        return g.count + randInt(rng, 1, 2);
    }
  };
  if (hAttr === 'size' || vAttr === 'size') A = { ...A, size: rng() < 0.5 ? 0 : 2 };
  const B = withAttr(A, hAttr, alt(A, hAttr));
  const C = withAttr(A, vAttr, alt(A, vAttr));
  const D = withAttr(B, vAttr, getAttr(C, vAttr));
  return {
    cells: [A, B, C, null],
    hole: 3,
    truth: D,
    main: [hAttr, vAttr],
    extra: [spare],
    explain: { kind: 'analogy' },
  };
}

// ---------- tìm hình khác loại ----------

function genOddOne(rng: Rng): Draft {
  const attr = pick(rng, ['shape', 'color', 'size', 'count'] as Attr[]);
  const others = (['shape', 'color', 'size'] as Attr[]).filter((a) => a !== attr);
  for (let attempt = 0; attempt < 200; attempt++) {
    const vary = shuffle(rng, others).slice(0, randInt(rng, 1, 2));
    const common = pick(
      rng,
      (attr === 'count' ? [1, 2, 3] : ATTR_POOL[attr]) as (number | string)[],
    );
    const odd = pick(
      rng,
      (attr === 'count' ? [1, 2, 3, 4] : ATTR_POOL[attr]).filter((v) => v !== common) as (
        number | string
      )[],
    );
    const baseVals: Partial<Record<Attr, number | string>> = {
      shape: pick(rng, BASE_SHAPES),
      color: pick(rng, COLORS),
      size: 1,
    };
    const items: Glyph[] = [0, 1, 2, 3].map((i) => {
      let g = glyph('circle', 0);
      for (const a of others) {
        const v = vary.includes(a) ? pick(rng, ATTR_POOL[a] as (number | string)[]) : baseVals[a];
        g = withAttr(g, a, v as number | string);
      }
      return withAttr(g, attr, i === 3 ? odd : common);
    });
    const order = shuffle(rng, [0, 1, 2, 3]);
    const shuffled = order.map((i) => items[i] as Glyph);
    const oddIndex = order.indexOf(3);
    const distinct = new Set(shuffled.map(itemKey)).size === 4;
    if (distinct && solveOdd(shuffled).join() === String(oddIndex)) {
      return {
        cells: [],
        hole: -1,
        truth: shuffled[oddIndex] as Item,
        main: [],
        extra: [],
        explain: { kind: 'odd', attr, oddIndex },
        oddItems: shuffled,
        oddIndex,
      };
    }
  }
  throw new Error('G7: không sinh được câu “khác loại” hợp lệ');
}

// ---------- đáp án nhiễu ----------

function glyphDistractors(rng: Rng, truth: Glyph, d: Draft, need: number): Glyph[] {
  const variants = (a: Attr): Glyph[] => {
    const domain = ATTR_DOMAIN[a].filter((v) => {
      if (v === truth[a]) return false;
      if (a === 'shape' && v === 'arrow' && truth.shape !== 'arrow') return false;
      if (a === 'shape' && truth.shape === 'arrow') return v === 'arrow';
      if (a === 'rot' && truth.shape !== 'arrow' && v !== 0) return false;
      return true;
    });
    return shuffle(rng, domain).map((v) => withAttr(truth, a, v));
  };
  const out: Glyph[] = [];
  const seen = new Set<string>([itemKey(truth)]);
  const take = (list: Glyph[][]): void => {
    for (let round = 0; out.length < need; round++) {
      let any = false;
      for (const l of list) {
        const g = l[round];
        if (!g) continue;
        any = true;
        if (out.length < need && !seen.has(itemKey(g))) {
          seen.add(itemKey(g));
          out.push(g);
        }
      }
      if (!any) break;
    }
  };
  take(shuffle(rng, d.main).map(variants));
  if (out.length < need) take(shuffle(rng, d.extra).map(variants));
  if (out.length < need) take((['color', 'shape', 'size', 'count'] as Attr[]).map(variants));
  return out;
}

function numDistractors(
  rng: Rng,
  truth: number,
  hints: readonly number[],
  seqNums: number[],
  need: number,
): number[] {
  const cand: number[] = [];
  for (const h of hints) cand.push(truth + h, truth - h);
  cand.push(truth + 1, truth - 1, truth + 2, truth - 2);
  cand.push(...seqNums);
  const out: number[] = [];
  const seen = new Set<number>([truth]);
  const take = (n: number): void => {
    if (out.length < need && n >= 0 && Number.isInteger(n) && !seen.has(n)) {
      seen.add(n);
      out.push(n);
    }
  };
  for (const n of shuffle(rng, cand)) take(n);
  for (let k = 3; out.length < need && k < 100; k++) {
    take(truth + k);
    take(truth - k);
  }
  return out;
}

// ---------- ghép thành câu hoàn chỉnh ----------

const GEN: Record<TypeId, (rng: Rng) => Draft> = {
  'ab-color': genAbColor,
  ab: genAbVariant('ab'),
  aab: genAbVariant('aab'),
  abb: genAbVariant('abb'),
  abc: genAbc,
  'size-alt': genSizeAlt,
  'num-step': genNumStep,
  'arrow-rot': genArrowRot,
  'two-attr': genTwoAttr,
  'num-down': genNumDown,
  'num-skip': genNumSkip,
  'grow-dots': genGrowDots,
  matrix2: genMatrix2,
  'matrix3-row': genMatrix3Row,
  'odd-one': genOddOne,
  'num-double': genNumDouble,
  'num-alt': genNumAlt,
  'matrix3-two': genMatrix3Two,
};

/** Mọi phần tử lấp được vào ô “?” của câu (theo bộ giải độc lập). Dạng `odd`: hình khác loại. */
export function solutionsOf(p: Puzzle): Item[] {
  switch (p.layout) {
    case 'seq':
      return solveSeq(p.cells, p.hole);
    case 'matrix2':
      return solveMatrix2(p.cells);
    case 'matrix3':
      return solveMatrix3(p.cells);
    case 'odd':
      return solveOdd(p.options).map((i) => p.options[i] as Item);
  }
}

/** Đáp án có thỏa quy luật không? */
export function fitsRule(p: Puzzle, candidate: Item): boolean {
  return solutionsOf(p).some((s) => itemEq(s, candidate));
}

/** Kiểm tra câu hợp lệ; trả về lý do nếu hỏng, null nếu ổn. */
export function validatePuzzle(p: Puzzle): string | null {
  const sols = solutionsOf(p);
  if (sols.length !== 1) return `có ${sols.length} lời giải`;
  const fits = (o: Item) => sols.some((s) => itemEq(s, o));
  if (p.options.filter(fits).length !== 1) return 'không đúng 1 đáp án thỏa quy luật';
  if (!fits(p.options[p.correctIndex] as Item)) return 'đáp án đúng không thỏa quy luật';
  if (new Set(p.options.map(itemKey)).size !== p.options.length) return 'đáp án trùng nhau';
  for (const o of p.options)
    if (o.kind === 'num' && (o.n < 0 || !Number.isInteger(o.n))) return 'số không hợp lệ';
  if (p.layout !== 'odd') {
    const truth = p.options[p.correctIndex] as Item;
    if (truth.kind === 'glyph') {
      for (const o of p.options) {
        if (o === truth || o.kind !== 'glyph') continue;
        if (diffAttrs(truth, o).length !== 1)
          return 'đáp án nhiễu khác đáp án đúng nhiều hơn 1 thuộc tính';
      }
    }
  }
  return null;
}

export function buildPuzzle(rng: Rng, type: TypeId, optionCount: number): Puzzle {
  const def = TYPE_DEFS[type];
  for (let attempt = 0; attempt < 300; attempt++) {
    const d = GEN[type](rng);
    let options: Item[];
    let correctIndex: number;
    if (d.oddItems) {
      options = d.oddItems;
      correctIndex = d.oddIndex as number;
    } else {
      const need = optionCount - 1;
      const dis: Item[] =
        d.truth.kind === 'glyph'
          ? glyphDistractors(rng, d.truth, d, need)
          : numDistractors(
              rng,
              d.truth.n,
              d.numHints ?? [],
              d.cells.flatMap((c) => (c && c.kind === 'num' ? [c.n] : [])),
              need,
            ).map(num);
      if (dis.length < need) continue;
      options = shuffle(rng, [d.truth, ...dis]);
      correctIndex = options.findIndex((o) => itemEq(o, d.truth));
    }
    const puzzle: Puzzle = {
      type,
      typeLevel: def.level,
      layout: def.layout,
      cells: d.cells,
      hole: d.hole,
      options,
      correctIndex,
      explain: d.explain,
    };
    if (validatePuzzle(puzzle) === null) return puzzle;
  }
  throw new Error(`G7: không sinh được câu hợp lệ cho dạng ${type}`);
}
