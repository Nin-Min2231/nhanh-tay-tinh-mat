// G6 – bộ sinh phép tính cho 14 chủ đề M01–M14 (docs/02_GAMES.md). Logic thuần, mọi random qua rng có seed.
import { pick, randInt, type Rng } from '../../app/rng';

export type Op = 'add' | 'sub' | 'mul' | 'div' | 'cmp';

/**
 * Một phép tính gốc `a op b = r`. Với `cmp`, r = dấu của (a − b): −1 (<), 0 (=), 1 (>).
 * `word` = viết dạng lời (M14: “Gấp a lên b lần”, “Giảm a đi b lần”).
 */
export interface Core {
  op: Op;
  a: number;
  b: number;
  r: number;
  word?: boolean;
}

export interface TopicDef {
  code: string;
  /** easy = phạm vi “nửa dễ” (cấp 1–3). */
  gen(rng: Rng, easy: boolean): Core;
  /** Kiểm tra phạm vi đầy đủ của chủ đề (dùng cho test và để lọc phép tính từ sổ lỗi). */
  inRange(c: Core): boolean;
  /** Cho phép dạng tìm số thiếu (`? + 8 = 15`). */
  canMiss: boolean;
  /** Luôn là dạng tìm số thiếu (M13). */
  forceMissing?: boolean;
}

// ---------- tiện ích ----------

const mk = (op: Op, a: number, b: number): Core => ({ op, a, b, r: compute(op, a, b) });

export function compute(op: Op, a: number, b: number): number {
  switch (op) {
    case 'add':
      return a + b;
    case 'sub':
      return a - b;
    case 'mul':
      return a * b;
    case 'div':
      return b === 0 ? NaN : a / b;
    case 'cmp':
      return Math.sign(a - b);
  }
}

/** Phép tính có đúng (a op b = r) và hợp lệ (số nguyên, không âm, chia hết)? */
export function isConsistent(c: Core): boolean {
  if (![c.a, c.b, c.r].every((n) => Number.isInteger(n))) return false;
  if (c.op === 'cmp') return c.r === Math.sign(c.a - c.b) && c.a >= 0 && c.b >= 0;
  if (c.a < 0 || c.b < 0 || c.r < 0) return false;
  return compute(c.op, c.a, c.b) === c.r;
}

/** Số lần “nhớ” khi cộng a + b theo cột. */
export function carries(a: number, b: number): number {
  let carry = 0;
  let count = 0;
  let x = a;
  let y = b;
  while (x > 0 || y > 0 || carry > 0) {
    const s = (x % 10) + (y % 10) + carry;
    carry = s >= 10 ? 1 : 0;
    count += carry;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
    if (x === 0 && y === 0) break;
  }
  return count;
}

/** Số lần “mượn/nhớ” khi trừ a − b theo cột (a ≥ b). */
export function borrows(a: number, b: number): number {
  let borrow = 0;
  let count = 0;
  let x = a;
  let y = b;
  while (x > 0 || y > 0) {
    const d = (x % 10) - (y % 10) - borrow;
    borrow = d < 0 ? 1 : 0;
    count += borrow;
    x = Math.floor(x / 10);
    y = Math.floor(y / 10);
  }
  return count;
}

const flip = (rng: Rng, p = 0.5): boolean => rng() < p;

// ---------- M01–M04: lớp 1 ----------

function genM01(rng: Rng, easy: boolean): Core {
  const max = easy ? 6 : 10;
  if (flip(rng)) {
    const a = randInt(rng, 1, max - 1);
    const b = randInt(rng, 1, max - a);
    return mk('add', a, b);
  }
  const a = randInt(rng, 2, max);
  return mk('sub', a, randInt(rng, 1, a - 1));
}

function genM02(rng: Rng, easy: boolean): Core {
  if (flip(rng)) {
    const a = randInt(rng, 10, easy ? 14 : 18);
    const bMax = Math.min(easy ? 5 : 9, 19 - a);
    return mk('add', a, randInt(rng, 1, bMax));
  }
  const a = randInt(rng, 11, easy ? 15 : 19);
  const u = a - 10;
  if (flip(rng, 0.7) || u < 2) return mk('sub', a, randInt(rng, 1, u)); // 17 − 5
  return mk('sub', a, randInt(rng, 10, 10 + u - 1)); // 17 − 12
}

