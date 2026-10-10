import { useEffect, useState } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import { replace } from '../../app/router';
import { audio, lastResult } from '../../app/store';
import { Button } from '../components/Button';
import { Confetti } from '../components/Confetti';
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

  return (
    <main class="screen screen-center result" data-testid="result">
      {celebrate && <Confetti />}
      <h1 class="title">{vi.result.title}</h1>
      <Mascot mood={celebrate ? 'cheer' : 'happy'} size={120} />
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
      <div class={`result-actions${ready ? '' : ' is-pending'}`}>
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
