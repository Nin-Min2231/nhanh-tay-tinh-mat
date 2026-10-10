import { vi } from '../../i18n/vi';
import { goBack, goHome } from '../../app/router';
import { Button } from '../components/Button';
import { IconBack } from '../components/Icons';
import { Mascot } from '../components/Mascot';

/** Trang tạm cho Album / Khu phụ huynh (làm ở TASK-06, TASK-07). */
export function UnderConstruction({ title }: { title: string }) {
  return (
    <main class="screen screen-center" data-testid="wip">
      <h1 class="title">{title}</h1>
      <Mascot mood="surprised" size={120} />
      <p class="rest-message">{vi.wip.message}</p>
      <Button variant="primary" size="lg" onClick={() => (goBack() ? undefined : goHome())}>
        <IconBack /> {vi.common.back}
      </Button>
    </main>
  );
}
