// Tab Tiến bộ (F06, F18, TC-010): biểu đồ chỉ số theo ngày + đường cấp độ, lọc game/chỉ số/khoảng ngày/thiết bị.
import { useEffect, useMemo, useRef, useState } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import {
  PROGRESS_METRICS,
  buildSeries,
  metricValue,
  recentRounds,
  type DeviceFilter,
  type RangeFilter,
} from '../../app/daily';
import { E2E } from '../../app/e2e';
import { dateKey } from '../../app/profile';
import { storage } from '../../app/storage';
import { GAME_IDS, type GameId } from '../../games/levels';
import { GameIcon } from '../components/GameIcon';
import { fmtDateTime, fmtDayShort, formatMetric, selectedParentProfile } from './state';

const RANGES: RangeFilter[] = [7, 30, 'all'];
const DEVICES: DeviceFilter[] = ['all', 'phone', 'tablet'];

function Segment<T extends string | number>({
  label,
  value,
  options,
  text,
  onChange,
  testid,
}: {
  label: string;
  value: T;
  options: readonly T[];
  text: (v: T) => string;
  onChange: (v: T) => void;
  testid: string;
}) {
  return (
    <fieldset class="pfield">
      <legend class="pfield-label">{label}</legend>
      <div class="pseg" role="radiogroup" aria-label={label} data-testid={testid}>
        {options.map((o) => (
          <button
            key={String(o)}
            type="button"
            role="radio"
            aria-checked={value === o}
            class={`pseg-btn${value === o ? ' is-selected' : ''}`}
            data-testid={`${testid}-${String(o)}`}
            onClick={() => onChange(o)}
          >
            {text(o)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function ProgressChart({
  labels,
  values,
  levels,
  metricKey,
  gameId,
}: {
  labels: string[];
  values: (number | null)[];
  levels: number[];
  metricKey: string;
  gameId: GameId;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  const def =
    PROGRESS_METRICS[gameId].find((m) => m.key === metricKey) ?? PROGRESS_METRICS[gameId][0]!;
  const signature = JSON.stringify([labels, values, levels, metricKey]);
  useEffect(() => {
    let chart: { destroy(): void } | null = null;
    let cancelled = false;
    // Chart.js chỉ nạp khi cần (tách gói riêng, vẫn nằm trong cache offline)
    void import('./chartRender').then(({ renderChart }) => {
      if (cancelled || !ref.current) return;
      chart = renderChart(ref.current, {
        labels,
        values,
        levels,
        metricLabel: vi.parent.metrics[metricKey] ?? metricKey,
        levelLabel: vi.parent.progress.levelLine,
        format: (v) => formatMetric(def, v),
      });
    });
    return () => {
      cancelled = true;
      chart?.destroy();
    };
  }, [signature]);
  return (
    <div
      class="chart-box"
      data-testid="progress-chart"
      data-chart={
        E2E.hooks ? JSON.stringify({ labels, values, levels, metric: metricKey }) : undefined
      }
    >
      <canvas ref={ref} role="img" aria-label={vi.parent.progress.chartLabel} />
    </div>
  );
}

export function ProgressTab() {
  const p = selectedParentProfile.value;
  const [gameId, setGameId] = useState<GameId>('G1');
  const [metricKey, setMetricKey] = useState<string>(PROGRESS_METRICS.G1[0]!.key);
  const [range, setRange] = useState<RangeFilter>(30);
  const [device, setDevice] = useState<DeviceFilter>('all');
  const pid = p?.id ?? '';
  const data = useMemo(
    () => ({ daily: storage.loadDaily(pid), rounds: storage.loadRounds(pid) }),
    [pid],
  );
  const metrics = PROGRESS_METRICS[gameId];
  const def = metrics.find((m) => m.key === metricKey) ?? metrics[0]!;
  const today = dateKey(new Date());

  const points = useMemo(
    () => buildSeries(data.daily, { gameId, metric: def.key, device, range, today }),
    [data, gameId, def.key, device, range, today],
  );
  const recent = useMemo(
    () => recentRounds(data.rounds, { gameId, device, limit: 10 }),
    [data, gameId, device],
  );
  if (!p) return null;

  const withValue = points.filter((x) => x.value !== null);
  const totalRounds = points.reduce((s, x) => s + x.rounds, 0);

  return (
    <div class="progress-tab" data-testid="progress-tab">
      <fieldset class="pfield">
        <legend class="pfield-label">{vi.parent.progress.game}</legend>
        <div class="pseg pseg-games" role="radiogroup" aria-label={vi.parent.progress.game}>
          {GAME_IDS.map((g) => (
            <button
              key={g}
              type="button"
              role="radio"
              aria-checked={gameId === g}
              class={`pseg-btn${gameId === g ? ' is-selected' : ''}`}
              data-testid={`pg-${g}`}
              onClick={() => {
                setGameId(g);
                setMetricKey(PROGRESS_METRICS[g][0]!.key);
              }}
            >
              <GameIcon id={g} size={28} />
              <span>{vi.games[g].name}</span>
            </button>
          ))}
        </div>
      </fieldset>

      <Segment
        label={vi.parent.progress.metric}
        value={def.key}
        options={metrics.map((m) => m.key)}
        text={(k) => vi.parent.metrics[k] ?? k}
        onChange={setMetricKey}
        testid="pm"
      />
      <div class="pfilters">
        <Segment
          label={vi.parent.progress.range}
          value={range}
          options={RANGES}
          text={(r) => vi.parent.progress.ranges[String(r)] ?? String(r)}
          onChange={setRange}
          testid="pr"
        />
        <Segment
          label={vi.parent.progress.device}
          value={device}
          options={DEVICES}
          text={(d) => vi.parent.progress.devices[d] ?? d}
          onChange={setDevice}
          testid="pd"
        />
      </div>

      {withValue.length === 0 ? (
        <p class="parent-empty" data-testid="progress-empty">
          {vi.parent.progress.empty}
        </p>
      ) : (
        <>
          <p class="parent-note" data-testid="progress-summary">
            {vi.parent.progress.summary(points.length, totalRounds)} ·{' '}
            {def.lowerIsBetter ? vi.parent.progress.lowerBetter : vi.parent.progress.higherBetter}
          </p>
          <ProgressChart
            labels={points.map((x) => fmtDayShort(x.date))}
            values={points.map((x) => x.value)}
            levels={points.map((x) => x.level)}
            metricKey={def.key}
            gameId={gameId}
          />
        </>
      )}

      <h2 class="parent-h2">{vi.parent.progress.recentTitle}</h2>
      {recent.length === 0 ? (
        <p class="parent-empty">{vi.parent.progress.recentEmpty}</p>
      ) : (
        <div class="table-wrap">
          <table class="ptable" data-testid="recent-table">
            <thead>
              <tr>
                <th>{vi.parent.progress.columns.when}</th>
                <th>{vi.parent.progress.columns.level}</th>
                <th>{vi.parent.progress.columns.score}</th>
                <th>{vi.parent.metrics[def.key] ?? def.key}</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((r) => (
                <tr key={r.id} data-testid="recent-row">
                  <td>
                    {fmtDateTime(r.startedAt)}
                    <span class="cell-sub">
                      {r.benchmark
                        ? vi.parent.progress.benchmarkTag
                        : (vi.parent.progress.modes[r.mode] ?? r.mode)}
                    </span>
                  </td>
                  <td>{r.trackLevel ?? r.level}</td>
                  <td>
                    {Math.round(r.score * 100)}%
                    <span class="cell-sub" aria-label={String(r.stars)}>
                      {'★'.repeat(r.stars)}
                    </span>
                  </td>
                  <td>{formatMetric(def, metricValue(def.key, r.score, r.metrics))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p class="parent-note">{vi.parent.progress.recentNote}</p>
    </div>
  );
}
