import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../app/rng';
import { levelsConfig } from '../levels';
import {
  DEFAULT_G2_OPTIONS,
  HINT_DEFAULT_SEC,
  g2LevelRow,
  parseBackward,
  parseColorMode,
  readG2Options,
  resolveG2Params,
} from './config';
import {
  COLOR_COUNT,
  cellCount,
  generateBoard,
  needsUnderline,
  partialScore,
  randomColors,
  scoreFromRound,
  shuffle,
  targetSequence,
} from './logic';

describe('cấu hình G2 từ levels.json', () => {
  it('10 cấp khớp bảng trong docs/02_GAMES.md', () => {
    expect(levelsConfig.games.G2.levels).toHaveLength(10);
    expect(resolveG2Params(1, DEFAULT_G2_OPTIONS)).toEqual({
      grid: 3,
      colorMode: 'mono',
      rotate: false,
      backward: false,
      targetSec: 20,
      hintAfterSec: 4,
    });
    expect(resolveG2Params(5, DEFAULT_G2_OPTIONS)).toMatchObject({
      grid: 4,
      colorMode: 'multi',
      rotate: true,
    });
    expect(resolveG2Params(9, DEFAULT_G2_OPTIONS)).toMatchObject({
      grid: 5,
      backward: true,
      targetSec: 70,
    });
    expect(resolveG2Params(10, DEFAULT_G2_OPTIONS)).toMatchObject({
      colorMode: 'cycle',
      rotate: true,
    });
  });

  it('ánh xạ nhãn tiếng Việt sang enum', () => {
    expect(parseColorMode('1 màu')).toBe('mono');
    expect(parseColorMode('Nhiều màu')).toBe('multi');
    expect(parseColorMode('Màu ô đổi mỗi 3s')).toBe('cycle');
    expect(parseBackward('Xuôi')).toBe(false);
    expect(parseBackward('Ngược 25→1')).toBe(true);
  });

  it('gợi ý chỉ có ở cấp 1–2; các cấp khác tắt', () => {
    expect(g2LevelRow(1).hintAfterSec).toBe(4);
    expect(g2LevelRow(2).hintAfterSec).toBe(6);
    for (let l = 3; l <= 10; l++)
      expect(resolveG2Params(l, DEFAULT_G2_OPTIONS).hintAfterSec).toBeNull();
  });

  it('tùy chọn PH: gợi ý bật/tắt, thứ tự, cỡ bảng', () => {
    expect(resolveG2Params(6, { ...DEFAULT_G2_OPTIONS, hint: 'on' }).hintAfterSec).toBe(
      HINT_DEFAULT_SEC,
    );
    expect(resolveG2Params(1, { ...DEFAULT_G2_OPTIONS, hint: 'off' }).hintAfterSec).toBeNull();
    expect(resolveG2Params(2, { ...DEFAULT_G2_OPTIONS, hint: 'on' }).hintAfterSec).toBe(6);
    expect(resolveG2Params(3, { ...DEFAULT_G2_OPTIONS, order: 'backward' }).backward).toBe(true);
    expect(resolveG2Params(9, { ...DEFAULT_G2_OPTIONS, order: 'forward' }).backward).toBe(false);
    const g5 = resolveG2Params(3, { ...DEFAULT_G2_OPTIONS, grid: 5 });
    expect(g5.grid).toBe(5);
    expect(g5.targetSec).toBe(Math.round((40 * 25) / 16)); // thời gian mục tiêu đổi theo số ô
  });

  it('readG2Options bỏ giá trị lạ', () => {
    expect(readG2Options({ grid: '4', order: 'backward', hint: 'on' })).toEqual({
      grid: 4,
      order: 'backward',
      hint: 'on',
    });
    expect(readG2Options({ grid: 9, order: 'x', hint: 1 })).toEqual(DEFAULT_G2_OPTIONS);
    expect(readG2Options(undefined)).toEqual(DEFAULT_G2_OPTIONS);
  });
});

