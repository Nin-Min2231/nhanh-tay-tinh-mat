// Nguồn cấu hình độ khó: docs/data/levels.json (chỉnh ở đó, không sửa số trong code – TASK-10).
import raw from '../../docs/data/levels.json' with { type: 'json' };

export type GameId = 'G1' | 'G2' | 'G3' | 'G4' | 'G5' | 'G6' | 'G7';
export const GAME_IDS: readonly GameId[] = ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7'];

export interface G1Level {
  displayMs: number;
  colors: number;
  simultaneous: number;
  goRatio: number;
  gapMs: [number, number];
}
export interface G2Level {
  grid: number;
  colorMode: string;
  rotate: boolean;
  order: string;
  targetSec: number;
  hintAfterSec: number | null;
}
export interface G3Level {
  speedPctW: number;
  sizePct: number;
  count: number;
  decoys: number;
  erratic: boolean | string;
}
export interface G4Level {
  pads: number;
  startLen: number;
  flashMs: number;
  gapMs: number;
}
export interface G5Level {
  fallMs: number;
  density: number;
  doubleRatio: number;
  perfectMs: number;
  goodMs: number;
}
export interface G6Level {
  secPerQ: number;
  options: number;
  sway: boolean;
  missing: boolean | string;
  range: string;
}
export interface G7Level {
  types: string;
  options: number;
  retry: boolean | string;
}

export interface LevelsByGame {
  G1: G1Level;
  G2: G2Level;
  G3: G3Level;
  G4: G4Level;
  G5: G5Level;
  G6: G6Level;
  G7: G7Level;
}

export interface GameConfig<L> {
  name: string;
  params: Record<string, string>;
  levels: L[];
}

export interface MathTopic {
  code: string;
  grade: 1 | 2 | 3;
  name: string;
  example: string;
}

export interface LevelsConfig {
  version: string;
  adaptive: {
    /** Số lượt 3 sao liên tiếp (cùng chế độ, cùng cấp) để lên 1 cấp. */
    upStreak: number;
    /** Số lượt liên tiếp chỉ 1 sao để xuống 1 cấp (lượt kế cuối nhắc bé nhẹ nhàng). */
    downStreak: number;
    /** Chênh cấp nội dung của chế độ Dễ so với số cấp của chế độ (âm = nhẹ hơn). */
    kidEasyDelta: number;
    /** Chênh cấp nội dung của chế độ Khó so với số cấp của chế độ. */
    kidHardDelta: number;
  };
  stars: { two: number; three: number };
  benchmark: Record<GameId, number>;
  games: { [K in GameId]: GameConfig<LevelsByGame[K]> };
  mathTopics: MathTopic[];
  mathDefaultByGrade: Record<'1' | '2' | '3', string[]>;
  unlocks: { stars: number; reward: string }[];
  rewards: {
    rarity: { common: number; rare: number; legendary: number };
    stickers: { common: number; rare: number; legendary: number };
    pityAfter: number;
    duplicateStars: number;
    boxEveryStars: number;
    maxBoxesPerDayDefault: number;
    restOnTimeStars: number;
  };
  session: {
    dailyMinutesDefault: number;
    dailyMinutesRange: [number, number];
    warnBeforeMin: number;
    overtimeMaxSec: number;
  };
}

// JSON import không biết tuple/union → ép kiểu qua unknown một lần, test kiểm tra hình dạng dữ liệu.
export const levelsConfig = raw as unknown as LevelsConfig;
