import { useState } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import type { KidChoice } from '../../app/adaptive';
import { goBack, navigate } from '../../app/router';
import { benchmarkMode } from '../../app/parentStore';
import { activeProfile, appState, pendingPlay } from '../../app/store';
import type { GameId } from '../../app/types';
import { Button } from '../components/Button';
import { DebugPanel } from '../components/DebugPanel';
import { GameIcon } from '../components/GameIcon';
import { IconBack } from '../components/Icons';
import { IntroAnimation } from '../components/IntroAnimation';

const CHOICES: KidChoice[] = ['easy', 'normal', 'auto', 'hard'];

export function GameIntro({ gameId }: { gameId: GameId }) {
  const p = activeProfile.value;
  const [choice, setChoice] = useState<KidChoice>('auto');
  const [animKey, setAnimKey] = useState(0);
  if (!p) return null;
  const bench = benchmarkMode.value;
  const canChoose = appState.value.settings.allowKidDifficultyChoice && !bench;

  const start = () => {
    pendingPlay.value = bench
      ? { gameId, choice: 'normal', benchmark: true }
      : { gameId, choice: canChoose ? choice : 'auto' };
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
            {CHOICES.map((c) => (
              <button
                key={c}
                type="button"
                role="radio"
                aria-checked={choice === c}
                class={`segment seg-${c}${choice === c ? ' is-selected' : ''}`}
                onClick={() => setChoice(c)}
              >
                {c === 'auto' && <span aria-hidden="true">★ </span>}
                {vi.intro[c]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      {!bench && <DebugPanel gameId={gameId} />}

      <Button variant="primary" size="lg" onClick={start} data-testid="start-game">
        {vi.common.start}
      </Button>
    </main>
  );
}
