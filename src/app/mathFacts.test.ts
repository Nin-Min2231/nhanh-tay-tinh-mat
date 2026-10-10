import { describe, expect, it } from 'vitest';
import {
  MASTER_STREAK,
  MAX_FACTS,
  applyMathResults,
  applyRoundToMath,
  dueFactKeys,
  parseFactResults,
  prune,
} from './mathFacts';
import type { MathFact } from './types';

const fact = (over: Partial<MathFact> = {}): MathFact => ({
  seen: 1,
  correct: 0,
  streak: 0,
  lastSeenRound: 1,
  mastered: false,
  ...over,
});

describe('sổ lỗi toán (F19)', () => {
  it('làm đúng phép tính chưa từng sai → không ghi vào sổ', () => {
    const { facts } = applyMathResults({}, [{ key: '8+7', correct: true }], 1);
    expect(facts).toEqual({});
  });

  it('làm sai → ghi vào sổ với streak 0, chưa thuộc', () => {
    const { facts } = applyMathResults({}, [{ key: '8+7', correct: false }], 4);
    expect(facts['8+7']).toEqual({
      seen: 1,
      correct: 0,
      streak: 0,
      lastSeenRound: 4,
      mastered: false,
    });
  });

  it('đúng liên tiếp 3 lần → đã thuộc; đếm newlyMastered', () => {
    let facts: Record<string, MathFact> = { '7x8': fact() };
    let r = applyMathResults(facts, [{ key: '7x8', correct: true }], 2);
    expect(r.facts['7x8']).toMatchObject({ streak: 1, mastered: false });
    expect(r.newlyMastered).toBe(0);
    facts = r.facts;
    r = applyMathResults(facts, [{ key: '7x8', correct: true }], 3);
    expect(r.facts['7x8']).toMatchObject({ streak: 2, mastered: false });
    r = applyMathResults(r.facts, [{ key: '7x8', correct: true }], 4);
    expect(r.facts['7x8']).toMatchObject({
      streak: MASTER_STREAK,
      mastered: true,
      correct: 3,
      seen: 4,
    });
    expect(r.newlyMastered).toBe(1);
  });

  it('streak ≥ 3 ngay trong một lượt (sai → đúng ×3) cũng tính là thuộc', () => {
    const r = applyMathResults(
      {},
      [
        { key: '9+6', correct: false },
        { key: '9+6', correct: true },
        { key: '9+6', correct: true },
        { key: '9+6', correct: true },
      ],
      1,
    );
    expect(r.facts['9+6']?.mastered).toBe(true);
    expect(r.newlyMastered).toBe(1);
  });

  it('sai lại khi đã thuộc → streak về 0 và bỏ trạng thái thuộc', () => {
    const prev = { '6x7': fact({ seen: 5, correct: 4, streak: 3, mastered: true }) };
    const r = applyMathResults(prev, [{ key: '6x7', correct: false }], 9);
    expect(r.facts['6x7']).toMatchObject({ streak: 0, mastered: false, lastSeenRound: 9, seen: 6 });
    expect(r.newlyMastered).toBe(0);
  });

  it('không đổi dữ liệu gốc (bất biến)', () => {
    const prev = { '8+7': fact() };
    const snapshot = JSON.stringify(prev);
    applyMathResults(prev, [{ key: '8+7', correct: true }], 2);
    expect(JSON.stringify(prev)).toBe(snapshot);
  });

  it('dueFactKeys: chỉ phép tính từng sai và chưa thuộc; streak thấp và lâu chưa gặp lên trước', () => {
    const facts: Record<string, MathFact> = {
      a: fact({ streak: 2, correct: 2, seen: 3, lastSeenRound: 1 }),
      b: fact({ streak: 0, lastSeenRound: 5 }),
      c: fact({ streak: 0, lastSeenRound: 2 }),
      d: fact({ seen: 4, correct: 3, streak: 3, mastered: true }),
      e: fact({ seen: 2, correct: 2, streak: 2 }), // chưa từng sai
    };
    expect(dueFactKeys(facts)).toEqual(['c', 'b', 'a']);
  });

  it('prune: giữ tối đa MAX_FACTS, bỏ “đã thuộc” cũ nhất trước', () => {
    const facts: Record<string, MathFact> = {};
    for (let i = 0; i < MAX_FACTS + 20; i++) {
      facts[`k${i}`] = fact({ lastSeenRound: i, mastered: i < 30 });
    }
    const out = prune(facts);
    expect(Object.keys(out)).toHaveLength(MAX_FACTS);
    expect(out.k0).toBeUndefined();
    expect(out.k19).toBeUndefined();
    expect(out.k20).toBeDefined();
    expect(out.k300).toBeDefined();
  });

  it('parseFactResults bỏ phần tử sai kiểu', () => {
    expect(
      parseFactResults({
        factResults: [
          { key: '8+7', correct: false },
          { key: 3, correct: true },
          null,
          { key: '', correct: true },
          { key: '1+1', correct: 'x' },
        ],
      }),
    ).toEqual([{ key: '8+7', correct: false }]);
    expect(parseFactResults(undefined)).toEqual([]);
    expect(parseFactResults({ factResults: 'x' })).toEqual([]);
  });

  it('applyRoundToMath cập nhật profile.math, giữ nguyên topics; không có kết quả thì trả về cùng đối tượng', () => {
    const math = { topics: ['M05'], facts: {} as Record<string, MathFact> };
    const next = applyRoundToMath(math, { factResults: [{ key: '8+7', correct: false }] }, 3);
    expect(next.topics).toEqual(['M05']);
    expect(next.facts['8+7']?.lastSeenRound).toBe(3);
    expect(applyRoundToMath(math, undefined, 3)).toBe(math);
  });
});
