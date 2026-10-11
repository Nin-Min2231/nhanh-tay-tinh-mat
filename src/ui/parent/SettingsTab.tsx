// Tab Cài đặt (F07, F09, F11, F12, F17): thời gian/ngày, hộp quà, âm thanh/nhạc/rung, quyền chọn độ khó của bé,
// độ khó từng game (Tự động min–max / Cố định + tùy chọn riêng), toán G6 (lớp + chủ đề), nhóm dạng câu G7.
import { vi } from '../../i18n/vi';
import { DAILY_MINUTES_STEP } from '../../app/parentOps';
import {
  parentPatchGame,
  parentSetGameOption,
  parentSetGrade,
  parentSetLimits,
  parentToggleTopic,
} from '../../app/parentStore';
import { MAX_BOXES_PER_DAY_RANGE } from '../../app/rewards';
import { appState, setSettings } from '../../app/store';
import type { GlobalSettings, Grade, Profile } from '../../app/types';
import { readG7Options } from '../../games/g7-patterns/config';
import { GAME_IDS, levelsConfig, type GameId } from '../../games/levels';
import { GameIcon } from '../components/GameIcon';
import { Button } from '../components/Button';
import { G7_GROUPS, SELECT_OPTIONS } from './gameOptions';
import { selectedParentProfile } from './state';

const LEVELS = Array.from({ length: 10 }, (_, i) => i + 1);
const GRADES: Grade[] = [1, 2, 3];

function Stepper({
  label,
  value,
  min,
  max,
  step,
  onChange,
  testid,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  onChange: (v: number) => void;
  testid: string;
}) {
  return (
    <div class="pfield">
      <span class="pfield-label" id={`${testid}-label`}>
        {label}
      </span>
      <div class="stepper" role="group" aria-labelledby={`${testid}-label`}>
        <Button
          variant="secondary"
          aria-label={vi.parent.settings.decrease}
          disabled={value <= min}
          data-testid={`${testid}-dec`}
          onClick={() => onChange(value - step)}
        >
          −
        </Button>
        <output class="stepper-value" data-testid={`${testid}-value`}>
          {value}
        </output>
        <Button
          variant="secondary"
          aria-label={vi.parent.settings.increase}
          disabled={value >= max}
          data-testid={`${testid}-inc`}
          onClick={() => onChange(value + step)}
        >
          +
        </Button>
      </div>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
  testid,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  testid: string;
}) {
  return (
    <label class="ptoggle">
      <input
        type="checkbox"
        checked={checked}
        data-testid={testid}
        onChange={(e) => onChange((e.currentTarget as HTMLInputElement).checked)}
      />
      <span>{label}</span>
      <span class="ptoggle-state" aria-hidden="true">
        {checked ? vi.parent.settings.on : vi.parent.settings.off}
      </span>
    </label>
  );
}

function LevelSelect({
  label,
  value,
  onChange,
  testid,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  testid: string;
}) {
  return (
    <label class="pfield">
      <span class="pfield-label">{label}</span>
      <select
        class="pselect"
        value={String(value)}
        data-testid={testid}
        onChange={(e) => onChange(Number((e.currentTarget as HTMLSelectElement).value))}
      >
        {LEVELS.map((l) => (
          <option key={l} value={String(l)}>
            {l}
          </option>
        ))}
      </select>
    </label>
  );
}

