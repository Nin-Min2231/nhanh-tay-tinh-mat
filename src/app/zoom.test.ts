import { describe, expect, it } from 'vitest';
import { ZOOM_EPS, isZoomed } from './zoom';

describe('isZoomed', () => {
  it('không có visualViewport (trình duyệt cũ) → không coi là phóng to', () => {
    expect(isZoomed(null)).toBe(false);
    expect(isZoomed(undefined)).toBe(false);
  });

  it('scale = 1 hoặc sai số làm tròn → chưa phóng', () => {
    expect(isZoomed({ scale: 1 })).toBe(false);
    expect(isZoomed({ scale: 1.0000001 })).toBe(false);
    expect(isZoomed({ scale: ZOOM_EPS })).toBe(false);
  });

  it('scale > 1 rõ ràng → đang phóng', () => {
    expect(isZoomed({ scale: 1.05 })).toBe(true);
    expect(isZoomed({ scale: 2 })).toBe(true);
    expect(isZoomed({ scale: 5 })).toBe(true);
  });
});
