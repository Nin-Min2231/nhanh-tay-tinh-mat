import { useEffect } from 'preact/hooks';
import { replace, route } from '../app/router';
import { dateKey } from '../app/profile';
import { isOutOfTime } from '../app/session';
import { parentUnlocked } from '../app/parentStore';
import { activeProfile, appState, lastResult, pendingPlay } from '../app/store';
import { isGameAvailable } from '../games/registry';
import { GiftModal } from './components/GiftBox';
import { StorageBanner, TooSmallOverlay, Toast } from './components/Overlays';
import { Album } from './screens/Album';
import { GameIntro } from './screens/GameIntro';
import { Home } from './screens/Home';
import { PlayScreen } from './screens/Play';
import { ProfileForm } from './screens/ProfileForm';
import { ProfileSelect } from './screens/ProfileSelect';
import { Rest } from './screens/Rest';
import { Result } from './screens/Result';
import { ParentArea } from './screens/ParentArea';
import { ParentGate } from './screens/ParentGate';

/** Nếu màn hình hiện tại không hợp lệ (chưa có hồ sơ, tải lại giữa lượt...) → đường dẫn cần chuyển tới. */
function redirectFor(): string | null {
  const r = route.value;
  const profile = activeProfile.value;
  const hasProfiles = appState.value.profiles.length > 0;
  if (r.name === 'profiles' || r.name === 'profile-new') {
    if (r.name === 'profiles' && !hasProfiles) return '/profiles/new';
    return null;
  }
  // Khu phụ huynh dùng được cả khi chưa có hồ sơ (để khôi phục từ file sao lưu); vào khu phải qua khóa.
  if (r.name === 'parent-gate') return null;
  if (r.name === 'parent') return parentUnlocked.value ? null : '/parent-gate';
  if (!profile) return hasProfiles ? '/profiles' : '/profiles/new';
  if (r.name === 'not-found') return '/home';
  if (r.name === 'play' && (!pendingPlay.value || pendingPlay.value.gameId !== r.gameId))
    return '/home';
  if (r.name === 'result' && !lastResult.value) return '/home';
  if ((r.name === 'intro' || r.name === 'play') && !isGameAvailable(r.gameId)) return '/home';
  if ((r.name === 'intro' || r.name === 'play') && isOutOfTime(profile, dateKey(new Date()))) {
    // Đang chơi dở thì đã được xử lý trong PlayScreen; vào mới khi hết giờ → màn nghỉ
    if (r.name === 'intro') return '/rest';
  }
  return null;
}

function Screen() {
  const r = route.value;
  switch (r.name) {
    case 'profiles':
      return <ProfileSelect />;
    case 'profile-new':
      return <ProfileForm />;
    case 'home':
      return <Home />;
    case 'intro':
      return <GameIntro gameId={r.gameId} />;
    case 'play':
      return <PlayScreen key={r.gameId} gameId={r.gameId} />;
    case 'result':
      return <Result />;
    case 'rest':
      return <Rest />;
    case 'album':
      return <Album />;
    case 'parent-gate':
      return <ParentGate />;
    case 'parent':
      return <ParentArea tab={r.tab} />;
    case 'not-found':
      return null;
  }
}

export function App() {
  const redirect = redirectFor();
  useEffect(() => {
    if (redirect) replace(redirect);
  }, [redirect]);

  return (
    <div class="app">
      <StorageBanner />
      {redirect ? null : <Screen />}
      <GiftModal />
      <Toast />
      <TooSmallOverlay />
    </div>
  );
}
