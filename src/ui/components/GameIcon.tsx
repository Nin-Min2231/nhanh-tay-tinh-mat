// Icon thẻ game (SVG tự vẽ). Màu luôn đi kèm hình dạng (mù màu).
import type { GameId } from '../../app/types';
import { renderSprite } from '../../games/g3-pets/art';
import { LANE_COLORS, renderGem, type LanePalette } from '../../games/g5-notes/art';

const LINE = '#37474F';

/** Sprite vẽ bằng canvas → data URL (tạo 1 lần, dùng lại cho mọi thẻ). */
const urlCache = new Map<string, string>();
function spriteUrl(key: string, make: () => HTMLCanvasElement): string {
  let url = urlCache.get(key);
  if (!url) {
    url = make().toDataURL('image/png');
    urlCache.set(key, url);
  }
  return url;
}

/** G2: bảng 3×3 – 5 màu ô giống game (g2-c0…c4: hồng, vàng, lá, xanh trời, tím), số xáo trộn, ô “1” có viền vàng. */
const G2_TONES: readonly (readonly [string, string])[] = [
  ['#ffd3e1', '#ff8fb1'],
  ['#fff3a8', '#ffc933'],
  ['#c3f7d0', '#4fd878'],
  ['#c9eeff', '#4cb8f2'],
  ['#e6dcff', '#a888f5'],
];
const G2_NUMS = [5, 2, 7, 3, 1, 9, 8, 6, 4];
const G2_TILE = 16.4;
const G2_STEP = 18.8;

