import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../app/rng';
import { levelsConfig } from '../levels';
import { DEFAULT_G4_OPTIONS, g4LevelRow, readG4Options, resolveG4Params } from './config';
import {
  G4Rules,
  MAX_LEN,
  MAX_MISTAKES,
  generateSequence,
  gridLayout,
  noRepeatForLevel,
  noteForPad,
  scoreFromSpan,
} from './logic';

describe('cấu hình G4 từ levels.json', () => {
  it('10 cấp khớp bảng trong docs/02_GAMES.md', () => {
    expect(levelsConfig.games.G4.levels).toHaveLength(10);
    expect(resolveG4Params(1, DEFAULT_G4_OPTIONS)).toEqual({
      pads: 4,
      startLen: 2,
      flashMs: 900,
      gapMs: 400,
    });
    expect(resolveG4Params(4, DEFAULT_G4_OPTIONS)).toEqual({
      pads: 6,
      startLen: 3,
      flashMs: 800,
      gapMs: 350,
    });
    expect(resolveG4Params(10, DEFAULT_G4_OPTIONS)).toEqual({
      pads: 9,
      startLen: 4,
      flashMs: 450,
      gapMs: 180,
    });
  });

  it('cùng số ô thì nhịp nhanh dần theo cấp; số ô tăng 4 → 6 → 9', () => {
    for (let l = 2; l <= 10; l++) {
      const a = g4LevelRow(l - 1);
      const b = g4LevelRow(l);
      expect(b.pads).toBeGreaterThanOrEqual(a.pads);
      if (b.pads === a.pads) {
        expect(b.flashMs).toBeLessThanOrEqual(a.flashMs);
        expect(b.gapMs).toBeLessThanOrEqual(a.gapMs);
      }
    }
    expect(g4LevelRow(1).pads).toBe(4);
    expect(g4LevelRow(10).pads).toBe(9);
  });

  it('tùy chọn PH: số ô, tốc độ (×1,3 / ×1 / ×0,8), độ dài bắt đầu', () => {
    expect(resolveG4Params(1, { ...DEFAULT_G4_OPTIONS, pads: 9 }).pads).toBe(9);
    expect(resolveG4Params(1, { ...DEFAULT_G4_OPTIONS, startLen: 5 }).startLen).toBe(5);
    expect(resolveG4Params(1, { ...DEFAULT_G4_OPTIONS, speed: 'slow' })).toMatchObject({
      flashMs: 1170,
      gapMs: 520,
    });
    expect(resolveG4Params(1, { ...DEFAULT_G4_OPTIONS, speed: 'medium' })).toMatchObject({
      flashMs: 900,
      gapMs: 400,
    });
    expect(resolveG4Params(1, { ...DEFAULT_G4_OPTIONS, speed: 'fast' })).toMatchObject({
      flashMs: 720,
      gapMs: 320,
    });
  });

  it('readG4Options bỏ giá trị lạ', () => {
    expect(readG4Options({ pads: '6', speed: 'fast', startLen: 5 })).toEqual({
      pads: 6,
      speed: 'fast',
      startLen: 5,
    });
    expect(readG4Options({ pads: 5, speed: 'x', startLen: 9 })).toEqual(DEFAULT_G4_OPTIONS);
    expect(readG4Options(undefined)).toEqual(DEFAULT_G4_OPTIONS);
  });
});

describe('sinh chuỗi', () => {
  it('cùng seed → cùng chuỗi; mọi ô nằm trong khoảng hợp lệ', () => {
    for (const pads of [4, 6, 9]) {
      const a = generateSequence(mulberry32(7), pads, 10, false);
      const b = generateSequence(mulberry32(7), pads, 10, false);
      expect(a).toEqual(b);
      expect(a).toHaveLength(10);
      a.forEach((p) => {
        expect(p).toBeGreaterThanOrEqual(0);
        expect(p).toBeLessThan(pads);
      });
    }
    expect(generateSequence(mulberry32(1), 9, 8, false)).not.toEqual(
      generateSequence(mulberry32(2), 9, 8, false),
    );
  });

  it('cấp 1–3: không lặp 1 ô 2 lần liên tiếp (1.000 chuỗi)', () => {
    expect(noRepeatForLevel(3)).toBe(true);
    expect(noRepeatForLevel(4)).toBe(false);
    const rng = mulberry32(3);
    for (let i = 0; i < 1000; i++) {
      const seq = generateSequence(rng, 4, 2 + (i % 10), true);
      for (let k = 1; k < seq.length; k++) expect(seq[k]).not.toBe(seq[k - 1]);
    }
  });

  it('cấp cao vẫn cho phép lặp liền kề; các ô được dùng khá đều', () => {
    const rng = mulberry32(4);
    const counts = new Array<number>(4).fill(0);
    let repeats = 0;
    for (let i = 0; i < 2000; i++) {
      const seq = generateSequence(rng, 4, 6, false);
      seq.forEach((p) => {
        counts[p] = (counts[p] ?? 0) + 1;
      });
      for (let k = 1; k < seq.length; k++) if (seq[k] === seq[k - 1]) repeats++;
    }
    expect(repeats).toBeGreaterThan(0);
    const total = counts.reduce((a, b) => a + b, 0);
    counts.forEach((n) => expect(Math.abs(n / total - 0.25)).toBeLessThan(0.02));
  });
});

