import { describe, expect, it } from 'vitest';
import {
  KEEP_ROUND_DAYS,
  PROGRESS_METRICS,
  addDays,
  buildSeries,
  daysBetween,
  pruneRounds,
  recentRounds,
  syncDaily,
} from './daily';
import type { DailyAggregate, DeviceClass, RoundRecord } from './types';
import type { GameId } from '../games/levels';

let n = 0;
function round(
  date: string,
  over: Partial<RoundRecord> & { metrics?: Record<string, number> } = {},
): RoundRecord {
  n += 1;
  return {
    id: `r${n}`,
    profileId: 'p1',
    gameId: 'G1',
    startedAt: `${date}T10:00:00`, // giờ địa phương → đúng ngày `date`
    level: 3,
    mode: 'auto',
    benchmark: false,
    options: {},
    durationMs: 60_000,
    score: 0.8,
    stars: 2,
    metrics: { rtMeanMs: 600 },
    deviceId: 'd',
    deviceClass: 'phone',
    ...over,
  };
}

describe('ngày lịch', () => {
  it('daysBetween / addDays chạy theo ngày lịch (qua tháng, qua năm, năm nhuận)', () => {
    expect(daysBetween('2026-01-31', '2026-02-01')).toBe(1);
    expect(daysBetween('2025-12-31', '2026-01-01')).toBe(1);
    expect(daysBetween('2028-02-28', '2028-03-01')).toBe(2);
    expect(daysBetween('2026-03-10', '2026-03-10')).toBe(0);
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-10-11', -6)).toBe('2026-10-05');
  });
});

describe('syncDaily', () => {
  it('trung bình điểm, cấp và từng chỉ số theo (ngày, game, thiết bị)', () => {
    const rs = [
      round('2026-10-01', { score: 0.6, level: 2, metrics: { rtMeanMs: 700, hits: 10 } }),
      round('2026-10-01', { score: 1, level: 4, metrics: { rtMeanMs: 500, hits: 20 } }),
    ];
    const d = syncDaily([], rs);
    expect(d).toHaveLength(1);
    expect(d[0]).toMatchObject({
      date: '2026-10-01',
      gameId: 'G1',
      deviceClass: 'phone',
      rounds: 2,
      avgScore: 0.8,
      avgLevel: 3,
    });
    expect(d[0]!.metrics).toEqual({ rtMeanMs: 600, hits: 15 });
  });

  it('tách theo game, ngày và loại thiết bị', () => {
    const rs = [
      round('2026-10-01'),
      round('2026-10-01', { gameId: 'G2', metrics: { timeSec: 30 } }),
      round('2026-10-02'),
      round('2026-10-01', { deviceClass: 'tablet' }),
    ];
    const d = syncDaily([], rs);
    expect(d).toHaveLength(4);
    expect(d.map((x) => `${x.date}|${x.gameId}|${x.deviceClass}`)).toEqual([
      '2026-10-01|G1|phone',
      '2026-10-01|G1|tablet',
      '2026-10-01|G2|phone',
      '2026-10-02|G1|phone',
    ]);
  });

  it('lượt bài đo tuần không đưa vào tổng hợp (chạy ở cấp cố định)', () => {
    const d = syncDaily(
      [],
      [round('2026-10-01'), round('2026-10-01', { benchmark: true, level: 4 })],
    );
    expect(d).toHaveLength(1);
    expect(d[0]!.rounds).toBe(1);
    expect(d[0]!.avgLevel).toBe(3);
  });

  it('tính lại ngày có lượt chi tiết, giữ nguyên ngày cũ đã bị dọn lượt', () => {
    const old: DailyAggregate = {
      date: '2025-01-01',
      gameId: 'G1',
      deviceClass: 'phone',
      rounds: 9,
      avgScore: 0.5,
      avgLevel: 2,
      metrics: { rtMeanMs: 900 },
    };
    const stale: DailyAggregate = { ...old, date: '2026-10-01', rounds: 1, avgScore: 0.1 };
    const d = syncDaily([old, stale], [round('2026-10-01', { score: 0.9 })]);
    expect(d.find((x) => x.date === '2025-01-01')).toEqual(old);
    expect(d.find((x) => x.date === '2026-10-01')!.avgScore).toBe(0.9);
  });

  it('chạy lại nhiều lần cho cùng dữ liệu → kết quả không đổi (idempotent)', () => {
    const rs = [round('2026-10-01'), round('2026-10-02', { score: 0.4 })];
    const once = syncDaily([], rs);
    expect(syncDaily(once, rs)).toEqual(once);
  });
});

describe('pruneRounds', () => {
  const now = new Date('2026-10-11T12:00:00');
  it(`bỏ lượt cũ hơn ${KEEP_ROUND_DAYS} ngày, giữ lượt còn mới`, () => {
    const keep = round('2026-06-13'); // đúng 120 ngày trước
    const drop = round('2026-06-12'); // 121 ngày trước
    const recent = round('2026-10-11');
    const out = pruneRounds([drop, keep, recent], now);
    expect(out.map((r) => r.id)).toEqual([keep.id, recent.id]);
  });

  it('lượt bài đo tuần được giữ mãi để còn so sánh với tuần đầu', () => {
    const bench = round('2025-01-01', { benchmark: true });
    const old = round('2025-01-01');
    expect(pruneRounds([bench, old], now)).toEqual([bench]);
  });

  it('dọn lượt không làm mất tổng hợp theo ngày đã có', () => {
    const old = round('2025-01-01', { score: 0.7 });
    const daily = syncDaily([], [old]);
    const rounds = pruneRounds([old], now);
    expect(rounds).toHaveLength(0);
    expect(syncDaily(daily, rounds)).toEqual(daily);
  });
});

