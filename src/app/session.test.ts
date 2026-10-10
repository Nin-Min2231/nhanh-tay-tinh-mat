import { describe, expect, it } from 'vitest';
import { RoundClock, dayAllowanceMs, dayRemainingMs, isOutOfTime } from './session';
import { createProfile, emptyDay } from './profile';

function setup(remainingMs: number, opts: { warnMs?: number; graceMs?: number } = {}) {
  let t = 1000;
  const clock = new RoundClock({ remainingMs, ...opts, now: () => t });
  return {
    clock,
    advance: (ms: number) => {
      t += ms;
    },
  };
}

function startRunning(c: RoundClock) {
  c.startCountdown();
  c.startRunning();
}

describe('RoundClock', () => {
  it('chỉ cộng thời gian khi Running', () => {
    const { clock, advance } = setup(60_000);
    advance(5000); // idle
    clock.startCountdown();
    advance(3000); // đếm ngược 3-2-1
    clock.startRunning();
    advance(4000);
    clock.tick();
    expect(clock.playedMs).toBe(4000);
    clock.pause();
    advance(10_000); // tạm dừng
    expect(clock.playedMs).toBe(4000);
    clock.startCountdown();
    advance(3000);
    clock.startRunning();
    advance(1000);
    clock.finish();
    expect(clock.playedMs).toBe(5000);
    expect(clock.phase).toBe('finished');
  });

  it('nhắc nhẹ đúng 1 lần khi còn 2 phút', () => {
    const { clock, advance } = setup(3 * 60_000);
    startRunning(clock);
    advance(59_000);
    expect(clock.tick()).toEqual([]);
    advance(2000); // còn 1:59
    expect(clock.tick()).toEqual(['warn']);
    advance(1000);
    expect(clock.tick()).toEqual([]);
  });

  it('hết giờ: phát timeUp, cho chơi nốt, hết 90s thì graceExpired', () => {
    const { clock, advance } = setup(10_000, { warnMs: 5000 });
    startRunning(clock);
    advance(6000);
    expect(clock.tick()).toEqual(['warn']);
    advance(4000);
    expect(clock.tick()).toEqual(['timeUp']);
    expect(clock.remainingMs).toBe(0);
    advance(89_000);
    expect(clock.tick()).toEqual([]);
    expect(clock.overtimeMs).toBe(89_000);
    advance(1000);
    expect(clock.tick()).toEqual(['graceExpired']);
    advance(1000);
    expect(clock.tick()).toEqual([]);
  });

  it('nhảy qua cả ngưỡng nhắc lẫn hết giờ trong 1 tick: bỏ qua nhắc', () => {
    const { clock, advance } = setup(60_000);
    startRunning(clock);
    advance(61_000);
    expect(clock.tick()).toEqual(['timeUp']);
  });

  it('abort khi tạm dừng: không về Finished, thời gian đã chơi vẫn còn', () => {
    const { clock, advance } = setup(60_000);
    startRunning(clock);
    advance(2000);
    clock.pause();
    clock.abort();
    expect(clock.phase).toBe('aborted');
    expect(clock.playedMs).toBe(2000);
    clock.finish();
    expect(clock.phase).toBe('aborted');
  });

  it('tạm dừng trong lúc đếm ngược không tính thời gian', () => {
    const { clock, advance } = setup(60_000);
    clock.startCountdown();
    advance(2000);
    clock.pause();
    expect(clock.phase).toBe('paused');
    expect(clock.playedMs).toBe(0);
  });
});

describe('thời gian chơi trong ngày', () => {
  const p = createProfile({ name: 'An', avatarId: 'a1', grade: 2 }, 'p', new Date());
  const key = '2026-10-10';

  it('mặc định 15 phút', () => {
    expect(dayAllowanceMs(p, key)).toBe(15 * 60_000);
    expect(dayRemainingMs(p, key)).toBe(15 * 60_000);
    expect(isOutOfTime(p, key)).toBe(false);
  });

  it('trừ thời gian đã chơi, cộng thời gian PH tặng, không âm', () => {
    const q = {
      ...p,
      days: { [key]: { ...emptyDay(), playMs: 13 * 60_000, bonusMs: 5 * 60_000 } },
    };
    expect(dayRemainingMs(q, key)).toBe(7 * 60_000);
    const over = { ...p, days: { [key]: { ...emptyDay(), playMs: 20 * 60_000 } } };
    expect(dayRemainingMs(over, key)).toBe(0);
    expect(isOutOfTime(over, key)).toBe(true);
  });

  it('mỗi ngày tính riêng', () => {
    const q = { ...p, days: { [key]: { ...emptyDay(), playMs: 15 * 60_000 } } };
    expect(isOutOfTime(q, key)).toBe(true);
    expect(isOutOfTime(q, '2026-10-11')).toBe(false);
  });
});
