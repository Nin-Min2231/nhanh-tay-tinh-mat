import { describe, expect, it } from 'vitest';
import { msUntilMidnight, refreshToday, today } from './today';

describe('today – ngày hôm nay tự làm mới', () => {
  it('msUntilMidnight: số ms tới 00:00 ngày kế tiếp (giờ máy)', () => {
    expect(msUntilMidnight(new Date(2026, 9, 11, 23, 59, 59))).toBe(1000);
    expect(msUntilMidnight(new Date(2026, 9, 11, 12, 0, 0))).toBe(12 * 3_600_000);
    expect(msUntilMidnight(new Date(2026, 9, 11, 0, 0, 0))).toBe(24 * 3_600_000);
    // cuối tháng / cuối năm
    expect(msUntilMidnight(new Date(2026, 11, 31, 23, 0, 0))).toBe(3_600_000);
  });

  it('refreshToday: đổi khi sang ngày mới, giữ nguyên khi cùng ngày', () => {
    refreshToday(new Date(2026, 9, 11, 23, 59, 0));
    expect(today.value).toBe('2026-10-11');
    const before = today.value;
    refreshToday(new Date(2026, 9, 11, 23, 59, 59));
    expect(today.value).toBe(before);
    refreshToday(new Date(2026, 9, 12, 0, 0, 1));
    expect(today.value).toBe('2026-10-12');
    refreshToday(new Date(2027, 0, 1, 7, 0, 0));
    expect(today.value).toBe('2027-01-01');
  });
});
