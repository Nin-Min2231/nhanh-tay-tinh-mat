// G1 – logic thuần (sinh bóng, vị trí, chấm điểm). Xem docs/02_GAMES.md mục G1.
import type { Rng } from '../../app/rng';
import { NON_GREEN_ORDER, type BallKind, type G1Params } from './config';

export const ROUND_MS = 60_000;
/** RT < 120ms coi là đoán trước, không tính vào trung bình. */
export const ANTICIPATION_MS = 120;
/** Vùng trúng = bán kính + 8px. */
export const HIT_SLOP_PX = 8;
/** Chiều cao dải HUD vẽ trong canvas (thanh tiến độ + số bóng đã chạm); bóng không được chồng lên. */
export const HUD_HEIGHT = 44;
/** Cách mép ≥ 16px. */
export const EDGE_MARGIN = 16;
const MIN_DIAMETER = 64;
const BALL_GAP = 12;

export function nonGreenKinds(colors: number): BallKind[] {
  return NON_GREEN_ORDER.slice(0, Math.max(1, colors - 1));
}

/** Bóng đường kính ≈ 18% cạnh ngắn vùng chơi, tối thiểu 64px. */
export function ballDiameter(width: number, height: number): number {
  return Math.max(MIN_DIAMETER, Math.round(0.18 * Math.min(width, height)));
}

/**
 * Bộ sinh các nhóm bóng. Mỗi bóng độc lập theo `goRatio`; khi 2 bóng cùng lúc,
 * đảm bảo ≥ 50% số nhóm có ít nhất 1 bóng xanh.
 */
export class SpawnPlanner {
  events = 0;
  eventsWithGreen = 0;
  private readonly others: BallKind[];

  constructor(
    private readonly rng: Rng,
    private readonly params: G1Params,
  ) {
    this.others = nonGreenKinds(params.colors);
  }

  next(): BallKind[] {
    const kinds: BallKind[] = [];
    for (let i = 0; i < this.params.simultaneous; i++) {
      kinds.push(this.rng() < this.params.goRatio ? 'green' : this.pickOther());
    }
    if (this.params.simultaneous === 2 && !kinds.includes('green')) {
      // Thêm nhóm không có bóng xanh nhưng làm tỷ lệ < 50% → ép 1 bóng thành xanh
      if (this.eventsWithGreen / (this.events + 1) < 0.5) kinds[this.rng() < 0.5 ? 0 : 1] = 'green';
    }
    this.events += 1;
    if (kinds.includes('green')) this.eventsWithGreen += 1;
    return kinds;
  }

  private pickOther(): BallKind {
    return this.others[Math.floor(this.rng() * this.others.length)] as BallKind;
  }
}

export interface PlayArea {
  width: number;
  height: number;
}

export interface Point {
  x: number;
  y: number;
}

/**
 * Chọn vị trí tâm cho `count` bóng: trong vùng chơi, cách mép ≥ 16px, không chồng HUD, không chồng nhau.
 * Vùng chơi quá nhỏ → dùng vị trí dự phòng (vẫn nằm trong khung).
 */
export function pickPositions(rng: Rng, area: PlayArea, diameter: number, count: number): Point[] {
  const r = diameter / 2;
  const minX = EDGE_MARGIN + r;
  const maxX = Math.max(minX, area.width - EDGE_MARGIN - r);
  const minY = HUD_HEIGHT + EDGE_MARGIN + r;
  const maxY = Math.max(minY, area.height - EDGE_MARGIN - r);
  const out: Point[] = [];
  for (let i = 0; i < count; i++) {
    let placed: Point | null = null;
    for (let tries = 0; tries < 40 && !placed; tries++) {
      const p = { x: minX + rng() * (maxX - minX), y: minY + rng() * (maxY - minY) };
      if (out.every((q) => Math.hypot(p.x - q.x, p.y - q.y) >= diameter + BALL_GAP)) placed = p;
    }
    if (!placed) {
      // dự phòng: bóng sau đặt đối xứng qua tâm vùng chơi
      const first = out[0];
      placed = first
        ? { x: minX + maxX - first.x, y: minY + maxY - first.y }
        : { x: (minX + maxX) / 2, y: (minY + maxY) / 2 };
    }
    out.push(placed);
  }
  return out;
}

export interface G1Stats {
  hits: number;
  misses: number;
  falseAlarms: number;
  correctRejections: number;
  emptyTaps: number;
}

export function emptyStats(): G1Stats {
  return { hits: 0, misses: 0, falseAlarms: 0, correctRejections: 0, emptyTaps: 0 };
}

export function totalBalls(s: G1Stats): number {
  return s.hits + s.misses + s.falseAlarms + s.correctRejections;
}

/** score = (hits + correctRejections) / (tổng số bóng + emptyTaps) */
export function scoreFromStats(s: G1Stats): number {
  const denom = totalBalls(s) + s.emptyTaps;
  return denom === 0 ? 0 : (s.hits + s.correctRejections) / denom;
}

/** Trung bình và trung vị RT (ms), bỏ các giá trị < 120ms (đoán trước). 0 nếu không có dữ liệu. */
export function reactionStats(rts: readonly number[]): {
  mean: number;
  median: number;
  used: number;
} {
  const valid = rts.filter((t) => t >= ANTICIPATION_MS).sort((a, b) => a - b);
  if (valid.length === 0) return { mean: 0, median: 0, used: 0 };
  const mean = valid.reduce((a, b) => a + b, 0) / valid.length;
  const mid = Math.floor(valid.length / 2);
  const median =
    valid.length % 2
      ? (valid[mid] as number)
      : ((valid[mid - 1] as number) + (valid[mid] as number)) / 2;
  return { mean, median, used: valid.length };
}

export function buildMetrics(s: G1Stats, rts: readonly number[]): Record<string, number> {
  const rt = reactionStats(rts);
  const balls = totalBalls(s);
  return {
    rtMeanMs: Math.round(rt.mean),
    rtMedianMs: Math.round(rt.median),
    accuracy: balls === 0 ? 0 : Math.round(((s.hits + s.correctRejections) / balls) * 1000) / 1000,
    hits: s.hits,
    misses: s.misses,
    falseAlarms: s.falseAlarms,
    correctRejections: s.correctRejections,
    emptyTaps: s.emptyTaps,
  };
}

/** Bóng (tâm + bán kính) có chứa điểm chạm không (kèm dung sai +8px)? Trả về bình phương khoảng cách, hoặc -1. */
export function hitDistanceSq(cx: number, cy: number, r: number, x: number, y: number): number {
  const dx = x - cx;
  const dy = y - cy;
  const d2 = dx * dx + dy * dy;
  const reach = r + HIT_SLOP_PX;
  return d2 <= reach * reach ? d2 : -1;
}