function genM03(rng: Rng, easy: boolean): Core {
  const max = easy ? 30 : 99;
  const u = rng();
  let a: number;
  let b: number;
  if (u < 0.15) {
    a = b = randInt(rng, 1, max);
  } else if (u < 0.45) {
    // đảo chữ số: 47 ? 74
    const hi = Math.floor(max / 10);
    do {
      const d1 = randInt(rng, 1, hi);
      const d2 = randInt(rng, 1, 9);
      a = d1 * 10 + d2;
      b = d2 * 10 + d1;
    } while (a === b || a > max || b > max);
  } else if (u < 0.7) {
    // cùng chục, khác đơn vị: 52 ? 58
    const t = randInt(rng, 1, Math.floor(max / 10) - (easy ? 1 : 0));
    a = t * 10 + randInt(rng, 0, 9);
    do b = t * 10 + randInt(rng, 0, 9);
    while (b === a);
  } else {
    a = randInt(rng, 1, max);
    do b = randInt(rng, 1, max);
    while (b === a);
  }
  return mk('cmp', a, b);
}

function genM04(rng: Rng, easy: boolean): Core {
  const lim = easy ? 50 : 100;
  const op: Op = flip(rng) ? 'add' : 'sub';
  if (flip(rng, 0.4)) {
    // số tròn chục
    if (op === 'add') {
      const a = 10 * randInt(rng, 1, lim / 10 - 1);
      return mk('add', a, 10 * randInt(rng, 1, lim / 10 - a / 10));
    }
    const a = 10 * randInt(rng, 2, lim / 10);
    return mk('sub', a, 10 * randInt(rng, 1, a / 10 - 1));
  }
  // hai chữ số, không nhớ
  const tMax = Math.min(9, Math.floor((lim - 1) / 10));
  if (op === 'add') {
    const at = randInt(rng, 1, tMax - 1);
    const bt = randInt(rng, 0, Math.min(tMax - at, 9 - at));
    const au = randInt(rng, 0, 8);
    const bu = randInt(rng, bt === 0 ? 1 : 0, 9 - au);
    return mk('add', at * 10 + au, bt * 10 + bu);
  }
  const at = randInt(rng, 1, tMax);
  const bt = randInt(rng, 0, at);
  const au = randInt(rng, bt === at || bt === 0 ? 1 : 0, 9);
  const bu = randInt(rng, bt === 0 ? 1 : 0, bt === at ? au - 1 : au);
  return mk('sub', at * 10 + au, bt * 10 + bu);
}

// ---------- M05–M09: lớp 2 ----------

function genM05(rng: Rng, easy: boolean): Core {
  if (flip(rng)) {
    // cộng qua 10: 8 + 7
    const lo = 11;
    const hi = easy ? 13 : 18;
    for (;;) {
      const a = randInt(rng, 2, 9);
      const b = randInt(rng, 2, 9);
      if (a + b >= lo && a + b <= hi) return mk('add', a, b);
    }
  }
  // trừ qua 10: 15 − 9
  const a = randInt(rng, 11, easy ? 13 : 18);
  return mk('sub', a, randInt(rng, a - 10 + 1, 9));
}

function genM06(rng: Rng, easy: boolean): Core {
  const tMax = easy ? 4 : 9; // easy: số hạng ≤ 50
  if (flip(rng)) {
    for (;;) {
      const at = randInt(rng, 1, tMax);
      const bt = flip(rng, 0.15) ? 0 : randInt(rng, 1, tMax);
      const au = randInt(rng, 1, 9);
      const bu = randInt(rng, Math.max(1, 10 - au), 9);
      const a = at * 10 + au;
      const b = bt * 10 + bu;
      if (a + b <= 99 && carries(a, b) === 1 && !(easy && (a > 50 || b > 50)))
        return mk('add', a, b);
    }
  }
  for (;;) {
    const at = randInt(rng, 2, tMax);
    const bt = randInt(rng, 1, at - 1);
    const au = randInt(rng, 0, 8);
    const bu = randInt(rng, au + 1, 9);
    const a = at * 10 + au;
    const b = bt * 10 + bu;
    if (!(easy && a > 50)) return mk('sub', a, b);
  }
}

function genM07(rng: Rng, easy: boolean): Core {
  const f = pick(rng, [2, 5]);
  const n = randInt(rng, 1, easy ? 5 : 10);
  return flip(rng, 0.75) ? mk('mul', f, n) : mk('mul', n, f);
}

function genM08(rng: Rng, easy: boolean): Core {
  const f = pick(rng, [2, 5]);
  const n = randInt(rng, 1, easy ? 5 : 10);
  return mk('div', f * n, f);
}

