import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../app/rng';
import type { MathFact } from '../../app/types';
import { levelsConfig } from '../levels';
import {
  QUESTIONS_PER_ROUND,
  parseEasyRange,
  parseMissing,
  readG6Options,
  resolveG6Params,
  resolveG6Topics,
} from './config';
import { G6Rules, MAX_DUE_PER_ROUND } from './logic';
import {
  buildQuestion,
  cmpSymbol,
  columnModel,
  formatNumber,
  illustrationFor,
  type MathQuestion,
} from './question';
import {
  TOPICS,
  borrows,
  carries,
  compute,
  coreFromKey,
  factKey,
  isConsistent,
  topicOfCore,
  type Core,
} from './topics';

const CODES = Object.keys(TOPICS);
const N = 1000;

/** Thay giá trị `v` vào chỗ “?” rồi kiểm tra phép tính có đúng không. */
function satisfies(q: MathQuestion, v: number): boolean {
  const { core, hidden } = q;
  if (core.op === 'cmp') return Math.sign(core.a - core.b) === v;
  const a = hidden === 'a' ? v : core.a;
  const b = hidden === 'b' ? v : core.b;
  const r = hidden === 'r' ? v : core.r;
  return compute(core.op, a, b) === r;
}

function maxNumber(q: MathQuestion): number {
  const nums = q.core.op === 'cmp' ? [q.core.a, q.core.b] : [q.core.a, q.core.b, q.core.r];
  return Math.max(...nums);
}

