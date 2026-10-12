import { mascotKind, type MascotKind } from '../../app/mascotKind';
import { vi } from '../../i18n/vi';
import { OutfitBack, OutfitBody, OutfitDefs, OutfitHead } from './Outfits';
import { Owl } from './Owl';

// Linh vật “Sóc Bo” – SVG tự vẽ, 5 biểu cảm (SPEC mục 12).
export type MascotMood = 'wave' | 'happy' | 'cheer' | 'surprised' | 'sleep';

const OUTLINE = '#5D4037';

function Eyes({ mood }: { mood: MascotMood }) {
  if (mood === 'sleep') {
    return (
      <g fill="none" stroke={OUTLINE} stroke-width="3.5" stroke-linecap="round">
        <path d="M72 80 Q80 87 88 80" />
        <path d="M112 80 Q120 87 128 80" />
      </g>
    );
  }
  if (mood === 'cheer') {
    return (
      <g fill="none" stroke={OUTLINE} stroke-width="3.5" stroke-linecap="round">
        <path d="M72 82 Q80 72 88 82" />
        <path d="M112 82 Q120 72 128 82" />
      </g>
    );
  }
  const r = mood === 'surprised' ? 9 : 7;
  return (
    <g>
      <circle cx="80" cy="79" r={r} fill="#263238" />
      <circle cx="120" cy="79" r={r} fill="#263238" />
      <circle cx="82.5" cy="76" r="2.6" fill="#fff" />
      <circle cx="122.5" cy="76" r="2.6" fill="#fff" />
    </g>
  );
}

function Mouth({ mood }: { mood: MascotMood }) {
  switch (mood) {
    case 'surprised':
      return <ellipse cx="100" cy="112" rx="6" ry="8" fill="#8D2B3A" />;
    case 'cheer':
    case 'happy':
      return (
        <g>
          <path
            d="M88 106 Q100 126 112 106 Z"
            fill="#8D2B3A"
            stroke={OUTLINE}
            stroke-width="2.5"
            stroke-linejoin="round"
          />
          <path d="M94 117 Q100 112 106 117 Q100 123 94 117 Z" fill="#FF8A9B" />
        </g>
      );
    case 'sleep':
      return (
        <path
          d="M94 110 Q100 114 106 110"
          fill="none"
          stroke={OUTLINE}
          stroke-width="3"
          stroke-linecap="round"
        />
      );
    default:
      return (
        <path
          d="M89 107 Q100 118 111 107"
          fill="none"
          stroke={OUTLINE}
          stroke-width="3.5"
          stroke-linecap="round"
        />
      );
  }
}

function Arms({ mood }: { mood: MascotMood }) {
  const fill = '#FF9A52';
  if (mood === 'cheer') {
    return (
      <g fill={fill} stroke={OUTLINE} stroke-width="2.5">
        <ellipse cx="52" cy="128" rx="10" ry="22" transform="rotate(30 52 128)" />
        <ellipse cx="148" cy="128" rx="10" ry="22" transform="rotate(-30 148 128)" />
      </g>
    );
  }
  if (mood === 'wave') {
    return (
      <g fill={fill} stroke={OUTLINE} stroke-width="2.5">
        <ellipse cx="60" cy="158" rx="10" ry="20" transform="rotate(10 60 158)" />
        <g class="mascot-wave">
          <ellipse cx="152" cy="122" rx="10" ry="22" transform="rotate(-25 152 122)" />
        </g>
      </g>
    );
  }
  return (
    <g fill={fill} stroke={OUTLINE} stroke-width="2.5">
      <ellipse cx="60" cy="158" rx="10" ry="20" transform="rotate(10 60 158)" />
      <ellipse cx="140" cy="158" rx="10" ry="20" transform="rotate(-10 140 158)" />
    </g>
  );
}

export function Mascot({
  mood = 'happy',
  size = 160,
  label,
  outfit = null,
  kind,
}: {
  mood?: MascotMood;
  size?: number;
  label?: string;
  /** Trang phục đã mở khóa đang mặc (id trong rewards.ts), null = không mặc. Chỉ Sóc Bo mặc được. */
  outfit?: string | null;
  /** Linh vật cụ thể (xem trước ở Album); bỏ trống = linh vật bé đang dùng (app/mascotKind.ts). */
  kind?: MascotKind;
}) {
  const which = kind ?? mascotKind.value;
  if (which === 'owl') return <Owl mood={mood} size={size} label={label} />;
  return (
    <svg
      class={`mascot mascot-${mood}`}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label={label ?? vi.app.mascot}
    >
      {outfit && <OutfitDefs />}
      {outfit && <OutfitBack outfit={outfit} />}
      {/* đuôi to */}
      <path
        d="M132 168 C 206 160, 212 70, 160 52 C 178 86, 152 104, 128 112 Z"
        fill="#E8742F"
        stroke={OUTLINE}
        stroke-width="2.5"
        stroke-linejoin="round"
      />
      <path
        d="M160 62 C 190 80, 184 130, 144 150"
        fill="none"
        stroke="#FFB27A"
        stroke-width="6"
        stroke-linecap="round"
      />
      {/* thân + bụng */}
      <ellipse
        cx="100"
        cy="150"
        rx="46"
        ry="40"
        fill="#FF8A3D"
        stroke={OUTLINE}
        stroke-width="2.5"
      />
      <ellipse cx="100" cy="158" rx="28" ry="26" fill="#FFE0B8" />
      {outfit && <OutfitBody outfit={outfit} />}
      <Arms mood={mood} />
      {/* tai */}
      <circle cx="62" cy="46" r="15" fill="#FF9A52" stroke={OUTLINE} stroke-width="2.5" />
      <circle cx="138" cy="46" r="15" fill="#FF9A52" stroke={OUTLINE} stroke-width="2.5" />
      <circle cx="62" cy="47" r="7" fill="#FFC9A0" />
      <circle cx="138" cy="47" r="7" fill="#FFC9A0" />
      {/* đầu */}
      <circle cx="100" cy="86" r="48" fill="#FF9A52" stroke={OUTLINE} stroke-width="2.5" />
      <ellipse cx="100" cy="102" rx="27" ry="21" fill="#FFE0B8" />
      <ellipse cx="68" cy="99" rx="7" ry="5.5" fill="#FF7B7B" opacity="0.55" />
      <ellipse cx="132" cy="99" rx="7" ry="5.5" fill="#FF7B7B" opacity="0.55" />
      <Eyes mood={mood} />
      <ellipse cx="100" cy="93" rx="6" ry="4.5" fill={OUTLINE} />
      <Mouth mood={mood} />
      {mood === 'surprised' && (
        <g fill="none" stroke={OUTLINE} stroke-width="3" stroke-linecap="round">
          <path d="M70 62 Q80 56 90 62" />
          <path d="M110 62 Q120 56 130 62" />
        </g>
      )}
      {outfit && <OutfitHead outfit={outfit} />}
      {mood === 'sleep' && (
        <g
          class="mascot-zzz"
          fill="none"
          stroke="#7E57C2"
          stroke-width="3.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M142 38 h14 l-14 15 h14" />
          <path d="M162 18 h10 l-10 11 h10" />
        </g>
      )}
    </svg>
  );
}
