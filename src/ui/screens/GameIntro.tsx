import { useState } from 'preact/hooks';
import { vi } from '../../i18n/vi';
import type { KidChoice } from '../../app/adaptive';
import { goBack, navigate } from '../../app/router';
import type { PlayableId } from '../../app/routes';
import { activeProfile, appState, pendingPlay } from '../../app/store';
import { Button } from '../components/Button';
import { GameIcon } from '../components/GameIcon';
import { IconBack } from '../components/Icons';

const CHOICES: KidChoice[] = ['easy', 'normal', 'auto', 'hard'];

/** Hình động hướng dẫn ≤ 5 giây (CSS). G1–G7 sẽ có hình riêng khi làm từng game. */
function IntroAnimation({ id }: { id: PlayableId }) {
  return (
    <div class="intro-anim" aria-hidden="true" data-game={id}>
      <div class="intro-target" />
      <div class="intro-finger" />
    </div>
  );
}

export function GameIntro({ gameId }: { gameId: PlayableId }) {
  const p = activeProfile.value;
  const [choice, setChoice] = useState<KidChoice>('auto');
  const [animKey, setAnimKey] = useState(0);
  if (!p) return null;
  const canChoose = appState.value.settings.allowKidDifficultyChoice;

  const start = () => {
    pendingPlay.value = { gameId, choice: canChoose ? choice : 'auto' };
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
      <h1 class="title">{vi.games[gameId].name}</h1>
      <IntroAnimation key={animKey} id={gameId} />
      <p class="intro-hint" data-testid="intro-hint">
        {vi.games[gameId].hint}
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
                class={`segment${choice === c ? ' is-selected' : ''}`}
                onClick={() => setChoice(c)}
              >
                {c === 'auto' && <span aria-hidden="true">★ </span>}
                {vi.intro[c]}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <Button variant="primary" size="lg" onClick={start} data-testid="start-game">
        {vi.common.start}
      </Button>
    </main>
  );
}
