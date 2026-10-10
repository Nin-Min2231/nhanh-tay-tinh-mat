import { describe, expect, it } from 'vitest';
import { clamp01, starsForScore } from './scoring';

describe('starsForScore', () => {
  it('ngưỡng 0,70 → 2 sao, 0,90 → 3 sao', () => {
    expect(starsForScore(0.69999)).toBe(1);
    expect(starsForScore(0.7)).toBe(2);
    expect(starsForScore(0.89999)).toBe(2);
    expect(starsForScore(0.9)).toBe(3);
    expect(starsForScore(1)).toBe(3);
  });

  it('hoàn thành lượt luôn được ≥ 1 sao (kể cả điểm 0 hoặc giá trị lạ)', () => {
    expect(starsForScore(0)).toBe(1);
    expect(starsForScore(0.01)).toBe(1);
    expect(starsForScore(-5)).toBe(1);
    expect(starsForScore(Number.NaN)).toBe(1);
  });

  it('điểm > 1 vẫn tối đa 3 sao', () => {
    expect(starsForScore(7)).toBe(3);
  });
});

describe('clamp01', () => {
  it('kẹp vào [0, 1]', () => {
    expect(clamp01(-1)).toBe(0);
    expect(clamp01(0.4)).toBe(0.4);
    expect(clamp01(3)).toBe(1);
  });
});
