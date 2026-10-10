// G7 Tìm Quy Luật: cấu hình từ docs/data/levels.json. Nhãn tiếng Việt trong JSON được ánh xạ sang enum ở đây.
import { levelsConfig, type G7Level } from '../levels';
import type { Group } from './puzzles';

export const QUESTIONS_PER_ROUND = 8;
/** Thời gian mỗi câu khi phụ huynh bật “30s”. */
export const TIMER_SEC = 30;

export const ALL_GROUPS: readonly Group[] = ['shapes', 'numbers', 'matrix'];

export interface G7Params {
  /** Số thẻ đáp án (3 hoặc 4; dạng “khác loại” luôn 4 hình). */
  options: number;
  /** Cấp 1–5: được thử lại 1 lần, đúng lần 2 được ½ điểm. Cấp 6+: sai là hiện đáp án. */
  retry: boolean;
}

/** Tùy chọn phụ huynh (F11): nhóm dạng câu và đồng hồ. */
export interface G7Options {
  groups: Group[];
  /** 'off' = không giới hạn thời gian (mặc định); 'sec30' = 30 giây/câu. */
  timer: 'off' | 'sec30';
}

export const DEFAULT_G7_OPTIONS: G7Options = { groups: [...ALL_GROUPS], timer: 'off' };

/** “Có (½ điểm)” → true; false → false. */
export function parseRetry(v: boolean | string): boolean {
  return typeof v === 'string' && v.startsWith('Có');
}

export function readG7Options(raw: Record<string, unknown> | undefined): G7Options {
  const rawGroups = raw?.groups;
  const groups = Array.isArray(rawGroups)
    ? ALL_GROUPS.filter((g) => rawGroups.includes(g))
    : [...ALL_GROUPS];
  return {
    groups: groups.length > 0 ? groups : [...ALL_GROUPS],
    timer: raw?.timer === 'sec30' || raw?.timer === 30 ? 'sec30' : 'off',
  };
}

export function g7LevelRow(level: number): G7Level {
  const levels = levelsConfig.games.G7.levels;
  const i = Math.min(levels.length, Math.max(1, Math.round(level))) - 1;
  return levels[i] as G7Level;
}

export function resolveG7Params(level: number): G7Params {
  const row = g7LevelRow(level);
  return { options: row.options, retry: parseRetry(row.retry) };
}
