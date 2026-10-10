import { vi } from '../../i18n/vi';
import { goHome, navigate } from '../../app/router';
import { MAX_PROFILES } from '../../app/profile';
import { appState, selectProfile } from '../../app/store';
import { Avatar } from '../components/Avatar';

export function ProfileSelect() {
  const profiles = appState.value.profiles;
  return (
    <main class="screen screen-center">
      <h1 class="title">{vi.profiles.selectTitle}</h1>
      <ul class="profile-grid">
        {profiles.map((p) => (
          <li key={p.id}>
            <button
              type="button"
              class="profile-tile"
              data-testid={`profile-${p.name}`}
              onClick={() => {
                selectProfile(p.id);
                goHome();
              }}
            >
              <Avatar id={p.avatarId} size={96} />
              <span class="profile-name">{p.name}</span>
            </button>
          </li>
        ))}
        {profiles.length < MAX_PROFILES && (
          <li>
            <button
              type="button"
              class="profile-tile profile-add"
              onClick={() => navigate('/profiles/new')}
            >
              <span class="profile-plus" aria-hidden="true">
                +
              </span>
              <span class="profile-name">{vi.profiles.addNew}</span>
            </button>
          </li>
        )}
      </ul>
    </main>
  );
}
