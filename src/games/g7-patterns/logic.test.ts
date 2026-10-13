import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../app/rng';
import { levelsConfig } from '../levels';
import {
  ALL_GROUPS,
  QUESTIONS_PER_ROUND,
  parseRetry,
  readG7Options,
  resolveG7Params,
} from './config';
import { diffAttrs, glyph, itemEq, itemKey, num, type Glyph, type Item } from './elements';
import { G7Rules, planTypes } from './logic';
import {
  ALL_TYPES,
  TYPE_DEFS,
  buildPuzzle,
  fitsRule,
  solutionsOf,
  typesForLevel,
  validatePuzzle,
  type Group,
  type Puzzle,
  type TypeId,
} from './puzzles';
import { solveMatrix2, solveMatrix3, solveOdd, solveSeq } from './solve';

const N = 1000;
const g = (shape: Glyph['shape'], color: number, over: Partial<Glyph> = {}): Glyph =>
  glyph(shape, color, over);

const make = (type: TypeId, seed: number, options = TYPE_DEFS[type].level <= 3 ? 3 : 4): Puzzle =>
  buildPuzzle(mulberry32(seed * 2654435761), type, options);

describe('G7 bộ giải độc lập', () => {
  it('dãy AB: A B A B ? → chỉ B', () => {
    const A = g('circle', 0);
    const B = g('circle', 1);
    const sols = solveSeq([A, B, A, B, null], 4);
    expect(sols).toHaveLength(1);
    expect(itemEq(sols[0] as Item, A)).toBe(true);
  });

  it('dãy quá ngắn thì mơ hồ → không có lời giải duy nhất (không bịa quy luật)', () => {
    // 1 2 4 ? : vừa “+1, +2, +1” (5) vừa “×2” (8)
    const sols = solveSeq([num(1), num(2), num(4), null], 3);
    expect(sols.map((s) => (s.kind === 'num' ? s.n : -1)).sort((a, b) => a - b)).toEqual([5, 8]);
    // 1 2 4 8 ? → chỉ 16
    expect(solveSeq([num(1), num(2), num(4), num(8), null], 4)).toEqual([num(16)]);
  });

  it('dãy số: cộng đều, xen kẽ (+1, +2), ô “?” ở giữa', () => {
    expect(solveSeq([num(3), num(5), num(7), num(9), null], 4)).toEqual([num(11)]);
    expect(solveSeq([num(3), num(4), num(6), num(7), num(9), null], 5)).toEqual([num(10)]);
    expect(solveSeq([num(2), num(4), null, num(8), num(10)], 2)).toEqual([num(6)]);
  });

  it('dãy mũi tên xoay 90°', () => {
    const a = (rot: 0 | 90 | 180 | 270) => g('arrow', 2, { rot });
    const sols = solveSeq([a(0), a(90), a(180), a(270), null], 4);
    expect(sols).toHaveLength(1);
    expect((sols[0] as Glyph).rot).toBe(0);
  });

  it('mẫu tăng dần 1, 2, 3 chấm', () => {
    const c = (count: number) => g('star', 3, { count });
    const sols = solveSeq([c(1), c(2), c(3), null], 3);
    expect(sols).toHaveLength(1);
    expect((sols[0] as Glyph).count).toBe(4);
  });

  it('ma trận 2×2: hàng đổi màu, cột đổi hình', () => {
    const A = g('circle', 0);
    const B = g('circle', 1);
    const C = g('square', 0);
    const sols = solveMatrix2([A, B, C, null]);
    expect(sols).toHaveLength(1);
    expect(itemEq(sols[0] as Item, g('square', 1))).toBe(true);
  });

  it('ma trận 2×2 mơ hồ (cùng đổi một thuộc tính theo cả hai chiều) bị loại', () => {
    const A = g('circle', 0);
    const B = g('square', 0);
    const C = g('triangle', 0);
    expect(solveMatrix2([A, B, C, null]).length).not.toBe(1);
  });

  it('ma trận 3×3: mỗi hàng đủ 3 hình (ô cuối là hình còn thiếu)', () => {
    const s = ['circle', 'square', 'triangle'] as const;
    const cells: (Glyph | null)[] = [];
    for (let r = 0; r < 3; r++)
      for (let c = 0; c < 3; c++) cells.push(g(s[(c + r) % 3] as Glyph['shape'], 1));
    const truth = cells[8] as Glyph;
    cells[8] = null;
    const sols = solveMatrix3(cells);
    expect(sols).toHaveLength(1);
    expect(itemEq(sols[0] as Item, truth)).toBe(true);
  });

  it('tìm hình khác loại: 3 cùng màu, 1 khác màu', () => {
    const items = [
      g('circle', 0),
      g('square', 0, { size: 2 }),
      g('star', 1),
      g('heart', 0, { size: 0 }),
    ];
    expect(solveOdd(items)).toEqual([2]);
    // hai hình lẻ → không rõ ràng
    expect(solveOdd([g('circle', 0), g('square', 0), g('star', 1), g('heart', 2)])).toEqual([]);
  });
});

