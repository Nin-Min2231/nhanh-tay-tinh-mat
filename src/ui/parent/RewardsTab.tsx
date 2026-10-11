// Tab Thưởng (F15, TC-023): tặng thêm giờ chơi hôm nay hoặc tặng hộp quà, kèm lý do.
import { useState } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import { BONUS_MINUTES, REWARD_REASONS } from '../../app/parentOps';
import { parentGiveBoxes, parentGiveTime } from '../../app/parentStore';
import { dateKey, getDay } from '../../app/profile';
import { dayRemainingMs } from '../../app/session';
import type { RewardReason } from '../../app/types';
import { Button } from '../components/Button';
import { fmtDateTime, selectedParentProfile } from './state';

const BOX_COUNTS = [1, 2, 3] as const;

export function RewardsTab() {
  const p = selectedParentProfile.value;
  const [reason, setReason] = useState<RewardReason>('goodStudy');
  const [status, setStatus] = useState<string | null>(null);
  if (!p) return null;
  const key = dateKey(new Date());
  const left = Math.ceil(dayRemainingMs(p, key) / 60_000);
  const bonus = Math.round(getDay(p, key).bonusMs / 60_000);
  const log = [...p.rewardLog].reverse().slice(0, 10);

  return (
    <div class="rewards-tab" data-testid="rewards-tab">
      <fieldset class="pfield">
        <legend class="pfield-label">{vi.parent.rewards.reasonTitle}</legend>
        <div class="pseg" role="radiogroup" aria-label={vi.parent.rewards.reasonTitle}>
          {REWARD_REASONS.map((r) => (
            <button
              key={r}
              type="button"
              role="radio"
              aria-checked={reason === r}
              class={`pseg-btn${reason === r ? ' is-selected' : ''}`}
              data-testid={`reason-${r}`}
              onClick={() => setReason(r)}
            >
              {vi.parent.rewards.reasons[r]}
            </button>
          ))}
        </div>
      </fieldset>

      <h2 class="parent-h2">{vi.parent.rewards.timeTitle}</h2>
      <p class="parent-note" data-testid="reward-today">
        {vi.parent.rewards.today(left, bonus)}
      </p>
      <div class="parent-actions">
        {BONUS_MINUTES.map((m) => (
          <Button
            key={m}
            variant="secondary"
            data-testid={`give-time-${m}`}
            onClick={() => {
              parentGiveTime(p.id, m, reason);
              setStatus(vi.parent.rewards.gaveTime(p.name, m));
            }}
          >
            {vi.parent.rewards.time(m)}
          </Button>
        ))}
      </div>

      <h2 class="parent-h2">{vi.parent.rewards.boxTitle}</h2>
      <p class="parent-note" data-testid="reward-pending">
        {vi.parent.rewards.pending(p.boxes.pending)}
      </p>
      <div class="parent-actions">
        {BOX_COUNTS.map((n) => (
          <Button
            key={n}
            variant="secondary"
            data-testid={`give-box-${n}`}
            onClick={() => {
              parentGiveBoxes(p.id, n, reason);
              setStatus(vi.parent.rewards.gaveBox(p.name, n));
            }}
          >
            {vi.parent.rewards.box(n)}
          </Button>
        ))}
      </div>
      <p class="parent-note">{vi.parent.rewards.boxNote}</p>

      {status && (
        <p class="parent-ok" role="status" data-testid="reward-status">
          {status}
        </p>
      )}

      <h2 class="parent-h2">{vi.parent.rewards.logTitle}</h2>
      {log.length === 0 ? (
        <p class="parent-empty">{vi.parent.rewards.logEmpty}</p>
      ) : (
        <ul class="parent-log" data-testid="reward-log">
          {log.map((e) => (
            <li key={e.at + e.kind + e.amount}>
              <span>{fmtDateTime(e.at)}</span>
              <span>
                {e.kind === 'time'
                  ? vi.parent.rewards.logTime(e.amount)
                  : vi.parent.rewards.logBox(e.amount)}
              </span>
              <span>{vi.parent.rewards.reasons[e.reason]}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
