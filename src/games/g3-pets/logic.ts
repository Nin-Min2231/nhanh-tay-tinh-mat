// G3 – logic thuần (chuyển động, va chạm mép, hit-test, chấm điểm). Xem docs/02_GAMES.md mục G3.
import type { Rng } from '../../app/rng';
import { clamp01 } from '../../app/scoring';

export const ROUND_MS = 60_000;
/** Vùng trúng = bán kính + 8px. */
export const HIT_SLOP_PX = 8;
/** Kích thước thú tối thiểu 48px. */
export const MIN_SIZE_PX = 48;
export const RESPAWN_MS = 300;
/** Bật khỏi mép với góc so với mép ≥ 20° (chống kẹt/chạy dọc sát mép). */
export const MIN_BOUNCE_DEG = 20;
export const ERRATIC_MIN_MS = 1000;
export const ERRATIC_MAX_MS = 2500;
export const BURST_FACTOR = 1.5;
export const BURST_MS = 500;
/** Nhím di chuyển chậm bằng ½ tốc độ thú. */
export const DECOY_SPEED_FACTOR = 0.5;

const DEG = Math.PI / 180;

/** Kích thước thú (đường kính, px): sizePct% cạnh ngắn, tối thiểu 48px. */
export function petSize(width: number, height: number, sizePct: number): number {
  return Math.max(MIN_SIZE_PX, Math.round((sizePct / 100) * Math.min(width, height)));
}

/** Tốc độ px/giây từ % chiều rộng/giây. */
export function speedPx(width: number, speedPctW: number): number {
  return (width * speedPctW) / 100;
}

export function targetHits(level: number): number {
  return 20 + 2 * level;
}

export interface G3Stats {
  hits: number;
  emptyTaps: number;
  decoyTaps: number;
}

export function accuracyOf(s: G3Stats): number {
  const denom = s.hits + s.emptyTaps + s.decoyTaps;
  return denom === 0 ? 0 : s.hits / denom;
}

/** score = 0,6 × accuracy + 0,4 × min(1, hits / targetHits) */
export function scoreFromStats(s: G3Stats, level: number): number {
  return clamp01(0.6 * accuracyOf(s) + 0.4 * Math.min(1, s.hits / targetHits(level)));
}

export function buildMetrics(s: G3Stats, durationMs: number): Record<string, number> {
  return {
    hits: s.hits,
    emptyTaps: s.emptyTaps,
    decoyTaps: s.decoyTaps,
    accuracy: Math.round(accuracyOf(s) * 1000) / 1000,
    hitsPerMin: durationMs > 0 ? Math.round((s.hits / (durationMs / 60_000)) * 10) / 10 : 0,
  };
}

export interface Mover {
  x: number;
  y: number;
  /** px/giây */
  vx: number;
  vy: number;
  /** Bán kính (px). */
  r: number;
}

export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

export function setHeading(m: Mover, angleRad: number, speed: number): void {
  m.vx = Math.cos(angleRad) * speed;
  m.vy = Math.sin(angleRad) * speed;
}

export function speedOf(m: Mover): number {
  return Math.hypot(m.vx, m.vy);
}

/** Đổi hướng ngẫu nhiên hoàn toàn, giữ nguyên tốc độ. */
export function turnRandomly(m: Mover, rng: Rng): void {
  setHeading(m, rng() * Math.PI * 2, speedOf(m));
}

/**
 * Đảm bảo vận tốc hợp với mép ít nhất MIN_BOUNCE_DEG:
 * `axis` 'x' = mép trái/phải (thành phần pháp tuyến là vx), 'y' = mép trên/dưới.
 * `sign` là chiều bắt buộc của thành phần pháp tuyến (hướng ra xa mép).
 */
