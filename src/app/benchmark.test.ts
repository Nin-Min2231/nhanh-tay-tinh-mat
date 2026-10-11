import { describe, expect, it } from 'vitest';
import {
  BENCHMARK_ORDER,
  benchmarkComplete,
  benchmarkDue,
  benchmarkLevel,
  benchmarkQueue,
  compareBenchmarks,
  doneRecently,
} from './benchmark';
import { levelsConfig, type GameId } from '../games/levels';
import type { RoundRecord } from './types';

let n = 0;
function bench(
  date: string,
  gameId: GameId,
  metrics: Record<string, number>,
  score = 0.8,
  benchmark = true,
): RoundRecord {
  n += 1;
  return {
    id: `b${n}`,
    profileId: 'p1',
    gameId,
    startedAt: `${date}T09:00:00`,
    level: levelsConfig.benchmark[gameId],
    mode: 'fixed',
    benchmark,
    options: {},
    durationMs: 60_000,
    score,
    stars: 2,
    metrics,
    deviceId: 'd',
    deviceClass: 'phone',
  };
}

const full = (date: string, tweak: (g: GameId) => Record<string, number>) =>
  BENCHMARK_ORDER.map((g) => bench(date, g, tweak(g)));

describe('hàng đợi bài đo', () => {
  it('cấp bài đo lấy từ levels.json', () => {
    expect(benchmarkLevel('G1')).toBe(levelsConfig.benchmark.G1);
    expect(BENCHMARK_ORDER).toEqual(['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7']);
  });

  it('chưa làm gì → đủ 7 game theo thứ tự G1 → G7', () => {
    expect(benchmarkQueue([], '2026-10-11')).toEqual(BENCHMARK_ORDER);
    expect(benchmarkComplete([], '2026-10-11')).toBe(false);
  });

  it('làm nhiều buổi trong tuần: chỉ còn các game chưa làm; đủ bộ → hoàn thành', () => {
    const rs = [bench('2026-10-08', 'G1', {}), bench('2026-10-09', 'G3', {})];
    expect(benchmarkQueue(rs, '2026-10-11')).toEqual(['G2', 'G4', 'G5', 'G6', 'G7']);
    const all = [...rs, ...BENCHMARK_ORDER.map((g) => bench('2026-10-10', g, {}))];
    expect(benchmarkQueue(all, '2026-10-11')).toEqual([]);
    expect(benchmarkComplete(all, '2026-10-11')).toBe(true);
  });

  it('lượt cũ hơn 7 ngày không còn tính; lượt thường (không phải bài đo) bị bỏ qua', () => {
    const rs = [bench('2026-10-04', 'G1', {}), bench('2026-10-10', 'G2', {}, 1, false)];
    expect(doneRecently(rs, '2026-10-11')).toEqual(new Set()); // 04 → 11 = 7 ngày: đã hết hạn
    expect(doneRecently([bench('2026-10-05', 'G1', {})], '2026-10-11')).toEqual(new Set(['G1']));
  });
});

describe('“Thử thách tuần” (benchmarkDue)', () => {
  it('chưa từng làm → tới hạn', () => {
    expect(benchmarkDue(null, '2026-10-11')).toBe(true);
  });
  it('mới làm 6 ngày trước → chưa; 7 ngày trước → tới hạn', () => {
    expect(benchmarkDue('2026-10-05T09:00:00', '2026-10-11')).toBe(false);
    expect(benchmarkDue('2026-10-04T09:00:00', '2026-10-11')).toBe(true);
  });
});

describe('compareBenchmarks (TC-027)', () => {
  it('chưa có bài đo nào → 7 dòng trống, không so sánh được', () => {
    const c = compareBenchmarks([]);
    expect(c.comparable).toBe(false);
    expect(c.rows).toHaveLength(7);
    expect(c.rows.every((r) => r.trend === 'none' && r.first === null)).toBe(true);
  });

  it('mới có 1 tuần → có giá trị tuần đầu nhưng chưa so sánh', () => {
    const c = compareBenchmarks(full('2026-09-01', () => ({ rtMeanMs: 700 })));
    expect(c.comparable).toBe(false);
    expect(c.rows[0]!.first).toBe(700);
    expect(c.rows[0]!.latest).toBeNull();
    expect(c.rows[0]!.trend).toBe('none');
  });

  it('2 tuần cách nhau: so sánh đủ 7 game, chiều “thấp hơn là tốt” được tính đúng', () => {
    const wk1 = full('2026-09-01', () => ({
      rtMeanMs: 700, // G1: thấp hơn là tốt
      timeSec: 40, // G2: thấp hơn là tốt
      hitsPerMin: 20,
      maxSpan: 4,
      perfectPct: 50,
      accuracy: 0.6,
    }));
    const wk2 = full('2026-09-15', () => ({
      rtMeanMs: 600, // nhanh hơn → tiến bộ
      timeSec: 45, // chậm hơn → giảm
      hitsPerMin: 25, // nhiều hơn → tiến bộ
      maxSpan: 4, // như nhau
      perfectPct: 40, // giảm
      accuracy: 0.9, // tiến bộ (G6, G7)
    }));
    const c = compareBenchmarks([...wk1, ...wk2]);
    expect(c.comparable).toBe(true);
    expect(c.weeks).toBe(2);
    expect(c.firstWeekStart).toBe('2026-09-01');
    expect(c.latestWeekStart).toBe('2026-09-15');
    const t = Object.fromEntries(c.rows.map((r) => [r.gameId, r.trend]));
    expect(t).toEqual({
      G1: 'better',
      G2: 'worse',
      G3: 'better',
      G4: 'same',
      G5: 'worse',
      G6: 'better',
      G7: 'better',
    });
    expect(c.rows[0]).toMatchObject({ first: 700, latest: 600, delta: -100 });
  });

  it('nhiều lượt trong cùng tuần → lấy trung bình; tuần gần nhất là tuần có lượt mới nhất', () => {
    const rs = [
      bench('2026-09-01', 'G1', { rtMeanMs: 800 }),
      bench('2026-09-03', 'G1', { rtMeanMs: 600 }), // cùng tuần 1 → TB 700
      bench('2026-09-08', 'G1', { rtMeanMs: 100 }), // tuần 2 (không phải mới nhất)
      bench('2026-09-20', 'G1', { rtMeanMs: 500 }), // tuần 3 = gần nhất
    ];
    const g1 = compareBenchmarks(rs).rows[0]!;
    expect(g1.first).toBe(700);
    expect(g1.latest).toBe(500);
    expect(g1.trend).toBe('better');
  });

  it('game thiếu dữ liệu ở một trong hai tuần → “không có” (không giả số)', () => {
    const rs = [
      bench('2026-09-01', 'G1', { rtMeanMs: 700 }),
      bench('2026-09-01', 'G2', { timeSec: 40 }),
      bench('2026-09-15', 'G1', { rtMeanMs: 650 }),
    ];
    const c = compareBenchmarks(rs);
    expect(c.rows[0]!.trend).toBe('better');
    expect(c.rows[1]!.trend).toBe('none');
    expect(c.rows[1]!.latest).toBeNull();
  });

  it('bỏ qua lượt thường, chỉ tính lượt bài đo', () => {
    const rs = [
      bench('2026-09-01', 'G1', { rtMeanMs: 700 }),
      bench('2026-09-15', 'G1', { rtMeanMs: 100 }, 1, false),
    ];
    expect(compareBenchmarks(rs).comparable).toBe(false);
  });
});
