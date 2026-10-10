import { describe, expect, it } from 'vitest';
import { afterRound, applyRound, levelForRound } from './adaptive';
import { createGameProgress } from './profile';
import type { GameProgress } from './types';

const g = (patch: Partial<GameProgress> = {}): GameProgress => ({
  ...createGameProgress(),
  ...patch,
});

function play(start: GameProgress, scores: number[], counts = true): GameProgress {
  return scores.reduce((p, s) => afterRound(p, s, counts), start);
}

describe('levelForRound', () => {
  it('Tự động / Vừa: giữ cấp hiện tại', () => {
    expect(levelForRound(g({ level: 5 }), 'auto')).toBe(5);
    expect(levelForRound(g({ level: 5 }), 'normal')).toBe(5);
  });

  it('Dễ −2, Khó +2, kẹp trong 1–10', () => {
    expect(levelForRound(g({ level: 5 }), 'easy')).toBe(3);
    expect(levelForRound(g({ level: 5 }), 'hard')).toBe(7);
    expect(levelForRound(g({ level: 1 }), 'easy')).toBe(1);
    expect(levelForRound(g({ level: 2 }), 'easy')).toBe(1);
    expect(levelForRound(g({ level: 10 }), 'hard')).toBe(10);
    expect(levelForRound(g({ level: 9 }), 'hard')).toBe(10);
  });

  it('chế độ Cố định: bỏ qua lựa chọn Dễ/Khó của bé', () => {
    const fixed = g({ mode: 'fixed', level: 5 });
    expect(levelForRound(fixed, 'easy')).toBe(5);
    expect(levelForRound(fixed, 'hard')).toBe(5);
    expect(levelForRound(fixed, 'auto')).toBe(5);
  });

  it('chế độ Tự động: cấp nằm trong min–max của phụ huynh', () => {
    expect(levelForRound(g({ level: 2, minLevel: 3, maxLevel: 6 }), 'auto')).toBe(3);
    expect(levelForRound(g({ level: 9, minLevel: 3, maxLevel: 6 }), 'auto')).toBe(6);
  });
});

describe('afterRound – tăng cấp (TC-009)', () => {
  it('3 lượt TB ≥ 0,85 → tăng 1 cấp và xóa lịch sử', () => {
    const r = applyRound(g({ level: 3, recentScores: [0.9, 0.9] }), 0.85, true);
    expect(r.change).toBe('up');
    expect(r.progress.level).toBe(4);
    expect(r.progress.recentScores).toEqual([]);
  });

  it('TB đúng ngưỡng 0,85 vẫn tăng; dưới ngưỡng thì không', () => {
    expect(play(g({ level: 3 }), [0.85, 0.85, 0.85]).level).toBe(4);
    expect(play(g({ level: 3 }), [0.84, 0.85, 0.85]).level).toBe(3);
  });

  it('chưa đủ 3 lượt thì chưa tăng cấp', () => {
    const p = play(g({ level: 3 }), [1, 1]);
    expect(p.level).toBe(3);
    expect(p.recentScores).toEqual([1, 1]);
  });

  it('chỉ giữ 3 lượt gần nhất', () => {
    const p = play(g({ level: 3 }), [0.6, 0.7, 0.7, 0.8]);
    expect(p.recentScores).toEqual([0.7, 0.7, 0.8]);
    expect(p.level).toBe(3);
  });

  it('không vượt maxLevel (và vẫn xóa lịch sử)', () => {
    const r = applyRound(g({ level: 6, maxLevel: 6, recentScores: [1, 1] }), 1, true);
    expect(r.progress.level).toBe(6);
    expect(r.change).toBe('none');
    expect(r.progress.recentScores).toEqual([]);
    expect(play(g({ level: 10 }), [1, 1, 1]).level).toBe(10);
  });
});

describe('afterRound – giảm cấp (TC-017)', () => {
  it('2 lượt liên tiếp < 0,5 → giảm 1 cấp', () => {
    const r = applyRound(g({ level: 5, recentScores: [0.4] }), 0.3, true);
    expect(r.change).toBe('down');
    expect(r.progress.level).toBe(4);
    expect(r.progress.recentScores).toEqual([]);
  });

  it('2 lượt < 0,5 nhưng không liên tiếp → chưa giảm', () => {
    const p = play(g({ level: 5 }), [0.4, 0.9, 0.4]);
    expect(p.level).toBe(5);
  });

  it('đúng 0,5 không tính là thấp', () => {
    expect(play(g({ level: 5 }), [0.5, 0.5]).level).toBe(5);
  });

  it('3 lượt TB ≤ 0,55 → giảm 1 cấp', () => {
    expect(play(g({ level: 5 }), [0.6, 0.5, 0.55]).level).toBe(4);
    expect(play(g({ level: 5 }), [0.6, 0.6, 0.56]).level).toBe(5);
  });

  it('không xuống dưới minLevel', () => {
    expect(play(g({ level: 1 }), [0.1, 0.1]).level).toBe(1);
    expect(play(g({ level: 4, minLevel: 4 }), [0.1, 0.1]).level).toBe(4);
  });
});

describe('afterRound – các lượt không tính', () => {
  it('chế độ Cố định: không đổi cấp, không lưu điểm (TC-015)', () => {
    const fixed = g({ mode: 'fixed', level: 5 });
    const p = play(fixed, [1, 1, 1, 1]);
    expect(p).toEqual(fixed);
    expect(play(fixed, [0, 0, 0]).level).toBe(5);
  });

  it('lượt Dễ/Vừa/Khó/bài đo (countsForAdaptive=false) không ảnh hưởng (TC-016)', () => {
    const before = g({ level: 5, recentScores: [0.9, 0.2] });
    const after = afterRound(before, 1, false);
    expect(after).toBe(before);
  });

  it('không làm thay đổi đối tượng gốc', () => {
    const before = g({ level: 3, recentScores: [0.9, 0.9] });
    const snapshot = JSON.stringify(before);
    applyRound(before, 0.9, true);
    expect(JSON.stringify(before)).toBe(snapshot);
  });
});
