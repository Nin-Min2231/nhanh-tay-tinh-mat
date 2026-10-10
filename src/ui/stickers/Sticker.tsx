// Khung sticker dùng chung: nền theo chủ đề + viền theo độ hiếm (Thường trắng ngọc · Hiếm bạc xanh · Siêu hiếm vàng lấp lánh).
// Hình vẽ từng sticker nằm ở animals.tsx / fruits.tsx / space.tsx / vehicles.tsx (khung 100×100).
import { stickerById, type StickerTheme } from '../../app/rewards';
import { vi } from '../../i18n/vi';
import { ANIMAL_ART } from './animals';
import { FRUIT_ART } from './fruits';
import { INK, Lin, Sparkle, type ArtFn, type Uid } from './kit';
import { SPACE_ART } from './space';
import { VEHICLE_ART } from './vehicles';

const ART: Record<string, ArtFn> = { ...ANIMAL_ART, ...FRUIT_ART, ...SPACE_ART, ...VEHICLE_ART };

const THEME_BG: Record<StickerTheme, readonly (readonly [number, string])[]> = {
  animal: [
    [0, '#A9E5FF'],
    [0.62, '#CFF5C8'],
    [1, '#9BE49A'],
  ],
  fruit: [
    [0, '#FFC4E0'],
    [1, '#FFF0A6'],
  ],
  space: [
    [0, '#1C0F58'],
    [1, '#5B37CC'],
  ],
  vehicle: [
    [0, '#8FDCFF'],
    [1, '#E6F8FF'],
  ],
};

const RING: Record<string, readonly (readonly [number, string])[]> = {
  common: [
    [0, '#FFFFFF'],
    [1, '#D5E3EC'],
  ],
  rare: [
    [0, '#F2FAFF'],
    [0.35, '#8FD0FF'],
    [0.7, '#DDF1FF'],
    [1, '#4FA7EE'],
  ],
  legendary: [
    [0, '#FFF6BF'],
    [0.35, '#FFC83A'],
    [0.7, '#FFE98A'],
    [1, '#FF9A1F'],
  ],
};

/** Vài ngôi sao nhỏ trên nền vũ trụ (vị trí cố định, không random). */
const SPACE_DOTS: readonly (readonly [number, number, number])[] = [
  [17, 20, 1.2],
  [30, 14, 0.9],
  [74, 18, 1.3],
  [84, 32, 0.9],
  [20, 44, 0.8],
  [80, 52, 1.1],
  [24, 76, 1],
  [70, 82, 0.9],
  [86, 70, 0.8],
];

export function Sticker({
  id,
  size = 96,
  locked = false,
  decorative = false,
}: {
  id: string;
  size?: number;
  /** Chưa có: hiện bóng mờ. */
  locked?: boolean;
  /** Ẩn khỏi trình đọc màn hình (khi đã có chữ tên bên cạnh). */
  decorative?: boolean;
}) {
  const def = stickerById(id);
  if (!def) return null;
  const u: Uid = (n) => `${id}-${n}`;
  const Art = ART[id];
  const label = vi.gift.stickerLabel(vi.stickers[id] ?? id, vi.rarity[def.rarity] ?? def.rarity);
  return (
    <svg
      class={`sticker sticker-${def.rarity}${locked ? ' is-locked' : ''}`}
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role={decorative ? undefined : 'img'}
      aria-label={decorative ? undefined : locked ? vi.album.unknown : label}
      aria-hidden={decorative ? 'true' : undefined}
      data-sticker={id}
    >
      <defs>
        <Lin id={u('bg')} stops={THEME_BG[def.theme]} />
        <Lin id={u('ring')} stops={RING[def.rarity] ?? []} x1={0} y1={0} x2={1} y2={1} />
        <linearGradient id={u('gl')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#fff" stop-opacity="0.75" />
          <stop offset="1" stop-color="#fff" stop-opacity="0" />
        </linearGradient>
        <clipPath id={u('clip')}>
          <rect x="9" y="9" width="82" height="82" rx="21" />
        </clipPath>
      </defs>
      {/* viền theo độ hiếm */}
      <rect
        x="3"
        y="3"
        width="94"
        height="94"
        rx="27"
        fill={`url(#${u('ring')})`}
        stroke={INK}
        stroke-width="3"
      />
      {/* nền chủ đề */}
      <rect
        x="9"
        y="9"
        width="82"
        height="82"
        rx="21"
        fill={`url(#${u('bg')})`}
        stroke={INK}
        stroke-width="1.6"
        stroke-opacity="0.55"
      />
      <g clip-path={`url(#${u('clip')})`}>
        {def.theme === 'space' &&
          SPACE_DOTS.map(([x, y, r]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff" opacity="0.85" />
          ))}
        {def.theme === 'vehicle' && (
          <g fill="#fff" opacity="0.9">
            <ellipse cx="26" cy="24" rx="11" ry="5" />
            <ellipse cx="33" cy="21" rx="7" ry="5" />
            <ellipse cx="72" cy="32" rx="9" ry="4.2" />
            <ellipse cx="77" cy="29.5" rx="5.5" ry="4" />
          </g>
        )}
        <g class="sticker-art">{Art ? Art(u) : null}</g>
        {/* vệt sáng bóng trên mép trên */}
        <path
          d="M14 30 Q15 15 32 13 L68 13 Q46 17 36 24 Q24 31 14 30 Z"
          fill={`url(#${u('gl')})`}
          opacity="0.85"
        />
      </g>
      {def.rarity === 'rare' && (
        <g>
          <Sparkle x={10} y={12} s={6} fill="#fff" />
          <Sparkle x={91} y={88} s={5} fill="#fff" />
        </g>
      )}
      {def.rarity === 'legendary' && (
        <g class="sticker-glints">
          <Sparkle x={10} y={11} s={8} fill="#FFFDE0" />
          <Sparkle x={92} y={16} s={6} fill="#FFFDE0" />
          <Sparkle x={8} y={80} s={5} fill="#FFFDE0" />
          <Sparkle x={91} y={90} s={8} fill="#FFFDE0" />
        </g>
      )}
    </svg>
  );
}