describe('G6 bộ sinh câu theo chủ đề', () => {
  it('có đủ 14 chủ đề M01–M14 khớp levels.json', () => {
    expect(CODES).toEqual(levelsConfig.mathTopics.map((t) => t.code));
  });

  for (const code of CODES) {
    for (const easy of [true, false]) {
      it(`${code} ${easy ? '(nửa dễ)' : '(đầy đủ)'}: ${N} phép tính hợp lệ, trong phạm vi, không âm, chia hết`, () => {
        const def = TOPICS[code]!;
        for (let seed = 1; seed <= N; seed++) {
          const rng = mulberry32(seed * 7919 + code.charCodeAt(2));
          const c = def.gen(rng, easy);
          expect(isConsistent(c), `${code} seed ${seed}: ${JSON.stringify(c)}`).toBe(true);
          expect(def.inRange(c), `${code} seed ${seed}: ${JSON.stringify(c)}`).toBe(true);
          expect(c.a).toBeGreaterThanOrEqual(0);
          expect(c.b).toBeGreaterThanOrEqual(0);
          if (c.op !== 'cmp') expect(c.r).toBeGreaterThanOrEqual(0);
          if (c.op === 'div') expect(c.a % c.b).toBe(0);
          expect(coreFromKey(factKey(c))).toMatchObject({ op: c.op, a: c.a, b: c.b, r: c.r });
        }
      });
    }
  }

  it('“nửa dễ” nhỏ hơn đầy đủ: M06 số hạng ≤ 50, M01 trong 6, M07 nhân đến 5, M09 ≤ 500', () => {
    for (let seed = 1; seed <= 500; seed++) {
      const m06 = TOPICS.M06!.gen(mulberry32(seed), true);
      expect(Math.max(m06.a, m06.b)).toBeLessThanOrEqual(50);
      const m01 = TOPICS.M01!.gen(mulberry32(seed), true);
      expect(Math.max(m01.a, m01.b, m01.r)).toBeLessThanOrEqual(6);
      const m07 = TOPICS.M07!.gen(mulberry32(seed), true);
      expect(Math.max(m07.a, m07.b)).toBeLessThanOrEqual(5);
      const m09 = TOPICS.M09!.gen(mulberry32(seed), true);
      expect(maxNumber({ core: m09 } as MathQuestion)).toBeLessThanOrEqual(600);
    }
  });

  it('M02 không nhớ; M05 có nhớ qua 10; M06 có nhớ đúng 1 lần; M09 nhớ ≤ 1 lần', () => {
    for (let seed = 1; seed <= 500; seed++) {
      const m02 = TOPICS.M02!.gen(mulberry32(seed), false);
      expect(m02.op === 'add' ? carries(m02.a, m02.b) : borrows(m02.a, m02.b)).toBe(0);
      const m05 = TOPICS.M05!.gen(mulberry32(seed), false);
      if (m05.op === 'add') expect(m05.r).toBeGreaterThanOrEqual(11);
      else expect(m05.a % 10).toBeLessThan(m05.b);
      const m06 = TOPICS.M06!.gen(mulberry32(seed), false);
      expect(m06.op === 'add' ? carries(m06.a, m06.b) : borrows(m06.a, m06.b)).toBe(1);
      const m09 = TOPICS.M09!.gen(mulberry32(seed), false);
      expect(m09.op === 'add' ? carries(m09.a, m09.b) : borrows(m09.a, m09.b)).toBeLessThanOrEqual(
        1,
      );
    }
  });

  it('M03: có đủ >, <, = và có cặp đảo chữ số', () => {
    const seen = new Set<number>();
    let reversal = 0;
    for (let seed = 1; seed <= 600; seed++) {
      const c = TOPICS.M03!.gen(mulberry32(seed), false);
      seen.add(c.r);
      if (
        c.a !== c.b &&
        c.a >= 10 &&
        c.b >= 10 &&
        c.a % 10 === Math.floor(c.b / 10) &&
        c.b % 10 === Math.floor(c.a / 10)
      )
        reversal++;
    }
    expect(seen).toEqual(new Set([-1, 0, 1]));
    expect(reversal).toBeGreaterThan(50);
  });

  it('M07 chỉ nhân với 2 hoặc 5; M08 chỉ chia cho 2 (không còn chia cho 5)', () => {
    const divisors = new Set<number>();
    const quotients = new Set<number>();
    for (let seed = 1; seed <= 400; seed++) {
      const m07 = TOPICS.M07!.gen(mulberry32(seed), false);
      expect([m07.a, m07.b].some((n) => n === 2 || n === 5)).toBe(true);
      const m08 = TOPICS.M08!.gen(mulberry32(seed), false);
      expect(m08.op).toBe('div');
      expect(m08.b).toBe(2);
      divisors.add(m08.b);
      quotients.add(m08.r);
    }
    expect([...divisors]).toEqual([2]);
    // đủ cả bảng chia 2: 2 : 2 … 20 : 2
    expect([...quotients].sort((x, y) => x - y)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
  });

  it('phép chia cho 5 (vd 35 : 5) không còn thuộc chủ đề nào của Lớp 2', () => {
    const c = coreFromKey('35:5')!;
    expect(isConsistent(c)).toBe(true);
    expect(TOPICS.M08!.inRange(c)).toBe(false);
    expect(topicOfCore(c, levelsConfig.mathDefaultByGrade['2'])).toBeNull();
  });

  it('M09 (cộng, trừ trong phạm vi 1000) thuộc Lớp 3, không còn trong chủ đề Lớp 2', () => {
    const m09 = levelsConfig.mathTopics.find((t) => t.code === 'M09')!;
    expect(m09.grade).toBe(3);
    expect(levelsConfig.mathDefaultByGrade['2']).not.toContain('M09');
    expect(levelsConfig.mathDefaultByGrade['3']).toContain('M09');
  });

  it('M14 viết dạng lời (word) và không có dạng tìm số thiếu; M13 luôn là tìm số thiếu', () => {
    expect(TOPICS.M14!.canMiss).toBe(false);
    expect(TOPICS.M13!.forceMissing).toBe(true);
    expect(TOPICS.M03!.canMiss).toBe(false);
    for (let seed = 1; seed <= 100; seed++) {
      expect(TOPICS.M14!.gen(mulberry32(seed), false).word).toBe(true);
      const q = buildQuestion(mulberry32(seed), 'M13', TOPICS.M13!.gen(mulberry32(seed), false), {
        optionCount: 4,
        missingRatio: 0,
      });
      expect(q.hidden).not.toBe('r');
    }
  });
});

describe('G6 đáp án và đáp án nhiễu', () => {
  for (const code of CODES) {
    for (const optionCount of [3, 4, 6]) {
      it(`${code} với ${optionCount} đáp án: ${N} câu luôn đúng 1 đáp án thỏa, nhiễu không trùng`, () => {
        const def = TOPICS[code]!;
        for (let seed = 1; seed <= N; seed++) {
          const rng = mulberry32(seed * 104729 + optionCount);
          const core = def.gen(rng, seed % 3 === 0);
          const q = buildQuestion(rng, code, core, { optionCount, missingRatio: 0.4 });
          const want = core.op === 'cmp' ? 3 : optionCount;
          expect(q.options).toHaveLength(want);
          expect(new Set(q.options).size).toBe(want); // không trùng
          expect(q.options[q.correctIndex]).toBe(q.answer);
          expect(q.options.filter((o) => satisfies(q, o))).toHaveLength(1); // đúng 1 đáp án thỏa
          if (core.op === 'cmp') {
            expect([...q.options].sort()).toEqual([-1, 0, 1]);
          } else {
            expect(q.options.every((o) => Number.isInteger(o) && o >= 0)).toBe(true);
          }
        }
      });
    }
  }

  it('M11: số thiếu không bao giờ quá 99 (không ra `? : 5 = 57` → 285), nhưng vẫn có dạng tìm số thiếu', () => {
    expect(TOPICS.M11!.maxMissing).toBe(99);
    let missing = 0;
    let big = 0;
    const kinds = new Set<string>();
    for (let seed = 1; seed <= 4000; seed++) {
      const rng = mulberry32(seed * 7919);
      const core = TOPICS.M11!.gen(rng, seed % 3 === 0);
      const q = buildQuestion(rng, 'M11', core, { optionCount: 4, missingRatio: 0.4 });
      if (q.hidden === 'r') continue;
      missing++;
      kinds.add(`${core.op}-${q.hidden}`);
      if (q.answer > 99) big++;
      expect(q.options.filter((o) => satisfies(q, o))).toHaveLength(1); // vẫn đúng 1 đáp án
    }
    expect(big).toBe(0);
    expect(missing).toBeGreaterThan(300); // vẫn xuất hiện thường xuyên (≈ 40% × phần câu còn được ẩn)
    // vẫn đủ các dạng: nhân (ẩn thừa số thứ nhất/thứ hai), chia (ẩn số chia; ẩn số bị chia khi nó ≤ 99, vd `22 : 2`)
    for (const k of ['mul-a', 'mul-b', 'div-b']) expect(kinds.has(k), k).toBe(true);
  });

  it('chủ đề khác M11 không bị giới hạn số thiếu (vd M09 vẫn ra số thiếu 3 chữ số)', () => {
    expect(TOPICS.M09!.maxMissing).toBeUndefined();
    let big = 0;
    for (let seed = 1; seed <= 600; seed++) {
      const rng = mulberry32(seed);
      const q = buildQuestion(rng, 'M09', TOPICS.M09!.gen(rng, false), {
        optionCount: 4,
        missingRatio: 0.4,
      });
      if (q.hidden !== 'r' && q.answer > 99) big++;
    }
    expect(big).toBeGreaterThan(50);
  });

  it('dạng tìm số thiếu xuất hiện đúng tỷ lệ ~30% (M05, 3000 câu)', () => {
    let missing = 0;
    const total = 3000;
    for (let seed = 1; seed <= total; seed++) {
      const rng = mulberry32(seed);
      const q = buildQuestion(rng, 'M05', TOPICS.M05!.gen(rng, false), {
        optionCount: 4,
        missingRatio: 0.3,
      });
      if (q.hidden !== 'r') missing++;
    }
    expect(Math.abs(missing / total - 0.3)).toBeLessThan(0.03);
  });

  it('không có dạng tìm số thiếu khi tỷ lệ = 0 (cấp 1–7)', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const rng = mulberry32(seed);
      const q = buildQuestion(rng, 'M06', TOPICS.M06!.gen(rng, false), {
        optionCount: 4,
        missingRatio: 0,
      });
      expect(q.hidden).toBe('r');
    }
  });

  it('đáp án nhiễu hợp lý: phần lớn nằm gần đáp án (±1, ±2, ±10, đảo chữ số, phép nhầm)', () => {
    let near = 0;
    let all = 0;
    for (let seed = 1; seed <= 1500; seed++) {
      const rng = mulberry32(seed);
      const q = buildQuestion(rng, 'M05', TOPICS.M05!.gen(rng, false), {
        optionCount: 4,
        missingRatio: 0,
      });
      for (const o of q.options) {
        if (o === q.answer) continue;
        all++;
        if (Math.abs(o - q.answer) <= 10) near++;
      }
    }
    expect(near / all).toBeGreaterThan(0.8);
  });

  it('M06: có đáp án lỗi quên nhớ (±10) và đảo chữ số', () => {
    let tenOff = 0;
    let swapped = 0;
    for (let seed = 1; seed <= 600; seed++) {
      const rng = mulberry32(seed);
      const q = buildQuestion(rng, 'M06', TOPICS.M06!.gen(rng, false), {
        optionCount: 6,
        missingRatio: 0,
      });
      for (const o of q.options) {
        if (Math.abs(o - q.answer) === 10) tenOff++;
        const swap = (q.answer % 10) * 10 + Math.floor(q.answer / 10);
        if (o === swap && o !== q.answer) swapped++;
      }
    }
    expect(tenOff).toBeGreaterThan(100);
    expect(swapped).toBeGreaterThan(50);
  });

  it('phép nhân hiện đáp án a×(b±1) làm nhiễu', () => {
    let hits = 0;
    for (let seed = 1; seed <= 400; seed++) {
      const rng = mulberry32(seed);
      const core: Core = { op: 'mul', a: 7, b: 8, r: 56 };
      const q = buildQuestion(rng, 'M10', core, { optionCount: 6, missingRatio: 0 });
      if ([48, 49, 63, 64].some((n) => q.options.includes(n))) hits++;
    }
    expect(hits).toBe(400);
  });

  it('theo seed: cùng seed cho cùng câu hỏi', () => {
    const make = (seed: number) => {
      const rng = mulberry32(seed);
      return buildQuestion(rng, 'M06', TOPICS.M06!.gen(rng, false), {
        optionCount: 4,
        missingRatio: 0.3,
      });
    };
    expect(make(42)).toEqual(make(42));
    expect(make(42)).not.toEqual(make(43));
  });

  it('vị trí đáp án đúng ngẫu nhiên đều giữa các ô', () => {
    const counts = [0, 0, 0, 0];
    const total = 4000;
    for (let seed = 1; seed <= total; seed++) {
      const rng = mulberry32(seed);
      const q = buildQuestion(rng, 'M02', TOPICS.M02!.gen(rng, false), {
        optionCount: 4,
        missingRatio: 0,
      });
      counts[q.correctIndex]!++;
    }
    counts.forEach((n) => expect(Math.abs(n / total - 0.25)).toBeLessThan(0.03));
  });
});

