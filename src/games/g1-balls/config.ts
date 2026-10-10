// G1 Bóng Xanh – Bóng Đỏ: cấu hình từ docs/data/levels.json (không chép tay số liệu).
import { levelsConfig, type G1Level } from '../levels';

export type BallKind = 'green' | 'red' | 'yellow' | 'brown';

/** Thứ tự bóng không phải xanh được thêm dần theo số màu: 2 màu → đỏ; 3 → +vàng; 4 → +nâu. */
export const NON_GREEN_ORDER: readonly Exclude<BallKind, 'green'>[] = ['red', 'yellow', 'brown'];

export interface G1Params {
  displayMs: number;
  colors: 2 | 3 | 4;
  simultaneous: 1 | 2;
  goRatio: number;
  gapMs: [number, number];
}

/** Tùy chọn phụ huynh (F11): 'auto' = theo bảng cấp độ. */
export interface G1Options {
  colors: 'auto' | 2 | 3 | 4;
  simultaneous: 'auto' | 1 | 2;
}

export const DEFAULT_G1_OPTIONS: G1Options = { colors: 'auto', simultaneous: 'auto' };

function oneOf<T extends number>(raw: unknown, allowed: readonly T[]): T | null {
  const n = typeof raw === 'string' ? Number(raw) : raw;
  return allowed.find((a) => a === n) ?? null;
}

export function readG1Options(raw: Record<string, unknown> | undefined): G1Options {
  return {
    colors: oneOf(raw?.colors, [2, 3, 4] as const) ?? 'auto',
    simultaneous: oneOf(raw?.simultaneous, [1, 2] as const) ?? 'auto',
  };
}

export function g1LevelRow(level: number): G1Level {
  const levels = levelsConfig.games.G1.levels;
  const i = Math.min(levels.length, Math.max(1, Math.round(level))) - 1;
  return levels[i] as G1Level;
}

export function resolveG1Params(level: number, options: G1Options): G1Params {
  const row = g1LevelRow(level);
  return {
    displayMs: row.displayMs,
    colors: options.colors === 'auto' ? (row.colors as 2 | 3 | 4) : options.colors,
    simultaneous:
      options.simultaneous === 'auto' ? (row.simultaneous as 1 | 2) : options.simultaneous,
    goRatio: row.goRatio,
    gapMs: [row.gapMs[0], row.gapMs[1]],
  };
}
