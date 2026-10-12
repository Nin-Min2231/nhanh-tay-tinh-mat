import { vi } from '../../i18n/vi';
import type { MascotMood } from './Mascot';

// Linh vật thứ 2 “Cú Mèo Thông Thái” (mở khóa ở 230 sao) – SVG tự vẽ, cùng khung 200×200 và cùng 5 biểu cảm với Sóc Bo.
// Phong cách “bóng bẩy” như sticker: chuyển sắc, vệt sáng, viền mềm. Màu luôn đi kèm hình (kính tròn, mỏ, tai lông).
const OUT = '#3B2A78';
const SW = 2.6;
const INK = '#2A2150';

function Defs() {
  return (
    <defs>
      <linearGradient id="ow-body" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#BFA8FF" />
        <stop offset="0.55" stop-color="#8E6BF3" />
        <stop offset="1" stop-color="#6141D0" />
      </linearGradient>
      <linearGradient id="ow-tuft" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#C9B6FF" />
        <stop offset="1" stop-color="#8E6BF3" />
      </linearGradient>
      <linearGradient id="ow-wing" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#8460EE" />
        <stop offset="1" stop-color="#4A2FB0" />
      </linearGradient>
      <radialGradient id="ow-belly" cx="50%" cy="30%" r="75%">
        <stop offset="0" stop-color="#FFFCEC" />
        <stop offset="1" stop-color="#FFE3A8" />
      </radialGradient>
      <radialGradient id="ow-face" cx="50%" cy="42%" r="62%">
        <stop offset="0" stop-color="#FFFFFF" />
        <stop offset="0.72" stop-color="#FFF4DC" />
        <stop offset="1" stop-color="#F4DAA2" />
      </radialGradient>
      <radialGradient id="ow-iris" cx="42%" cy="36%" r="70%">
        <stop offset="0" stop-color="#FFF0A0" />
        <stop offset="0.5" stop-color="#FFC107" />
        <stop offset="1" stop-color="#E67E00" />
      </radialGradient>
      <linearGradient id="ow-beak" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFD866" />
        <stop offset="1" stop-color="#F28100" />
      </linearGradient>
      <linearGradient id="ow-feet" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFC857" />
        <stop offset="1" stop-color="#EE8208" />
      </linearGradient>
    </defs>
  );
}

/** Cánh: xuôi theo thân, giơ lên chào, hoặc giơ cả hai lên cổ vũ. */
function Wing({ side, raised, wave }: { side: 'l' | 'r'; raised: boolean; wave?: boolean }) {
  const right = side === 'r';
  const down = right
    ? 'M148 102 C 176 110, 180 152, 164 178 C 150 170, 142 152, 142 128 Z'
    : 'M52 102 C 24 110, 20 152, 36 178 C 50 170, 58 152, 58 128 Z';
  // cánh giơ lên: rộng, đầu cánh có 3 chùm lông
  const up = right
    ? 'M148 110 C 178 108, 198 88, 194 58 C 190 52, 184 52, 181 56 C 180 46, 172 42, 167 46 C 162 52, 158 58, 152 66 C 146 78, 140 92, 142 108 Z'
    : 'M52 110 C 22 108, 2 88, 6 58 C 10 52, 16 52, 19 56 C 20 46, 28 42, 33 46 C 38 52, 42 58, 48 66 C 54 78, 60 92, 58 108 Z';
  const lines = raised
    ? right
      ? 'M150 102 C 166 96, 180 84, 188 64 M146 98 C 158 88, 168 74, 172 56 M144 100 C 152 90, 158 80, 160 70'
      : 'M50 102 C 34 96, 20 84, 12 64 M54 98 C 42 88, 32 74, 28 56 M56 100 C 48 90, 42 80, 40 70'
    : right
      ? 'M166 126 C 168 144, 166 158, 160 170 M156 122 C 158 140, 156 154, 152 164'
      : 'M34 126 C 32 144, 34 158, 40 170 M44 122 C 42 140, 44 154, 48 164';
  const wing = (
    <g>
      <path
        d={raised ? up : down}
        fill="url(#ow-wing)"
        stroke={OUT}
        stroke-width={SW}
        stroke-linejoin="round"
      />
      <path
        d={lines}
        fill="none"
        stroke="#B49CFF"
        stroke-width="2.4"
        stroke-linecap="round"
        opacity="0.8"
      />
    </g>
  );
  return wave ? <g class="owl-wave">{wing}</g> : wing;
}

