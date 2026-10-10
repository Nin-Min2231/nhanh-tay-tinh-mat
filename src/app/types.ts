// Mô hình dữ liệu – docs/01_SPEC.md mục 5.
import type { GameId } from '../games/levels';

export type { GameId };
export type DeviceClass = 'phone' | 'tablet';
export type Grade = 1 | 2 | 3;

export interface MathFact {
  seen: number;
  correct: number;
  streak: number;
  lastSeenRound: number;
  mastered: boolean;
}

export interface GlobalSettings {
  sound: boolean;
  music: boolean;
  vibration: boolean;
  allowKidDifficultyChoice: boolean;
}

export interface GameProgress {
  mode: 'auto' | 'fixed';
  level: number;
  minLevel: number;
  maxLevel: number;
  recentScores: number[];
  options: Record<string, unknown>;
  bestStars: number;
  plays: number;
}

export interface DayUsage {
  playMs: number;
  bonusMs: number;
  missions: { reflex: boolean; focus: boolean; learn: boolean; rewarded: boolean };
  boxesEarned: number;
  starsToday: number;
  restOnTimeRewarded: boolean;
}

export interface Profile {
  id: string;
  name: string;
  avatarId: string;
  grade: Grade;
  createdAt: string;
  limits: { dailyMinutes: number; maxBoxesPerDay: number };
  totalStars: number;
  unlocked: string[];
  outfitId: string | null;
  backgroundId: string | null;
  stickers: Record<string, number>;
  boxes: { pending: number; openedTotal: number; sinceLastRare: number };
  games: Record<GameId, GameProgress>;
  math: { topics: string[]; facts: Record<string, MathFact> };
  days: Record<string, DayUsage>;
  lastBenchmarkAt: string | null;
}

export interface AppState {
  schemaVersion: number;
  deviceId: string;
  activeProfileId: string | null;
  profiles: Profile[];
  settings: GlobalSettings;
  lastBackupAt: string | null;
  installedVersion: string;
}

export type RoundMode = 'auto' | 'fixed' | 'easy' | 'normal' | 'hard';

export interface RoundRecord {
  id: string;
  profileId: string;
  /** G0 = game thử tạm của TASK-02, bị gỡ ở TASK-03. */
  gameId: GameId | 'G0';
  startedAt: string;
  level: number;
  mode: RoundMode;
  benchmark: boolean;
  options: Record<string, unknown>;
  durationMs: number;
  score: number;
  stars: 1 | 2 | 3;
  metrics: Record<string, number>;
  deviceId: string;
  deviceClass: DeviceClass;
}

export interface DailyAggregate {
  date: string;
  gameId: GameId;
  deviceClass: DeviceClass;
  rounds: number;
  avgScore: number;
  avgLevel: number;
  metrics: Record<string, number>;
}