describe('buildSeries', () => {
  const daily: DailyAggregate[] = [
    mk('2026-10-01', 'phone', 2, 0.6, 2, { rtMeanMs: 800 }),
    mk('2026-10-01', 'tablet', 2, 1, 4, { rtMeanMs: 400 }),
    mk('2026-10-05', 'phone', 1, 0.9, 3, { rtMeanMs: 500 }),
    mk('2026-10-10', 'tablet', 3, 0.7, 5, { rtMeanMs: 450 }),
    { ...mk('2026-10-10', 'phone', 1, 0.2, 1, {}), gameId: 'G2' as GameId },
  ];
  function mk(
    date: string,
    deviceClass: DeviceClass,
    rounds: number,
    avgScore: number,
    avgLevel: number,
    metrics: Record<string, number>,
  ): DailyAggregate {
    return { date, gameId: 'G1', deviceClass, rounds, avgScore, avgLevel, metrics };
  }
  const base = { gameId: 'G1' as GameId, metric: 'rtMeanMs', today: '2026-10-11' };

  it('lọc đúng game; thiết bị “Tất cả” gộp trung bình có trọng số theo số lượt', () => {
    const s = buildSeries(daily, { ...base, device: 'all', range: 'all' });
    expect(s.map((p) => p.date)).toEqual(['2026-10-01', '2026-10-05', '2026-10-10']);
    expect(s[0]).toMatchObject({ value: 600, level: 3, rounds: 4 }); // (800×2 + 400×2) / 4
  });

  it('lọc theo thiết bị', () => {
    const phone = buildSeries(daily, { ...base, device: 'phone', range: 'all' });
    expect(phone.map((p) => p.value)).toEqual([800, 500]);
    const tablet = buildSeries(daily, { ...base, device: 'tablet', range: 'all' });
    expect(tablet.map((p) => p.date)).toEqual(['2026-10-01', '2026-10-10']);
  });

  it('khoảng 7 / 30 ngày tính cả ngày hôm nay', () => {
    const w = buildSeries(daily, { ...base, device: 'all', range: 7 });
    expect(w.map((p) => p.date)).toEqual(['2026-10-05', '2026-10-10']); // 05 là ngày đầu của 7 ngày (05→11)
    const w30 = buildSeries(daily, { ...base, device: 'all', range: 30 });
    expect(w30).toHaveLength(3);
  });

  it('chỉ số “score” lấy từ điểm trung bình; chỉ số thiếu → value null', () => {
    const s = buildSeries(daily, { ...base, metric: 'score', device: 'phone', range: 'all' });
    expect(s.map((p) => p.value)).toEqual([0.6, 0.9]);
    const missing = buildSeries(daily, {
      ...base,
      metric: 'khongCo',
      device: 'phone',
      range: 'all',
    });
    expect(missing.every((p) => p.value === null)).toBe(true);
  });

  it('bỏ ngày sau hôm nay (đồng hồ máy bị chỉnh)', () => {
    const s = buildSeries(daily, { ...base, today: '2026-10-04', device: 'all', range: 'all' });
    expect(s.map((p) => p.date)).toEqual(['2026-10-01']);
  });
});

describe('recentRounds', () => {
  it('10 lượt mới nhất trước, lọc game và thiết bị', () => {
    const rs = Array.from({ length: 15 }, (_, i) =>
      round(`2026-10-${String(i + 1).padStart(2, '0')}`),
    );
    const out = recentRounds(rs);
    expect(out).toHaveLength(10);
    expect(out[0]!.startedAt.slice(0, 10)).toBe('2026-10-15');
    expect(recentRounds([round('2026-10-01', { gameId: 'G2' })], { gameId: 'G1' })).toHaveLength(0);
    expect(
      recentRounds([round('2026-10-01', { deviceClass: 'tablet' })], { device: 'phone' }),
    ).toHaveLength(0);
  });
});

describe('PROGRESS_METRICS', () => {
  it('mỗi game có ≥ 2 chỉ số, chỉ số đầu tiên là chỉ số chính', () => {
    for (const metrics of Object.values(PROGRESS_METRICS)) {
      expect(metrics.length).toBeGreaterThanOrEqual(2);
      expect(new Set(metrics.map((m) => m.key)).size).toBe(metrics.length);
    }
    expect(PROGRESS_METRICS.G1[0]!.key).toBe('rtMeanMs');
    expect(PROGRESS_METRICS.G1[0]!.lowerIsBetter).toBe(true);
    expect(PROGRESS_METRICS.G2[0]!.lowerIsBetter).toBe(true);
  });
});
