import { useEffect, useMemo, useState } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import { dateKey, getDay } from '../../app/profile';
import { REST_ON_TIME_STARS } from '../../app/rewards';
import { goHome, navigate } from '../../app/router';
import { isOutOfTime } from '../../app/session';
import {
  REST_WINDOW_MS,
  activeProfile,
  audio,
  claimRest,
  openGiftModal,
  restWindowEndsAt,
  startRestWindow,
} from '../../app/store';
import { Button } from '../components/Button';
import { Confetti } from '../components/Confetti';
import { GiftBoxArt } from '../components/GiftBox';
import { Mascot } from '../components/Mascot';
import { ProgressBar } from '../components/ProgressBar';

export function Rest() {
  // Gợi ý vận động ngẫu nhiên: không ảnh hưởng chấm điểm/thưởng nên không cần RNG có seed.
  const activity = useMemo(
    () => vi.rest.activities[Math.floor(Math.random() * vi.rest.activities.length)],
    [],
  );
  const [now, setNow] = useState(() => Date.now());
  const [justClaimed, setJustClaimed] = useState(false);

  // Vừa hết giờ rồi vào màn Nghỉ → bắt đầu cửa sổ 30 giây của “Con nghỉ đây” (F20)
  useEffect(() => {
    startRestWindow();
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), 250);
    return () => window.clearInterval(id);
  }, []);

  const p = activeProfile.value;
  if (!p) return null;
  const key = dateKey(new Date());
  const day = getDay(p, key);
  const end = restWindowEndsAt.value;
  const msLeft = end === null ? 0 : Math.max(0, end - now);
  const canClaim = msLeft > 0 && !day.restOnTimeRewarded && isOutOfTime(p, key);
  const pending = p.boxes.pending;

  const onRest = () => {
    const res = claimRest();
    if (!res) return;
    audio.star();
    setJustClaimed(true);
  };

  return (
    <main class="screen screen-center rest" data-testid="rest">
      {justClaimed && <Confetti count={30} />}
      <h1 class="title">{vi.rest.title}</h1>
      <Mascot mood="sleep" size={150} outfit={p.outfitId} />
      <p class="rest-message">{vi.rest.message}</p>

      {canClaim && (
        <section class="rest-claim" data-testid="rest-claim">
          <Button variant="primary" size="lg" onClick={onRest} data-testid="rest-now">
            {vi.rest.restNow}
          </Button>
          <ProgressBar value={msLeft / REST_WINDOW_MS} label={vi.rest.restHint} tone="orange" />
          <p class="rest-hint">
            {vi.rest.restHint} ({vi.rest.secondsLeft(Math.ceil(msLeft / 1000))})
          </p>
        </section>
      )}
      {day.restOnTimeRewarded && (
        <p class="rest-reward" data-testid="rest-reward">
          {justClaimed ? vi.rest.restReward(REST_ON_TIME_STARS) : vi.rest.restDone}
        </p>
      )}

      <section class="rest-gifts" data-testid="rest-gifts">
        {pending > 0 ? (
          <>
            <GiftBoxArt size={72} />
            <p class="rest-message">{vi.rest.boxesLeft(pending)}</p>
            <Button variant="primary" onClick={openGiftModal} data-testid="rest-open-gift">
              {vi.rest.openBoxes}
            </Button>
          </>
        ) : (
          <p class="rest-hint">{vi.rest.noBoxes}</p>
        )}
      </section>

      <p class="rest-activity-title">{vi.rest.activityTitle}</p>
      <p class="rest-activity" data-testid="rest-activity">
        {activity}
      </p>
      <p class="rest-message">{vi.rest.tomorrow}</p>
      <div class="result-actions">
        <Button variant="primary" size="lg" onClick={() => goHome()}>
          {vi.common.goHome}
        </Button>
        <Button variant="secondary" size="lg" onClick={() => navigate('/album')}>
          {vi.rest.toAlbum}
        </Button>
      </div>
    </main>
  );
}
