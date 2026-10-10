// G0 demo (tạm, bị gỡ ở TASK-03): chạm vòng tròn 10 lần để thử toàn luồng.
import type { Rng } from '../../app/rng';

export const G0_TARGET_HITS = 10;
export const G0_RADIUS = 36;
/** Dung sai chạm thêm quanh vòng tròn (CLAUDE: vùng chạm lớn hơn hình vẽ). */
export const G0_TOUCH_SLOP = 8;

export interface Target {
  x: number;
  y: number;
  r: number;
}

/** Điểm số: tỷ lệ chạm đúng. Chạm trượt (chỗ trống) bị tính lỗi – chống bấm bừa. */
export function scoreFromTaps(hits: number, misses: number): number {
  const total = hits + misses;
  return total === 0 ? 0 : hits / total;
}

export function isHit(t: Target, x: number, y: number): boolean {
  const dx = x - t.x;
  const dy = y - t.y;
  const reach = t.r + G0_TOUCH_SLOP;
  return dx * dx + dy * dy <= reach * reach;
}

/** Sinh vòng tròn mới trong vùng chơi, cách vị trí cũ đủ xa. */
export function nextTarget(rng: Rng, width: number, height: number, prev: Target | null): Target {
  const r = G0_RADIUS;
  const margin = r + 12;
  const w = Math.max(1, width - margin * 2);
  const h = Math.max(1, height - margin * 2);
  let x = margin + rng() * w;
  let y = margin + rng() * h;
  for (let i = 0; i < 8 && prev && Math.hypot(x - prev.x, y - prev.y) < r * 3; i++) {
    x = margin + rng() * w;
    y = margin + rng() * h;
  }
  return { x, y, r };
}