describe('G7 bộ sinh câu: 1.000 câu mỗi dạng luôn đúng 1 đáp án thỏa quy luật', () => {
  for (const type of ALL_TYPES) {
    for (const options of [3, 4]) {
      it(`${type} (${options} đáp án)`, () => {
        for (let seed = 1; seed <= N; seed++) {
          const p = make(type, seed + options * 100003, options);
          expect(validatePuzzle(p), `${type} seed ${seed}`).toBeNull();
          const want = type === 'odd-one' ? 4 : options;
          expect(p.options).toHaveLength(want);
          expect(new Set(p.options.map(itemKey)).size).toBe(want); // không trùng
          // đúng 1 đáp án thỏa quy luật, và đó là đáp án đúng
          const fits = p.options.map((o, i) => (fitsRule(p, o) ? i : -1)).filter((i) => i >= 0);
          expect(fits).toEqual([p.correctIndex]);
          expect(solutionsOf(p)).toHaveLength(1);
        }
      });
    }
  }

  it('đáp án nhiễu (hình) khác đáp án đúng đúng 1 thuộc tính', () => {
    for (const type of ALL_TYPES) {
      if (type === 'odd-one' || TYPE_DEFS[type].group === 'numbers') continue;
      for (let seed = 1; seed <= 200; seed++) {
        const p = make(type, seed);
        const truth = p.options[p.correctIndex] as Glyph;
        for (const o of p.options) {
          if (o === truth) continue;
          expect(diffAttrs(truth, o as Glyph), `${type} seed ${seed}`).toHaveLength(1);
        }
      }
    }
  });

  it('dãy số: không có số âm, đáp án nhiễu là số nguyên ≥ 0', () => {
    for (const type of ALL_TYPES.filter((t) => TYPE_DEFS[t].group === 'numbers')) {
      for (let seed = 1; seed <= N; seed++) {
        const p = make(type, seed);
        const nums = [...p.cells, ...p.options].flatMap((c) =>
          c && c.kind === 'num' ? [c.n] : [],
        );
        expect(nums.length).toBeGreaterThan(0);
        expect(nums.every((n) => Number.isInteger(n) && n >= 0)).toBe(true);
      }
    }
  });

  it('dãy tối đa 7 ô (vừa màn hình điện thoại); ô “?” chỉ ở giữa dãy từ cấp 5', () => {
    const middleSeen: Record<string, boolean> = {};
    for (const type of ALL_TYPES) {
      if (TYPE_DEFS[type].layout !== 'seq') continue;
      for (let seed = 1; seed <= 300; seed++) {
        const p = make(type, seed);
        expect(p.cells.length).toBeLessThanOrEqual(7);
        expect(p.cells.length).toBeGreaterThanOrEqual(4);
        expect(p.cells[p.hole]).toBeNull();
        expect(p.cells.filter((c) => c === null)).toHaveLength(1);
        const middle = p.hole !== p.cells.length - 1;
        if (middle) middleSeen[type] = true;
        if (TYPE_DEFS[type].level < 5)
          expect(middle, `${type} không được có “?” ở giữa`).toBe(false);
      }
    }
    // dạng từ cấp 5 trở lên có thể có ô “?” ở giữa (trừ grow-dots đủ ngắn vẫn có)
    for (const type of ['two-attr', 'num-down', 'num-skip', 'num-double', 'num-alt'] as TypeId[]) {
      expect(middleSeen[type], `${type} nên có lúc “?” ở giữa`).toBe(true);
    }
  });

  it('theo seed: cùng seed cho cùng câu, khác seed cho câu khác', () => {
    expect(make('abc', 5)).toEqual(make('abc', 5));
    expect(make('matrix2', 5)).toEqual(make('matrix2', 5));
    const a = JSON.stringify(make('matrix3-two', 5));
    const b = JSON.stringify(make('matrix3-two', 6));
    expect(a).not.toBe(b);
  });
});

