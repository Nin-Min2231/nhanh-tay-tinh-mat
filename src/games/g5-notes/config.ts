// G5 Nốt Nhạc Rơi: cấu hình từ docs/data/levels.json.
import { levelsConfig, type G5Level } from '../levels';

export interface G5Params {
  /** Thời gian nốt rơi từ trên xuống vạch đích (ms). */
  fallMs: number;
  /** Mật độ trung bình (nốt/giây, tính cả nốt đôi). */
  density: number;
  /** Tỷ lệ nhịp là nốt đôi (2 làn cùng lúc). */
  doubleRatio: number;
  /** |tap − hit| ≤ perfectMs → Tuyệt. */
  perfectMs: number;
  /** |tap − hit| ≤ goodMs → Tốt. */
  goodMs: number;
  bpm: number;
}

/** Tùy chọn phụ huynh (F11): chỉ ghi đè thời gian rơi / nốt đôi. */
export interface G5Options {
  fall: 'auto' | 'slow' | 'medium' | 'fast';
  doubles: 'auto' | 'off';
}

export const DEFAULT_G5_OPTIONS: G5Options = { fall: 'auto', doubles: 'auto' };

/** Thời gian rơi lấy theo cấp 2 / 5 / 8 của bảng. */
const FALL_LEVEL = { slow: 2, medium: 5, fast: 8 } as const;

export function readG5Options(raw: Record<string, unknown> | undefined): G5Options {
  const fall = raw?.fall;
  return {
    fall: fall === 'slow' || fall === 'medium' || fall === 'fast' ? fall : 'auto',
    doubles: raw?.doubles === 'off' ? 'off' : 'auto',
  };
}

export function g5LevelRow(level: number): G5Level {
  const levels = levelsConfig.games.G5.levels;
  const i = Math.min(levels.length, Math.max(1, Math.round(level))) - 1;
  return levels[i] as G5Level;
}

/** BPM 90–140 tăng dần theo cấp. */
export function bpmForLevel(level: number): number {
  const l = Math.min(10, Math.max(1, Math.round(level)));
  return Math.round(90 + ((l - 1) * 50) / 9);
}

export function resolveG5Params(level: number, options: G5Options): G5Params {
  const row = g5LevelRow(level);
  const fallRow = options.fall === 'auto' ? row : g5LevelRow(FALL_LEVEL[options.fall]);
  return {
    fallMs: fallRow.fallMs,
    density: row.density,
    doubleRatio: options.doubles === 'off' ? 0 : row.doubleRatio,
    perfectMs: row.perfectMs,
    goodMs: row.goodMs,
    bpm: bpmForLevel(level),
  };
}