describe('sinh bảng', () => {
  it('đủ 1..N, không trùng, với mọi cỡ bảng và nhiều seed', () => {
    for (const grid of [3, 4, 5] as const) {
      const n = cellCount(grid);
      for (let seed = 1; seed <= 200; seed++) {
        const b = generateBoard(mulberry32(seed), { grid, colorMode: 'multi', rotate: true });
        expect([...b.numbers].sort((a, c) => a - c)).toEqual(
          Array.from({ length: n }, (_, i) => i + 1),
        );
        expect(b.colors).toHaveLength(n);
        expect(b.rotations).toHaveLength(n);
      }
    }
  });

  it('cùng seed → cùng bảng; khác seed → khác bảng', () => {
    const p = { grid: 5, colorMode: 'multi', rotate: true } as const;
    expect(generateBoard(mulberry32(1), p)).toEqual(generateBoard(mulberry32(1), p));
    expect(generateBoard(mulberry32(1), p).numbers).not.toEqual(
      generateBoard(mulberry32(2), p).numbers,
    );
  });

  it('1 màu: mọi ô cùng màu; nhiều màu: dùng nhiều màu trong khoảng 0..4', () => {
    const mono = generateBoard(mulberry32(3), { grid: 5, colorMode: 'mono', rotate: false });
    expect(new Set(mono.colors).size).toBe(1);
    const multi = generateBoard(mulberry32(3), { grid: 5, colorMode: 'multi', rotate: false });
    expect(new Set(multi.colors).size).toBeGreaterThan(1);
    multi.colors.forEach((c) => {
      expect(c).toBeGreaterThanOrEqual(0);
      expect(c).toBeLessThan(COLOR_COUNT);
    });
  });

  it('chỉ xoay khi bật “Số xoay”, góc thuộc {0, 90, 180, 270}', () => {
    const off = generateBoard(mulberry32(4), { grid: 5, colorMode: 'multi', rotate: false });
    expect(new Set(off.rotations)).toEqual(new Set([0]));
    const on = generateBoard(mulberry32(4), { grid: 5, colorMode: 'multi', rotate: true });
    expect(new Set(on.rotations).size).toBeGreaterThan(1);
    on.rotations.forEach((r) => expect([0, 90, 180, 270]).toContain(r));
  });

  it('đổi màu (cấp 10) chỉ tạo mảng màu mới, không đụng tới vị trí số', () => {
    const rng = mulberry32(8);
    const b = generateBoard(rng, { grid: 5, colorMode: 'cycle', rotate: true });
    const before = [...b.numbers];
    const next = randomColors(rng, 25);
    expect(next).toHaveLength(25);
    expect(b.numbers).toEqual(before);
  });

  it('shuffle không làm mất phần tử và không sửa mảng gốc', () => {
    const src = [1, 2, 3, 4, 5, 6];
    const out = shuffle(mulberry32(5), src);
    expect(src).toEqual([1, 2, 3, 4, 5, 6]);
    expect([...out].sort()).toEqual(src);
  });
});

describe('thứ tự chạm', () => {
  it('xuôi 1 → N', () => {
    expect(targetSequence({ grid: 3, backward: false })).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  it('ngược 25 → 1 (cấp 9)', () => {
    const seq = targetSequence({ grid: 5, backward: true });
    expect(seq[0]).toBe(25);
    expect(seq.at(-1)).toBe(1);
    expect(seq).toHaveLength(25);
  });
});

describe('gạch chân số dễ nhầm khi xoay', () => {
  it('khi xoay: 6, 9, 16, 19 có gạch chân; số khác thì không', () => {
    for (const n of [6, 9, 16, 19]) expect(needsUnderline(n, true)).toBe(true);
    for (const n of [1, 2, 3, 4, 5, 7, 8, 10, 11, 12, 13, 14, 15, 17, 18, 20, 25]) {
      expect(needsUnderline(n, true)).toBe(false);
    }
  });

  it('không xoay thì không gạch chân', () => {
    expect(needsUnderline(6, false)).toBe(false);
    expect(needsUnderline(9, false)).toBe(false);
  });
});

describe('chấm điểm', () => {
  it('score = clamp(target/time, 0, 1) × max(0, 1 − 0,05 × lỗi)', () => {
    expect(scoreFromRound(20, 10, 0)).toBe(1); // nhanh hơn mục tiêu → tối đa
    expect(scoreFromRound(20, 40, 0)).toBe(0.5);
    expect(scoreFromRound(20, 20, 2)).toBeCloseTo(0.9, 10);
    expect(scoreFromRound(20, 40, 4)).toBeCloseTo(0.5 * 0.8, 10);
  });

  it('20 lỗi trở lên → 0; không âm', () => {
    expect(scoreFromRound(20, 20, 20)).toBe(0);
    expect(scoreFromRound(20, 20, 50)).toBe(0);
  });

  it('thời gian bằng 0 không gây chia cho 0', () => {
    expect(scoreFromRound(20, 0, 0)).toBe(1);
  });

  it('lượt bị buộc kết thúc: nhân thêm tỷ lệ số đã tìm', () => {
    expect(partialScore(1, 4, 16)).toBe(0.25);
    expect(partialScore(0.8, 16, 16)).toBe(0.8);
    expect(partialScore(1, 0, 0)).toBe(0);
  });
});
