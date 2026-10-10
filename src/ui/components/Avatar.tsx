// 12 avatar SVG tự vẽ đơn giản (động vật). Mỗi avatar có tên để đọc bằng trình đọc màn hình.
import type { ComponentChildren } from 'preact';
import { vi } from '../../i18n/vi';

export const AVATAR_IDS = [
  'cat',
  'dog',
  'bunny',
  'bear',
  'panda',
  'fox',
  'frog',
  'lion',
  'owl',
  'pig',
  'penguin',
  'koala',
] as const;
export type AvatarId = (typeof AVATAR_IDS)[number];

const LINE = '#37474F';

function Eyes({ y = 52, gap = 14, r = 4.5 }: { y?: number; gap?: number; r?: number }) {
  return (
    <g fill="#263238">
      <circle cx={50 - gap} cy={y} r={r} />
      <circle cx={50 + gap} cy={y} r={r} />
      <circle cx={50 - gap + 1.5} cy={y - 1.5} r={r * 0.35} fill="#fff" />
      <circle cx={50 + gap + 1.5} cy={y - 1.5} r={r * 0.35} fill="#fff" />
    </g>
  );
}

function Smile({ y = 66 }: { y?: number }) {
  return (
    <path
      d={`M42 ${y} Q50 ${y + 8} 58 ${y}`}
      fill="none"
      stroke={LINE}
      stroke-width="3"
      stroke-linecap="round"
    />
  );
}