function Art({ id }: { id: GameId }) {
  switch (id) {
    case 'G1':
      return (
        <>
          <defs>
            <radialGradient id="gi1g" cx="34%" cy="28%" r="85%">
              <stop offset="0" stop-color="#dcffe6" />
              <stop offset="0.45" stop-color="#48e07c" />
              <stop offset="1" stop-color="#1b9a46" />
            </radialGradient>
            <linearGradient id="gi1r" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#ffa3ad" />
              <stop offset="0.55" stop-color="#ff4d5e" />
              <stop offset="1" stop-color="#c0243a" />
            </linearGradient>
          </defs>
          <ellipse cx="22" cy="55" rx="14" ry="3" fill={LINE} fill-opacity="0.2" />
          <ellipse cx="48" cy="46.5" rx="10.5" ry="2.4" fill={LINE} fill-opacity="0.18" />
          <circle cx="22" cy="37" r="16.5" fill="url(#gi1g)" stroke="#16793a" stroke-width="2.4" />
          <ellipse
            cx="14.5"
            cy="28.5"
            rx="6"
            ry="3.3"
            transform="rotate(-38 14.5 28.5)"
            fill="#fff"
            fill-opacity="0.62"
          />
          <ellipse cx="12.4" cy="40.6" rx="2.9" ry="2.2" fill="#ff7d9b" fill-opacity="0.9" />
          <ellipse cx="31.6" cy="40.6" rx="2.9" ry="2.2" fill="#ff7d9b" fill-opacity="0.9" />
          <circle cx="16.8" cy="35" r="2.4" fill={LINE} />
          <circle cx="27.2" cy="35" r="2.4" fill={LINE} />
          <circle cx="17.6" cy="34.2" r="0.85" fill="#fff" />
          <circle cx="28" cy="34.2" r="0.85" fill="#fff" />
          <path
            d="M16 41.5 Q22 47.5 28 41.5"
            fill="none"
            stroke={LINE}
            stroke-width="2.4"
            stroke-linecap="round"
          />
          <g transform="rotate(8 48 29)">
            <rect
              x="37"
              y="18"
              width="22"
              height="22"
              rx="6"
              fill="url(#gi1r)"
              stroke="#a3192d"
              stroke-width="2.4"
            />
            <path
              d="M40.5 25 Q40.5 21.5 44.5 21"
              fill="none"
              stroke="#fff"
              stroke-opacity="0.65"
              stroke-width="2.2"
              stroke-linecap="round"
            />
            <path
              d="M43.5 25.5 L52.5 34.5 M52.5 25.5 L43.5 34.5"
              fill="none"
              stroke="#8a1424"
              stroke-opacity="0.35"
              stroke-width="5"
              stroke-linecap="round"
              transform="translate(0 1)"
            />
            <path
              d="M43.5 25.5 L52.5 34.5 M52.5 25.5 L43.5 34.5"
              fill="none"
              stroke="#fff"
              stroke-width="3.6"
              stroke-linecap="round"
            />
          </g>
          <path
            d="M12 4.5 L13.6 8.9 L18 10.5 L13.6 12.1 L12 16.5 L10.4 12.1 L6 10.5 L10.4 8.9 Z"
            fill="#ffe066"
            stroke="#d4a017"
            stroke-width="1"
            stroke-linejoin="round"
          />
        </>
      );
    case 'G2':
      return (
        <g
          font-family="Nunito, sans-serif"
          font-weight="800"
          font-size="11.5"
          text-anchor="middle"
          fill={LINE}
        >
          <defs>
            {G2_TONES.map(([top, bottom], i) => (
              <linearGradient key={i} id={`gi2${i}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stop-color={top} />
                <stop offset="1" stop-color={bottom} />
              </linearGradient>
            ))}
          </defs>
          {G2_NUMS.map((n, i) => {
            const x = 5 + (i % 3) * G2_STEP;
            const y = 4.5 + Math.floor(i / 3) * G2_STEP;
            return (
              <g key={n}>
                <rect
                  x={x}
                  y={y + 1.6}
                  width={G2_TILE}
                  height={G2_TILE}
                  rx="4.2"
                  fill={LINE}
                  fill-opacity="0.3"
                />
                <rect
                  x={x}
                  y={y}
                  width={G2_TILE}
                  height={G2_TILE}
                  rx="4.2"
                  fill={`url(#gi2${i % G2_TONES.length})`}
                  stroke={LINE}
                  stroke-width="1.8"
                />
                <rect
                  x={x + 2.2}
                  y={y + 2}
                  width={G2_TILE - 4.4}
                  height="4.2"
                  rx="2.1"
                  fill="#fff"
                  fill-opacity="0.45"
                  stroke="none"
                />
                <text x={x + G2_TILE / 2} y={y + 12.6} stroke="none">
                  {n}
                </text>
                {n === 1 && (
                  <rect
                    x={x - 0.6}
                    y={y - 0.6}
                    width={G2_TILE + 1.2}
                    height={G2_TILE + 1.2}
                    rx="4.8"
                    fill="none"
                    stroke="#ff9f1c"
                    stroke-width="1.6"
                  />
                )}
              </g>
            );
          })}
        </g>
      );
    case 'G3':
      return (
        <image
          href={spriteUrl('cat', () => renderSprite('cat', false, 128, 1))}
          x="1"
          y="1"
          width="62"
          height="62"
        />
      );
    case 'G4':
      return (
        <g stroke={LINE} stroke-width="2.5" stroke-linejoin="round">
          <defs>
            <linearGradient id="gi4r" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#FF9AA6" />
              <stop offset="1" stop-color="#E0334A" />
            </linearGradient>
            <linearGradient id="gi4b" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#9AD3FF" />
              <stop offset="1" stop-color="#2F8BE0" />
            </linearGradient>
            <linearGradient id="gi4g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#A8F2BE" />
              <stop offset="1" stop-color="#2EB85A" />
            </linearGradient>
            <linearGradient id="gi4y" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stop-color="#FFF08A" />
              <stop offset="1" stop-color="#F2B90A" />
            </linearGradient>
          </defs>
          <rect x="5" y="5" width="26" height="26" rx="7" fill="url(#gi4r)" />
          <circle cx="18" cy="18" r="6" fill="#fff" />
          <rect x="33" y="5" width="26" height="26" rx="7" fill="url(#gi4b)" />
          <rect x="40" y="12" width="12" height="12" rx="2" fill="#fff" />
          <rect x="5" y="33" width="26" height="26" rx="7" fill="url(#gi4g)" />
          <path d="M18 39 L25.5 52 L10.5 52 Z" fill="#fff" />
          <rect x="33" y="33" width="26" height="26" rx="7" fill="url(#gi4y)" />
          <path d="M46 39 L52.5 46 L46 53 L39.5 46 Z" fill="#fff" />
        </g>
      );
    case 'G5':
      return (
        <image
          href={spriteUrl('gem', () => renderGem(LANE_COLORS[0] as LanePalette, 40, 3))}
          x="0"
          y="2"
          width="64"
          height="64"
        />
      );
    case 'G6':
      return (
        <>
          <defs>
            <radialGradient id="gi6a" cx="34%" cy="30%" r="82%">
              <stop offset="0" stop-color="#ff9a8f" />
              <stop offset="0.5" stop-color="#ec3b3b" />
              <stop offset="1" stop-color="#b01e2a" />
            </radialGradient>
            <linearGradient id="gi6l" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="#b6f06a" />
              <stop offset="1" stop-color="#2f9e3a" />
            </linearGradient>
          </defs>
          <path
            d="M32 17 C 19 7, 3 15, 4.5 35 C 6 54, 20 62, 32 59.5 C 44 62, 58 54, 59.5 35 C 61 15, 45 7, 32 17 Z"
            fill="url(#gi6a)"
            stroke="#7d1020"
            stroke-width="2.4"
            stroke-linejoin="round"
          />
          <path
            d="M32 18 C 32 12, 34 8, 38 4.5"
            fill="none"
            stroke="#6d4320"
            stroke-width="3.2"
            stroke-linecap="round"
          />
          <path
            d="M36 10 C 41 2, 52 3, 55 8.5 C 49 14.5, 39 14.5, 36 10 Z"
            fill="url(#gi6l)"
            stroke="#2c6b27"
            stroke-width="1.8"
            stroke-linejoin="round"
          />
          <ellipse
            cx="18.5"
            cy="26"
            rx="7"
            ry="4"
            transform="rotate(-38 18.5 26)"
            fill="#fff"
            fill-opacity="0.6"
          />
          <circle cx="32" cy="38" r="12" fill="#fff" stroke={LINE} stroke-width="2.4" />
          <text
            x="32"
            y="44.2"
            text-anchor="middle"
            font-family="Nunito, sans-serif"
            font-weight="800"
            font-size="17"
            fill={LINE}
          >
            7
          </text>
        </>
      );
    case 'G7':
      return (
        <g stroke={LINE} stroke-width="2.3" stroke-linejoin="round">
          <defs>
            <radialGradient id="gi7r" cx="34%" cy="28%" r="85%">
              <stop offset="0" stop-color="#ff9a8f" />
              <stop offset="0.55" stop-color="#ec3b3b" />
              <stop offset="1" stop-color="#a61b27" />
            </radialGradient>
            <radialGradient id="gi7b" cx="34%" cy="28%" r="85%">
              <stop offset="0" stop-color="#9fd0ff" />
              <stop offset="0.55" stop-color="#2f86e8" />
              <stop offset="1" stop-color="#154c9e" />
            </radialGradient>
            <radialGradient id="gi7y" cx="34%" cy="28%" r="85%">
              <stop offset="0" stop-color="#fff6a6" />
              <stop offset="0.55" stop-color="#ffc928" />
              <stop offset="1" stop-color="#e08a00" />
            </radialGradient>
            <pattern
              id="gi7s"
              width="7"
              height="7"
              patternUnits="userSpaceOnUse"
              patternTransform="rotate(45)"
            >
              <rect width="2.6" height="7" fill="#fff" fill-opacity="0.55" />
            </pattern>
            <pattern id="gi7d" width="8" height="8" patternUnits="userSpaceOnUse">
              <circle cx="4" cy="4" r="1.7" fill="#fff" fill-opacity="0.65" />
            </pattern>
          </defs>
          <circle cx="12" cy="17" r="9.5" fill="url(#gi7r)" />
          <circle cx="12" cy="17" r="9.5" fill="url(#gi7s)" stroke="none" />
          <rect x="24" y="8" width="18" height="18" rx="4.5" fill="url(#gi7b)" />
          <rect x="24" y="8" width="18" height="18" rx="4.5" fill="url(#gi7d)" stroke="none" />
          <path d="M54 7.5 L62 24 L46 24 Z" fill="url(#gi7y)" />
          <rect x="6" y="35" width="52" height="22" rx="7" fill="#fff" stroke-dasharray="4.5 3" />
          <text
            x="32"
            y="52.5"
            text-anchor="middle"
            font-family="Nunito, sans-serif"
            font-weight="800"
            font-size="19"
            fill="#7b4de0"
            stroke="none"
          >
            ?
          </text>
        </g>
      );
  }
}

export function GameIcon({ id, size = 64 }: { id: GameId; size?: number }) {
  return (
    <svg class="game-icon" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <Art id={id} />
    </svg>
  );
}
