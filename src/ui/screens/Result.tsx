import { useEffect, useState } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import { replace } from '../../app/router';
import { audio, lastResult } from '../../app/store';
import { Button } from '../components/Button';
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
    if (r) audio.star();
  }, [r]);
  if (!r) return null;

  const g = vi.games[r.gameId];
  const metricText = 'metric' in g ? g.metric(r.metrics) : '';

  return (
    <main class="screen screen-center result" data-testid="result">
      <h1 class="title">{vi.result.title}</h1>
      <Mascot mood={r.stars === 3 ? 'cheer' : 'happy'} size={120} />
      <StarBurst count={r.stars} />
      <p class="result-stars">{vi.result.starsEarned(r.stars)}</p>
      <p class="result-praise" data-testid="praise">
        {vi.result.praise[r.stars]}
      </p>
      {metricText && <p class="result-metric">{metricText}</p>}
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
            <Button variant="primary" size="lg" onClick={() => replace(`/play/${r.gameId}/intro`)}>
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
