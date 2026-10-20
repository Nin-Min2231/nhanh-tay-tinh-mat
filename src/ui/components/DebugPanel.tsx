// Bảng chỉnh nhanh độ khó/tùy chọn game – chỉ hiện khi chạy dev với ?debug=1 (xem src/app/e2e.ts).
// Giao diện phụ huynh thật sẽ làm ở TASK-07.
import { KID_CHOICES } from '../../app/adaptive';
import { DEBUG } from '../../app/e2e';
import { activeProfile, setGameProgress } from '../../app/store';
import type { GameId, GameProgress } from '../../app/types';
import { TOPIC_CODES } from '../../games/g6-math/config';
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
        {/* Cố định: cấp cố định. Tự động: cấp của sổ “Tự động” (3 sổ còn lại giữ nguyên). */}
        <Select
          label={vi.debug.level}
          value={String(g.mode === 'fixed' ? g.level : g.tracks.auto.level)}
          options={levelOptions}
          onChange={(v) =>
            set({
              level: Number(v),
              tracks: { ...g.tracks, auto: { level: Number(v), stars: 0, recent: [] } },
            })
          }
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
        {gameId === 'G3' && (
          <>
            <Select
              label={vi.debug.speed}
              value={opt('speed')}
              options={[
                autoOpt,
                ['slow', vi.debug.slow],
                ['medium', vi.debug.medium],
                ['fast', vi.debug.fast],
              ]}
              onChange={(v) => setOpt('speed', v)}
            />
            <Select
              label={vi.debug.decoys}
              value={opt('decoys')}
              options={[autoOpt, ['off', vi.debug.off], ['on', vi.debug.on]]}
              onChange={(v) => setOpt('decoys', v)}
            />
          </>
        )}
        {gameId === 'G4' && (
          <>
            <Select
              label={vi.debug.pads}
              value={opt('pads')}
              options={[autoOpt, ['4', '4'], ['6', '6'], ['9', '9']]}
              onChange={(v) => setOpt('pads', v)}
            />
            <Select
              label={vi.debug.speed}
              value={opt('speed')}
              options={[
                autoOpt,
                ['slow', vi.debug.slow],
                ['medium', vi.debug.medium],
                ['fast', vi.debug.fast],
              ]}
              onChange={(v) => setOpt('speed', v)}
            />
            <Select
              label={vi.debug.startLen}
              value={opt('startLen')}
              options={[autoOpt, ['2', '2'], ['3', '3'], ['4', '4'], ['5', '5']]}
              onChange={(v) => setOpt('startLen', v)}
            />
          </>
        )}
        {gameId === 'G5' && (
          <>
            <Select
              label={vi.debug.fall}
              value={opt('fall')}
              options={[
                autoOpt,
                ['slow', vi.debug.slow],
                ['medium', vi.debug.medium],
                ['fast', vi.debug.fast],
              ]}
              onChange={(v) => setOpt('fall', v)}
            />
            <Select
              label={vi.debug.doubles}
              value={opt('doubles')}
              options={[autoOpt, ['off', vi.debug.off]]}
              onChange={(v) => setOpt('doubles', v)}
            />
          </>
        )}
        {gameId === 'G6' && (
          <>
            <Select
              label={vi.debug.topic}
              value={
                Array.isArray(g.options.topics) ? String(g.options.topics[0] ?? 'auto') : 'auto'
              }
              options={[autoOpt, ...TOPIC_CODES.map((c) => [c, c] as const)]}
              onChange={(v) =>
                set({ options: { ...g.options, topics: v === 'auto' ? null : [v] } })
              }
            />
            <Select
              label={vi.debug.timer}
              value={opt('timer')}
              options={[autoOpt, ['off', vi.debug.timerOff]]}
              onChange={(v) => setOpt('timer', v)}
            />
          </>
        )}
        {gameId === 'G7' && (
          <>
            <Select
              label={vi.debug.groups}
              value={
                Array.isArray(g.options.groups) ? String(g.options.groups[0] ?? 'auto') : 'auto'
              }
              options={[
                autoOpt,
                ['shapes', vi.debug.shapes],
                ['numbers', vi.debug.numbers],
                ['matrix', vi.debug.matrix],
              ]}
              onChange={(v) =>
                set({ options: { ...g.options, groups: v === 'auto' ? null : [v] } })
              }
            />
            <Select
              label={vi.debug.timer}
              value={opt('timer') === 'auto' ? 'off' : opt('timer')}
              options={[
                ['off', vi.debug.timerOff],
                ['sec30', vi.debug.timer30],
              ]}
              onChange={(v) => setOpt('timer', v)}
            />
          </>
        )}
      </div>
      <p class="debug-note" data-testid="debug-recent">
        {vi.debug.tracks(
          KID_CHOICES.map(
            (c) => [vi.intro[c], g.tracks[c].level, g.tracks[c].stars, g.tracks[c].recent] as const,
          ),
        )}
      </p>
    </section>
  );
}
