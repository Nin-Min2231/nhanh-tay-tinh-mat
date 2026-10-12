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

/** Phụ huynh thưởng ngoài đời (F15): tặng thêm giờ hoặc tặng hộp quà, kèm lý do. */
export type RewardReason = 'goodStudy' | 'wellBehaved' | 'chores' | 'other';
export interface RewardLogEntry {
  at: string;
  kind: 'time' | 'box';
  /** Số phút (kind = time) hoặc số hộp (kind = box). */
  amount: number;
  reason: RewardReason;
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
  /** Linh vật đang dùng (id trong rewards.ts, vd 'mascot-owl'); null = Sóc Bo. Thêm ở schema 3. */
  mascotId: string | null;
  /** Bộ âm thanh đang dùng (id trong rewards.ts, vd 'sound-percussion'); null = âm gốc. Thêm ở schema 3. */
  soundSetId: string | null;
  stickers: Record<string, number>;
  boxes: { pending: number; openedTotal: number; sinceLastRare: number };
  games: Record<GameId, GameProgress>;
  math: { topics: string[]; facts: Record<string, MathFact> };
  days: Record<string, DayUsage>;
  lastBenchmarkAt: string | null;
  /** Nhật ký phụ huynh thưởng (mới nhất ở cuối, giữ tối đa 50). Thêm ở schema 2. */
  rewardLog: RewardLogEntry[];
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
  gameId: GameId;
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