describe('G6 hình minh họa khi sai', () => {
  it('cộng/trừ trong 20 → khung 10 ô; số lớn → đặt tính dọc', () => {
    expect(illustrationFor({ op: 'add', a: 8, b: 7, r: 15 })).toMatchObject({
      kind: 'frames',
      op: 'add',
    });
    expect(illustrationFor({ op: 'sub', a: 15, b: 9, r: 6 })).toMatchObject({
      kind: 'frames',
      op: 'sub',
    });
    expect(illustrationFor({ op: 'add', a: 38, b: 27, r: 65 })).toMatchObject({
      kind: 'column',
      op: 'add',
    });
    expect(illustrationFor({ op: 'sub', a: 352, b: 129, r: 223 })).toMatchObject({
      kind: 'column',
      op: 'sub',
    });
  });

  it('nhân/chia → lưới chấm hàng × cột; số lớn → đặt tính dọc', () => {
    expect(illustrationFor({ op: 'mul', a: 7, b: 8, r: 56 })).toEqual({
      kind: 'grid',
      rows: 7,
      cols: 8,
    });
    expect(illustrationFor({ op: 'div', a: 35, b: 5, r: 7 })).toEqual({
      kind: 'grid',
      rows: 5,
      cols: 7,
    });
    expect(illustrationFor({ op: 'mul', a: 4, b: 3, r: 12, word: true })).toEqual({
      kind: 'grid',
      rows: 3,
      cols: 4,
    });
    expect(illustrationFor({ op: 'mul', a: 23, b: 4, r: 92 })).toMatchObject({
      kind: 'column',
      op: 'mul',
      a: 23,
      b: 4,
    });
    expect(illustrationFor({ op: 'div', a: 84, b: 4, r: 21 })).toMatchObject({
      kind: 'column',
      op: 'mul',
      a: 21,
      b: 4,
      r: 84,
      check: true,
    });
  });

  it('so sánh → khối chục/đơn vị', () => {
    expect(illustrationFor({ op: 'cmp', a: 47, b: 74, r: -1 })).toEqual({
      kind: 'blocks',
      a: 47,
      b: 74,
    });
  });

  it('mọi phép tính sinh ra đều có hình minh họa phù hợp', () => {
    for (const code of CODES) {
      for (let seed = 1; seed <= 200; seed++) {
        const c = TOPICS[code]!.gen(mulberry32(seed), false);
        const ill = illustrationFor(c);
        if (ill.kind === 'grid') {
          expect(ill.rows).toBeLessThanOrEqual(10);
          expect(ill.cols).toBeLessThanOrEqual(10);
        }
        if (ill.kind === 'frames') expect(Math.max(c.a, c.b, c.r)).toBeLessThanOrEqual(20);
      }
    }
  });
});

