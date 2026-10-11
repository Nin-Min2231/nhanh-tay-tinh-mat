// Tổng hợp theo ngày (DailyAggregate, giữ vĩnh viễn) + dọn RoundRecord cũ + dữ liệu cho biểu đồ tiến bộ.
// Thuần, có test (SPEC mục 5, 9; F06, F18; NF09).
import type { GameId } from '../games/levels';
import { dateKey } from './profile';
import type { DailyAggregate, DeviceClass, RoundRecord } from './types';

/** Lượt chơi chi tiết chỉ giữ ngần này ngày (NF09). Lượt bài đo tuần được giữ mãi (xem pruneRounds). */
export const KEEP_ROUND_DAYS = 120;

const DAY_MS = 86_400_000;

/** Khóa ngày của một lượt (giờ địa phương của máy). */
export function roundDate(r: RoundRecord): string {
  return dateKey(new Date(r.startedAt));
}

/** Số ngày giữa hai khóa ngày 'YYYY-MM-DD' (b − a), tính theo ngày lịch. */
export function daysBetween(a: string, b: string): number {
  return Math.round((toUtc(b) - toUtc(a)) / DAY_MS);
}

function toUtc(key: string): number {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  return Date.UTC(y, m - 1, d);
}

/** Cộng/trừ ngày lịch vào khóa 'YYYY-MM-DD'. */
export function addDays(key: string, n: number): string {
  const d = new Date(toUtc(key) + n * DAY_MS);
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(d.getUTCDate()).padStart(2, '0');
  return `${d.getUTCFullYear()}-${mm}-${dd}`;
}

function groupKey(date: string, gameId: GameId, device: DeviceClass): string {
  return `${date}|${gameId}|${device}`;
}

function mean(xs: number[]): number {
  return xs.length === 0 ? 0 : xs.reduce((s, x) => s + x, 0) / xs.length;
}

/** Làm tròn 4 chữ số thập phân để dữ liệu lưu gọn. */
const r4 = (n: number) => Math.round(n * 10_000) / 10_000;

/** Gộp các lượt của CÙNG (ngày, game, thiết bị) thành một bản ghi. */
function aggregateGroup(
  date: string,
  gameId: GameId,
  device: DeviceClass,
  rounds: RoundRecord[],
): DailyAggregate {
  const sums: Record<string, number[]> = {};
  for (const r of rounds) {
    for (const [k, v] of Object.entries(r.metrics)) {
      if (typeof v === 'number' && Number.isFinite(v)) (sums[k] ??= []).push(v);
    }
  }
  const metrics: Record<string, number> = {};
  for (const [k, vs] of Object.entries(sums)) metrics[k] = r4(mean(vs));
  return {
    date,
    gameId,
    deviceClass: device,
    rounds: rounds.length,
    avgScore: r4(mean(rounds.map((r) => r.score))),
    avgLevel: r4(mean(rounds.map((r) => r.level))),
    metrics,
  };
}

/**
 * Dựng/cập nhật DailyAggregate từ các RoundRecord còn giữ: các ngày có lượt chi tiết được tính lại
 * chính xác từ lượt đó; các ngày cũ hơn (lượt đã bị dọn) giữ nguyên bản tổng hợp đã lưu.
 * Lượt bài đo tuần (benchmark) không đưa vào đây vì chạy ở cấp cố định – xem tab “Bài đo tuần”.
 */
export function syncDaily(existing: DailyAggregate[], rounds: RoundRecord[]): DailyAggregate[] {
  const groups = new Map<string, { date: string; g: GameId; d: DeviceClass; rs: RoundRecord[] }>();
  const touched = new Set<string>();
  for (const r of rounds) {
    const date = roundDate(r);
    const key = groupKey(date, r.gameId, r.deviceClass);
    touched.add(key);
    if (r.benchmark) continue;
    const grp = groups.get(key) ?? { date, g: r.gameId, d: r.deviceClass, rs: [] };
    grp.rs.push(r);
    groups.set(key, grp);
  }
  const kept = existing.filter((a) => !touched.has(groupKey(a.date, a.gameId, a.deviceClass)));
  const fresh = [...groups.values()].map((g) => aggregateGroup(g.date, g.g, g.d, g.rs));
  return [...kept, ...fresh].sort(
    (a, b) =>
      a.date.localeCompare(b.date) ||
      a.gameId.localeCompare(b.gameId) ||
      a.deviceClass.localeCompare(b.deviceClass),
  );
}

/** Bỏ lượt chi tiết cũ hơn `keepDays` ngày (tính theo ngày lịch). Lượt bài đo tuần được giữ mãi để so sánh tuần đầu. */
export function pruneRounds(
  rounds: RoundRecord[],
  now: Date,
  keepDays: number = KEEP_ROUND_DAYS,
): RoundRecord[] {
  const today = dateKey(now);
  return rounds.filter((r) => r.benchmark || daysBetween(roundDate(r), today) <= keepDays);
}

// ---------------------------------------------------------------- chỉ số hiển thị

export interface MetricDef {
  /** 'score' = điểm lượt (0–1); còn lại là khóa trong RoundRecord.metrics. */
  key: string;
  /** Giá trị thấp hơn là tốt hơn (thời gian phản ứng, thời gian hoàn thành, lỗi…). */
  lowerIsBetter: boolean;
  /** Cách hiển thị số. */
  unit: 'fraction' | 'percent' | 'ms' | 'sec' | 'count' | 'perMin';
}

