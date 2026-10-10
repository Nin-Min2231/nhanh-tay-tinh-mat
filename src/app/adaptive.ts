import type { GameProgress } from './types';

export type KidChoice = 'easy' | 'normal' | 'auto' | 'hard';

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

/** Cấp độ áp dụng cho lượt chơi (SPEC mục 6). TASK-03 bổ sung afterRound + test. */
export function levelForRound(g: GameProgress, kidChoice: KidChoice): number {
  if (g.mode === 'fixed') return g.level;
  if (kidChoice === 'easy') return clamp(g.level - 2, 1, 10);
  if (kidChoice === 'hard') return clamp(g.level + 2, 1, 10);
  return g.level;
}