describe('G7 từng dạng đúng như bảng cấp độ', () => {
  const hasRepeat = (p: Puzzle, unit: number) => {
    const full = p.cells.map((c, i) =>
      i === p.hole ? (p.options[p.correctIndex] as Item) : (c as Item),
    );
    return full.every((c, i) => itemEq(c, full[i % unit] as Item));
  };

  it('AB (màu): cùng hình, hai màu xen kẽ', () => {
    for (let s = 1; s <= 200; s++) {
      const p = make('ab-color', s);
      const cells = p.cells.filter((c): c is Glyph => c !== null && c.kind === 'glyph');
      expect(new Set(cells.map((c) => c.shape)).size).toBe(1);
      expect(new Set(cells.map((c) => c.color)).size).toBe(2);
      expect(hasRepeat(p, 2)).toBe(true);
      expect(p.explain).toEqual({ kind: 'unit', len: 2 });
    }
  });

  it('AB / AAB / ABB: đơn vị lặp đúng mẫu, hình + màu đổi cùng lúc', () => {
    for (let s = 1; s <= 200; s++) {
      for (const [type, len, pattern] of [
        ['ab', 2, 'AB'],
        ['aab', 3, 'AAB'],
        ['abb', 3, 'ABB'],
      ] as const) {
        const p = make(type, s);
        expect(hasRepeat(p, len)).toBe(true);
        const full = p.cells.map((c, i) =>
          i === p.hole ? (p.options[p.correctIndex] as Item) : (c as Item),
        );
        const unit = full.slice(0, len);
        const letters = unit.map((u) => (itemEq(u, unit[0] as Item) ? 'A' : 'B')).join('');
        expect(letters).toBe(pattern);
        const [a, b] = [unit[0], unit[len - 1]] as [Glyph, Glyph];
        expect(a.shape).not.toBe(b.shape);
        expect(a.color).not.toBe(b.color);
      }
    }
  });

  it('ABC: 3 hình khác nhau lặp lại; to – nhỏ: hai cỡ xen kẽ', () => {
    for (let s = 1; s <= 200; s++) {
      const abc = make('abc', s);
      expect(hasRepeat(abc, 3)).toBe(true);
      const sizes = make('size-alt', s);
      expect(hasRepeat(sizes, 2)).toBe(true);
      const cells = sizes.cells.filter((c): c is Glyph => c !== null && c.kind === 'glyph');
      expect(new Set(cells.map((c) => c.size))).toEqual(new Set([0, 2]));
    }
  });

  it('dãy số +1, +2, +5, +10 và đủ 4 loại bước', () => {
    const steps = new Set<number>();
    for (let s = 1; s <= 300; s++) {
      const p = make('num-step', s);
      const nums = p.cells.map((c, i) =>
        i === p.hole ? (p.options[p.correctIndex] as { n: number }).n : (c as { n: number }).n,
      );
      const d = nums[1]! - nums[0]!;
      steps.add(d);
      nums.forEach((n, i) => i > 0 && expect(n - nums[i - 1]!).toBe(d));
      const labels = (p.explain as { labels: string[] }).labels;
      expect(labels).toHaveLength(nums.length - 1);
      expect(labels.every((l) => l === `+${d}`)).toBe(true);
    }
    expect([...steps].sort((a, b) => a - b)).toEqual([1, 2, 5, 10]);
  });

  it('mũi tên xoay 90° (cả chiều thuận và ngược), nhiễu là các hướng khác', () => {
    const dirs = new Set<string>();
    for (let s = 1; s <= 200; s++) {
      const p = make('arrow-rot', s);
      const rots = p.cells.map((c, i) =>
        i === p.hole ? (p.options[p.correctIndex] as Glyph).rot : (c as Glyph).rot,
      );
      const d = (((rots[1]! - rots[0]!) % 360) + 360) % 360;
      dirs.add(String(d));
      rots.forEach((r, i) => i > 0 && expect((((r - rots[i - 1]!) % 360) + 360) % 360).toBe(d));
      const opts = p.options as Glyph[];
      expect(opts.every((o) => o.shape === 'arrow')).toBe(true);
      expect(new Set(opts.map((o) => o.rot)).size).toBe(4); // đủ 4 hướng
    }
    expect([...dirs].sort()).toEqual(['270', '90']);
  });

  it('mẫu 2 thuộc tính: màu và hình có chu kỳ khác nhau', () => {
    for (let s = 1; s <= 200; s++) {
      const p = make('two-attr', s);
      const full = p.cells.map((c, i) =>
        i === p.hole ? (p.options[p.correctIndex] as Glyph) : (c as Glyph),
      );
      const colorPeriod = new Set(full.map((c) => c.color)).size;
      const shapePeriod = new Set(full.map((c) => c.shape)).size;
      expect([colorPeriod, shapePeriod].sort()).toEqual([2, 3]);
      // lời giải thích riêng: màu lặp mỗi colorPeriod ô, hình lặp mỗi shapePeriod ô (đúng với dãy thật)
      expect(p.explain).toEqual({ kind: 'dual', colorLen: colorPeriod, shapeLen: shapePeriod });
      full.forEach((c, i) => {
        expect(c.color, `màu ô ${i}`).toBe(full[i % colorPeriod]!.color);
        expect(c.shape, `hình ô ${i}`).toBe(full[i % shapePeriod]!.shape);
      });
    }
  });

  it('dãy số giảm, đếm cách 3/4, mẫu tăng dần chấm, ×2, xen kẽ', () => {
    for (let s = 1; s <= 200; s++) {
      const down = make('num-down', s);
      const dn = down.cells.map((c, i) =>
        i === down.hole
          ? (down.options[down.correctIndex] as { n: number }).n
          : (c as { n: number }).n,
      );
      dn.forEach((n, i) => i > 0 && expect(n).toBeLessThan(dn[i - 1]!));
      expect(dn[dn.length - 1]).toBeGreaterThanOrEqual(0);

      const skip = make('num-skip', s);
      const sn = skip.cells.map((c, i) =>
        i === skip.hole
          ? (skip.options[skip.correctIndex] as { n: number }).n
          : (c as { n: number }).n,
      );
      expect([3, 4]).toContain(sn[1]! - sn[0]!);

      const dots = make('grow-dots', s);
      const cs = dots.cells.map((c, i) =>
        i === dots.hole ? (dots.options[dots.correctIndex] as Glyph).count : (c as Glyph).count,
      );
      cs.forEach((c, i) => i > 0 && expect(c - cs[i - 1]!).toBe(1));
      expect(Math.max(...cs)).toBeLessThanOrEqual(6);

      const dbl = make('num-double', s);
      const bn = dbl.cells.map((c, i) =>
        i === dbl.hole
          ? (dbl.options[dbl.correctIndex] as { n: number }).n
          : (c as { n: number }).n,
      );
      bn.forEach((n, i) => i > 0 && expect(n).toBe(bn[i - 1]! * 2));

      const alt = make('num-alt', s);
      const an = alt.cells.map((c, i) =>
        i === alt.hole
          ? (alt.options[alt.correctIndex] as { n: number }).n
          : (c as { n: number }).n,
      );
      const diffs = an.slice(1).map((n, i) => n - an[i]!);
      diffs.forEach((d, i) => i >= 2 && expect(d).toBe(diffs[i - 2]));
      expect(diffs[0]).not.toBe(diffs[1]);
    }
  });

  it('ma trận 2×2: 4 ô, ô “?” ở cuối, hàng và cột mỗi bên đổi một thuộc tính', () => {
    for (let s = 1; s <= 300; s++) {
      const p = make('matrix2', s);
      expect(p.cells).toHaveLength(4);
      expect(p.hole).toBe(3);
      const [A, B, C] = p.cells as [Glyph, Glyph, Glyph];
      const D = p.options[p.correctIndex] as Glyph;
      expect(diffAttrs(A, B)).toHaveLength(1);
      expect(diffAttrs(A, C)).toHaveLength(1);
      expect(diffAttrs(A, B)[0]).not.toBe(diffAttrs(A, C)[0]);
      expect(diffAttrs(C, D)).toEqual(diffAttrs(A, B));
      expect(diffAttrs(B, D)).toEqual(diffAttrs(A, C));
      expect(p.explain.kind).toBe('analogy');
    }
  });

  it('ma trận 3×3: 9 ô, ô “?” ở hàng cuối; cấp 8 một quy luật, cấp 10 hai quy luật', () => {
    for (let s = 1; s <= 300; s++) {
      const p8 = make('matrix3-row', s);
      const p10 = make('matrix3-two', s);
      for (const p of [p8, p10]) {
        expect(p.cells).toHaveLength(9);
        expect(p.hole).toBe(8);
        expect(p.explain).toEqual({ kind: 'row', row: 2 });
      }
      const varying = (p: Puzzle) => {
        const all = [...p.cells.slice(0, 8), p.options[p.correctIndex]] as Glyph[];
        return (['shape', 'color', 'size', 'rot', 'count'] as const).filter(
          (a) => new Set(all.map((x) => x[a])).size > 1,
        );
      };
      expect(varying(p10).length).toBe(2);
      expect(varying(p8).length).toBeGreaterThanOrEqual(1);
      expect(varying(p8).length).toBeLessThanOrEqual(2);
    }
  });

  it('tìm hình khác loại: 4 hình, 3 hình cùng một thuộc tính, chỉ 1 hình lẻ', () => {
    for (let s = 1; s <= 300; s++) {
      const p = make('odd-one', s);
      expect(p.cells).toHaveLength(0);
      expect(p.options).toHaveLength(4);
      const ex = p.explain as {
        kind: 'odd';
        attr: 'shape' | 'color' | 'size' | 'count';
        oddIndex: number;
      };
      expect(ex.oddIndex).toBe(p.correctIndex);
      const vals = (p.options as Glyph[]).map((o) => o[ex.attr]);
      const rest = vals.filter((_, i) => i !== ex.oddIndex);
      expect(new Set(rest).size).toBe(1);
      expect(vals[ex.oddIndex]).not.toBe(rest[0]);
      expect(solveOdd(p.options)).toEqual([p.correctIndex]);
    }
  });

  it('màu luôn đi kèm hình/hoa văn: 5 màu, tối đa 5 hình khác nhau trong dãy', () => {
    const colors = new Set<number>();
    for (let s = 1; s <= 200; s++) {
      for (const o of make('abc', s).options) if (o.kind === 'glyph') colors.add(o.color);
    }
    expect(colors.size).toBe(5);
  });
});

