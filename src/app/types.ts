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

/** Lựa chọn độ khó của bé ở màn Giới thiệu. Mỗi lựa chọn có một “sổ cấp” riêng trong mỗi game (schema 4). */
export type KidChoice = 'easy' | 'normal' | 'auto' | 'hard';

/** Tiến độ của MỘT chế độ trong MỘT game. */
export interface ModeTrack {
  /** Cấp của chế độ (1–10). Cấp nội dung thật = cấp này + chênh của chế độ (Dễ −2, Khó +2), xem adaptive.ts. */
  level: number;
  /** Sao cao nhất đã đạt ở cấp hiện tại (0–3); về 0 khi đổi cấp. */
  stars: number;
  /** Sao (1–3) của tối đa 3 lượt gần nhất ở cấp hiện tại; xóa khi đổi cấp. */
  recent: number[];
}

export interface GameProgress {
  /** Phụ huynh: ‘auto’ = bé chọn chế độ, mỗi chế độ một cấp riêng; ‘fixed’ = luôn chơi một cấp (`level`). */
  mode: 'auto' | 'fixed';
  /** Cấp cố định – chỉ dùng khi mode = ‘fixed’. */
  level: number;
  /** Khoảng cấp phụ huynh cho phép (áp cho cả 4 sổ cấp). */
  minLevel: number;
  maxLevel: number;
  /** Sổ cấp theo lựa chọn của bé. Thêm ở schema 4 (thay `level`/`recentScores` cũ của chế độ Tự động). */
  tracks: Record<KidChoice, ModeTrack>;
  /** Chế độ bé chơi gần nhất: hiện trên thẻ game ở Home và mở sẵn ở màn Giới thiệu. Thêm ở schema 4. */
  lastChoice: KidChoice;
  options: Record<string, unknown>;
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
  /** Cấp nội dung thật đã chơi (bảng levels.json) – dùng cho biểu đồ độ khó. */
  level: number;
  /** Cấp của chế độ bé thấy lúc chơi (Dễ cấp 3 → level 1). Thiếu ở lượt cũ, bài đo và chế độ Cố định. Thêm ở 1.1.0. */
  trackLevel?: number;
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
