// Icon thẻ game (SVG tự vẽ). Màu luôn đi kèm hình dạng (mù màu).
import type { PlayableId } from '../../app/routes';

const LINE = '#37474F';

function Art({ id }: { id: PlayableId }) {
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
        <g fill="#FF8A65" stroke={LINE} stroke-width="2.5">
          <ellipse cx="32" cy="42" rx="14" ry="11" />
          <ellipse cx="14" cy="28" rx="5.5" ry="7" transform="rotate(-20 14 28)" />
          <ellipse cx="25" cy="17" rx="5.5" ry="7" />
          <ellipse cx="39" cy="17" rx="5.5" ry="7" />
          <ellipse cx="50" cy="28" rx="5.5" ry="7" transform="rotate(20 50 28)" />
        </g>
      );
    case 'G4':
      return (
        <g stroke={LINE} stroke-width="2.5" stroke-linejoin="round">
          <rect x="6" y="6" width="25" height="25" rx="5" fill="#EF5350" />
          <circle cx="18.5" cy="18.5" r="6" fill="#fff" />
          <rect x="33" y="6" width="25" height="25" rx="5" fill="#4FC3F7" />
          <rect x="40" y="13" width="11" height="11" fill="#fff" />
          <rect x="6" y="33" width="25" height="25" rx="5" fill="#66BB6A" />
          <path d="M18.5 40 L26 52 L11 52 Z" fill="#fff" />
          <rect x="33" y="33" width="25" height="25" rx="5" fill="#FFD54F" />
          <path d="M45.5 39 L52 45.5 L45.5 52 L39 45.5 Z" fill="#fff" />
        </g>
      );
    case 'G5':
      return (
        <g fill={LINE}>
          <ellipse
            cx="22"
            cy="46"
            rx="11"
            ry="8"
            fill="#9575CD"
            stroke={LINE}
            stroke-width="2.5"
            transform="rotate(-20 22 46)"
          />
          <path
            d="M31 44 L31 12 Q44 14 48 28"
            fill="none"
            stroke={LINE}
            stroke-width="4.5"
            stroke-linecap="round"
          />
          <ellipse
            cx="46"
            cy="52"
            rx="8"
            ry="6"
            fill="#4FC3F7"
            stroke={LINE}
            stroke-width="2.5"
            transform="rotate(-20 46 52)"
          />
        </g>
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
    case 'G0':
      return (
        <>
          <circle cx="32" cy="32" r="22" fill="#66BB6A" stroke={LINE} stroke-width="2.5" />
          <path
            d="M22 36 Q32 46 42 36"
            fill="none"
            stroke={LINE}
            stroke-width="3"
            stroke-linecap="round"
          />
          <circle cx="25" cy="27" r="2.5" fill={LINE} />
          <circle cx="39" cy="27" r="2.5" fill={LINE} />
        </>
      );
  }
}

export function GameIcon({ id, size = 64 }: { id: PlayableId; size?: number }) {
  return (
    <svg class="game-icon" width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
      <Art id={id} />
    </svg>
  );
}
