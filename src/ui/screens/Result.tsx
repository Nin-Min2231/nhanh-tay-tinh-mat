import { Fragment } from 'preact';
import { useEffect, useState } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import { BENCHMARK_ORDER } from '../../app/benchmark';
import { needsPicking } from '../../app/rewards';
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
    // Xuống cấp: vẫn chỉ phát tiếng sao như mọi lượt (không có âm buồn)
    if (r.levelChange === 'up') audio.levelUp();
    else audio.star();
  }, [r]);
  if (!r) return null;

  const lines = vi.games[r.gameId]?.lines?.(r.metrics) ?? [];
  const leveledUp = r.levelChange === 'up';
  const leveledDown = r.levelChange === 'down';
  const celebrate = r.stars === 3 || leveledUp;
  const modeName = vi.intro[r.choice];
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
      {leveledUp && (
        <>
          <p class="levelup" data-testid="level-up">
            {vi.result.levelUp}
          </p>
          <p class="levelup-detail" data-testid="level-up-detail">
            {vi.result.levelUpDetail(modeName, r.newLevel)}
          </p>
        </>
      )}
      {leveledDown && (
        <p class="levelup-detail level-down" data-testid="level-down">
          {vi.result.levelDown(modeName, r.newLevel)}
        </p>
      )}
      <p class="result-praise" data-testid="praise">
        {vi.result.praise[r.stars]}
      </p>
      {lines.map((line) => (
        <p key={line} class="result-metric" data-testid="metric-line">
          {line}
        </p>
      ))}
      {r.benchmark && (
        <p class="result-mission" data-testid="bench-progress">
          {r.benchmarkNext
            ? vi.result.benchmarkProgress(
                BENCHMARK_ORDER.length - r.benchmarkLeft,
                BENCHMARK_ORDER.length,
              )
            : vi.result.benchmarkDone}
        </p>
      )}
      {rewards.newMission && (
        <p class="result-mission" data-testid="result-mission">
          {vi.result.missionDone(vi.home.missions[rewards.group])}{' '}
          {vi.result.missionsProgress(rewards.missionsDone)}
        </p>
      )}
      {rewards.unlocked.map((id) => (
        <Fragment key={id}>
          <p class="levelup reward-unlock" data-testid="result-unlock">
            {vi.result.unlocked(vi.unlocks[id] ?? id)}
          </p>
          {needsPicking(id) && (
            <p class="result-note" data-testid="result-unlock-hint">
              {vi.album.useHint}
            </p>
          )}
        </Fragment>
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
            {r.benchmark && r.benchmarkNext ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => replace(`/play/${r.benchmarkNext}/intro`)}
                data-testid="bench-next"
              >
                {vi.result.benchmarkNext}
              </Button>
            ) : (
              !r.benchmark && (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => replace(`/play/${r.gameId}/intro`)}
                  data-testid="play-again"
                >
                  {vi.common.playAgain}
                </Button>
              )
            )}
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
