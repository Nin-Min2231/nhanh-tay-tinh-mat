// Hình động hướng dẫn ≤ 5 giây (CSS thuần), mỗi game một kiểu. Game chưa làm dùng khung chung.
import type { GameId } from '../../app/types';

const GRID_ORDER = [4, 1, 7, 9, 2, 5, 8, 3, 6];

export function IntroAnimation({ id }: { id: GameId }) {
  if (id === 'G1') {
    return (
      <div class="intro-anim" aria-hidden="true" data-game={id}>
        <svg class="ia-ball ia-green" viewBox="0 0 64 64">
          <circle cx="32" cy="32" r="28" fill="#3DDC6E" stroke="#1B8F3E" stroke-width="5" />
          <circle cx="23" cy="26" r="3.5" fill="#263238" />
          <circle cx="41" cy="26" r="3.5" fill="#263238" />
          <path
            d="M20 36 Q32 50 44 36"
            fill="none"
            stroke="#263238"
            stroke-width="4"
            stroke-linecap="round"
          />
        </svg>
        <svg class="ia-ball ia-red" viewBox="0 0 64 64">
          <rect
            x="6"
            y="6"
            width="52"
            height="52"
            rx="14"
            fill="#FF4D5E"
            stroke="#B3202F"
            stroke-width="5"
          />
          <path
            d="M21 21 L43 43 M43 21 L21 43"
            stroke="#fff"
            stroke-width="7"
            stroke-linecap="round"
          />
        </svg>
        <div class="ia-finger" />
      </div>
    );
  }
  if (id === 'G2') {
    return (
      <div class="intro-anim" aria-hidden="true" data-game={id}>
        <div class="ia-grid">
          {GRID_ORDER.map((n) => (
            <div key={n} class={n <= 3 ? 'ia-cell ia-step' : 'ia-cell'} style={`--k:${n - 0.6}`}>
              {n}
            </div>
          ))}
        </div>
      </div>
    );
  }
  return <div class="intro-anim" aria-hidden="true" data-game={id} />;
}
