import { vi } from '../../i18n/vi';
import { navigate } from '../../app/router';
import { dateKey } from '../../app/profile';
import type { PlayableId } from '../../app/routes';
import { dayAllowanceMs, dayRemainingMs } from '../../app/session';
import { activeProfile, updateAvailable } from '../../app/store';
import { GAME_GROUPS, isGameAvailable } from '../../games/registry';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { GameIcon } from '../components/GameIcon';
import { IconAlbum, IconLock, IconSwitch } from '../components/Icons';
import { Mascot } from '../components/Mascot';
import { ProgressBar } from '../components/ProgressBar';

const MISSIONS = [
  { key: 'reflex', icon: 'G1' },
  { key: 'focus', icon: 'G2' },
  { key: 'learn', icon: 'G6' },
] as const;

function GameCard({ id, locked }: { id: PlayableId; locked: boolean }) {
  const p = activeProfile.value;
  const available = isGameAvailable(id);
  const progress = id === 'G0' ? null : p?.games[id];
  const disabled = !available || locked;
  return (
    <button
      type="button"
      class={`game-card${disabled ? ' is-disabled' : ''}`}
      disabled={disabled}
      data-testid={`game-${id}`}
      onClick={() => navigate(`/play/${id}/intro`)}
    >
      <GameIcon id={id} size={72} />
      <span class="game-name">{vi.games[id].name}</span>
      <span class="game-meta">
        {!available && vi.common.comingSoon}
        {available && locked && (
          <>
            <IconLock /> {vi.common.locked}
          </>
        )}
        {available &&
          !locked &&
          progress &&
          `${vi.common.level(progress.level)} · ${'★'.repeat(progress.bestStars)}${'☆'.repeat(3 - progress.bestStars)}`}
        {available && !locked && !progress && vi.games.G0.hint}
      </span>
    </button>
  );
}

export function Home() {
  const p = activeProfile.value;
  if (!p) return null;
  const key = dateKey(new Date());
  const remaining = dayRemainingMs(p, key);
  const allowance = dayAllowanceMs(p, key);
  const out = remaining <= 0;

  return (
    <main class="screen home">
      <header class="home-top">
        <div class="home-player">
          <Avatar id={p.avatarId} size={48} />
          <span class="home-stars" data-testid="total-stars">
            ★ {vi.home.totalStars(p.totalStars)}
          </span>
        </div>
        <nav class="home-actions">
          <Button variant="icon" aria-label={vi.home.album} onClick={() => navigate('/album')}>
            <IconAlbum />
          </Button>
          <Button
            variant="icon"
            aria-label={vi.home.switchPlayer}
            onClick={() => navigate('/profiles')}
          >
            <IconSwitch />
          </Button>
          <Button
            variant="icon"
            aria-label={vi.home.parent}
            onClick={() => navigate('/parent-gate')}
          >
            <IconLock />
          </Button>
        </nav>
      </header>

      {updateAvailable.value && <div class="banner banner-info">{vi.home.updateAvailable}</div>}

      <section class="home-hello">
        <Mascot mood="wave" size={132} />
        <h1 class="title" data-testid="greeting">
          {vi.home.greeting(p.name)}
        </h1>
      </section>

      <section class="home-time" aria-label={vi.home.timeLeftLabel}>
        <ProgressBar
          value={allowance > 0 ? remaining / allowance : 0}
          label={vi.home.timeLeftLabel}
          tone={out ? 'orange' : 'sky'}
        />
        <p class="home-time-text" data-testid="time-left">
          {out ? vi.home.outOfTime : vi.home.timeLeft(Math.ceil(remaining / 60_000))}
        </p>
        {out && (
          <Button variant="primary" onClick={() => navigate('/rest')}>
            {vi.home.goRest}
          </Button>
        )}
      </section>

      <section aria-labelledby="missions-title">
        <h2 id="missions-title" class="section-title">
          {vi.home.missionsTitle}
        </h2>
        <ul class="mission-row">
          {MISSIONS.map((m) => (
            <li key={m.key} class="mission" data-testid={`mission-${m.key}`}>
              <GameIcon id={m.icon} size={40} />
              <span>{vi.home.missions[m.key]}</span>
              <span class="mission-check" aria-hidden="true" />
            </li>
          ))}
        </ul>
      </section>

      {GAME_GROUPS.map(({ group, games }) => (
        <section key={group} class={`group group-${group}`}>
          <h2 class="section-title">{vi.home.groups[group]}</h2>
          <div class="card-grid">
            {games.map((id) => (
              <GameCard key={id} id={id} locked={out} />
            ))}
          </div>
        </section>
      ))}

      <section class="group group-test">
        <h2 class="section-title">{vi.home.groups.test}</h2>
        <div class="card-grid">
          <GameCard id="G0" locked={out} />
        </div>
      </section>
    </main>
  );
}