describe('G7 chọn dạng câu theo cấp và nhóm', () => {
  it('mỗi cấp 1–10 có ít nhất 1 dạng; khớp bảng levels.json', () => {
    const expected: Record<number, TypeId[]> = {
      1: ['ab-color'],
      2: ['ab', 'aab', 'abb'],
      3: ['abc', 'size-alt'],
      4: ['num-step', 'arrow-rot'],
      5: ['two-attr'],
      6: ['num-down', 'num-skip', 'grow-dots'],
      7: ['matrix2'],
      8: ['matrix3-row'],
      9: ['odd-one', 'num-double'],
      10: ['num-alt', 'matrix3-two'],
    };
    for (let level = 1; level <= 10; level++) {
      expect(typesForLevel(level, ALL_GROUPS).sort()).toEqual(
        [...(expected[level] as TypeId[])].sort(),
      );
    }
    expect(levelsConfig.games.G7.levels).toHaveLength(10);
  });

  it('tắt nhóm: lấy dạng của nhóm còn bật có cấp gần nhất (ưu tiên cấp thấp hơn)', () => {
    const only = (...gs: Group[]) => gs;
    expect(typesForLevel(1, only('numbers'))).toEqual(['num-step']);
    expect(typesForLevel(5, only('numbers'))).toEqual(['num-step']); // 4 và 6 cách đều 1 → lấy cấp thấp
    expect(typesForLevel(7, only('numbers'))).toEqual(['num-down', 'num-skip']);
    expect(typesForLevel(3, only('matrix'))).toEqual(['matrix2']);
    expect(typesForLevel(10, only('shapes'))).toEqual(['odd-one']);
    expect(typesForLevel(9, only('shapes', 'matrix'))).toEqual(['odd-one']);
  });

  it('nhóm rỗng → coi như bật tất cả', () => {
    expect(typesForLevel(2, [])).toEqual(typesForLevel(2, ALL_GROUPS));
  });

  it('planTypes: đủ 8 câu, xoay vòng các dạng, không có 2 câu liền kề cùng dạng', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const plan = planTypes(mulberry32(seed), ['ab', 'aab', 'abb'], 8);
      expect(plan).toHaveLength(8);
      plan.forEach((t, i) => i > 0 && expect(t).not.toBe(plan[i - 1]));
      const counts = ['ab', 'aab', 'abb'].map((t) => plan.filter((x) => x === t).length);
      expect(Math.max(...counts) - Math.min(...counts)).toBeLessThanOrEqual(1);
    }
    expect(planTypes(mulberry32(1), ['ab-color'], 8)).toEqual(Array(8).fill('ab-color'));
  });
});

