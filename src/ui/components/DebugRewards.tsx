// Công cụ thử thưởng – chỉ hiện khi chạy dev với ?debug=1 (xem src/app/e2e.ts).
import { DEBUG } from '../../app/e2e';
import { debugAddBox, debugAddStars, debugResetDay } from '../../app/store';
import { vi } from '../../i18n/vi';
import { Button } from './Button';

export function DebugRewards() {
  if (!DEBUG) return null;
  return (
    <section class="debug-panel" data-testid="debug-rewards">
      <h2>{vi.debug.rewards}</h2>
      <div class="debug-grid">
        <Button onClick={debugAddBox} data-testid="debug-add-box">
          {vi.debug.addBox}
        </Button>
        <Button onClick={() => debugAddStars(10)} data-testid="debug-add-10">
          {vi.debug.addStars(10)}
        </Button>
        <Button onClick={() => debugAddStars(15)} data-testid="debug-add-15">
          {vi.debug.addStars(15)}
        </Button>
        <Button onClick={debugResetDay} data-testid="debug-reset-day">
          {vi.debug.resetDay}
        </Button>
      </div>
    </section>
  );
}
