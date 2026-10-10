import { useEffect, useState } from 'preact/hooks';
import { vi } from '../../i18n/vi';

export const COUNTDOWN_FROM = 3;
export const COUNTDOWN_STEP_MS = 1000;

/** Đếm ngược 3-2-1 rồi gọi onDone. Unmount giữa chừng thì hủy. */
export function Countdown({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(COUNTDOWN_FROM);

  useEffect(() => {
    const id = window.setTimeout(() => {
      if (n <= 1) onDone();
      else setN(n - 1);
    }, COUNTDOWN_STEP_MS);
    return () => window.clearTimeout(id);
  }, [n, onDone]);

  return (
    <div class="overlay overlay-light" role="status" aria-live="assertive" data-testid="countdown">
      <p class="countdown-label">{vi.play.countdownLabel}</p>
      <div key={n} class="countdown-number">
        {n}
      </div>
    </div>
  );
}