describe('G6 đặt tính dọc có tô chữ số nhớ', () => {
  it('38 + 27: nhớ 1 ở cột chục, kết quả 65', () => {
    const m = columnModel('add', 38, 27);
    expect(m.result).toEqual([6, 5]);
    expect(m.carry).toEqual([1, 0]);
    expect(m.carryAbove).toBe('top');
  });

  it('352 + 129: nhớ 1 từ hàng đơn vị sang hàng chục, hàng chục không nhớ tiếp', () => {
    const m = columnModel('add', 352, 129);
    expect(m.result).toEqual([4, 8, 1]);
    expect(m.carry).toEqual([0, 1, 0]);
  });

  it('72 − 45: nhớ 1 ở số trừ cột chục (cách trừ nhớ), kết quả 27', () => {
    const m = columnModel('sub', 72, 45);
    expect(m.result).toEqual([2, 7]);
    expect(m.carry).toEqual([1, 0]);
    expect(m.carryAbove).toBe('bottom');
  });

  it('23 × 4: nhớ 1 ở cột chục, kết quả 92', () => {
    const m = columnModel('mul', 23, 4);
    expect(m.result).toEqual([9, 2]);
    expect(m.carry).toEqual([1, 0]);
    expect(m.bottom).toEqual([null, 4]);
  });

  it('kết quả dài hơn số hạng vẫn căn phải đúng: 95 + 18 = 113', () => {
    const m = columnModel('add', 95, 18);
    expect(m.width).toBe(3);
    expect(m.top).toEqual([null, 9, 5]);
    expect(m.result).toEqual([1, 1, 3]);
  });

  it('chữ số kết quả luôn ghép lại đúng phép tính (1.000 phép)', () => {
    for (let seed = 1; seed <= N; seed++) {
      const code = ['M06', 'M09', 'M11', 'M12'][seed % 4]!;
      const c = TOPICS[code]!.gen(mulberry32(seed), false);
      const ill = illustrationFor(c);
      if (ill.kind !== 'column') continue;
      const m = columnModel(ill.op, ill.a, ill.b);
      expect(Number(m.result.join(''))).toBe(
        ill.op === 'add' ? ill.a + ill.b : ill.op === 'sub' ? ill.a - ill.b : ill.a * ill.b,
      );
    }
  });
});

