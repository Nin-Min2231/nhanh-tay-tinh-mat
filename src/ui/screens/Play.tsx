// Màn Chơi: điều phối vòng đời một lượt (SPEC mục 3) – đếm ngược, đồng hồ, tạm dừng, hết giờ, lưu kết quả.
import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import { levelForRound } from '../../app/adaptive';
import { benchmarkLevel } from '../../app/benchmark';
import { setBackInterceptor } from '../../app/backButton';
import { E2E, TIME_SCALE } from '../../app/e2e';
import { freshSeed, mulberry32 } from '../../app/rng';
import { goHome, setStack } from '../../app/router';
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
  restPending,
} from '../../app/store';
import type { GameId, RoundMode } from '../../app/types';
import { pageZoomed } from '../../app/zoom';
import { Countdown } from '../../games/common/Countdown';
import { PauseOverlay } from '../../games/common/PauseOverlay';
import type { GameInstance, RoundResult } from '../../games/common/types';
import { getGameModule } from '../../games/registry';
import { levelsConfig } from '../../games/levels';
import { Button } from '../components/Button';
import { IconPause } from '../components/Icons';

const TICK_MS = 250;
const WARN_BANNER_MS = 5000;

export function PlayScreen({ gameId }: { gameId: GameId }) {
  const hostRef = useRef<HTMLDivElement>(null);
  const clockRef = useRef<RoundClock | null>(null);
  const instanceRef = useRef<GameInstance | null>(null);
  const settledRef = useRef(false);
  const startedRef = useRef(false);
  const settleRef = useRef<(r: RoundResult | null) => void>(() => undefined);

  const [phase, setPhase] = useState<RoundPhase>('countdown');
  const [banner, setBanner] = useState<string | null>(null);
  const [remainingSec, setRemainingSec] = useState(0);
  // Trang đang bị phóng to (2 ngón ở màn khác) – màn chơi chặn phóng nên phải thu nhỏ lại trước khi chơi
  const [zoomed, setZoomed] = useState(false);

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

    const progress = profile.games[gameId];
    // Bài đo tuần (F16): cấp cố định theo levels.json, tùy chọn mặc định, toán theo chủ đề mặc định của lớp.
    const benchmark = pending.benchmark === true;
    const level = benchmark ? benchmarkLevel(gameId) : levelForRound(progress, pending.choice);
    // Cố định > lựa chọn của bé. Game ở chế độ Tự động của phụ huynh: mọi lựa chọn của bé (Dễ / Vừa / Tự động / Khó)
    // đều tính vào sổ cấp RIÊNG của lựa chọn đó; bài đo tuần và chế độ Cố định thì không tính.
    const mode: RoundMode = benchmark || progress.mode === 'fixed' ? 'fixed' : pending.choice;
    const countsForAdaptive = progress.mode === 'auto' && !benchmark;
    const gameOptions = benchmark ? {} : progress.options;

    const settle = (result: RoundResult | null): void => {
      if (settledRef.current) return;
      settledRef.current = true;
      if (result) {
        clock.finish();
        const { stars, change, newLevel, rewards, benchmarkNext, benchmarkLeft } = recordRound({
          profileId: profile.id,
          gameId,
          level,
          mode,
          choice: pending.choice,
          startedAt,
          result,
          playedMs: clock.playedMs,
          countsForAdaptive,
          benchmark,
          options: gameOptions,
        });
        lastResult.value = {
          gameId,
          score: result.score,
          stars,
          metrics: result.metrics,
          levelChange: change,
          choice: pending.choice,
          newLevel,
          outOfTime: clock.remainingMs <= 0,
          rewards,
          benchmark,
          benchmarkNext,
          benchmarkLeft,
        };
        // Vừa hết giờ: màn Nghỉ kế tiếp được tính “nghỉ đúng giờ” (F20)
        restPending.value = clock.remainingMs <= 0;
        setStack(['/home', '/result']);
      } else {
        clock.abort(); // thoát: không lưu lượt, nhưng thời gian đã chơi vẫn tính vào giới hạn ngày
        addPlayTime(profile.id, clock.playedMs, key);
      }
    };
    settleRef.current = settle;

    const instance = mod.create(host, {
      level,
      options: gameOptions,
      profile: {
        grade: profile.grade,
        mathTopics: benchmark
          ? [...levelsConfig.mathDefaultByGrade[`${profile.grade}`]]
          : profile.math.topics,
        mathFacts: benchmark ? {} : profile.math.facts,
      },
      rng: mulberry32(E2E.enabled ? E2E.seed : freshSeed()),
      audio,
      haptics,
      benchmark,
      timeScale: TIME_SCALE,
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
    // Đang bị phóng to (vào game khi trang đã phóng, hoặc phóng lúc đang tạm dừng) → tạm dừng, cho thu nhỏ lại
    const vv = window.visualViewport;
    const onZoom = () => {
      const z = pageZoomed();
      setZoomed(z);
      if (z) doPause();
    };
    vv?.addEventListener('resize', onZoom);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('pagehide', doPause);
    window.addEventListener('resize', onResize);
    onZoom();

    // Nút/cử chỉ Quay lại: đang chơi → tạm dừng (NF10)
    setBackInterceptor(() => {
      doPause();
      return true;
    });

    return () => {
      window.clearInterval(timer);
      window.clearTimeout(bannerTimer);
      vv?.removeEventListener('resize', onZoom);
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
    if (pageZoomed()) return; // chưa thu nhỏ lại thì chưa chơi tiếp
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
    <main class="play" data-phase={phase} data-zoomed={zoomed ? '1' : undefined}>
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
      {phase === 'paused' && <PauseOverlay onResume={onResume} onExit={onExit} zoomed={zoomed} />}
    </main>
  );
}
