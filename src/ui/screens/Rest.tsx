import { useMemo } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import { goHome } from '../../app/router';
import { Button } from '../components/Button';
import { Mascot } from '../components/Mascot';

export function Rest() {
  // Gợi ý vận động ngẫu nhiên: không ảnh hưởng chấm điểm/thưởng nên không cần RNG có seed.
  const activity = useMemo(
    () => vi.rest.activities[Math.floor(Math.random() * vi.rest.activities.length)],
    [],
  );
  return (
    <main class="screen screen-center rest" data-testid="rest">
      <h1 class="title">{vi.rest.title}</h1>
      <Mascot mood="sleep" size={150} />
      <p class="rest-message">{vi.rest.message}</p>
      <p class="rest-activity-title">{vi.rest.activityTitle}</p>
      <p class="rest-activity" data-testid="rest-activity">
        {activity}
      </p>
      <p class="rest-message">{vi.rest.tomorrow}</p>
      <Button variant="primary" size="lg" onClick={() => goHome()}>
        {vi.common.goHome}
      </Button>
    </main>
  );
}
