// G6 Hái Táo Tính Nhẩm: cấu hình từ docs/data/levels.json. Nhãn tiếng Việt trong JSON được ánh xạ sang số/enum ở đây.
import type { Grade } from '../../app/types';
import { levelsConfig, type G6Level } from '../levels';

export const QUESTIONS_PER_ROUND = 10;

export interface G6Params {
  secPerQ: number;
  /** Số quả táo trên cây (M03 luôn chỉ có 3). */
  options: number;
  sway: boolean;
  /** Tỷ lệ câu đổi sang dạng tìm số thiếu (0–0,4). */
  missingRatio: number;
  /** Cấp 1–3: dùng phạm vi “nửa dễ” của từng chủ đề. */
  easy: boolean;
}

/** Tùy chọn phụ huynh (F17): topics = null → theo hồ sơ/lớp. */
export interface G6Options {
  topics: string[] | null;
  grade: Grade | null;
  timer: 'auto' | 'off';
}

export const DEFAULT_G6_OPTIONS: G6Options = { topics: null, grade: null, timer: 'auto' };

export const TOPIC_CODES: readonly string[] = levelsConfig.mathTopics.map((t) => t.code);

/** “20% câu” → 0,2; false → 0. */
export function parseMissing(v: boolean | string): number {
  if (typeof v === 'string') {
    const n = Number.parseInt(v, 10);
    return Number.isFinite(n) ? n / 100 : 0;
  }
  return 0;
}

/** “Nhỏ (nửa dễ)” → true; “Đầy đủ” → false. */
export function parseEasyRange(label: string): boolean {
  return label.includes('nửa dễ');
}

export function readG6Options(raw: Record<string, unknown> | undefined): G6Options {
  const rawTopics = raw?.topics;
  const topics = Array.isArray(rawTopics)
    ? rawTopics.filter((t): t is string => typeof t === 'string' && TOPIC_CODES.includes(t))
    : [];
  const g = typeof raw?.grade === 'string' ? Number(raw.grade) : raw?.grade;
  return {
    topics: topics.length > 0 ? topics : null,
    grade: g === 1 || g === 2 || g === 3 ? g : null,
    timer: raw?.timer === 'off' ? 'off' : 'auto',
  };
}

export function g6LevelRow(level: number): G6Level {
  const levels = levelsConfig.games.G6.levels;
  const i = Math.min(levels.length, Math.max(1, Math.round(level))) - 1;
  return levels[i] as G6Level;
}

export function resolveG6Params(level: number): G6Params {
  const row = g6LevelRow(level);
  return {
    secPerQ: row.secPerQ,
    options: row.options,
    sway: row.sway,
    missingRatio: parseMissing(row.missing),
    easy: parseEasyRange(row.range),
  };
}

/**
 * Chủ đề đang bật: tùy chọn `topics` > mặc định của lớp trong tùy chọn `grade` > chủ đề của hồ sơ > mặc định theo lớp hồ sơ.
 */
export function resolveG6Topics(
  options: G6Options,
  profile: { grade: Grade; mathTopics: string[] },
): string[] {
  const valid = (list: readonly string[]) => list.filter((t) => TOPIC_CODES.includes(t));
  if (options.topics) return valid(options.topics);
  if (options.grade) return [...levelsConfig.mathDefaultByGrade[`${options.grade}`]];
  const own = valid(profile.mathTopics);
  return own.length > 0 ? own : [...levelsConfig.mathDefaultByGrade[`${profile.grade}`]];
}
