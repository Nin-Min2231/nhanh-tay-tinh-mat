// Độ khó thích ứng – docs/01_SPEC.md mục 6 (F04, F11, F12). Thuần, có test.
// Mỗi game có 4 “sổ cấp” độc lập theo lựa chọn của bé (Dễ / Vừa / Tự động / Khó). Ngưỡng đọc từ docs/data/levels.json → adaptive.
import { levelsConfig } from '../games/levels';
import type { GameProgress, KidChoice, ModeTrack } from './types';

export type { KidChoice };
export type LevelChange = 'up' | 'down' | 'none';

export const KID_CHOICES: readonly KidChoice[] = ['easy', 'normal', 'auto', 'hard'];
export const MIN_LEVEL = 1;
export const MAX_LEVEL = 10;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Chênh cấp nội dung của chế độ so với số cấp của chế độ đó: Dễ −2, Khó +2, còn lại 0 (levels.json). */
export function choiceOffset(choice: KidChoice): number {
  if (choice === 'easy') return levelsConfig.adaptive.kidEasyDelta;
  if (choice === 'hard') return levelsConfig.adaptive.kidHardDelta;
  return 0;
}

/** Cấp của chế độ (cấp bé thấy), kẹp trong khoảng min–max của phụ huynh. */
export function trackLevel(g: GameProgress, choice: KidChoice): number {
  return clamp(g.tracks[choice].level, g.minLevel, g.maxLevel);
}

/**
 * Cấp nội dung (dòng của bảng levels.json) áp dụng cho lượt chơi.
 * - Cố định: luôn là cấp đã đặt; lựa chọn Dễ/Khó của bé không có tác dụng.
 * - Tự động (của phụ huynh): cấp của chế độ bé chọn + chênh (Dễ −2, Khó +2), kẹp trong 1–10.
 */
export function levelForRound(g: GameProgress, choice: KidChoice): number {
  if (g.mode === 'fixed') return clamp(g.level, MIN_LEVEL, MAX_LEVEL);
  return clamp(trackLevel(g, choice) + choiceOffset(choice), MIN_LEVEL, MAX_LEVEL);
}

/** Số sao của các lượt cuối của sổ có đủ `n` lượt, toàn bằng `star`? */
function lastAll(recent: readonly number[], n: number, star: number): boolean {
  return n > 0 && recent.length >= n && recent.slice(-n).every((s) => s === star);
}

export interface RoundOutcome {
  progress: GameProgress;
  change: LevelChange;
  /** Cấp của chế độ vừa chơi, sau lượt này. */
  newLevel: number;
}

/**
 * Cập nhật tiến độ sau một lượt (chỉ sổ của chế độ vừa chơi):
 * - `upStreak` lượt 3 sao liên tiếp → lên 1 cấp; `downStreak` lượt liên tiếp chỉ 1 sao → xuống 1 cấp
 *   (chỉ trong khoảng min–max của phụ huynh). Đổi cấp thì sao và lịch sử của sổ đó về 0.
 * - `counts` chỉ true khi game ở chế độ Tự động của phụ huynh và không phải bài đo chuẩn.
 */
export function applyRound(
  g: GameProgress,
  choice: KidChoice,
  stars: number,
  counts: boolean,
): RoundOutcome {
  if (g.mode === 'fixed' || !counts) {
    return { progress: g, change: 'none', newLevel: trackLevel(g, choice) };
  }
  const A = levelsConfig.adaptive;
  const before = g.tracks[choice];
  const level = trackLevel(g, choice);
  const recent = [...before.recent, stars].slice(-Math.max(A.upStreak, A.downStreak, 1));

  let next: ModeTrack = { level, stars: Math.max(before.stars, stars), recent };
  let change: LevelChange = 'none';
  if (lastAll(recent, A.upStreak, 3) && level < g.maxLevel) {
    next = { level: level + 1, stars: 0, recent: [] };
    change = 'up';
  } else if (lastAll(recent, A.downStreak, 1) && level > g.minLevel) {
    next = { level: level - 1, stars: 0, recent: [] };
    change = 'down';
  }
  return {
    progress: { ...g, lastChoice: choice, tracks: { ...g.tracks, [choice]: next } },
    change,
    newLevel: next.level,
  };
}

/**
 * Lượt kế tiếp là lượt cuối trước khi xuống cấp (đã có `downStreak − 1` lượt liên tiếp chỉ 1 sao, và còn cấp để xuống):
 * màn Giới thiệu nhắc bé nhẹ nhàng.
 */
export function dropWarning(g: GameProgress, choice: KidChoice): boolean {
  if (g.mode === 'fixed') return false;
  const need = levelsConfig.adaptive.downStreak - 1;
  return lastAll(g.tracks[choice].recent, need, 1) && trackLevel(g, choice) > g.minLevel;
}
