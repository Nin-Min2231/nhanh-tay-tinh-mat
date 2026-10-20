import { useEffect, useRef, useState } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import { KID_CHOICES, dropWarning, trackLevel, type KidChoice } from '../../app/adaptive';
import { goBack, navigate } from '../../app/router';
import { benchmarkMode } from '../../app/parentStore';
import { activeProfile, appState, pendingPlay } from '../../app/store';
import type { GameId } from '../../app/types';
import { Button } from '../components/Button';
import { DebugPanel } from '../components/DebugPanel';
import { GameIcon } from '../components/GameIcon';
import { IconBack } from '../components/Icons';
import { IntroAnimation } from '../components/IntroAnimation';
import { starMeter } from '../components/starMeter';

export function GameIntro({ gameId }: { gameId: GameId }) {
  const p = activeProfile.value;
  const g = p?.games[gameId];
  // Mở sẵn chế độ bé chơi gần nhất của game này
  const [choice, setChoice] = useState<KidChoice>(g?.lastChoice ?? 'auto');
  const [animKey, setAnimKey] = useState(0);
  const startRef = useRef<HTMLDivElement>(null);
  const bench = benchmarkMode.value;
  const canChoose = appState.value.settings.allowKidDifficultyChoice && !bench;
  const picked: KidChoice = canChoose ? choice : 'auto';
  // Phụ huynh đặt Cố định thì không có sổ cấp riêng: chỉ hiện tên chế độ như trước
  const showLevels = g?.mode === 'auto' && !bench;
  // Lượt cuối trước khi xuống cấp: nhắc bé nhẹ nhàng (không chê, không âm thanh)
  const warn = !!g && showLevels && dropWarning(g, picked);
  // Màn thấp (điện thoại): lời nhắc nằm dưới các nút chế độ nên cuộn sao cho cả lời nhắc lẫn nút Bắt đầu đều hiện ra
  useEffect(() => {
    if (warn) startRef.current?.scrollIntoView({ block: 'end' });
  }, [warn]);
  if (!p || !g) return null;

  const start = () => {
    pendingPlay.value = bench
      ? { gameId, choice: 'normal', benchmark: true }
      : { gameId, choice: picked };
    navigate(`/play/${gameId}`);
  };

  return (
    <main class="screen screen-center intro">
      <div class="intro-bar">
        <Button variant="ghost" onClick={() => goBack()} aria-label={vi.common.back}>
          <IconBack /> {vi.common.back}
        </Button>
      </div>
      <GameIcon id={gameId} size={72} />
      <h1 class="title">{vi.games[gameId]?.name}</h1>
      {bench && (
        <p class="intro-bench" data-testid="intro-bench">
          {vi.intro.benchmark} – {vi.intro.benchmarkNote}
        </p>
      )}
      <IntroAnimation key={animKey} id={gameId} />
      <p class="intro-hint" data-testid="intro-hint">
        {vi.games[gameId]?.hint}
      </p>
      <Button variant="ghost" onClick={() => setAnimKey(animKey + 1)}>
        {vi.intro.replay}
      </Button>

      {canChoose && (
        <fieldset class="field">
          <legend class="field-label">{vi.intro.chooseLevel}</legend>
          <div class="segmented segmented-wrap" role="radiogroup" aria-label={vi.intro.chooseLevel}>
            {KID_CHOICES.map((c) => {
              const stars = g.tracks[c].stars;
              const level = trackLevel(g, c);
              return (
                <button
                  key={c}
                  type="button"
                  role="radio"
                  aria-checked={choice === c}
                  aria-label={
                    showLevels ? vi.intro.modeLevel(vi.intro[c], level, stars) : undefined
                  }
                  data-testid={`choice-${c}`}
                  class={`segment seg-${c}${choice === c ? ' is-selected' : ''}`}
                  onClick={() => setChoice(c)}
                >
                  <span class="seg-name">
                    {c === 'auto' && <span aria-hidden="true">★ </span>}
                    {vi.intro[c]}
                  </span>
                  {showLevels && (
                    <span class="seg-level" data-testid={`choice-level-${c}`} aria-hidden="true">
                      {vi.common.level(level)} · {starMeter(stars)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {warn && (
        <p class="intro-warn" role="status" data-testid="drop-warning">
          {vi.intro.dropWarning}
        </p>
      )}

      {!bench && <DebugPanel gameId={gameId} />}

      <div ref={startRef}>
        <Button variant="primary" size="lg" onClick={start} data-testid="start-game">
          {vi.common.start}
        </Button>
      </div>
    </main>
  );
}
