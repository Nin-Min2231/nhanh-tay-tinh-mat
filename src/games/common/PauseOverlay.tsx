import { vi } from '../../i18n/vi';
import { Button } from '../../ui/components/Button';

export function PauseOverlay({ onResume, onExit }: { onResume: () => void; onExit: () => void }) {
  return (
    <div
      class="overlay"
      role="dialog"
      aria-modal="true"
      aria-label={vi.play.paused}
      data-testid="pause-overlay"
    >
      <h2 class="overlay-title">{vi.play.paused}</h2>
      <Button variant="primary" size="lg" onClick={onResume}>
        {vi.play.resume}
      </Button>
      <Button variant="secondary" onClick={onExit}>
        {vi.play.exit}
      </Button>
      <p class="overlay-note">{vi.play.exitNote}</p>
    </div>
  );
}