function genM09(rng: Rng, easy: boolean): Core {
  const add = flip(rng);
  for (let i = 0; i < 400; i++) {
    if (add) {
      const hi = easy ? 300 : 899;
      const a = randInt(rng, 100, hi);
      const b = randInt(rng, 100, easy ? 300 : 999 - a);
      if (a + b <= 999 && carries(a, b) <= 1) return mk('add', a, b);
    } else {
      const a = randInt(rng, 200, easy ? 500 : 999);
      const b = randInt(rng, 100, a - 1);
      if (borrows(a, b) <= 1) return mk('sub', a, b);
    }
  }
  return add ? mk('add', 352, 129) : mk('sub', 452, 129);
}

// ---------- M10–M14: lớp 3 ----------

function genM10(rng: Rng, easy: boolean): Core {
  const hi = easy ? 6 : 9;
  const a = randInt(rng, 3, hi);
  const b = randInt(rng, 3, hi);
  return flip(rng) ? mk('mul', a, b) : mk('div', a * b, a);
}

function genM11(rng: Rng, easy: boolean): Core {
  const d = randInt(rng, 2, easy ? 4 : 9);
  if (flip(rng)) return mk('mul', randInt(rng, 11, easy ? 30 : 99), d);
  const q = randInt(rng, 11, easy ? 30 : 99);
  return mk('div', q * d, d);
}

function genM12(rng: Rng, easy: boolean): Core {
  const unit = easy ? 100 : 10;
  const lo = 1000 / unit;
  const hi = 9000 / unit;
  if (flip(rng)) {
    const a = randInt(rng, lo, hi - lo) * unit;
    return mk('add', a, randInt(rng, lo, Math.min(hi, Math.floor((9990 - a) / unit))) * unit);
  }
  const a = randInt(rng, 2 * lo, hi) * unit;
  return mk('sub', a, randInt(rng, lo, a / unit - lo) * unit);
}

function genM13(rng: Rng, easy: boolean): Core {
  const u = rng();
  const hi = easy ? 5 : 9;
  if (u < 0.35) return mk('mul', randInt(rng, 2, hi), randInt(rng, 2, hi));
  if (u < 0.6) {
    const d = randInt(rng, 2, hi);
    return mk('div', d * randInt(rng, 2, hi), d);
  }
  const lim = easy ? 50 : 99;
  if (u < 0.8) {
    const a = randInt(rng, 11, lim - 10);
    return mk('add', a, randInt(rng, 2, lim - a));
  }
  const a = randInt(rng, 21, lim);
  return mk('sub', a, randInt(rng, 2, a - 10));
}

function genM14(rng: Rng, easy: boolean): Core {
  const hi = easy ? 5 : 9;
  const x = randInt(rng, 2, easy ? 6 : 10);
  const times = randInt(rng, 2, hi);
  if (flip(rng)) return { ...mk('mul', x, times), word: true }; // Gấp x lên `times` lần
  return { ...mk('div', x * times, times), word: true }; // Giảm x·times đi `times` lần
}

// ---------- kiểm tra phạm vi đầy đủ ----------

const inRng = (n: number, lo: number, hi: number) => n >= lo && n <= hi;
const isOp = (c: Core, ...ops: Op[]) => ops.includes(c.op);

