// Độ khó thích ứng – docs/01_SPEC.md mục 6 (F04, F11, F12). Thuần, có test.
// Ngưỡng đọc từ docs/data/levels.json → adaptive.
import { levelsConfig } from '../games/levels';
import type { GameProgress } from './types';

export type KidChoice = 'easy' | 'normal' | 'auto' | 'hard';
export type LevelChange = 'up' | 'down' | 'none';

export const MIN_LEVEL = 1;
export const MAX_LEVEL = 10;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));
const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;

/**
 * Cấp độ áp dụng cho lượt chơi.
 * - Cố định: luôn là cấp đã đặt; Dễ/Khó của bé không có tác dụng.
 * - Tự động: cấp hiện tại (kẹp trong min–max của phụ huynh); Dễ −2, Khó +2 (kẹp 1–10); Vừa và Tự động giữ nguyên.
 */
export function levelForRound(g: GameProgress, kidChoice: KidChoice): number {
  if (g.mode === 'fixed') return clamp(g.level, MIN_LEVEL, MAX_LEVEL);
  const base = clamp(g.level, g.minLevel, g.maxLevel);
  if (kidChoice === 'easy')
    return clamp(base + levelsConfig.adaptive.kidEasyDelta, MIN_LEVEL, MAX_LEVEL);
  if (kidChoice === 'hard')
    return clamp(base + levelsConfig.adaptive.kidHardDelta, MIN_LEVEL, MAX_LEVEL);
  return base;
}

/**
 * Cập nhật tiến độ sau một lượt.
 * `countsForAdaptive` chỉ true với lượt ở chế độ Tự động mà bé chọn “Tự động”, và không phải bài đo chuẩn.
 */
export function applyRound(
  g: GameProgress,
  score: number,
  countsForAdaptive: boolean,
): { progress: GameProgress; change: LevelChange } {
  if (g.mode === 'fixed' || !countsForAdaptive) return { progress: g, change: 'none' };
  const A = levelsConfig.adaptive;
  const s = [...g.recentScores, score].slice(-A.window);
  const avg = mean(s);
  const twoLow =
    s.length >= 2 && (s.at(-1) as number) < A.twoLowBelow && (s.at(-2) as number) < A.twoLowBelow;

  let level = g.level;
  let recentScores = s;
  if (s.length === A.window && avg >= A.upAvg) {
    level = Math.min(g.level + 1, g.maxLevel);
    recentScores = [];
  } else if ((s.length === A.window && avg <= A.downAvg) || twoLow) {
    level = Math.max(g.level - 1, g.minLevel);
    recentScores = [];
  }
  const change: LevelChange = level > g.level ? 'up' : level < g.level ? 'down' : 'none';
  return { progress: { ...g, level, recentScores }, change };
}

export function afterRound(
  g: GameProgress,
  score: number,
  countsForAdaptive: boolean,
): GameProgress {
  return applyRound(g, score, countsForAdaptive).progress;
}