describe('G6 luật lượt chơi', () => {
  const lvl = (level: number) => resolveG6Params(level);
  const make = (
    seed: number,
    level = 5,
    topics = ['M02', 'M05', 'M06', 'M07', 'M08'],
    facts: Record<string, MathFact> = {},
  ) => new G6Rules(mulberry32(seed), lvl(level), topics, facts);

  it('mỗi lượt đúng 10 câu, thuộc chủ đề đã bật, không trùng phép tính', () => {
    for (let seed = 1; seed <= 200; seed++) {
      const g = make(seed);
      const qs = g.questions();
      expect(qs).toHaveLength(QUESTIONS_PER_ROUND);
      for (const q of qs) expect(['M02', 'M05', 'M06', 'M07', 'M08']).toContain(q.topic);
      expect(new Set(qs.map((q) => q.key)).size).toBe(10);
    }
  });

  it('chỉ bật một chủ đề thì tất cả câu thuộc chủ đề đó', () => {
    const g = make(3, 5, ['M07']);
    expect(g.questions().every((q) => q.topic === 'M07')).toBe(true);
  });

  it('trả lời đúng cả 10 → score 1, accuracy 1, không timeout', () => {
    const g = make(5);
    while (!g.done) {
      g.answer(g.current().correctIndex, 2000);
      g.next();
    }
    expect(g.score).toBe(1);
    expect(g.metrics(0)).toMatchObject({
      accuracy: 1,
      avgTimeMs: 2000,
      timeouts: 0,
      masteredCount: 0,
    });
  });

  it('hết giờ (null) tính là sai, đếm timeouts, không ảnh hưởng câu khác', () => {
    const g = make(6);
    const out = g.answer(null, 15000);
    expect(out).toMatchObject({ correct: false, timedOut: true });
    g.next();
    g.answer(g.current().correctIndex, 1000);
    expect(g.timeouts).toBe(1);
    expect(g.correctCount).toBe(1);
    expect(g.score).toBeCloseTo(0.1, 10);
  });

  it('câu sai được chèn lại sau 2–4 câu, vẫn đủ 10 câu, cùng phép tính', () => {
    for (let seed = 1; seed <= 300; seed++) {
      const g = make(seed);
      g.answer((g.current().correctIndex + 1) % g.current().options.length, 1000); // sai câu 0
      // câu 0 là câu sinh mới: được chèn lại
      const key = g.questions()[0]!.key;
      const at = g.questions().findIndex((q, i) => i > 0 && q.key === key);
      expect(at).toBeGreaterThanOrEqual(2);
      expect(at).toBeLessThanOrEqual(4);
      expect(g.questions()[at]!.retry).toBe(true);
      expect(g.questions()).toHaveLength(10);
    }
  });

  it('sai câu hỏi lại lần nữa thì không chèn lại nữa (tối đa 1 lần/lượt)', () => {
    const g = make(11);
    const wrong = () => g.answer((g.current().correctIndex + 1) % g.current().options.length, 500);
    const first = wrong();
    expect(first.retryAt).not.toBeNull();
    const target = first.retryAt as number;
    while (g.index < target) g.next(); // đứng tại câu hỏi lại
    expect(g.current().retry).toBe(true);
    expect(wrong().retryAt).toBeNull();
  });

  it('sai ở 2 câu cuối: không còn chỗ chèn (retryAt = null)', () => {
    const g = make(12);
    for (let i = 0; i < 8; i++) {
      g.answer(g.current().correctIndex, 100);
      g.next();
    }
    expect(g.answer(null, 15000).retryAt).toBeNull();
    g.next();
    expect(g.answer(null, 15000).retryAt).toBeNull();
  });

  it('không chèn đè lên câu hỏi lại khác', () => {
    const g = make(13);
    g.answer(null, 1); // sai câu 0 → chèn lại ở 2..4
    g.next();
    const second = g.answer(null, 1); // sai câu 1 → chèn lại ở 3..5
    expect(second.retryAt).not.toBeNull();
    const retries = g
      .questions()
      .map((q, i) => (q.retry ? i : -1))
      .filter((i) => i >= 0);
    expect(new Set(retries).size).toBe(retries.length);
    expect(retries.length).toBe(2);
  });

  it('sổ lỗi: tối đa 2 câu đầu lượt sau là phép tính từng sai (chưa thuộc)', () => {
    const facts: Record<string, MathFact> = {
      '8+7': { seen: 2, correct: 0, streak: 0, lastSeenRound: 1, mastered: false },
      '15-9': { seen: 1, correct: 0, streak: 0, lastSeenRound: 2, mastered: false },
      '7+6': { seen: 1, correct: 0, streak: 0, lastSeenRound: 3, mastered: false },
      '9+9': { seen: 5, correct: 2, streak: 3, lastSeenRound: 3, mastered: true },
    };
    const g = make(21, 5, ['M05'], facts);
    const qs = g.questions();
    expect(MAX_DUE_PER_ROUND).toBe(2);
    expect(qs[0]!.key).toBe('8+7');
    expect(qs[1]!.key).toBe('15-9');
    expect(qs[0]!.retry && qs[1]!.retry).toBe(true);
    expect(qs.slice(2).some((q) => q.key === '7+6' && q.retry)).toBe(false);
    expect(qs[2]!.retry).toBe(false);
  });

  it('sổ lỗi: phép tính ngoài chủ đề đang bật bị bỏ qua; đã thuộc không hỏi lại ở đầu lượt', () => {
    const facts: Record<string, MathFact> = {
      '7x8': { seen: 1, correct: 0, streak: 0, lastSeenRound: 1, mastered: false }, // M10, không bật
      '8+7': { seen: 2, correct: 1, streak: 3, lastSeenRound: 1, mastered: true },
    };
    const g = make(22, 5, ['M05'], facts);
    expect(
      g
        .questions()
        .slice(0, 2)
        .every((q) => !q.retry),
    ).toBe(true);
    expect(g.questions().some((q) => q.key === '7x8')).toBe(false);
  });

  it('sổ lỗi cũ có phép chia cho 5 (35:5): không hỏi lại ở chủ đề Lớp 2, chia cho 2 (14:2) vẫn hỏi lại', () => {
    const facts: Record<string, MathFact> = {
      '35:5': { seen: 2, correct: 0, streak: 0, lastSeenRound: 1, mastered: false },
      '14:2': { seen: 1, correct: 0, streak: 0, lastSeenRound: 2, mastered: false },
    };
    for (let seed = 1; seed <= 50; seed++) {
      const qs = make(seed, 5, ['M07', 'M08'], facts).questions();
      expect(qs.some((q) => q.key === '35:5')).toBe(false);
      expect(qs[0]!.key).toBe('14:2');
      expect(qs[0]!.retry).toBe(true);
    }
  });

  it('factResults theo đúng thứ tự trả lời; metrics có accuracy, avgTimeMs, timeouts, masteredCount', () => {
    const g = make(30);
    g.answer(g.current().correctIndex, 3000);
    const k0 = g.questions()[0]!.key;
    g.next();
    g.answer(null, 15000);
    const k1 = g.questions()[1]!.key;
    expect(g.factResults()).toEqual([
      { key: k0, correct: true },
      { key: k1, correct: false },
    ]);
    expect(g.metrics(2)).toMatchObject({
      accuracy: 0.5,
      avgTimeMs: 3000,
      timeouts: 1,
      masteredCount: 2,
    });
  });

  it('theo seed: cùng seed cho cùng cả lượt', () => {
    expect(make(77).questions()).toEqual(make(77).questions());
  });

  it('cấp 8–10 có dạng tìm số thiếu, cấp 1–7 thì không', () => {
    const missing = (level: number) => {
      let n = 0;
      for (let seed = 1; seed <= 200; seed++)
        n += make(seed, level)
          .questions()
          .filter((q) => q.hidden !== 'r').length;
      return n;
    };
    // M13 không có trong chủ đề mặc định lớp 2 nên cấp ≤ 7 chắc chắn không có
    expect(missing(7)).toBe(0);
    expect(missing(8)).toBeGreaterThan(0);
    expect(missing(10) / 2000).toBeGreaterThan(0.3);
  });

  it('số đáp án theo cấp: 3/4/6 (M03 luôn 3)', () => {
    expect(
      make(1, 1)
        .questions()
        .every((q) => q.options.length === 3),
    ).toBe(true);
    expect(
      make(1, 5)
        .questions()
        .every((q) => q.options.length === 4),
    ).toBe(true);
    expect(
      make(1, 9)
        .questions()
        .every((q) => q.options.length === 6),
    ).toBe(true);
    expect(
      make(1, 9, ['M03'])
        .questions()
        .every((q) => q.options.length === 3),
    ).toBe(true);
  });

  it('M13 luôn là dạng tìm số thiếu kể cả cấp thấp', () => {
    const g = make(2, 1, ['M13']);
    expect(g.questions().every((q) => q.hidden !== 'r')).toBe(true);
  });

  it('không có chủ đề → báo lỗi rõ ràng', () => {
    expect(() => make(1, 5, [])).toThrow();
  });
});