const RANGE: Record<string, (c: Core) => boolean> = {
  M01: (c) => isOp(c, 'add', 'sub') && inRng(c.a, 1, 10) && inRng(c.b, 1, 10) && inRng(c.r, 1, 10),
  M02: (c) =>
    isOp(c, 'add', 'sub') &&
    inRng(c.a, 1, 19) &&
    inRng(c.b, 1, 19) &&
    inRng(c.r, 1, 20) &&
    (c.op === 'add' ? carries(c.a, c.b) === 0 : borrows(c.a, c.b) === 0),
  M03: (c) => c.op === 'cmp' && inRng(c.a, 0, 100) && inRng(c.b, 0, 100),
  M04: (c) =>
    isOp(c, 'add', 'sub') &&
    inRng(c.a, 1, 100) &&
    inRng(c.b, 1, 100) &&
    inRng(c.r, 1, 100) &&
    // số tròn chục (100 − 70) hoặc hai chữ số không nhớ
    ((c.a % 10 === 0 && c.b % 10 === 0) ||
      (c.op === 'add' ? carries(c.a, c.b) === 0 : borrows(c.a, c.b) === 0)),
  M05: (c) =>
    (c.op === 'add' && inRng(c.a, 2, 9) && inRng(c.b, 2, 9) && inRng(c.r, 11, 18)) ||
    (c.op === 'sub' && inRng(c.a, 11, 18) && inRng(c.b, 2, 9) && c.b > c.a - 10),
  M06: (c) =>
    (c.op === 'add' && inRng(c.r, 1, 99) && carries(c.a, c.b) === 1 && c.a >= 10 && c.b >= 1) ||
    (c.op === 'sub' && inRng(c.a, 11, 99) && inRng(c.r, 1, 99) && borrows(c.a, c.b) === 1),
  M07: (c) =>
    c.op === 'mul' &&
    (([2, 5].includes(c.a) && inRng(c.b, 1, 10)) || ([2, 5].includes(c.b) && inRng(c.a, 1, 10))),
  M08: (c) => c.op === 'div' && [2, 5].includes(c.b) && inRng(c.r, 1, 10),
  M09: (c) =>
    isOp(c, 'add', 'sub') &&
    inRng(c.a, 100, 999) &&
    inRng(c.b, 100, 999) &&
    inRng(c.r, 1, 999) &&
    (c.op === 'add' ? carries(c.a, c.b) <= 1 : borrows(c.a, c.b) <= 1),
  M10: (c) =>
    (c.op === 'mul' && inRng(c.a, 3, 9) && inRng(c.b, 3, 9)) ||
    (c.op === 'div' && inRng(c.b, 3, 9) && inRng(c.r, 3, 9)),
  M11: (c) =>
    (c.op === 'mul' && inRng(c.a, 10, 99) && inRng(c.b, 2, 9) && c.r <= 999) ||
    (c.op === 'div' && inRng(c.b, 2, 9) && inRng(c.r, 10, 99) && c.a <= 999),
  M12: (c) =>
    isOp(c, 'add', 'sub') &&
    inRng(c.a, 1000, 9990) &&
    inRng(c.b, 1000, 9990) &&
    inRng(c.r, 1, 9999) &&
    c.a % 10 === 0 &&
    c.b % 10 === 0,
  M13: (c) =>
    isOp(c, 'add', 'sub', 'mul', 'div') &&
    inRng(c.a, 2, 99) &&
    inRng(c.b, 2, 99) &&
    inRng(c.r, 2, 99),
  M14: (c) =>
    (c.op === 'mul' && inRng(c.a, 2, 10) && inRng(c.b, 2, 9)) ||
    (c.op === 'div' && inRng(c.b, 2, 9) && inRng(c.r, 2, 10)),
};

const GEN: Record<string, (rng: Rng, easy: boolean) => Core> = {
  M01: genM01,
  M02: genM02,
  M03: genM03,
  M04: genM04,
  M05: genM05,
  M06: genM06,
  M07: genM07,
  M08: genM08,
  M09: genM09,
  M10: genM10,
  M11: genM11,
  M12: genM12,
  M13: genM13,
  M14: genM14,
};

const NO_MISS = new Set(['M03', 'M13', 'M14']);

export const TOPICS: Record<string, TopicDef> = Object.fromEntries(
  Object.keys(GEN).map((code) => [
    code,
    {
      code,
      gen: GEN[code] as (rng: Rng, easy: boolean) => Core,
      inRange: (c: Core) => isConsistent(c) && (RANGE[code] as (c: Core) => boolean)(c),
      canMiss: !NO_MISS.has(code),
      forceMissing: code === 'M13',
    } satisfies TopicDef,
  ]),
);

/** Chủ đề đầu tiên chứa phép tính này (dùng để lọc câu từ sổ lỗi theo chủ đề đang bật). */
export function topicOfCore(core: Core, enabled: readonly string[]): string | null {
  for (const code of enabled) if (TOPICS[code]?.inRange(core)) return code;
  return null;
}

// ---------- khóa phép tính (sổ lỗi) ----------

/** Khóa chuẩn hóa: "8+7", "15-9", "7x8", "35:5", "47?74". */
export function factKey(c: Core): string {
  const sym = { add: '+', sub: '-', mul: 'x', div: ':', cmp: '?' }[c.op];
  return `${c.a}${sym}${c.b}`;
}

/** Khôi phục phép tính từ khóa (null nếu khóa không hợp lệ). */
export function coreFromKey(key: string): Core | null {
  const m = /^(\d+)([+\-x:?])(\d+)$/.exec(key);
  if (!m) return null;
  const a = Number(m[1]);
  const b = Number(m[3]);
  const op = ({ '+': 'add', '-': 'sub', x: 'mul', ':': 'div', '?': 'cmp' } as const)[
    m[2] as '+' | '-' | 'x' | ':' | '?'
  ];
  const c = mk(op, a, b);
  return isConsistent(c) ? c : null;
}
