// Bảng chỉnh nhanh độ khó/tùy chọn game – chỉ hiện khi chạy dev với ?debug=1 (xem src/app/e2e.ts).
// Giao diện phụ huynh thật sẽ làm ở TASK-07.
import { DEBUG } from '../../app/e2e';
import { activeProfile, setGameProgress } from '../../app/store';
import type { GameId, GameProgress } from '../../app/types';
import { vi } from '../../i18n/vi';

const LEVELS = Array.from({ length: 10 }, (_, i) => String(i + 1));

function Select({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: readonly (readonly [string, string])[];
  onChange: (v: string) => void;
}) {
  return (
    <label>
      {label}
      <select
        value={value}
        onChange={(e) => onChange((e.currentTarget as HTMLSelectElement).value)}
      >
        {options.map(([v, text]) => (
          <option key={v} value={v}>
            {text}
          </option>
        ))}
      </select>
    </label>
  );
}

const levelOptions = LEVELS.map((l) => [l, l] as const);
const autoOpt = ['auto', vi.debug.auto] as const;

export function DebugPanel({ gameId }: { gameId: GameId }) {
  const p = activeProfile.value;
  if (!DEBUG || !p) return null;
  const g = p.games[gameId];
  const set = (patch: Partial<GameProgress>) => setGameProgress(p.id, gameId, patch);
  const opt = (key: string) => String(g.options[key] ?? 'auto');
  const setOpt = (key: string, v: string) =>
    set({
      options: { ...g.options, [key]: v === 'auto' || Number.isNaN(Number(v)) ? v : Number(v) },
    });

  return (
    <section class="debug-panel" data-testid="debug-panel">
      <h2>{vi.debug.title}</h2>
      <div class="debug-grid">
        <Select
          label={vi.debug.mode}
          value={g.mode}
          options={[
            ['auto', vi.debug.modeAuto],
            ['fixed', vi.debug.modeFixed],
          ]}
          onChange={(v) => set({ mode: v === 'fixed' ? 'fixed' : 'auto' })}
        />
        <Select
          label={vi.debug.level}
          value={String(g.level)}
          options={levelOptions}
          onChange={(v) => set({ level: Number(v) })}
        />
        <Select
          label={vi.debug.minLevel}
          value={String(g.minLevel)}
          options={levelOptions}
          onChange={(v) => set({ minLevel: Number(v) })}
        />
        <Select
          label={vi.debug.maxLevel}
          value={String(g.maxLevel)}
          options={levelOptions}
          onChange={(v) => set({ maxLevel: Number(v) })}
        />
        {gameId === 'G1' && (
          <>
            <Select
              label={vi.debug.colors}
              value={opt('colors')}
              options={[autoOpt, ['2', '2'], ['3', '3'], ['4', '4']]}
              onChange={(v) => setOpt('colors', v)}
            />
            <Select
              label={vi.debug.simultaneous}
              value={opt('simultaneous')}
              options={[autoOpt, ['1', '1'], ['2', '2']]}
              onChange={(v) => setOpt('simultaneous', v)}
            />
          </>
        )}
        {gameId === 'G2' && (
          <>
            <Select
              label={vi.debug.grid}
              value={opt('grid')}
              options={[autoOpt, ['3', '3×3'], ['4', '4×4'], ['5', '5×5']]}
              onChange={(v) => setOpt('grid', v)}
            />
            <Select
              label={vi.debug.order}
              value={opt('order')}
              options={[
                autoOpt,
                ['forward', vi.debug.orderForward],
                ['backward', vi.debug.orderBackward],
              ]}
              onChange={(v) => setOpt('order', v)}
            />
            <Select
              label={vi.debug.hint}
              value={opt('hint')}
              options={[autoOpt, ['on', vi.debug.on], ['off', vi.debug.off]]}
              onChange={(v) => setOpt('hint', v)}
            />
          </>
        )}
      </div>
      <p class="debug-note" data-testid="debug-recent">
        {vi.debug.recent(g.recentScores)}
      </p>
    </section>
  );
}