function Eyes({ mood }: { mood: MascotMood }) {
  if (mood === 'sleep' || mood === 'cheer') {
    // sleep: mắt nhắm cong xuống; cheer: mắt cười cong lên
    const d = mood === 'sleep' ? 'M58 88 Q72 100 86 88' : 'M58 94 Q72 76 86 94';
    const e = mood === 'sleep' ? 'M114 88 Q128 100 142 88' : 'M114 94 Q128 76 142 94';
    return (
      <g fill="none" stroke={INK} stroke-width="4.2" stroke-linecap="round">
        <path d={d} />
        <path d={e} />
      </g>
    );
  }
  const wide = mood === 'surprised';
  const iris = wide ? 17 : 15;
  const pupil = wide ? 5.8 : 8.6;
  return (
    <g>
      {[72, 128].map((cx) => (
        <g key={cx}>
          <circle
            cx={cx}
            cy={90}
            r={iris}
            fill="url(#ow-iris)"
            stroke="#B35A00"
            stroke-width="1.4"
          />
          <circle cx={cx} cy={90} r={pupil} fill={INK} />
          <circle cx={cx + 5} cy={84} r={wide ? 4.2 : 3.4} fill="#fff" />
          <circle cx={cx - 5} cy={96} r="1.8" fill="#fff" opacity="0.9" />
        </g>
      ))}
    </g>
  );
}

function Beak({ mood }: { mood: MascotMood }) {
  const open = mood === 'cheer' || mood === 'surprised';
  return (
    <g stroke-linejoin="round">
      {open && <ellipse cx="100" cy="119" rx="8" ry="7" fill="#7A1F2E" />}
      <path
        d="M91 99 C 91 92, 109 92, 109 99 C 109 108, 104 114, 100 118 C 96 114, 91 108, 91 99 Z"
        fill="url(#ow-beak)"
        stroke="#B35A00"
        stroke-width="2"
      />
      {open && (
        <path
          d="M93 121 Q100 134 107 121 Q100 125 93 121 Z"
          fill="url(#ow-beak)"
          stroke="#B35A00"
          stroke-width="1.8"
        />
      )}
      <ellipse cx="97" cy="97" rx="3.4" ry="2" fill="#fff" opacity="0.6" />
    </g>
  );
}

