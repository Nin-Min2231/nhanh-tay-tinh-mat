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
          <path
            d="M32 18 C 14 8, 4 28, 10 42 C 16 58, 28 56, 32 54 C 36 56, 48 58, 54 42 C 60 28, 50 8, 32 18 Z"
            fill="#EF5350"
            stroke={LINE}
            stroke-width="2.5"
            stroke-linejoin="round"
          />
          <path
            d="M32 18 Q32 10 36 6"
            fill="none"
            stroke={LINE}
            stroke-width="3"
            stroke-linecap="round"
          />
          <path
            d="M36 12 Q46 4 52 10 Q44 16 36 12 Z"
            fill="#66BB6A"
            stroke={LINE}
            stroke-width="2"
            stroke-linejoin="round"
          />
          <path
            d="M18 28 Q20 24 24 24"
            fill="none"
            stroke="#fff"
            stroke-width="3"
            stroke-linecap="round"
            opacity="0.8"
          />
        </>
      );
    case 'G7':
      return (
        <g stroke={LINE} stroke-width="2.5" stroke-linejoin="round">
          <circle cx="12" cy="20" r="8" fill="#EF5350" />
          <rect x="24" y="12" width="16" height="16" rx="2" fill="#4FC3F7" />
          <path d="M52 12 L60 28 L44 28 Z" fill="#FFD54F" />
          <rect x="8" y="36" width="48" height="20" rx="5" fill="#fff" stroke-dasharray="4 3" />
          <text
            x="32"
            y="52"
            text-anchor="middle"
            font-family="Nunito, sans-serif"
            font-weight="800"
            font-size="18"
            fill={LINE}
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
