// G5 – logic thuần: sinh nốt theo nhịp, chấm Tuyệt/Tốt/Trượt, combo, điểm. Xem docs/02_GAMES.md mục G5.
import type { Rng } from '../../app/rng';
import { clamp01 } from '../../app/scoring';
import type { G5Params } from './config';

export const ROUND_MS = 75_000;
export const LANES = 4;
/** Vạch đích ở 80% chiều cao vùng chơi. */
export const HIT_LINE = 0.8;
/** Chạm làn không có nốt trong ±1,5 × goodMs → extraTaps. */
export const NEAR_FACTOR = 1.5;
export const GOOD_WEIGHT = 0.6;
export const EXTRA_TAP_WEIGHT = 0.5;
/** Số nốt trong thang ngũ cung 2 quãng tám (C D E G A C D E G A). */
export const PITCHES = 10;

export interface Note {
  /** Thời điểm nốt chạm vạch đích (ms, trục thời gian của lượt). */
  hitTime: number;
  lane: number;
  /** Chỉ số nốt 0–9 trong thang ngũ cung. */
  pitch: number;
}

export function laneOfPitch(pitch: number): number {
  return Math.min(LANES - 1, Math.floor(pitch / 2.5));
}

/** Chọn 1 nốt thuộc làn `lane` (cao độ tăng dần từ trái sang phải). */
export function pitchForLane(lane: number, rng: Rng): number {
  return Math.min(PITCHES - 1, Math.max(0, Math.round(lane * 2.5 + rng() * 2)));
}

/** Thời gian (ms) từ đầu lượt tới nốt đầu tiên chạm vạch: để nốt đầu rơi từ đỉnh màn hình. */
export function firstHitTime(params: Pick<G5Params, 'fallMs'>): number {
  return params.fallMs + 400;
}

/**
 * Sinh toàn bộ nốt của lượt (sắp theo hitTime).
 * Lưới móc đơn theo BPM; mật độ = `density` nốt/giây (đã tính nốt đôi); giai điệu đi bước ngũ cung ngẫu nhiên
 * (tự sinh, không dùng bài hát có sẵn); không có 3 nốt liên tiếp cùng làn.
 */
export function generateSchedule(rng: Rng, params: G5Params, durationMs: number): Note[] {
  const slotMs = 60_000 / params.bpm / 2;
  const t0 = firstHitTime(params);
  const eventsPerSec = params.density / (1 + params.doubleRatio);
  const p = Math.min(1, (eventsPerSec * slotMs) / 1000);
  const notes: Note[] = [];
  let events = 0;
  let pitch = 4;
  let lastLane = -1;
  let lastLane2 = -1;
  for (let k = 0; t0 + k * slotMs <= durationMs; k++) {
    const t = Math.round(t0 + k * slotMs);
    // Bernoulli theo p, có chặn lệch: không để số nhịp lệch quá 1,5 so với kỳ vọng
    const deficit = p * (k + 1) - events;
    const prob = deficit > 1.5 ? 1 : deficit < -1.5 ? 0 : p;
    if (rng() >= prob) continue;
    // giai điệu: bước −2…+2 trong thang ngũ cung
    pitch = Math.min(PITCHES - 1, Math.max(0, pitch + Math.floor(rng() * 5) - 2));
    let lane = laneOfPitch(pitch);
    if (lane === lastLane && lane === lastLane2) {
      lane = (lane + 1 + Math.floor(rng() * (LANES - 1))) % LANES;
      pitch = pitchForLane(lane, rng);
    }
    notes.push({ hitTime: t, lane, pitch });
    events += 1;
    if (params.doubleRatio > 0 && rng() < params.doubleRatio) {
      const lane2 = (lane + 1 + Math.floor(rng() * (LANES - 1))) % LANES;
      notes.push({ hitTime: t, lane: lane2, pitch: pitchForLane(lane2, rng) });
    }
    lastLane2 = lastLane;
    lastLane = lane;
  }
  return notes;
}