function Art({ id }: { id: AvatarId }): ComponentChildren {
  switch (id) {
    case 'cat':
      return (
        <>
          <path
            d="M20 40 L24 12 L44 28 Z M80 40 L76 12 L56 28 Z"
            fill="#FFA45C"
            stroke={LINE}
            stroke-width="2.5"
            stroke-linejoin="round"
          />
          <circle cx="50" cy="55" r="34" fill="#FFB877" stroke={LINE} stroke-width="2.5" />
          <Eyes />
          <path d="M47 60 L53 60 L50 64 Z" fill="#E57373" />
          <Smile y={66} />
          <g stroke={LINE} stroke-width="2" stroke-linecap="round">
            <path d="M18 60 L34 62 M18 68 L34 66 M82 60 L66 62 M82 68 L66 66" />
          </g>
        </>
      );
    case 'dog':
      return (
        <>
          <ellipse
            cx="22"
            cy="48"
            rx="12"
            ry="22"
            fill="#8D6E63"
            stroke={LINE}
            stroke-width="2.5"
          />
          <ellipse
            cx="78"
            cy="48"
            rx="12"
            ry="22"
            fill="#8D6E63"
            stroke={LINE}
            stroke-width="2.5"
          />
          <circle cx="50" cy="52" r="32" fill="#D7B899" stroke={LINE} stroke-width="2.5" />
          <ellipse cx="50" cy="64" rx="15" ry="11" fill="#F5E6D3" />
          <Eyes y={48} />
          <ellipse cx="50" cy="60" rx="6" ry="4.5" fill="#263238" />
          <path
            d="M50 65 L50 70 M44 72 Q50 77 56 72"
            fill="none"
            stroke={LINE}
            stroke-width="2.5"
            stroke-linecap="round"
          />
        </>
      );
    case 'bunny':
      return (
        <>
          <ellipse cx="36" cy="22" rx="9" ry="24" fill="#F5F5F5" stroke={LINE} stroke-width="2.5" />
          <ellipse cx="64" cy="22" rx="9" ry="24" fill="#F5F5F5" stroke={LINE} stroke-width="2.5" />
          <ellipse cx="36" cy="24" rx="4" ry="16" fill="#F8BBD0" />
          <ellipse cx="64" cy="24" rx="4" ry="16" fill="#F8BBD0" />
          <circle cx="50" cy="60" r="30" fill="#FAFAFA" stroke={LINE} stroke-width="2.5" />
          <Eyes y={56} gap={12} />
          <ellipse cx="50" cy="65" rx="4" ry="3" fill="#F48FB1" />
          <path
            d="M50 68 L50 72 M44 74 Q50 78 56 74"
            fill="none"
            stroke={LINE}
            stroke-width="2.5"
            stroke-linecap="round"
          />
          <circle cx="34" cy="68" r="5" fill="#FFCDD2" opacity="0.8" />
          <circle cx="66" cy="68" r="5" fill="#FFCDD2" opacity="0.8" />
        </>
      );
    case 'bear':
      return (
        <>
          <circle cx="24" cy="26" r="13" fill="#A1887F" stroke={LINE} stroke-width="2.5" />
          <circle cx="76" cy="26" r="13" fill="#A1887F" stroke={LINE} stroke-width="2.5" />
          <circle cx="50" cy="54" r="34" fill="#BCAAA4" stroke={LINE} stroke-width="2.5" />
          <ellipse cx="50" cy="64" rx="14" ry="11" fill="#EFEBE9" />
          <Eyes y={48} />
          <ellipse cx="50" cy="60" rx="5.5" ry="4" fill="#3E2723" />
          <Smile y={67} />
        </>
      );
    case 'panda':
      return (
        <>
          <circle cx="23" cy="26" r="13" fill="#263238" />
          <circle cx="77" cy="26" r="13" fill="#263238" />
          <circle cx="50" cy="54" r="34" fill="#FAFAFA" stroke={LINE} stroke-width="2.5" />
          <ellipse cx="35" cy="50" rx="9" ry="12" fill="#263238" transform="rotate(20 35 50)" />
          <ellipse cx="65" cy="50" rx="9" ry="12" fill="#263238" transform="rotate(-20 65 50)" />
          <circle cx="36" cy="49" r="3.5" fill="#fff" />
          <circle cx="64" cy="49" r="3.5" fill="#fff" />
          <ellipse cx="50" cy="62" rx="5.5" ry="4" fill="#263238" />
          <Smile y={68} />
        </>
      );
    case 'fox':
      return (
        <>
          <path
            d="M16 44 L22 10 L44 30 Z M84 44 L78 10 L56 30 Z"
            fill="#FF8A3D"
            stroke={LINE}
            stroke-width="2.5"
            stroke-linejoin="round"
          />
          <path
            d="M16 50 Q50 30 84 50 Q80 88 50 90 Q20 88 16 50 Z"
            fill="#FF9A52"
            stroke={LINE}
            stroke-width="2.5"
            stroke-linejoin="round"
          />
          <path d="M18 58 Q36 54 50 78 Q64 54 82 58 Q76 86 50 88 Q24 86 18 58 Z" fill="#FFF3E0" />
          <Eyes y={54} />
          <ellipse cx="50" cy="73" rx="5" ry="4" fill="#263238" />
        </>
      );
    case 'frog':
      return (
        <>
          <circle cx="30" cy="30" r="15" fill="#81C784" stroke={LINE} stroke-width="2.5" />
          <circle cx="70" cy="30" r="15" fill="#81C784" stroke={LINE} stroke-width="2.5" />
          <circle cx="30" cy="30" r="9" fill="#fff" />
          <circle cx="70" cy="30" r="9" fill="#fff" />
          <circle cx="31" cy="31" r="4.5" fill="#263238" />
          <circle cx="69" cy="31" r="4.5" fill="#263238" />
          <ellipse
            cx="50"
            cy="62"
            rx="36"
            ry="28"
            fill="#81C784"
            stroke={LINE}
            stroke-width="2.5"
          />
          <path
            d="M30 66 Q50 84 70 66"
            fill="none"
            stroke={LINE}
            stroke-width="3"
            stroke-linecap="round"
          />
          <circle cx="44" cy="54" r="2" fill={LINE} />
          <circle cx="56" cy="54" r="2" fill={LINE} />
          <circle cx="26" cy="64" r="5" fill="#FFAB91" opacity="0.7" />
          <circle cx="74" cy="64" r="5" fill="#FFAB91" opacity="0.7" />
        </>
      );
    case 'lion':
      return (
        <>
          <circle cx="50" cy="52" r="42" fill="#E69138" stroke={LINE} stroke-width="2.5" />
          <circle cx="24" cy="24" r="8" fill="#F6B26B" stroke={LINE} stroke-width="2" />
          <circle cx="76" cy="24" r="8" fill="#F6B26B" stroke={LINE} stroke-width="2" />
          <circle cx="50" cy="54" r="29" fill="#FFD54F" stroke={LINE} stroke-width="2.5" />
          <Eyes y={48} />
          <path d="M45 58 L55 58 L50 63 Z" fill="#8D4B2A" />
          <path
            d="M50 63 L50 67 M43 68 Q50 74 57 68"
            fill="none"
            stroke={LINE}
            stroke-width="2.5"
            stroke-linecap="round"
          />
        </>
      );
    case 'owl':
      return (
        <>
          <path
            d="M20 40 L18 12 L42 28 Z M80 40 L82 12 L58 28 Z"
            fill="#8D6E63"
            stroke={LINE}
            stroke-width="2.5"
            stroke-linejoin="round"
          />
          <ellipse
            cx="50"
            cy="56"
            rx="34"
            ry="36"
            fill="#A1887F"
            stroke={LINE}
            stroke-width="2.5"
          />
          <circle cx="36" cy="48" r="14" fill="#FFF8E1" stroke={LINE} stroke-width="2" />
          <circle cx="64" cy="48" r="14" fill="#FFF8E1" stroke={LINE} stroke-width="2" />
          <circle cx="37" cy="49" r="6" fill="#263238" />
          <circle cx="63" cy="49" r="6" fill="#263238" />
          <circle cx="39" cy="47" r="2" fill="#fff" />
          <circle cx="65" cy="47" r="2" fill="#fff" />
          <path
            d="M44 60 L56 60 L50 72 Z"
            fill="#FFB300"
            stroke={LINE}
            stroke-width="2"
            stroke-linejoin="round"
          />
        </>
      );
    case 'pig':
      return (
        <>
          <path
            d="M22 36 L20 14 L40 26 Z M78 36 L80 14 L60 26 Z"
            fill="#F48FB1"
            stroke={LINE}
            stroke-width="2.5"
            stroke-linejoin="round"
          />
          <circle cx="50" cy="54" r="34" fill="#F8BBD0" stroke={LINE} stroke-width="2.5" />
          <Eyes y={46} />
          <ellipse
            cx="50"
            cy="64"
            rx="15"
            ry="11"
            fill="#F48FB1"
            stroke={LINE}
            stroke-width="2.5"
          />
          <ellipse cx="45" cy="64" rx="2.6" ry="4" fill={LINE} />
          <ellipse cx="55" cy="64" rx="2.6" ry="4" fill={LINE} />
        </>
      );
    case 'penguin':
      return (
        <>
          <circle cx="50" cy="52" r="36" fill="#37474F" stroke={LINE} stroke-width="2.5" />
          <path d="M26 46 Q50 28 74 46 Q76 82 50 84 Q24 82 26 46 Z" fill="#FAFAFA" />
          <Eyes y={52} gap={11} />
          <path
            d="M42 62 L58 62 L50 72 Z"
            fill="#FFA726"
            stroke={LINE}
            stroke-width="2"
            stroke-linejoin="round"
          />
          <circle cx="32" cy="64" r="4.5" fill="#FFCDD2" opacity="0.8" />
          <circle cx="68" cy="64" r="4.5" fill="#FFCDD2" opacity="0.8" />
        </>
      );
    case 'koala':
      return (
        <>
          <circle cx="20" cy="38" r="17" fill="#B0BEC5" stroke={LINE} stroke-width="2.5" />
          <circle cx="80" cy="38" r="17" fill="#B0BEC5" stroke={LINE} stroke-width="2.5" />
          <circle cx="20" cy="38" r="9" fill="#ECEFF1" />
          <circle cx="80" cy="38" r="9" fill="#ECEFF1" />
          <circle cx="50" cy="56" r="32" fill="#CFD8DC" stroke={LINE} stroke-width="2.5" />
          <Eyes y={50} />
          <ellipse cx="50" cy="62" rx="9" ry="12" fill="#37474F" />
          <Smile y={76} />
        </>
      );
  }
}

const BACKGROUNDS: Record<AvatarId, string> = {
  cat: '#FFF3C4',
  dog: '#D7F0FF',
  bunny: '#FFE0EC',
  bear: '#E3F5DA',
  panda: '#E6E0FA',
  fox: '#D7F0FF',
  frog: '#FFF3C4',
  lion: '#E3F5DA',
  owl: '#FFE0EC',
  pig: '#D7F0FF',
  penguin: '#FFF3C4',
  koala: '#FFE0EC',
};

export function isAvatarId(id: string): id is AvatarId {
  return (AVATAR_IDS as readonly string[]).includes(id);
}

export function Avatar({ id, size = 72 }: { id: string; size?: number }) {
  const key: AvatarId = isAvatarId(id) ? id : 'cat';
  return (
    <svg
      class="avatar"
      width={size}
      height={size}
      viewBox="0 0 100 100"
      role="img"
      aria-label={vi.avatars[key] ?? key}
    >
      <circle cx="50" cy="50" r="50" fill={BACKGROUNDS[key]} />
      <Art id={key} />
    </svg>
  );
}
