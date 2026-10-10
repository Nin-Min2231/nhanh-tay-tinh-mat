import { describe, expect, it } from 'vitest';
import { PointerGate } from './PointerInput';

describe('PointerGate', () => {
  it("chế độ 'first': bỏ qua ngón thứ 2 khi ngón đầu còn đang giữ (TC-031)", () => {
    const g = new PointerGate('first');
    expect(g.down(1, true)).toBe(true);
    expect(g.down(2, false)).toBe(false);
    g.up(2);
    expect(g.down(3, false)).toBe(false); // ngón 1 vẫn giữ
  });

  it("chế độ 'first': nhận lại sau khi thả ngón đầu", () => {
    const g = new PointerGate('first');
    g.down(1, true);
    g.up(1);
    expect(g.down(2, true)).toBe(true);
  });

  it("chế độ 'first': pointer chính mới reset (phòng mất pointerup)", () => {
    const g = new PointerGate('first');
    g.down(1, true);
    expect(g.down(5, true)).toBe(true);
  });

  it("chế độ 'multi' (G5): nhận mọi ngón", () => {
    const g = new PointerGate('multi');
    expect(g.down(1, true)).toBe(true);
    expect(g.down(2, false)).toBe(true);
    expect(g.down(3, false)).toBe(true);
  });
});
