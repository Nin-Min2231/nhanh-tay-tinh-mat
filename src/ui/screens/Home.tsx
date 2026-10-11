import { vi } from '../../i18n/vi';
import { useEffect, useMemo } from 'preact/hooks';
import { navigate } from '../../app/router';
import { BENCHMARK_ORDER, benchmarkDue, doneRecently } from '../../app/benchmark';
import { benchmarkMode, startBenchmark } from '../../app/parentStore';
import { getDay, dateKey } from '../../app/profile';
import { applyUpdate } from '../../app/pwa';
import { MISSION_GROUPS, boxRoomToday, starsToNextBox, BOX_EVERY_STARS } from '../../app/rewards';
import { dayAllowanceMs, dayRemainingMs } from '../../app/session';
import { storage } from '../../app/storage';
import { activeProfile, updateAvailable } from '../../app/store';
import type { GameId } from '../../app/types';
import { GAME_GROUPS, isGameAvailable } from '../../games/registry';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { DebugRewards } from '../components/DebugRewards';
import { GameIcon } from '../components/GameIcon';
import { GiftButton } from '../components/GiftButton';
import { IconAlbum, IconCheck, IconLock, IconSwitch } from '../components/Icons';
import { Mascot } from '../components/Mascot';
import { ProgressBar } from '../components/ProgressBar';
import { BadgeGold } from '../components/RewardIcons';
import { Scene } from '../components/Scenes';

const MISSION_ICON: Record<(typeof MISSION_GROUPS)[number], GameId> = {
  reflex: 'G1',
  focus: 'G2',
  learn: 'G6',
};

function GameCard({ id, locked }: { id: GameId; locked: boolean }) {
  const p = activeProfile.value;
  const available = isGameAvailable(id);
  const progress = p?.games[id];
  const disabled = !available || locked;
  return (
    <button
      type="button"
      class={`game-card g-${id}${disabled ? ' is-disabled' : ''}`}
      disabled={disabled}
      data-testid={`game-${id}`}
      onClick={() => navigate(`/play/${id}/intro`)}
    >
      <span class="game-icon-wrap">
        <GameIcon id={id} size={64} />
      </span>
      <span class="game-name">{vi.games[id]?.name}</span>
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
      </span>
    </button>
  );
}

export function Home() {
  const p = activeProfile.value;
  const key = dateKey(new Date());
  // Về Home = thoát luồng bài đo tuần (nếu có)
  useEffect(() => {
    benchmarkMode.value = false;
  }, []);
  const benchDone = useMemo(
    () => (p ? doneRecently(storage.loadRounds(p.id), key).size : 0),
    [p?.id, p?.games, key],
  );
  if (!p) return null;
  const remaining = dayRemainingMs(p, key);
  const allowance = dayAllowanceMs(p, key);
  const out = remaining <= 0;
  const day = getDay(p, key);
  const boxesFull = boxRoomToday(p, key) === 0;
  const toNext = starsToNextBox(p);

  return (
    <main class="screen home">
      <header class="home-top">
        <div class="home-player">
          <Avatar id={p.avatarId} size={48} frame={p.unlocked.includes('frame-rainbow')} />
          <span class="home-stars" data-testid="total-stars">
            ★ {vi.home.totalStars(p.totalStars)}
          </span>
          {p.unlocked.includes('badge-gold') && (
            <span class="home-badge" data-testid="home-badge">
              <BadgeGold size={40} />
            </span>
          )}
        </div>
        <nav class="home-actions">
          <Button
            variant="icon"
            class="tone-purple"
            aria-label={vi.home.album}
            onClick={() => navigate('/album')}
            data-testid="open-album"
          >
            <IconAlbum />
          </Button>
          <Button
            variant="icon"
            class="tone-sky"
            aria-label={vi.home.switchPlayer}
            onClick={() => navigate('/profiles')}
          >
            <IconSwitch />
          </Button>
          <Button
            variant="icon"
            class="tone-orange"
            aria-label={vi.home.parent}
            onClick={() => navigate('/parent-gate')}
          >
            <IconLock />
          </Button>
        </nav>
      </header>

      {updateAvailable.value && (
        <div class="banner banner-info update-banner">
          <Button variant="primary" onClick={applyUpdate} data-testid="update-button">
            {vi.home.updateAvailable}
          </Button>
        </div>
      )}

      {!out && benchmarkDue(p.lastBenchmarkAt, key) && (
        <section
          class="benchmark-banner"
          data-testid="benchmark-banner"
          aria-label={vi.home.benchmarkTitle}
        >
          <div>
            <h2 class="benchmark-title">{vi.home.benchmarkTitle}</h2>
            <p>{vi.home.benchmarkText}</p>
            {benchDone > 0 && (
              <p class="benchmark-progress" data-testid="benchmark-progress">
                {vi.home.benchmarkProgress(benchDone, BENCHMARK_ORDER.length)}
              </p>
            )}
          </div>
          <Button variant="primary" onClick={() => startBenchmark()} data-testid="benchmark-start">
            {benchDone > 0 ? vi.home.benchmarkContinue : vi.home.benchmarkStart}
          </Button>
        </section>
      )}

      <section
        class={`home-hello${p.backgroundId ? ' has-scene' : ''}`}
        data-bg={p.backgroundId ?? ''}
      >
        {p.backgroundId && (
          <div class="hello-scene" data-testid="home-scene">
            <Scene id={p.backgroundId} />
          </div>
        )}
        <Mascot mood="wave" size={132} outfit={p.outfitId} />
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
          {MISSION_GROUPS.map((m) => {
            const done = day.missions[m];
            return (
              <li
                key={m}
                class={`mission mission-${m}${done ? ' is-done' : ''}`}
                data-testid={`mission-${m}`}
                data-done={done ? '1' : '0'}
              >
                <GameIcon id={MISSION_ICON[m]} size={40} />
                <span>{vi.home.missions[m]}</span>
                <span
                  class="mission-check"
                  role="img"
                  aria-label={done ? vi.home.missionDone : vi.home.missionTodo}
                >
                  {done && <IconCheck />}
                </span>
              </li>
            );
          })}
        </ul>
        <div class="gift-row" data-testid="gift-row">
          <GiftButton />
          <div class="gift-info">
            <ProgressBar
              value={(BOX_EVERY_STARS - toNext) / BOX_EVERY_STARS}
              label={vi.home.nextBoxIn(toNext)}
              tone="green"
            />
            <p class="gift-info-text" data-testid="gift-info">
              {boxesFull ? vi.home.boxLimit : vi.home.nextBoxIn(toNext)}
            </p>
          </div>
        </div>
      </section>

      {GAME_GROUPS.map(({ group, games }) => (
        <section key={group} class={`group group-${group}`}>
          <h2 class="group-title">{vi.home.groups[group]}</h2>
          <div class="card-grid">
            {games.map((id) => (
              <GameCard key={id} id={id} locked={out} />
            ))}
          </div>
        </section>
      ))}

      <DebugRewards />
    </main>
  );
}
