import { describe, expect, it } from 'vitest';
import {
  GATE_LOCK_MS,
  GATE_MAX_WRONG,
  initialGate,
  lockRemainingMs,
  makeChallenge,
  refreshGate,
  submitAnswer,
} from './parentGate';
import { mulberry32 } from './rng';

describe('khóa phụ huynh (F08, TC-026)', () => {
  it('phép nhân a × b với a ∈ [12, 49], b ∈ [3, 9] (kiểm 2.000 phép)', () => {
    const rng = mulberry32(7);
    const seen = { a: new Set<number>(), b: new Set<number>() };
    for (let i = 0; i < 2000; i++) {
      const c = makeChallenge(rng);
      expect(c.a).toBeGreaterThanOrEqual(12);
      expect(c.a).toBeLessThanOrEqual(49);
      expect(c.b).toBeGreaterThanOrEqual(3);
      expect(c.b).toBeLessThanOrEqual(9);
      expect(c.answer).toBe(c.a * c.b);
      seen.a.add(c.a);
      seen.b.add(c.b);
    }
    expect(seen.a.size).toBe(38); // đủ cả 12…49
    expect(seen.b.size).toBe(7);
  });

  it('đáp án đúng → ok', () => {
    const g = initialGate(mulberry32(1));
    expect(submitAnswer(g, String(g.challenge.answer), 0).result).toBe('ok');
  });

  it('bỏ trống → không tính là sai', () => {
    const g = initialGate(mulberry32(1));
    const r = submitAnswer(g, '  ', 0);
    expect(r.result).toBe('empty');
    expect(r.state.wrong).toBe(0);
  });

  it('chuỗi không phải số / số thập phân / có chữ → sai', () => {
    const g = initialGate(mulberry32(1));
    for (const bad of ['abc', `${g.challenge.answer}.0`, `${g.challenge.answer}x`, '-5']) {
      expect(submitAnswer(g, bad, 0).result).toBe('wrong');
    }
  });

  it('sai 3 lần → khóa 30 giây; trong lúc khóa kể cả nhập đúng cũng không mở', () => {
    let g = initialGate(mulberry32(2));
    const t0 = 1000;
    for (let i = 1; i < GATE_MAX_WRONG; i++) {
      const r = submitAnswer(g, '0', t0);
      expect(r.result).toBe('wrong');
      g = r.state;
    }
    const r3 = submitAnswer(g, '0', t0);
    expect(r3.result).toBe('locked');
    expect(r3.state.lockedUntil).toBe(t0 + GATE_LOCK_MS);
    expect(lockRemainingMs(r3.state, t0 + 10_000)).toBe(20_000);
    const during = submitAnswer(r3.state, String(g.challenge.answer), t0 + 10_000);
    expect(during.result).toBe('locked');
  });

  it('hết 30 giây → phép tính mới, đếm sai bắt đầu lại', () => {
    let g = initialGate(mulberry32(2));
    for (let i = 0; i < GATE_MAX_WRONG; i++) g = submitAnswer(g, '0', 0).state;
    const rng = mulberry32(99);
    expect(refreshGate(g, GATE_LOCK_MS - 1, rng)).toBe(g); // chưa hết khóa → giữ nguyên
    const after = refreshGate(g, GATE_LOCK_MS, rng);
    expect(after.lockedUntil).toBeNull();
    expect(after.wrong).toBe(0);
    expect(after.challenge).not.toEqual(g.challenge);
    expect(submitAnswer(after, String(after.challenge.answer), GATE_LOCK_MS).result).toBe('ok');
  });

  it('thời gian khóa có thể rút ngắn (chế độ test)', () => {
    let g = initialGate(mulberry32(3));
    for (let i = 0; i < GATE_MAX_WRONG; i++) g = submitAnswer(g, '0', 0, 3000).state;
    expect(g.lockedUntil).toBe(3000);
  });
});
