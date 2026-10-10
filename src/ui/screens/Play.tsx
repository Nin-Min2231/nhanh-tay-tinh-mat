// Màn Chơi: điều phối vòng đời một lượt (SPEC mục 3) – đếm ngược, đồng hồ, tạm dừng, hết giờ, lưu kết quả.
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import { levelForRound } from '../../app/adaptive';
import { setBackInterceptor } from '../../app/backButton';
import { freshSeed, mulberry32 } from '../../app/rng';
import { goHome, setStack } from '../../app/router';
import type { PlayableId } from '../../app/routes';
import { dateKey } from '../../app/profile';
import { RoundClock, dayRemainingMs, type RoundPhase } from '../../app/session';
import {
  activeProfile,
  addPlayTime,
  audio,
  haptics,
  lastResult,
  pendingPlay,
  recordRound,
} from '../../app/store';
import type { RoundMode } from '../../app/types';
import { Countdown } from '../../games/common/Countdown';
import { PauseOverlay } from '../../games/common/PauseOverlay';
import type { GameInstance, RoundResult } from '../../games/common/types';
import { getGameModule } from '../../games/registry';
import { Button } from '../components/Button';
import { IconPause } from '../components/Icons';

const TICK_MS = 250;
const WARN_BANNER_MS = 5000;

export function PlayScreen({ gameId }: { gameId: PlayableId }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<RoundClock | null>(null);
  const instanceRef = useRef<GameInstance | null>(null);
  const settledRef = useRef(false);
  const startedRef = useRef(false);
  const settleRef = useRef<(r: RoundResult | null) => void>(() => undefined);

  const [phase, setPhase] = useState<RoundPhase>('countdown');
  const [banner, setBanner] = useState<string | null>(null);
  const [remainingSec, setRemainingSec] = useState(0);

  const doPause = useCallback(() => {
    const clock = clockRef.current;
    if (!clock || (clock.phase !== 'running' && clock.phase !== 'countdown')) return;
    clock.pause();
    instanceRef.current?.pause();
    setPhase('paused');
  }, []);

  useEffect(() => {
    const profile = activeProfile.value;
    const pending = pendingPlay.value;
    const host = hostRef.current;
    const mod = getGameModule(gameId);
    if (!profile || !pending || !host || !mod) return;

    const startedAt = new Date();
    const key = dateKey(startedAt);
    const clock = new RoundClock({ remainingMs: dayRemainingMs(profile, key) });
    clockRef.current = clock;
    setRemainingSec(Math.ceil(clock.remainingMs / 1000));

    const progress = gameId === 'G0' ? null : profile.games[gameId];
    const level = progress ? levelForRound(progress, pending.choice) : 1;
    const mode: RoundMode =
      pending.choice === 'auto' ? (progress?.mode ?? 'normal') : pending.choice;

    const settle = (result: RoundResult | null): void => {
      if (settledRef.current) return;
      settledRef.current = true;
      if (result) {
        clock.finish();
        const { stars } = recordRound({
          profileId: profile.id,
          gameId,
          level,
          mode,
          startedAt,
          result,
          playedMs: clock.playedMs,
        });
        lastResult.value = {
          gameId,
          score: result.score,
          stars,
          metrics: result.metrics,
          outOfTime: clock.remainingMs <= 0,
        };
        setStack(['/home', '/result']);
      } else {
        clock.abort(); // thoát: không lưu lượt, nhưng thời gian đã chơi vẫn tính vào giới hạn ngày
        addPlayTime(profile.id, clock.playedMs, key);
      }
    };
    settleRef.current = settle;

    const instance = mod.create(host, {
      level,
      options: progress?.options ?? {},
      profile: {
        grade: profile.grade,
        mathTopics: profile.math.topics,
        mathFacts: profile.math.facts,
      },
      rng: mulberry32(freshSeed()),
      audio,
      haptics,
      benchmark: false,
      onFinish: (r) => settle(r),
    });
    instanceRef.current = instance;
    clock.startCountdown();

    let bannerTimer = 0;
    const timer = window.setInterval(() => {
      for (const ev of clock.tick()) {
        if (ev === 'warn') {
          setBanner(vi.play.warn2min);
          window.clearTimeout(bannerTimer);
          bannerTimer = window.setTimeout(() => setBanner(null), WARN_BANNER_MS);
        } else if (ev === 'timeUp') {
          window.clearTimeout(bannerTimer);
          setBanner(vi.play.timeUp);
        } else if (ev === 'graceExpired') {
          if (instance.finish) instance.finish();
          else settle({ score: 0, durationMs: clock.playedMs, metrics: {} });
        }
      }
      setRemainingSec(Math.max(0, Math.ceil(clock.remainingMs / 1000)));
    }, TICK_MS);

    // Tạm dừng khi thoát app / đổi hướng / đổi kích thước (gồm chia đôi màn hình) – quy tắc 10
    let lastW = window.innerWidth;
    let lastH = window.innerHeight;
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') doPause();
    };
    const onResize = () => {
      if (window.innerWidth === lastW && window.innerHeight === lastH) return;
      lastW = window.innerWidth;
      lastH = window.innerHeight;
      doPause();
    };
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', doPause);
    window.addEventListener('resize', onResize);

    // Nút/cử chỉ Quay lại: đang chơi → tạm dừng (NF10)
    setBackInterceptor(() => {
      doPause();
      return true;
    });

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(bannerTimer);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pagehide', doPause);
      window.removeEventListener('resize', onResize);
      setBackInterceptor(null);
      settle(null); // rời màn khi chưa kết thúc → hủy lượt
      instance.destroy();
      instanceRef.current = null;
      clockRef.current = null;
    };
  }, [gameId, doPause]);

  const onCountdownDone = useCallback(() => {
    const clock = clockRef.current;
    const instance = instanceRef.current;
    if (!clock || !instance || clock.phase !== 'countdown') return;
    clock.startRunning();
    if (startedRef.current) instance.resume();
    else {
      startedRef.current = true;
      instance.start();
    }
    setPhase('running');
  }, []);

  const onResume = () => {
    clockRef.current?.startCountdown();
    setPhase('countdown');
  };

  const onExit = () => {
    settleRef.current(null);
    goHome();
  };

  const mm = Math.floor(remainingSec / 60);
  const ss = String(remainingSec % 60).padStart(2, '0');

  return (
    <main class="play" data-phase={phase}>
      <header class="play-bar">
        <h1 class="play-title">{vi.games[gameId].name}</h1>
        <span class="play-time" data-testid="play-time" aria-label={vi.home.timeLeftLabel}>
          {mm}:{ss}
        </span>
        <Button
          variant="icon"
          aria-label={vi.play.pause}
          onClick={doPause}
          disabled={phase === 'paused'}
          data-testid="pause-button"
        >
          <IconPause />
        </Button>
      </header>
      {banner && (
        <div class="banner banner-info play-banner" role="status" data-testid="play-banner">
          {banner}
        </div>
      )}
      <div class="game-host" ref={hostRef} data-testid="game-host" />
      {phase === 'countdown' && <Countdown onDone={onCountdownDone} />}
      {phase === 'paused' && <PauseOverlay onResume={onResume} onExit={onExit} />}
    </main>
  );
}
