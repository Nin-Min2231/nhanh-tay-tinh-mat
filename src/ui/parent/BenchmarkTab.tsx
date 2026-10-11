// Tab Bài đo tuần (F16, TC-027): so sánh tuần đầu ↔ tuần gần nhất cho đủ 7 game + nút bắt đầu bài đo.
import { useMemo } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import {
  BENCHMARK_ORDER,
  compareBenchmarks,
  doneRecently,
  type BenchRow,
} from '../../app/benchmark';
import type { MetricDef } from '../../app/daily';
import { startBenchmark } from '../../app/parentStore';
import { dateKey } from '../../app/profile';
import { storage } from '../../app/storage';
import { Button } from '../components/Button';
import { GameIcon } from '../components/GameIcon';
import { fmtDayKey, formatMetric, selectedParentProfile } from './state';

const ARROW = { up: '▲', down: '▼', same: '＝' } as const;

/** Mức thay đổi kèm dấu: “+100 ms”, “−12%”. */
function formatDelta(def: MetricDef, delta: number): string {
  const sign = delta > 0 ? '+' : delta < 0 ? '−' : '';
  return `${sign}${formatMetric(def, Math.abs(delta))}`;
}

function Row({ row }: { row: BenchRow }) {
  const dir = row.delta === null ? null : row.delta > 0 ? 'up' : row.delta < 0 ? 'down' : 'same';
  const col = vi.parent.benchmark.columns;
  return (
    <article class="bench-card" data-testid={`bench-row-${row.gameId}`} data-trend={row.trend}>
      <header class="bench-head">
        <GameIcon id={row.gameId} size={32} />
        <div>
          <strong>{vi.games[row.gameId].name}</strong>
          <span class="bench-metric">{vi.parent.metrics[row.metric.key] ?? row.metric.key}</span>
        </div>
      </header>
      <dl class="bench-values">
        <div>
          <dt>{col.first}</dt>
          <dd data-testid={`bench-first-${row.gameId}`}>{formatMetric(row.metric, row.first)}</dd>
        </div>
        <div>
          <dt>{col.latest}</dt>
          <dd data-testid={`bench-latest-${row.gameId}`}>{formatMetric(row.metric, row.latest)}</dd>
        </div>
        <div class={`trend trend-${row.trend}`}>
          <dt>{col.change}</dt>
          <dd>
            {dir && row.delta !== null ? (
              <>
                <span aria-hidden="true">{ARROW[dir]}</span> {formatDelta(row.metric, row.delta)}
                <span class="trend-text">{vi.parent.benchmark.trend[row.trend]}</span>
              </>
            ) : (
              vi.parent.benchmark.trend.none
            )}
          </dd>
        </div>
      </dl>
    </article>
  );
}

export function BenchmarkTab() {
  const p = selectedParentProfile.value;
  const pid = p?.id ?? '';
  const rounds = useMemo(() => storage.loadRounds(pid), [pid]);
  const cmp = useMemo(() => compareBenchmarks(rounds), [rounds]);
  const today = dateKey(new Date());
  const done = useMemo(() => doneRecently(rounds, today), [rounds, today]);
  if (!p) return null;
  const total = BENCHMARK_ORDER.length;
  const label =
    done.size === 0
      ? vi.parent.benchmark.start
      : done.size >= total
        ? vi.parent.benchmark.again
        : vi.parent.benchmark.continue;

  return (
    <div class="benchmark-tab" data-testid="benchmark-tab">
      <p class="parent-note">{vi.parent.benchmark.intro}</p>
      <p class="parent-strong" data-testid="bench-week">
        {vi.parent.benchmark.thisWeek(done.size, total)}
      </p>
      <Button variant="primary" onClick={() => startBenchmark(p.id)} data-testid="bench-start">
        {label}
      </Button>

      <h2 class="parent-h2">{vi.parent.benchmark.compareTitle}</h2>
      {cmp.weeks === 0 ? (
        <p class="parent-empty" data-testid="bench-none">
          {vi.parent.benchmark.none}
        </p>
      ) : (
        <>
          {cmp.comparable && cmp.firstWeekStart && cmp.latestWeekStart ? (
            <p class="parent-note" data-testid="bench-weeks">
              {vi.parent.benchmark.weeks(
                fmtDayKey(cmp.firstWeekStart),
                fmtDayKey(cmp.latestWeekStart),
              )}
            </p>
          ) : (
            <p class="parent-empty" data-testid="bench-notcomparable">
              {vi.parent.benchmark.notComparable}
            </p>
          )}
          <div class="bench-list" data-testid="bench-table">
            {cmp.rows.map((r) => (
              <Row key={r.gameId} row={r} />
            ))}
          </div>
          <p class="parent-note">{vi.parent.benchmark.note}</p>
        </>
      )}
    </div>
  );
}
