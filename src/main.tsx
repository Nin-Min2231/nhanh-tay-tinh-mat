import { render } from 'preact';
import './ui/theme.css';
import './ui/app.css';
import './ui/games.css';
import './ui/games2.css';
import { installBackButton } from './app/backButton';
import { initRouter, replace, route } from './app/router';
import { appState, audio, selectProfile, showToast } from './app/store';
import './app/viewport';
import { vi } from './i18n/vi';
import { App } from './ui/App';

initRouter();

// Chọn màn hình đầu tiên: chưa có hồ sơ → tạo; 1 hồ sơ → vào Home; nhiều hồ sơ → chọn người chơi.
(function boot() {
  const { profiles } = appState.value;
  const r = route.value;
  if (profiles.length === 0) return replace('/profiles/new');
  if (profiles.length === 1) {
    const only = profiles[0];
    if (only) selectProfile(only.id);
    if (r.name === 'profiles' || r.name === 'profile-new') replace('/home');
    return;
  }
  replace('/profiles');
})();

installBackButton({ onExitHint: () => showToast(vi.toast.exitHint) });

// Mở khóa AudioContext ở lần chạm đầu tiên
document.addEventListener('pointerdown', () => audio.unlock(), { capture: true });

render(<App />, document.getElementById('app')!);
