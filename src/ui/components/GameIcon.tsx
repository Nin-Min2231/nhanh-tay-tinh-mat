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

function Art({ id }: { id: GameId }) {
  switch (id) {
    case 'G1':
      return (
        <>
          <circle cx="22" cy="34" r="15" fill="#66BB6A" stroke={LINE} stroke-width="2.5" />
          <circle cx="17" cy="30" r="2" fill={LINE} />
          <circle cx="27" cy="30" r="2" fill={LINE} />
          <path
            d="M16 38 Q22 44 28 38"
            fill="none"
            stroke={LINE}
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <rect
            x="36"
            y="22"
            width="24"
            height="24"
            rx="4"
            fill="#EF5350"
            stroke={LINE}
            stroke-width="2.5"
          />
          <path
            d="M42 28 L54 40 M54 28 L42 40"
            stroke={LINE}
            stroke-width="3"
            stroke-linecap="round"
          />
        </>
      );
    case 'G2':
      return (
        <g
          font-family="Nunito, sans-serif"
          font-weight="800"
          font-size="14"
          text-anchor="middle"
          fill={LINE}
        >
          {[0, 1, 2].flatMap((r) =>
            [0, 1, 2].map((c) => (
              <g key={`${r}${c}`}>
                <rect
                  x={8 + c * 17}
                  y={8 + r * 17}
                  width="15"
                  height="15"
                  rx="3"
                  fill={(r + c) % 2 ? '#FFD54F' : '#4FC3F7'}
                  stroke={LINE}
                  stroke-width="1.8"
                />
                <text x={15.5 + c * 17} y={20 + r * 17}>
                  {r * 3 + c + 1}
                </text>
              </g>
            )),
          )}
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