function GamePanel({ profile, gameId }: { profile: Profile; gameId: GameId }) {
  const S = vi.parent.settings;
  const g = profile.games[gameId];
  const patch = (p: Parameters<typeof parentPatchGame>[2]) =>
    parentPatchGame(profile.id, gameId, p);
  const summary =
    g.mode === 'fixed' ? S.summaryFixed(g.level) : S.summaryAuto(g.minLevel, g.maxLevel);

  return (
    <details class="pgame" data-testid={`pgame-${gameId}`}>
      <summary class="pgame-sum">
        <GameIcon id={gameId} size={32} />
        <span class="pgame-name">{vi.games[gameId].name}</span>
        <span class="pgame-state" data-testid={`pgame-summary-${gameId}`}>
          {summary}
        </span>
      </summary>
      <div class="pgame-body">
        <fieldset class="pfield">
          <legend class="pfield-label">{S.mode}</legend>
          <div class="pseg" role="radiogroup" aria-label={S.mode}>
            {(['auto', 'fixed'] as const).map((m) => (
              <button
                key={m}
                type="button"
                role="radio"
                aria-checked={g.mode === m}
                class={`pseg-btn${g.mode === m ? ' is-selected' : ''}`}
                data-testid={`mode-${gameId}-${m}`}
                onClick={() => patch({ mode: m })}
              >
                {m === 'auto' ? S.modeAuto : S.modeFixed}
              </button>
            ))}
          </div>
        </fieldset>
        <p class="parent-note">{g.mode === 'auto' ? S.autoHint : S.fixedHint}</p>

        {g.mode === 'fixed' ? (
          <LevelSelect
            label={S.level}
            value={g.level}
            onChange={(v) => patch({ level: v })}
            testid={`level-${gameId}`}
          />
        ) : (
          <>
            <div class="pfilters">
              <LevelSelect
                label={S.minLevel}
                value={g.minLevel}
                onChange={(v) => patch({ minLevel: v })}
                testid={`min-${gameId}`}
              />
              <LevelSelect
                label={S.maxLevel}
                value={g.maxLevel}
                onChange={(v) => patch({ maxLevel: v })}
                testid={`max-${gameId}`}
              />
            </div>
            <p class="parent-note" data-testid={`current-${gameId}`}>
              {S.currentLevel(g.level)}
            </p>
          </>
        )}

        {SELECT_OPTIONS[gameId].length > 0 && <h3 class="parent-h3">{S.options}</h3>}
        <div class="pfilters">
          {SELECT_OPTIONS[gameId].map((def) => {
            const current = String(g.options[def.key] ?? def.fallback ?? 'auto');
            return (
              <label class="pfield" key={def.key}>
                <span class="pfield-label">{def.label}</span>
                <select
                  class="pselect"
                  value={current}
                  data-testid={`opt-${gameId}-${def.key}`}
                  onChange={(e) => {
                    const v = (e.currentTarget as HTMLSelectElement).value;
                    const reset = v === 'auto' || v === (def.fallback ?? 'auto');
                    parentSetGameOption(
                      profile.id,
                      gameId,
                      def.key,
                      reset ? null : /^\d+$/.test(v) ? Number(v) : v,
                    );
                  }}
                >
                  {def.choices.map(([val, text]) => (
                    <option key={val} value={val}>
                      {text}
                    </option>
                  ))}
                </select>
              </label>
            );
          })}
        </div>

        {gameId === 'G6' && <MathPanel profile={profile} />}
        {gameId === 'G7' && <GroupsPanel profile={profile} />}
      </div>
    </details>
  );
}

/** G6: lớp + chủ đề M01–M14 (F17). */
function MathPanel({ profile }: { profile: Profile }) {
  const S = vi.parent.settings;
  return (
    <div class="math-panel" data-testid="math-panel">
      <h3 class="parent-h3">{S.mathTitle}</h3>
      <fieldset class="pfield">
        <legend class="pfield-label">{S.grade}</legend>
        <div class="pseg" role="radiogroup" aria-label={S.grade}>
          {GRADES.map((gr) => (
            <button
              key={gr}
              type="button"
              role="radio"
              aria-checked={profile.grade === gr}
              class={`pseg-btn${profile.grade === gr ? ' is-selected' : ''}`}
              data-testid={`math-grade-${gr}`}
              onClick={() => parentSetGrade(profile.id, gr)}
            >
              {vi.parent.profiles.grade(gr)}
            </button>
          ))}
        </div>
      </fieldset>
      <p class="parent-note">{S.gradeNote}</p>
      <fieldset class="pfield">
        <legend class="pfield-label">{S.topics}</legend>
        <div class="topic-list" data-testid="math-topics">
          {levelsConfig.mathTopics.map((t) => (
            <label class="ptoggle ptoggle-topic" key={t.code}>
              <input
                type="checkbox"
                checked={profile.math.topics.includes(t.code)}
                data-testid={`topic-${t.code}`}
                onChange={() => parentToggleTopic(profile.id, t.code)}
              />
              <span>
                <strong>{t.code}</strong> · {t.name} ({vi.parent.profiles.grade(t.grade)}) –{' '}
                {t.example}
              </span>
            </label>
          ))}
        </div>
      </fieldset>
      <p class="parent-note">{S.topicsNote}</p>
    </div>
  );
}

