// Khu phụ huynh (SPEC mục 9): 6 tab. Chữ thường, không cần hoạt hình.
import { useEffect } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import { backupOverdue } from '../../app/backup';
import { parentUnlocked } from '../../app/parentStore';
import { goBack, goHome, replace } from '../../app/router';
import { appState } from '../../app/store';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { IconBack } from '../components/Icons';
import { BenchmarkTab } from '../parent/BenchmarkTab';
import { DataTab } from '../parent/DataTab';
import { ProfilesTab } from '../parent/ProfilesTab';
import { ProgressTab } from '../parent/ProgressTab';
import { RewardsTab } from '../parent/RewardsTab';
import { SettingsTab } from '../parent/SettingsTab';
import { parentProfileId, selectedParentProfile } from '../parent/state';

export const PARENT_TABS = [
  'progress',
  'benchmark',
  'settings',
  'profiles',
  'rewards',
  'data',
] as const;
export type ParentTab = (typeof PARENT_TABS)[number];

/** Các tab xem/sửa dữ liệu của MỘT bé nên cần chọn hồ sơ. */
const NEEDS_PROFILE: ParentTab[] = ['progress', 'benchmark', 'settings', 'rewards'];

export function normalizeTab(tab: string): ParentTab {
  return (PARENT_TABS as readonly string[]).includes(tab) ? (tab as ParentTab) : 'progress';
}

function Content({ tab }: { tab: ParentTab }) {
  switch (tab) {
    case 'progress':
      return <ProgressTab />;
    case 'benchmark':
      return <BenchmarkTab />;
    case 'settings':
      return <SettingsTab />;
    case 'profiles':
      return <ProfilesTab />;
    case 'rewards':
      return <RewardsTab />;
    case 'data':
      return <DataTab />;
  }
}

export function ParentArea({ tab: rawTab }: { tab: string }) {
  const tab = normalizeTab(rawTab);
  // Rời khu phụ huynh → khóa lại (lần sau phải giải phép tính)
  useEffect(
    () => () => {
      parentUnlocked.value = false;
    },
    [],
  );

  const state = appState.value;
  const selected = selectedParentProfile.value;
  const overdue = state.profiles.length > 0 && backupOverdue(state.lastBackupAt, Date.now());

  return (
    <main class="screen parent" data-testid="parent-area" data-tab={tab}>
      <header class="parent-head">
        <Button
          variant="secondary"
          onClick={() => (goBack() ? undefined : goHome())}
          aria-label={vi.parent.exitLabel}
          data-testid="parent-exit"
        >
          <IconBack /> {vi.parent.exit}
        </Button>
        <h1 class="parent-title">{vi.parent.title}</h1>
      </header>

      <nav class="parent-tabs" role="tablist" aria-label={vi.parent.title}>
        {PARENT_TABS.map((t) => (
          <button
            key={t}
            type="button"
            role="tab"
            aria-selected={tab === t}
            class={`parent-tab${tab === t ? ' is-selected' : ''}`}
            data-testid={`tab-${t}`}
            onClick={() => replace(`/parent/${t}`)}
          >
            {vi.parent.tabs[t]}
          </button>
        ))}
      </nav>

      {overdue && (
        <div class="parent-banner" role="status" data-testid="backup-reminder">
          <span>{state.lastBackupAt ? vi.parent.backupOverdue : vi.parent.backupNever}</span>
          {tab !== 'data' && (
            <Button variant="secondary" onClick={() => replace('/parent/data')}>
              {vi.parent.backupNow}
            </Button>
          )}
        </div>
      )}

      {NEEDS_PROFILE.includes(tab) &&
        (state.profiles.length === 0 ? (
          <p class="parent-empty" data-testid="parent-no-profile">
            {vi.parent.noProfile}
          </p>
        ) : (
          <div class="parent-picker" role="radiogroup" aria-label={vi.parent.profilePicker}>
            {state.profiles.map((p) => (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={selected?.id === p.id}
                class={`chip${selected?.id === p.id ? ' is-selected' : ''}`}
                data-testid={`pick-${p.id}`}
                onClick={() => (parentProfileId.value = p.id)}
              >
                <Avatar id={p.avatarId} size={28} />
                {p.name}
              </button>
            ))}
          </div>
        ))}

      {(!NEEDS_PROFILE.includes(tab) || state.profiles.length > 0) && (
        <section class="parent-panel" aria-label={vi.parent.tabs[tab]}>
          <Content tab={tab} />
        </section>
      )}
    </main>
  );
}