function enforceBounceAngle(m: Mover, axis: 'x' | 'y', sign: 1 | -1, rng: Rng): void {
  const s = speedOf(m);
  if (s === 0) return;
  const minComp = s * Math.sin(MIN_BOUNCE_DEG * DEG);
  // góc ngẫu nhiên so với mép trong [20°, 90°) → thành phần pháp tuyến = s·sin(góc)
  const angle = (MIN_BOUNCE_DEG + rng() * (90 - MIN_BOUNCE_DEG - 5)) * DEG;
  const normal = Math.max(minComp, s * Math.sin(angle));
  const tangent = Math.sqrt(Math.max(0, s * s - normal * normal));
  const tangentSign = (axis === 'x' ? m.vy : m.vx) >= 0 ? 1 : -1;
  if (axis === 'x') {
    m.vx = sign * normal;
    m.vy = tangentSign * tangent;
  } else {
    m.vy = sign * normal;
    m.vx = tangentSign * tangent;
  }
}

/**
 * Tiến `dtMs` mili giây. Nảy khi chạm mép (kẹp vị trí vào khung, bật ra góc ngẫu nhiên ≥ 20°).
 * Trả về true nếu vừa nảy.
 */
export function stepMover(m: Mover, dtMs: number, b: Bounds, rng: Rng): boolean {
  const dt = dtMs / 1000;
  m.x += m.vx * dt;
  m.y += m.vy * dt;
  let bounced = false;
  const minX = b.left + m.r;
  const maxX = Math.max(minX, b.right - m.r);
  const minY = b.top + m.r;
  const maxY = Math.max(minY, b.bottom - m.r);
  if (m.x < minX) {
    m.x = minX;
    enforceBounceAngle(m, 'x', 1, rng);
    bounced = true;
  } else if (m.x > maxX) {
    m.x = maxX;
    enforceBounceAngle(m, 'x', -1, rng);
    bounced = true;
  }
  if (m.y < minY) {
    m.y = minY;
    enforceBounceAngle(m, 'y', 1, rng);
    bounced = true;
  } else if (m.y > maxY) {
    m.y = maxY;
    enforceBounceAngle(m, 'y', -1, rng);
    bounced = true;
  }
  return bounced;
}

export interface Target {
  x: number;
  y: number;
  r: number;
  /** false = không nhận chạm (đang biến mất). */
  active: boolean;
}

/** Vật nào trúng điểm chạm (bán kính + 8px)? Nhiều vật → chọn vật gần tâm nhất. -1 nếu không trúng. */
export function pickTarget(targets: readonly Target[], x: number, y: number): number {
  let best = -1;
  let bestD = Infinity;
  for (let i = 0; i < targets.length; i++) {
    const t = targets[i] as Target;
    if (!t.active) continue;
    const dx = x - t.x;
    const dy = y - t.y;
    const d2 = dx * dx + dy * dy;
    const reach = t.r + HIT_SLOP_PX;
    if (d2 <= reach * reach && d2 < bestD) {
      best = i;
      bestD = d2;
    }
  }
  return best;
}

/** Vị trí xuất hiện: trong khung, cách các vật khác ít nhất `minDist` (thử tối đa 20 lần). */
export function spawnPosition(
  rng: Rng,
  b: Bounds,
  r: number,
  others: readonly { x: number; y: number }[],
  minDist: number,
): { x: number; y: number } {
  const minX = b.left + r;
  const maxX = Math.max(minX, b.right - r);
  const minY = b.top + r;
  const maxY = Math.max(minY, b.bottom - r);
  let best = { x: minX, y: minY };
  let bestScore = -1;
  for (let i = 0; i < 20; i++) {
    const p = { x: minX + rng() * (maxX - minX), y: minY + rng() * (maxY - minY) };
    let nearest = Infinity;
    for (const o of others) nearest = Math.min(nearest, Math.hypot(p.x - o.x, p.y - o.y));
    if (nearest >= minDist) return p;
    if (nearest > bestScore) {
      bestScore = nearest;
      best = p;
    }
  }
  return best;
}