describe('luật chơi (TC-006)', () => {
  const rules = (pads: 4 | 6 | 9 = 4, startLen = 2, seed = 1) =>
    new G4Rules(mulberry32(seed), pads, startLen, true);

  function tapAll(r: G4Rules, seq: number[]) {
    let last = 'progress' as ReturnType<G4Rules['tap']>;
    for (const p of seq) last = r.tap(p);
    return last;
  }

  it('bắt đầu với chuỗi dài startLen', () => {
    expect(rules(4, 3).length).toBe(3);
  });

  it('lặp đúng → chuỗi mới dài thêm 1', () => {
    const r = rules(4, 2);
    const first = [...r.sequence];
    expect(r.tap(first[0] as number)).toBe('progress');
    expect(r.tap(first[1] as number)).toBe('sequence-complete');
    expect(r.length).toBe(3);
    expect(r.pos).toBe(0);
    expect(r.maxSpan).toBe(2);
    expect(r.correctSequences).toBe(1);
    expect(r.mistakes).toBe(0);
  });

  it('sai lần 1 → thử lại cùng chuỗi, cùng độ dài, nhập lại từ đầu', () => {
    const r = rules(4, 3);
    const seq = [...r.sequence];
    r.tap(seq[0] as number);
    const wrong = ((seq[1] as number) + 1) % 4;
    expect(r.tap(wrong)).toBe('retry');
    expect(r.sequence).toEqual(seq);
    expect(r.pos).toBe(0);
    expect(r.mistakes).toBe(1);
    expect(tapAll(r, seq)).toBe('sequence-complete'); // làm lại đúng thì đi tiếp bình thường
    expect(r.length).toBe(4);
  });

  it('sai lần thứ 2 trong lượt → kết thúc', () => {
    const r = rules(4, 2);
    expect(r.tap((r.expected + 1) % 4)).toBe('retry');
    expect(r.tap((r.expected + 1) % 4)).toBe('game-over');
    expect(r.mistakes).toBe(MAX_MISTAKES);
  });

  it('2 lần sai không cần liên tiếp: sai – đúng cả chuỗi – sai → vẫn kết thúc', () => {
    const r = rules(4, 2);
    expect(r.tap((r.expected + 1) % 4)).toBe('retry');
    expect(tapAll(r, [...r.sequence])).toBe('sequence-complete');
    expect(r.tap((r.expected + 1) % 4)).toBe('game-over');
  });

  it('đạt chuỗi dài tối đa thì kết thúc', () => {
    const r = rules(4, MAX_LEN - 1);
    tapAll(r, [...r.sequence]);
    expect(r.length).toBe(MAX_LEN);
    expect(tapAll(r, [...r.sequence])).toBe('max-reached');
    expect(r.maxSpan).toBe(MAX_LEN);
  });

  it('metrics và score theo maxSpan', () => {
    const r = rules(6, 3);
    tapAll(r, [...r.sequence]);
    tapAll(r, [...r.sequence]);
    expect(r.metrics()).toEqual({ maxSpan: 4, correctSequences: 2, pads: 6 });
    expect(r.score).toBeCloseTo(scoreFromSpan(4, 3), 10);
  });
});

describe('chấm điểm', () => {
  it('score = clamp((maxSpan − (startLen − 1)) / 4, 0, 1)', () => {
    expect(scoreFromSpan(2, 2)).toBe(0.25);
    expect(scoreFromSpan(3, 3)).toBe(0.25);
    expect(scoreFromSpan(5, 3)).toBe(0.75);
    expect(scoreFromSpan(6, 3)).toBe(1);
    expect(scoreFromSpan(12, 3)).toBe(1);
  });

  it('chưa lặp đúng chuỗi nào (maxSpan = 0) → 0, không âm', () => {
    expect(scoreFromSpan(0, 2)).toBe(0);
    expect(scoreFromSpan(0, 5)).toBe(0);
  });
});

describe('bố cục và nốt nhạc', () => {
  it('lưới: 4 ô 2×2; 9 ô 3×3; 6 ô 2×3 (dọc) hoặc 3×2 (ngang)', () => {
    expect(gridLayout(4, 360, 740)).toEqual({ cols: 2, rows: 2 });
    expect(gridLayout(9, 800, 600)).toEqual({ cols: 3, rows: 3 });
    expect(gridLayout(6, 360, 600)).toEqual({ cols: 2, rows: 3 });
    expect(gridLayout(6, 900, 500)).toEqual({ cols: 3, rows: 2 });
  });

  it('mỗi ô có nốt riêng, tăng dần, trong thang 10 nốt', () => {
    for (const pads of [4, 6, 9]) {
      const notes = Array.from({ length: pads }, (_, i) => noteForPad(i, pads));
      expect(new Set(notes).size).toBe(pads);
      expect([...notes].sort((a, b) => a - b)).toEqual(notes);
      expect(Math.min(...notes)).toBeGreaterThanOrEqual(0);
      expect(Math.max(...notes)).toBeLessThanOrEqual(9);
    }
  });
});