export type Judgement = 'perfect' | 'good' | 'near' | 'none';

/** Phân loại độ lệch |tap − hit| (ms). 'near' = lệch hơn “Tốt” nhưng vẫn gần nốt (không tính điểm, không phạt). */
export function judge(absDtMs: number, perfectMs: number, goodMs: number): Judgement {
  if (absDtMs <= perfectMs) return 'perfect';
  if (absDtMs <= goodMs) return 'good';
  if (absDtMs <= goodMs * NEAR_FACTOR) return 'near';
  return 'none';
}

export const PENDING = 0;
export const PERFECT = 1;
export const GOOD = 2;
export const MISS = 3;

export interface Match {
  index: number;
  judgement: Judgement;
}

/**
 * Tìm nốt chưa xử lý ở làn `lane` gần nhất với thời điểm chạm `tapTime`.
 * Không có nốt nào trong ±1,5 × goodMs → { index: -1, judgement: 'none' } (tính extraTaps).
 * `from` = chỉ số nốt chưa xử lý đầu tiên (để không phải quét từ đầu).
 */
export function matchTap(
  notes: readonly Note[],
  state: ArrayLike<number>,
  from: number,
  lane: number,
  tapTime: number,
  perfectMs: number,
  goodMs: number,
): Match {
  const reach = goodMs * NEAR_FACTOR;
  let best = -1;
  let bestD = Infinity;
  for (let i = from; i < notes.length; i++) {
    const n = notes[i] as Note;
    if (n.hitTime - tapTime > reach) break; // các nốt sau còn xa hơn
    if (state[i] !== PENDING || n.lane !== lane) continue;
    const d = Math.abs(tapTime - n.hitTime);
    if (d <= reach && d < bestD) {
      best = i;
      bestD = d;
    }
  }
  if (best < 0) return { index: -1, judgement: 'none' };
  return { index: best, judgement: judge(bestD, perfectMs, goodMs) };
}

export class ComboTracker {
  combo = 0;
  max = 0;
  hit(): void {
    this.combo += 1;
    if (this.combo > this.max) this.max = this.combo;
  }
  miss(): void {
    this.combo = 0;
  }
}

export interface G5Counts {
  perfect: number;
  good: number;
  miss: number;
  extraTaps: number;
}

export function totalNotes(c: G5Counts): number {
  return c.perfect + c.good + c.miss;
}

/** score = (perfect + 0,6 × good) / (totalNotes + 0,5 × extraTaps) */
export function scoreFromCounts(c: G5Counts, total: number = totalNotes(c)): number {
  const denom = total + EXTRA_TAP_WEIGHT * c.extraTaps;
  return denom <= 0 ? 0 : clamp01((c.perfect + GOOD_WEIGHT * c.good) / denom);
}

export function buildMetrics(
  c: G5Counts,
  maxCombo: number,
  total: number = totalNotes(c),
): Record<string, number> {
  const pct = (n: number) => (total === 0 ? 0 : Math.round((n / total) * 1000) / 10);
  return {
    perfectPct: pct(c.perfect),
    goodPct: pct(c.good),
    missPct: pct(c.miss),
    maxCombo,
    extraTaps: c.extraTaps,
  };
}

/** Làn (0–3) theo toạ độ x trong vùng chơi rộng `width`. */
export function laneFromX(x: number, width: number, lanes: number = LANES): number {
  if (width <= 0) return 0;
  return Math.min(lanes - 1, Math.max(0, Math.floor((x / width) * lanes)));
}

/** 0 khi nốt vừa xuất hiện ở đỉnh, 1 khi chạm vạch đích, >1 khi đã qua vạch. Tính theo THỜI GIAN, không theo khung hình. */
export function fallProgress(hitTime: number, now: number, fallMs: number): number {
  return 1 - (hitTime - now) / fallMs;
}
