// Hình động hướng dẫn ≤ 5 giây (CSS thuần), mỗi game một kiểu. Game chưa làm dùng khung chung.
import { useEffect, useRef } from 'preact/hooks';
import type { GameId } from '../../app/types';
import { renderSprite, type SpriteKind } from '../../games/g3-pets/art';
import { LANE_COLORS, renderGem } from '../../games/g5-notes/art';
import { vi } from '../../i18n/vi';

/** Vẽ sprite thú / viên nhạc vào canvas DOM (dùng chung bộ hình với game thật). */
function SpriteCanvas({
  draw,
  size,
  class: cls,
}: {
  draw: (dpr: number) => HTMLCanvasElement;
  size: number;
  class?: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    const c = cv?.getContext('2d');
    if (!cv || !c) return;
    const sprite = draw(window.devicePixelRatio || 1);
    cv.width = sprite.width;
    cv.height = sprite.height;
    c.drawImage(sprite, 0, 0);
  }, [draw]);
  return <canvas ref={ref} class={cls} style={`width:${size}px;height:${size}px`} />;
}

const petSprite = (kind: SpriteKind, cheer: boolean, size: number) => (dpr: number) =>
  renderSprite(kind, cheer, size, dpr);
const gemSprite = (lane: number, size: number) => (dpr: number) =>
  renderGem(LANE_COLORS[lane] ?? LANE_COLORS[0]!, size, dpr);

const GRID_ORDER = [4, 1, 7, 9, 2, 5, 8, 3, 6];

const PAD_ICONS = [
  <circle
    key="c"
    cx="32"
    cy="32"
    r="17"
    fill="#fff"
    stroke="rgba(38,50,56,0.55)"
    stroke-width="3"
  />,
  <path
    key="t"
    d="M32 12 L52 49 L12 49 Z"
    fill="#fff"
    stroke="rgba(38,50,56,0.55)"
    stroke-width="3"
    stroke-linejoin="round"
  />,
  <rect
    key="s"
    x="15"
    y="15"
    width="34"
    height="34"
    rx="6"
    fill="#fff"
    stroke="rgba(38,50,56,0.55)"
    stroke-width="3"
  />,
  <path
    key="st"
    d="M32 9 L38.6 25 L56 26.3 L42.7 37.6 L46.8 54.5 L32 45.2 L17.2 54.5 L21.3 37.6 L8 26.3 L25.4 25 Z"
    fill="#fff"
    stroke="rgba(38,50,56,0.55)"
    stroke-width="3"
    stroke-linejoin="round"
  />,
];

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
  if (id === 'G3') {
    return (
      <div class="intro-anim ia-meadow" aria-hidden="true" data-game={id}>
        <div class="ia-cat">
          <SpriteCanvas class="ia-cat-idle" size={92} draw={petSprite('cat', false, 92)} />
          <SpriteCanvas class="ia-cat-cheer" size={92} draw={petSprite('cat', true, 92)} />
        </div>
        <div class="ia-hedgehog">
          <SpriteCanvas size={84} draw={petSprite('hedgehog', false, 84)} />
          <span class="ia-zzz">z z z</span>
        </div>
        <div class="ia-finger ia-finger-cat" />
        <span class="ia-hu">{vi.g3.cheer}</span>
      </div>
    );
  }
  if (id === 'G4') {
    return (
      <div class="intro-anim ia-g4" aria-hidden="true" data-game={id}>
        <div class="ia-pads">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} class={`g4-pad g4-p${i} ia-pad ia-pad-${i}`}>
              <svg viewBox="0 0 64 64">{PAD_ICONS[i]}</svg>
            </div>
          ))}
          <div class="ia-finger ia-finger-pads" />
        </div>
      </div>
    );
  }
  if (id === 'G5') {
    return (
      <div class="intro-anim ia-night" aria-hidden="true" data-game={id}>
        <div class="ia-lanes">
          {[0, 1, 2, 3].map((l) => (
            <div key={l} class={`ia-lane ia-lane-${l}`} />
          ))}
          <div class="ia-line" />
          <div class="ia-gem">
            <SpriteCanvas size={52} draw={gemSprite(2, 38)} />
          </div>
          <div class="ia-finger ia-finger-gem" />
          <span class="ia-perfect">{vi.g5.perfect}</span>
        </div>
      </div>
    );
  }
  return <div class="intro-anim" aria-hidden="true" data-game={id} />;
}
