// Chấm sao – docs/01_SPEC.md mục 7 (F03). Thuần, có test.
import { levelsConfig } from '../games/levels';

export const clamp01 = (n: number): number => Math.min(1, Math.max(0, n));

/** Sao theo điểm: 1 (hoàn thành, khen nỗ lực) · 2 (≥ 0,70) · 3 (≥ 0,90). Luôn ≥ 1 sao. */
export function starsForScore(score: number): 1 | 2 | 3 {
  if (score >= levelsConfig.stars.three) return 3;
  if (score >= levelsConfig.stars.two) return 2;
  return 1;
}
