import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../app/rng';
import { G0_RADIUS, G0_TOUCH_SLOP, isHit, nextTarget, scoreFromTaps } from './logic';

describe('G0 demo logic', () => {
  it('điểm = tỷ lệ chạm đúng; bấm bừa làm giảm điểm', () => {
    expect(scoreFromTaps(10, 0)).toBe(1);
    expect(scoreFromTaps(10, 10)).toBe(0.5);
    expect(scoreFromTaps(0, 0)).toBe(0);
  });

  it('isHit tính cả dung sai', () => {
    const t = { x: 100, y: 100, r: G0_RADIUS };
    expect(isHit(t, 100, 100)).toBe(true);
    expect(isHit(t, 100 + G0_RADIUS + G0_TOUCH_SLOP, 100)).toBe(true);
    expect(isHit(t, 100 + G0_RADIUS + G0_TOUCH_SLOP + 1, 100)).toBe(false);
  });

  it('nextTarget luôn nằm trong vùng chơi và tái lập được theo seed', () => {
    const a = mulberry32(5);
    const b = mulberry32(5);
    let pa = null as ReturnType<typeof nextTarget> | null;
    let pb = null as ReturnType<typeof nextTarget> | null;
    for (let i = 0; i < 200; i++) {
      pa = nextTarget(a, 300, 400, pa);
      pb = nextTarget(b, 300, 400, pb);
      expect(pa).toEqual(pb);
      expect(pa.x).toBeGreaterThanOrEqual(G0_RADIUS);
      expect(pa.x).toBeLessThanOrEqual(300 - G0_RADIUS);
      expect(pa.y).toBeGreaterThanOrEqual(G0_RADIUS);
      expect(pa.y).toBeLessThanOrEqual(400 - G0_RADIUS);
    }
  });
});
