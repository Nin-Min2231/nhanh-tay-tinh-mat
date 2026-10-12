// Biểu tượng phần thưởng đặc biệt (SVG tự vẽ, khung 100×100): Huy hiệu Vàng, Nhạc Cụ Gõ.
import { vi } from '../../i18n/vi';

const INK = '#37474F';

/** Huy hiệu Vàng “Nhanh Tay Tinh Mắt” (mở khóa ở 300 sao). */
export function BadgeGold({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={vi.unlocks['badge-gold']}
    >
      <defs>
        <linearGradient id="bg-gold" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stop-color="#FFF3A0" />
          <stop offset="0.5" stop-color="#FFC52E" />
          <stop offset="1" stop-color="#E08A00" />
        </linearGradient>
      </defs>
      <path
        d="M32 54 L20 94 L36 86 L46 98 L54 58 Z"
        fill="#FF4D5E"
        stroke={INK}
        stroke-width="2.6"
        stroke-linejoin="round"
      />
      <path
        d="M68 54 L80 94 L64 86 L54 98 L46 58 Z"
        fill="#29B6F6"
        stroke={INK}
        stroke-width="2.6"
        stroke-linejoin="round"
      />
      <circle cx="50" cy="38" r="31" fill="url(#bg-gold)" stroke={INK} stroke-width="3" />
      <circle cx="50" cy="38" r="23" fill="none" stroke="#E08A00" stroke-width="2.4" />
      <path
        d="M50 20 L55.5 32 L68.5 33.4 L58.8 42.2 L61.6 55 L50 48.4 L38.4 55 L41.2 42.2 L31.5 33.4 L44.5 32 Z"
        fill="#fff"
        stroke={INK}
        stroke-width="2.2"
        stroke-linejoin="round"
      />
      <ellipse
        cx="36"
        cy="20"
        rx="9"
        ry="3.6"
        fill="#fff"
        opacity="0.65"
        transform="rotate(-35 36 20)"
      />
    </svg>
  );
}

/** Bộ âm thanh Nhạc Cụ Gõ: đàn gõ nhiều màu. */
export function XyloIcon({ size = 56 }: { size?: number }) {
  const bars: readonly (readonly [number, number, string])[] = [
    [18, 52, '#FF4D5E'],
    [30, 46, '#FF8A3D'],
    [42, 40, '#FFD93D'],
    [54, 34, '#3DDC6E'],
    [66, 28, '#29B6F6'],
  ];
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={vi.unlocks['sound-percussion']}
    >
      <path d="M12 82 L88 82" stroke={INK} stroke-width="5" stroke-linecap="round" />
      <path d="M12 38 L88 38" stroke={INK} stroke-width="0" />
      {bars.map(([x, h, c]) => (
        <g key={c}>
          <rect
            x={x - 5}
            y={78 - h}
            width="11"
            height={h}
            rx="4"
            fill={c}
            stroke={INK}
            stroke-width="2.4"
          />
          <rect
            x={x - 2}
            y={80 - h}
            width="3"
            height={h * 0.5}
            rx="1.5"
            fill="#fff"
            opacity="0.55"
          />
        </g>
      ))}
      <path d="M72 18 L92 44" stroke={INK} stroke-width="3.4" stroke-linecap="round" />
      <circle cx="70" cy="15" r="6" fill="#FF5FA2" stroke={INK} stroke-width="2.4" />
    </svg>
  );
}

/** Âm thanh gốc: loa nhỏ có sóng âm nhiều màu. */
export function SpeakerIcon({ size = 56 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={vi.album.defaultSound}
    >
      <defs>
        <linearGradient id="spk-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#9BDCFF" />
          <stop offset="1" stop-color="#2F8BE0" />
        </linearGradient>
      </defs>
      <path
        d="M14 40 H32 L54 20 V80 L32 60 H14 Z"
        fill="url(#spk-body)"
        stroke={INK}
        stroke-width="3"
        stroke-linejoin="round"
      />
      <path
        d="M19 44 H32 L50 28"
        fill="none"
        stroke="#fff"
        stroke-width="3"
        stroke-linecap="round"
        opacity="0.55"
      />
      <path
        d="M63 38 Q71 50 63 62"
        fill="none"
        stroke="#FF5FA2"
        stroke-width="5.5"
        stroke-linecap="round"
      />
      <path
        d="M72 28 Q88 50 72 72"
        fill="none"
        stroke="#FFC107"
        stroke-width="5.5"
        stroke-linecap="round"
      />
      <path
        d="M81 18 Q104 50 81 82"
        fill="none"
        stroke="#3DDC6E"
        stroke-width="5.5"
        stroke-linecap="round"
      />
    </svg>
  );
}
