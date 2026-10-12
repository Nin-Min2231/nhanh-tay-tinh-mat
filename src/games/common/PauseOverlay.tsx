import { vi } from '../../i18n/vi';
import { Button } from '../../ui/components/Button';

export function PauseOverlay({
  onResume,
  onExit,
  zoomed = false,
}: {
  onResume: () => void;
  onExit: () => void;
  /** Trang đang bị phóng to: nhắc thu nhỏ, chưa cho chơi tiếp. */
  zoomed?: boolean;
}) {
  return (
    <div
      class="overlay"
      role="dialog"
      aria-modal="true"
      aria-label={vi.play.paused}
      data-testid="pause-overlay"
    >
      <h2 class="overlay-title">{vi.play.paused}</h2>
      {zoomed && (
        <p class="overlay-note zoom-hint" role="status" data-testid="zoom-hint">
          {vi.play.zoomHint}
        </p>
      )}
      <Button variant="primary" size="lg" onClick={onResume} disabled={zoomed}>
        {vi.play.resume}
      </Button>
      <Button variant="secondary" onClick={onExit}>
        {vi.play.exit}
      </Button>
      <p class="overlay-note">{vi.play.exitNote}</p>
    </div>
  );
}