describe('G6 cấu hình', () => {
  it('đọc bảng cấp độ từ levels.json', () => {
    expect(resolveG6Params(1)).toEqual({
      secPerQ: 15,
      options: 3,
      sway: false,
      missingRatio: 0,
      easy: true,
    });
    expect(resolveG6Params(4)).toEqual({
      secPerQ: 11,
      options: 4,
      sway: false,
      missingRatio: 0,
      easy: false,
    });
    expect(resolveG6Params(7)).toMatchObject({ secPerQ: 8, sway: true, missingRatio: 0 });
    expect(resolveG6Params(8)).toMatchObject({
      secPerQ: 7,
      options: 6,
      sway: false,
      missingRatio: 0.2,
    });
    expect(resolveG6Params(9)).toMatchObject({ missingRatio: 0.3, sway: true });
    expect(resolveG6Params(10)).toEqual({
      secPerQ: 5,
      options: 6,
      sway: true,
      missingRatio: 0.4,
      easy: false,
    });
  });

  it('cấp 1–3 là “nửa dễ”, từ cấp 4 là đầy đủ', () => {
    for (let l = 1; l <= 10; l++) expect(resolveG6Params(l).easy).toBe(l <= 3);
  });

  it('parseMissing / parseEasyRange', () => {
    expect(parseMissing('40% câu')).toBe(0.4);
    expect(parseMissing(false)).toBe(0);
    expect(parseEasyRange('Nhỏ (nửa dễ)')).toBe(true);
    expect(parseEasyRange('Đầy đủ')).toBe(false);
  });

  it('tùy chọn phụ huynh: bỏ giá trị lạ, mặc định theo hồ sơ', () => {
    expect(readG6Options(undefined)).toEqual({ topics: null, grade: null, timer: 'auto' });
    expect(readG6Options({ topics: ['M01', 'X9', 3], grade: '3', timer: 'off' })).toEqual({
      topics: ['M01'],
      grade: 3,
      timer: 'off',
    });
    expect(readG6Options({ topics: [], grade: 9 })).toEqual({
      topics: null,
      grade: null,
      timer: 'auto',
    });
  });

  it('chủ đề: topics > grade > hồ sơ > mặc định lớp', () => {
    const profile = { grade: 2 as const, mathTopics: ['M02', 'M05'] };
    expect(resolveG6Topics({ topics: ['M10'], grade: 1, timer: 'auto' }, profile)).toEqual(['M10']);
    expect(resolveG6Topics({ topics: null, grade: 1, timer: 'auto' }, profile)).toEqual([
      'M01',
      'M02',
      'M03',
      'M04',
    ]);
    expect(resolveG6Topics({ topics: null, grade: null, timer: 'auto' }, profile)).toEqual([
      'M02',
      'M05',
    ]);
    expect(
      resolveG6Topics({ topics: null, grade: null, timer: 'auto' }, { grade: 2, mathTopics: [] }),
    ).toEqual(['M02', 'M05', 'M06', 'M07', 'M08']);
  });

  it('định dạng số và ký hiệu so sánh', () => {
    expect(formatNumber(7)).toBe('7');
    expect(formatNumber(2450)).toBe('2 450');
    expect(formatNumber(10000)).toBe('10 000');
    expect([cmpSymbol(-1), cmpSymbol(0), cmpSymbol(1)]).toEqual(['<', '=', '>']);
  });
});
