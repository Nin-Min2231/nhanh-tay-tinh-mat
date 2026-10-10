import { useEffect, useState } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import { replace } from '../../app/router';
import { activeProfile, audio, lastResult, openGiftModal } from '../../app/store';
import { Button } from '../components/Button';
import { Confetti } from '../components/Confetti';
import { GiftBoxArt } from '../components/GiftBox';
import { Mascot } from '../components/Mascot';
import { StarBurst } from '../components/StarBurst';

/** Chặn “click-through”: game kết thúc bằng pointerdown, cú click giả sau đó có thể rơi trúng nút ở màn này. */
const INPUT_GUARD_MS = 600;

export function Result() {
  const r = lastResult.value;
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const id = window.setTimeout(() => setReady(true), INPUT_GUARD_MS);
    return () => window.clearTimeout(id);
  }, []);
  useEffect(() => {
    if (!r) return;
    if (r.leveledUp) audio.levelUp();
    else audio.star();
  }, [r]);
  if (!r) return null;

  const lines = vi.games[r.gameId]?.lines?.(r.metrics) ?? [];
  const celebrate = r.stars === 3 || r.leveledUp;
  const { rewards } = r;
  const pending = activeProfile.value?.boxes.pending ?? 0;
  const hasGift = rewards.boxesGained > 0 && pending > 0;

  return (
    <main class="screen screen-center result" data-testid="result">
      {celebrate && <Confetti />}
      <h1 class="title">{vi.result.title}</h1>
      <Mascot
        mood={celebrate ? 'cheer' : 'happy'}
        size={120}
        outfit={activeProfile.value?.outfitId ?? null}
      />
      <StarBurst count={r.stars} />
      <p class="result-stars">{vi.result.starsEarned(r.stars)}</p>
      {r.leveledUp && (
        <>
          <p class="levelup" data-testid="level-up">
            {vi.result.levelUp}
          </p>
          <p class="levelup-detail">{vi.result.levelUpDetail(r.newLevel)}</p>
        </>
      )}
      <p class="result-praise" data-testid="praise">
        {vi.result.praise[r.stars]}
      </p>
      {lines.map((line) => (
        <p key={line} class="result-metric" data-testid="metric-line">
          {line}
        </p>
      ))}
      {rewards.newMission && (
        <p class="result-mission" data-testid="result-mission">
          {vi.result.missionDone(vi.home.missions[rewards.group])}{' '}
          {vi.result.missionsProgress(rewards.missionsDone)}
        </p>
      )}
      {rewards.unlocked.map((id) => (
        <p key={id} class="levelup reward-unlock" data-testid="result-unlock">
          {vi.result.unlocked(vi.unlocks[id] ?? id)}
        </p>
      ))}
      {hasGift && (
        <div class="gift-banner" data-testid="gift-earned">
          <GiftBoxArt size={64} />
          <span>{vi.result.giftEarned}</span>
        </div>
      )}
      {rewards.boxesBlocked > 0 && (
        <p class="result-note" data-testid="gift-blocked">
          {vi.result.giftBlocked}
        </p>
      )}
      <div class={`result-actions${ready ? '' : ' is-pending'}`}>
        {pending > 0 && (
          <Button variant="primary" size="lg" onClick={openGiftModal} data-testid="open-gift">
            {vi.result.openGift}
          </Button>
        )}
        {r.outOfTime ? (
          <Button
            variant="primary"
            size="lg"
            onClick={() => replace('/rest')}
            data-testid="to-rest"
          >
            {vi.common.next}
          </Button>
        ) : (
          <>
            <Button
              variant="primary"
              size="lg"
              onClick={() => replace(`/play/${r.gameId}/intro`)}
              data-testid="play-again"
            >
              {vi.common.playAgain}
            </Button>
            <Button
              variant="secondary"
              size="lg"
              onClick={() => replace('/home')}
              data-testid="to-home"
            >
              {vi.common.goHome}
            </Button>
          </>
        )}
      </div>
    </main>
  );
}
