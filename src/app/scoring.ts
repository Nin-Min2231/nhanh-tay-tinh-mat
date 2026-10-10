import { levelsConfig } from '../games/levels';

/** Sao theo điểm: luôn ≥ 1 khi hoàn thành lượt (khen nỗ lực). TASK-03 bổ sung test đầy đủ. */
export function starsForScore(score: number): 1 | 2 | 3 {
  if (score >= levelsConfig.stars.three) return 3;
  if (score >= levelsConfig.stars.two) return 2;
  return 1;
}
