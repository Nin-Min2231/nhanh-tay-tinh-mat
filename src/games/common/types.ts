// Giao diện chung cho game – docs/01_SPEC.md mục 4.
import type { AudioApi } from '../../app/audio';
import type { HapticsApi } from '../../app/haptics';
import type { Rng } from '../../app/rng';
import type { GameId, Grade, MathFact } from '../../app/types';

export interface GameContext {
  /** 1–10 đã áp dụng (sau Dễ/Khó hoặc chế độ Cố định). */
  level: number;
  /** Tùy chọn phụ huynh của game (vd { colors: 4 }). */
  options: Record<string, unknown>;
  profile: { grade: Grade; mathTopics: string[]; mathFacts: Record<string, MathFact> };
  /** RNG có seed. */
  rng: Rng;
  audio: AudioApi;
  haptics: HapticsApi;
  benchmark: boolean;
  /** Hệ số rút ngắn độ dài lượt (chỉ >1 khi chạy e2e; chơi thật luôn là 1). Không đổi tốc độ/thời gian hiện của vật. */
  timeScale: number;
  onFinish(result: RoundResult): void;
}

export interface GameInstance {
  start(): void;
  pause(): void;
  resume(): void;
  destroy(): void;
  /**
   * Kết thúc lượt ngay với kết quả hiện có rồi gọi ctx.onFinish.
   * Host gọi khi đã chơi lố giờ quá 90 giây (SPEC mục 3). Tùy chọn: game không có thì host tự tạo kết quả rỗng.
   */
  finish?(): void;
}

export interface GameModule {
  id: GameId;
  create(host: HTMLElement, ctx: GameContext): GameInstance;
}

export interface RoundResult {
  /** 0–1 */
  score: number;
  /** Thời gian Running thực tế (ms). */
  durationMs: number;
  /** Chỉ số riêng từng game (docs/02_GAMES.md). */
  metrics: Record<string, number>;
  /** Vd danh sách phép tính sai (G6). */
  extra?: Record<string, unknown>;
}