describe('G7 cấu hình', () => {
  it('số đáp án và quyền thử lại theo bảng cấp độ', () => {
    for (let l = 1; l <= 10; l++) {
      const p = resolveG7Params(l);
      expect(p.options).toBe(l <= 3 ? 3 : 4);
      expect(p.retry).toBe(l <= 5);
    }
    expect(parseRetry('Có (½ điểm)')).toBe(true);
    expect(parseRetry(false)).toBe(false);
  });

  it('tùy chọn phụ huynh: nhóm và đồng hồ (mặc định không giới hạn thời gian)', () => {
    expect(readG7Options(undefined)).toEqual({
      groups: ['shapes', 'numbers', 'matrix'],
      timer: 'off',
    });
    expect(readG7Options({ groups: ['numbers', 'x'], timer: 'sec30' })).toEqual({
      groups: ['numbers'],
      timer: 'sec30',
    });
    expect(readG7Options({ groups: [], timer: 30 })).toEqual({
      groups: ['shapes', 'numbers', 'matrix'],
      timer: 'sec30',
    });
  });
});

describe('G7 luật lượt chơi', () => {
  const rules = (level: number, seed = 1, groups: readonly Group[] = ALL_GROUPS) =>
    new G7Rules(mulberry32(seed), resolveG7Params(level), level, groups);
  const wrongIndex = (r: G7Rules) => (r.current().correctIndex + 1) % r.current().options.length;

  it('mỗi lượt 8 câu, không trùng nhau', () => {
    for (let seed = 1; seed <= 100; seed++) {
      const r = rules(2, seed);
      expect(r.puzzles).toHaveLength(QUESTIONS_PER_ROUND);
      for (const p of r.puzzles) expect(validatePuzzle(p)).toBeNull();
    }
    const r = rules(7, 3);
    expect(
      new Set(
        r.puzzles.map((p) =>
          JSON.stringify([p.cells.map((c) => c && itemKey(c)), p.options.map(itemKey)]),
        ),
      ).size,
    ).toBe(8);
  });

  it('đúng lần đầu cả 8 câu → score 1, accuracy 1', () => {
    const r = rules(3);
    while (!r.done) {
      expect(r.answer(r.current().correctIndex, 4000)).toEqual({
        kind: 'correct',
        points: 1,
        firstTry: true,
      });
      r.next();
    }
    expect(r.score).toBe(1);
    expect(r.metrics()).toMatchObject({
      accuracy: 1,
      avgTimeMs: 4000,
      correct: 8,
      firstTry: 8,
      timeouts: 0,
    });
  });

  it('cấp 1–5: sai → được thử lại; đúng lần 2 được ½ điểm (TC-020)', () => {
    for (const level of [1, 3, 5]) {
      const r = rules(level);
      expect(r.answer(wrongIndex(r), 1000)).toEqual({ kind: 'retry' });
      expect(r.isResolved).toBe(false);
      expect(r.wrong.has(wrongIndex(r))).toBe(true);
      expect(r.answer(r.current().correctIndex, 3000)).toEqual({
        kind: 'correct',
        points: 0.5,
        firstTry: false,
      });
      r.next();
      expect(r.points).toBe(0.5);
      expect(r.score).toBeCloseTo(0.5 / 8, 10);
    }
  });

  it('cấp 1–5: sai cả 2 lần → hết cơ hội, 0 điểm, hiện đáp án', () => {
    const r = rules(2);
    const first = wrongIndex(r);
    r.answer(first, 1);
    const other = [0, 1, 2].find((i) => i !== r.current().correctIndex && i !== first) as number;
    expect(r.answer(other, 1)).toEqual({ kind: 'wrong' });
    expect(r.isResolved).toBe(true);
    expect(r.points).toBe(0);
  });

  it('cấp 6+: sai là hiện đáp án luôn (không thử lại)', () => {
    for (const level of [6, 8, 10]) {
      const r = rules(level);
      expect(r.answer(wrongIndex(r), 500)).toEqual({ kind: 'wrong' });
      expect(r.isResolved).toBe(true);
      expect(r.points).toBe(0);
    }
  });

  it('bấm lại thẻ đã sai, hoặc bấm sau khi đã xong câu → bị bỏ qua', () => {
    const r = rules(1);
    const w = wrongIndex(r);
    r.answer(w, 1);
    expect(r.answer(w, 1)).toEqual({ kind: 'ignored' });
    r.answer(r.current().correctIndex, 1);
    expect(r.answer(r.current().correctIndex, 1)).toEqual({ kind: 'ignored' });
  });

  it('hết giờ (30 giây) → 0 điểm, đếm timeouts, không cho thử lại', () => {
    const r = rules(1);
    expect(r.answer(null, 30000)).toEqual({ kind: 'timeout' });
    r.next();
    r.answer(r.current().correctIndex, 2000);
    expect(r.metrics()).toMatchObject({ timeouts: 1, correct: 1, firstTry: 1 });
  });

  it('sang câu sau thì xóa trạng thái thử lại', () => {
    const r = rules(1);
    r.answer(wrongIndex(r), 1);
    r.answer(r.current().correctIndex, 1);
    r.next();
    expect(r.wrong.size).toBe(0);
    expect(r.isResolved).toBe(false);
    expect(r.answer(wrongIndex(r), 1)).toEqual({ kind: 'retry' });
  });

  it('metrics: highestTypeCorrect = cấp cao nhất của dạng đã giải đúng', () => {
    const r = rules(9, 4);
    const levels = r.puzzles.map((p) => p.typeLevel);
    expect(new Set(levels)).toEqual(new Set([9]));
    r.answer(r.current().correctIndex, 1000);
    expect(r.metrics().highestTypeCorrect).toBe(9);
    const none = rules(9, 4);
    expect(none.metrics().highestTypeCorrect).toBe(0);
  });

  it('chỉ giải đúng một phần: accuracy chia cho 8 câu (kể cả câu chưa làm)', () => {
    const r = rules(1);
    r.answer(r.current().correctIndex, 1000);
    expect(r.metrics().accuracy).toBeCloseTo(1 / 8, 3);
    expect(r.score).toBeCloseTo(1 / 8, 10);
  });

  it('theo seed: cùng seed cho cùng lượt', () => {
    expect(rules(6, 9).puzzles).toEqual(rules(6, 9).puzzles);
  });

  it('nhóm số: cấp 1 vẫn ra dãy số (dạng gần nhất)', () => {
    const r = rules(1, 2, ['numbers']);
    expect(r.puzzles.every((p) => TYPE_DEFS[p.type].group === 'numbers')).toBe(true);
  });
});
