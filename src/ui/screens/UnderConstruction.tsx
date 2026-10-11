import { vi } from '../../i18n/vi';
import { goBack, goHome } from '../../app/router';
import { APP_VERSION } from '../../app/version';
import { Button } from '../components/Button';
import { IconBack } from '../components/Icons';
import { Mascot } from '../components/Mascot';

/** Trang tạm cho Khu phụ huynh (làm ở TASK-07). `showVersion`: hiện số phiên bản app (kiểm TC-029). */
export function UnderConstruction({
  title,
  showVersion = false,
}: {
  title: string;
  showVersion?: boolean;
}) {
  return (
    <main class="screen screen-center" data-testid="wip">
      <h1 class="title">{title}</h1>
      <Mascot mood="surprised" size={120} />
      <p class="rest-message">{vi.wip.message}</p>
      {showVersion && (
        <p class="app-version" data-testid="app-version">
          {vi.wip.version(APP_VERSION)}
        </p>
      )}
      <Button variant="primary" size="lg" onClick={() => (goBack() ? undefined : goHome())}>
        <IconBack /> {vi.common.back}
      </Button>
    </main>
  );
}