/** G7: nhóm dạng câu (Hình / Số / Ma trận). */
function GroupsPanel({ profile }: { profile: Profile }) {
  const S = vi.parent.settings;
  const groups = readG7Options(profile.games.G7.options).groups as string[];
  const toggle = (id: string, box: HTMLInputElement) => {
    const next = groups.includes(id) ? groups.filter((x) => x !== id) : [...groups, id];
    if (next.length === 0) {
      box.checked = true; // luôn còn ít nhất 1 nhóm: trả ô về trạng thái đã chọn (dữ liệu không đổi nên Preact không vẽ lại)
      return;
    }
    const ordered = G7_GROUPS.map(([k]) => k as string).filter((k) => next.includes(k));
    parentSetGameOption(
      profile.id,
      'G7',
      'groups',
      ordered.length === G7_GROUPS.length ? null : ordered,
    );
  };
  return (
    <fieldset class="pfield" data-testid="g7-groups">
      <legend class="pfield-label">{S.groups}</legend>
      <div class="topic-list">
        {G7_GROUPS.map(([id, text]) => (
          <label class="ptoggle" key={id}>
            <input
              type="checkbox"
              checked={groups.includes(id)}
              data-testid={`group-${id}`}
              onChange={(e) => toggle(id, e.currentTarget as HTMLInputElement)}
            />
            <span>{text}</span>
          </label>
        ))}
      </div>
      <p class="parent-note">{S.groupsNote}</p>
    </fieldset>
  );
}

export function SettingsTab() {
  const S = vi.parent.settings;
  const p = selectedParentProfile.value;
  const settings = appState.value.settings;
  if (!p) return null;
  const [minM, maxM] = levelsConfig.session.dailyMinutesRange;
  const setGlobal = (patch: Partial<GlobalSettings>) => setSettings(patch);

  return (
    <div class="settings-tab" data-testid="settings-tab">
      <h2 class="parent-h2">{S.timeTitle}</h2>
      <div class="pfilters">
        <Stepper
          label={S.dailyMinutes}
          value={p.limits.dailyMinutes}
          min={minM}
          max={maxM}
          step={DAILY_MINUTES_STEP}
          onChange={(v) => parentSetLimits(p.id, { dailyMinutes: v })}
          testid="daily"
        />
        <Stepper
          label={S.maxBoxes}
          value={p.limits.maxBoxesPerDay}
          min={MAX_BOXES_PER_DAY_RANGE[0]}
          max={MAX_BOXES_PER_DAY_RANGE[1]}
          step={1}
          onChange={(v) => parentSetLimits(p.id, { maxBoxesPerDay: v })}
          testid="boxes"
        />
      </div>

      <h2 class="parent-h2">{S.globalTitle}</h2>
      <div class="toggle-list">
        <Toggle
          label={S.sound}
          checked={settings.sound}
          onChange={(v) => setGlobal({ sound: v })}
          testid="set-sound"
        />
        <Toggle
          label={S.music}
          checked={settings.music}
          onChange={(v) => setGlobal({ music: v })}
          testid="set-music"
        />
        <Toggle
          label={S.vibration}
          checked={settings.vibration}
          onChange={(v) => setGlobal({ vibration: v })}
          testid="set-vibration"
        />
        <Toggle
          label={S.kidChoice}
          checked={settings.allowKidDifficultyChoice}
          onChange={(v) => setGlobal({ allowKidDifficultyChoice: v })}
          testid="set-kidchoice"
        />
      </div>

      <h2 class="parent-h2">{S.gamesTitle}</h2>
      <div class="game-list">
        {GAME_IDS.map((id) => (
          <GamePanel key={`${p.id}-${id}`} profile={p} gameId={id} />
        ))}
      </div>
    </div>
  );
}
