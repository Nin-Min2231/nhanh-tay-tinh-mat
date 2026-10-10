import { describe, expect, it } from 'vitest';
import { GAME_IDS, levelsConfig } from './levels';

describe('levels.json', () => {
  it('có đủ 7 game, mỗi game 10 cấp', () => {
    expect(GAME_IDS).toHaveLength(7);
    for (const id of GAME_IDS) {
      expect(levelsConfig.games[id].levels).toHaveLength(10);
    }
  });

  it('cấp bài đo chuẩn nằm trong 1–10', () => {
    for (const id of GAME_IDS) {
      const lv = levelsConfig.benchmark[id];
      expect(lv).toBeGreaterThanOrEqual(1);
      expect(lv).toBeLessThanOrEqual(10);
    }
  });

  it('tỷ lệ độ hiếm hộp quà cộng lại bằng 1', () => {
    const { common, rare, legendary } = levelsConfig.rewards.rarity;
    expect(common + rare + legendary).toBeCloseTo(1, 10);
  });
});