export function Owl({
  mood = 'happy',
  size = 160,
  label,
}: {
  mood?: MascotMood;
  size?: number;
  label?: string;
}) {
  const raiseL = mood === 'cheer';
  const raiseR = mood === 'cheer' || mood === 'wave';
  return (
    <svg
      class={`mascot mascot-owl mascot-${mood}`}
      width={size}
      height={size}
      viewBox="0 0 200 200"
      role="img"
      aria-label={label ?? vi.app.mascotOwl}
    >
      <Defs />
      {/* chân */}
      <ellipse
        cx="80"
        cy="189"
        rx="15"
        ry="6.5"
        fill="url(#ow-feet)"
        stroke="#B35A00"
        stroke-width="2.2"
      />
      <ellipse
        cx="120"
        cy="189"
        rx="15"
        ry="6.5"
        fill="url(#ow-feet)"
        stroke="#B35A00"
        stroke-width="2.2"
      />
      {/* tai lông */}
      <path
        d="M54 64 C 46 50, 42 32, 46 16 C 60 20, 76 30, 88 46 Z"
        fill="url(#ow-tuft)"
        stroke={OUT}
        stroke-width={SW}
        stroke-linejoin="round"
      />
      <path
        d="M146 64 C 154 50, 158 32, 154 16 C 140 20, 124 30, 112 46 Z"
        fill="url(#ow-tuft)"
        stroke={OUT}
        stroke-width={SW}
        stroke-linejoin="round"
      />
      <path
        d="M58 52 C 54 42, 52 32, 53 24 M142 52 C 146 42, 148 32, 147 24"
        fill="none"
        stroke="#E6DCFF"
        stroke-width="3"
        stroke-linecap="round"
        opacity="0.8"
      />
      {/* thân tròn như quả trứng */}
      <path
        d="M100 34 C 58 34, 40 72, 40 118 C 40 160, 62 192, 100 192 C 138 192, 160 160, 160 118 C 160 72, 142 34, 100 34 Z"
        fill="url(#ow-body)"
        stroke={OUT}
        stroke-width={SW}
        stroke-linejoin="round"
      />
      {/* cánh */}
      <Wing side="l" raised={raiseL} />
      <Wing side="r" raised={raiseR} wave={mood === 'wave'} />
      {/* bụng + vảy lông */}
      <ellipse
        cx="100"
        cy="152"
        rx="37"
        ry="36"
        fill="url(#ow-belly)"
        stroke="#E2B66B"
        stroke-width="1.6"
      />
      <g fill="none" stroke="#E0B060" stroke-width="2.4" stroke-linecap="round">
        <path d="M82 138 q6 8 12 0 M94 138 q6 8 12 0 M106 138 q6 8 12 0" />
        <path d="M76 154 q6 8 12 0 M88 154 q6 8 12 0 M100 154 q6 8 12 0 M112 154 q6 8 12 0" />
        <path d="M82 170 q6 8 12 0 M94 170 q6 8 12 0 M106 170 q6 8 12 0" />
      </g>
      {/* mặt: hai đĩa mắt + kính tròn */}
      <circle cx="72" cy="88" r="27" fill="url(#ow-face)" stroke="#C5B0FF" stroke-width="2.2" />
      <circle cx="128" cy="88" r="27" fill="url(#ow-face)" stroke="#C5B0FF" stroke-width="2.2" />
      <Eyes mood={mood} />
      <g fill="none" stroke="#E0A300" stroke-width="3.4" stroke-linecap="round">
        <circle cx="72" cy="88" r="29" />
        <circle cx="128" cy="88" r="29" />
        <path d="M97 84 Q100 80 103 84" />
        <path d="M43 82 L35 77 M157 82 L165 77" />
      </g>
      <g fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round" opacity="0.7">
        <path d="M52 76 Q56 68 64 64" />
        <path d="M108 76 Q112 68 120 64" />
      </g>
      <Beak mood={mood} />
      {/* má hồng */}
      <ellipse cx="50" cy="118" rx="8" ry="5" fill="#FF8FB1" opacity="0.6" />
      <ellipse cx="150" cy="118" rx="8" ry="5" fill="#FF8FB1" opacity="0.6" />
      {/* vệt sáng */}
      <ellipse
        cx="70"
        cy="48"
        rx="24"
        ry="8"
        transform="rotate(-24 70 48)"
        fill="#fff"
        opacity="0.3"
      />
      <path
        d="M48 124 C 46 140, 50 156, 58 168"
        fill="none"
        stroke="#fff"
        stroke-width="5"
        stroke-linecap="round"
        opacity="0.16"
      />
      {mood === 'sleep' && (
        <g
          class="mascot-zzz"
          fill="none"
          stroke="#7E57C2"
          stroke-width="3.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M150 34 h14 l-14 15 h14" />
          <path d="M170 14 h10 l-10 11 h10" />
        </g>
      )}
    </svg>
  );
}
