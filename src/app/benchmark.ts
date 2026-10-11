// Bài đo chuẩn hằng tuần (F16, SPEC mục 10). Thuần, có test.
// Mỗi tuần 1 lượt/game ở cấp cố định (levels.json → benchmark), không tính vào độ khó thích ứng.
import { GAME_IDS, levelsConfig, type GameId } from '../games/levels';
import { BENCHMARK_METRIC, daysBetween, metricValue, roundDate, type MetricDef } from './daily';
import type { RoundRecord } from './types';

/** Banner “Thử thách tuần” hiện khi đã ≥ ngần này ngày kể từ lần làm đủ bộ bài đo. */
export const BENCHMARK_EVERY_DAYS = 7;

/** Thứ tự chạy: G1 → G2 → … → G7. */
export const BENCHMARK_ORDER: readonly GameId[] = GAME_IDS;

/** Cấp cố định của bài đo cho một game. */
export function benchmarkLevel(gameId: GameId): number {
  return levelsConfig.benchmark[gameId];
}

export function benchmarkRounds(rounds: RoundRecord[]): RoundRecord[] {
  return rounds.filter((r) => r.benchmark);
}

/** Game đã có lượt bài đo trong `BENCHMARK_EVERY_DAYS` ngày gần nhất (tính theo ngày lịch). */
export function doneRecently(rounds: RoundRecord[], today: string): Set<GameId> {
  const done = new Set<GameId>();
  for (const r of benchmarkRounds(rounds)) {
    const age = daysBetween(roundDate(r), today);
    if (age >= 0 && age < BENCHMARK_EVERY_DAYS) done.add(r.gameId);
  }
  return done;
}

/** Các game còn phải làm để đủ bộ bài đo của tuần này (đúng thứ tự). Rỗng = đã đủ. */
export function benchmarkQueue(rounds: RoundRecord[], today: string): GameId[] {
  const done = doneRecently(rounds, today);
  return BENCHMARK_ORDER.filter((g) => !done.has(g));
}

/** Đã làm đủ 7 game trong tuần này. */
export function benchmarkComplete(rounds: RoundRecord[], today: string): boolean {
  return benchmarkQueue(rounds, today).length === 0;
}

/** Hiện “Thử thách tuần” khi chưa từng làm đủ bộ hoặc đã ≥ 7 ngày. */
export function benchmarkDue(lastBenchmarkAt: string | null, today: string): boolean {
  if (!lastBenchmarkAt) return true;
  return (
    daysBetween(roundDate({ startedAt: lastBenchmarkAt } as RoundRecord), today) >=
    BENCHMARK_EVERY_DAYS
  );
}

// ---------------------------------------------------------------- so sánh tuần

export type Trend = 'better' | 'worse' | 'same' | 'none';

export interface BenchRow {
  gameId: GameId;
  metric: MetricDef;
  /** Tuần đầu / tuần gần nhất (null = tuần đó chưa làm game này). */
  first: number | null;
  latest: number | null;
  /** latest − first. */
  delta: number | null;
  /** better = tiến bộ (đã tính chiều “thấp hơn là tốt”). */
  trend: Trend;
  /** Điểm lượt (0–1) trung bình của tuần đầu / gần nhất. */
  firstScore: number | null;
  latestScore: number | null;
}

export interface BenchComparison {
  /** Số tuần (cách nhau 7 ngày kể từ lần đo đầu tiên) có dữ liệu. */
  weeks: number;
  /** Có từ 2 tuần khác nhau trở lên → so sánh được. */
  comparable: boolean;
  firstWeekStart: string | null;
  latestWeekStart: string | null;
  rows: BenchRow[];
}

function meanOrNull(xs: number[]): number | null {
  return xs.length === 0 ? null : xs.reduce((s, x) => s + x, 0) / xs.length;
}

function trendOf(first: number | null, latest: number | null, lowerIsBetter: boolean): Trend {
  if (first === null || latest === null) return 'none';
  const d = Math.round((latest - first) * 1000) / 1000;
  if (d === 0) return 'same';
  return d < 0 === lowerIsBetter ? 'better' : 'worse';
}

function addDaysKey(key: string, n: number): string {
  const [y, m, d] = key.split('-').map(Number) as [number, number, number];
  const dt = new Date(Date.UTC(y, m - 1, d + n));
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, '0')}-${String(dt.getUTCDate()).padStart(2, '0')}`;
}

/**
 * So sánh “tuần đầu” (7 ngày kể từ lần đo đầu tiên) với “tuần gần nhất” (khoảng 7 ngày chứa lần đo mới nhất,
 * cùng cách chia tuần). Mỗi game lấy trung bình các lượt bài đo trong tuần đó.
 */
export function compareBenchmarks(rounds: RoundRecord[]): BenchComparison {
  const bench = benchmarkRounds(rounds);
  const empty = (): BenchRow[] =>
    BENCHMARK_ORDER.map((g) => ({
      gameId: g,
      metric: BENCHMARK_METRIC[g],
      first: null,
      latest: null,
      delta: null,
      trend: 'none',
      firstScore: null,
      latestScore: null,
    }));
  if (bench.length === 0) {
    return {
      weeks: 0,
      comparable: false,
      firstWeekStart: null,
      latestWeekStart: null,
      rows: empty(),
    };
  }
  const dated = bench.map((r) => ({ r, date: roundDate(r) }));
  const firstDate = dated.reduce((m, x) => (x.date < m ? x.date : m), dated[0]!.date);
  const weekOf = (date: string) => Math.floor(daysBetween(firstDate, date) / BENCHMARK_EVERY_DAYS);
  const withWeek = dated.map((x) => ({ ...x, week: weekOf(x.date) }));
  const lastWeek = withWeek.reduce((m, x) => Math.max(m, x.week), 0);
  const weeks = new Set(withWeek.map((x) => x.week)).size;

  const rows = BENCHMARK_ORDER.map((g): BenchRow => {
    const metric = BENCHMARK_METRIC[g];
    const pick = (week: number) =>
      withWeek.filter((x) => x.week === week && x.r.gameId === g).map((x) => x.r);
    const stat = (week: number) => {
      const rs = pick(week);
      return {
        value: meanOrNull(
          rs
            .map((r) => metricValue(metric.key, r.score, r.metrics))
            .filter((v): v is number => v !== null),
        ),
        score: meanOrNull(rs.map((r) => r.score)),
      };
    };
    const a = stat(0);
    const b = lastWeek > 0 ? stat(lastWeek) : { value: null, score: null };
    return {
      gameId: g,
      metric,
      first: a.value,
      latest: b.value,
      delta: a.value !== null && b.value !== null ? b.value - a.value : null,
      trend: trendOf(a.value, b.value, metric.lowerIsBetter),
      firstScore: a.score,
      latestScore: b.score,
    };
  });
  return {
    weeks,
    comparable: lastWeek > 0,
    firstWeekStart: firstDate,
    latestWeekStart: lastWeek > 0 ? addDaysKey(firstDate, lastWeek * BENCHMARK_EVERY_DAYS) : null,
    rows,
  };
}