const SCORE: MetricDef = { key: 'score', lowerIsBetter: false, unit: 'fraction' };
const m = (key: string, unit: MetricDef['unit'], lowerIsBetter = false): MetricDef => ({
  key,
  unit,
  lowerIsBetter,
});

/** Chỉ số chọn được ở biểu đồ, theo từng game (khóa lấy từ docs/02_GAMES.md). Chỉ số đầu = mặc định. */
export const PROGRESS_METRICS: Record<GameId, MetricDef[]> = {
  G1: [
    m('rtMeanMs', 'ms', true),
    m('accuracy', 'fraction'),
    SCORE,
    m('falseAlarms', 'count', true),
  ],
  G2: [m('timeSec', 'sec', true), m('errors', 'count', true), SCORE],
  G3: [m('hitsPerMin', 'perMin'), m('accuracy', 'fraction'), m('hits', 'count'), SCORE],
  G4: [m('maxSpan', 'count'), m('correctSequences', 'count'), SCORE],
  G5: [m('perfectPct', 'percent'), m('missPct', 'percent', true), m('maxCombo', 'count'), SCORE],
  G6: [m('accuracy', 'fraction'), m('avgTimeMs', 'ms', true), m('masteredCount', 'count'), SCORE],
  G7: [
    m('accuracy', 'fraction'),
    m('avgTimeMs', 'ms', true),
    m('highestTypeCorrect', 'count'),
    SCORE,
  ],
};

/** Chỉ số chính dùng để so sánh ở tab “Bài đo tuần” (một chỉ số/game). */
export const BENCHMARK_METRIC: Record<GameId, MetricDef> = {
  G1: m('rtMeanMs', 'ms', true),
  G2: m('timeSec', 'sec', true),
  G3: m('hitsPerMin', 'perMin'),
  G4: m('maxSpan', 'count'),
  G5: m('perfectPct', 'percent'),
  G6: m('accuracy', 'fraction'),
  G7: m('accuracy', 'fraction'),
};

export function metricValue(
  key: string,
  score: number,
  metrics: Record<string, number>,
): number | null {
  if (key === 'score') return score;
  const v = metrics[key];
  return typeof v === 'number' && Number.isFinite(v) ? v : null;
}

// ---------------------------------------------------------------- dữ liệu biểu đồ

export type DeviceFilter = 'all' | DeviceClass;
/** Khoảng ngày: 7, 30 ngày gần nhất hoặc 'all'. */
export type RangeFilter = 7 | 30 | 'all';

export interface SeriesPoint {
  date: string;
  /** Giá trị chỉ số (trung bình trong ngày), null nếu ngày đó không có số liệu cho chỉ số này. */
  value: number | null;
  /** Cấp trung bình trong ngày. */
  level: number;
  rounds: number;
}

export interface SeriesQuery {
  gameId: GameId;
  metric: string;
  device: DeviceFilter;
  range: RangeFilter;
  /** Ngày hôm nay (khóa 'YYYY-MM-DD'). */
  today: string;
}

/** Gộp các bản ghi cùng ngày của nhiều thiết bị (trung bình có trọng số theo số lượt). */
function mergeSameDay(entries: DailyAggregate[]): DailyAggregate {
  const first = entries[0] as DailyAggregate;
  if (entries.length === 1) return first;
  const total = entries.reduce((s, e) => s + e.rounds, 0);
  const w = (f: (e: DailyAggregate) => number) =>
    entries.reduce((s, e) => s + f(e) * e.rounds, 0) / total;
  const keys = new Set(entries.flatMap((e) => Object.keys(e.metrics)));
  const metrics: Record<string, number> = {};
  for (const k of keys) {
    const have = entries.filter((e) => typeof e.metrics[k] === 'number');
    const n = have.reduce((s, e) => s + e.rounds, 0);
    metrics[k] = r4(have.reduce((s, e) => s + (e.metrics[k] as number) * e.rounds, 0) / n);
  }
  return {
    date: first.date,
    gameId: first.gameId,
    deviceClass: first.deviceClass,
    rounds: total,
    avgScore: r4(w((e) => e.avgScore)),
    avgLevel: r4(w((e) => e.avgLevel)),
    metrics,
  };
}

/** Chuỗi điểm theo ngày cho biểu đồ (F06, F18), sắp theo ngày tăng dần. */
export function buildSeries(daily: DailyAggregate[], q: SeriesQuery): SeriesPoint[] {
  const minDate = q.range === 'all' ? null : addDays(q.today, 1 - q.range);
  const byDate = new Map<string, DailyAggregate[]>();
  for (const a of daily) {
    if (a.gameId !== q.gameId) continue;
    if (q.device !== 'all' && a.deviceClass !== q.device) continue;
    if (minDate && a.date < minDate) continue;
    if (a.date > q.today) continue;
    byDate.set(a.date, [...(byDate.get(a.date) ?? []), a]);
  }
  return [...byDate.keys()].sort().map((date) => {
    const day = mergeSameDay(byDate.get(date) as DailyAggregate[]);
    return {
      date,
      value: metricValue(q.metric, day.avgScore, day.metrics),
      level: day.avgLevel,
      rounds: day.rounds,
    };
  });
}

/** Bảng “10 lượt gần nhất” của một hồ sơ (mới nhất trước). */
export function recentRounds(
  rounds: RoundRecord[],
  opts: { gameId?: GameId; device?: DeviceFilter; limit?: number } = {},
): RoundRecord[] {
  return rounds
    .filter((r) => (opts.gameId ? r.gameId === opts.gameId : true))
    .filter((r) => (opts.device && opts.device !== 'all' ? r.deviceClass === opts.device : true))
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
    .slice(0, opts.limit ?? 10);
}
