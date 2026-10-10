// Trang phục cho linh vật Sóc Bo (SVG tự vẽ, khung 200×200 cùng Mascot). Chia 3 lớp để không che mặt/tay:
//   back = sau đuôi/thân (áo choàng) · body = trên thân, dưới tay (áo, khăn) · head = trên đầu (mũ, mặt nạ).
// Mọi gradient dùng id có tiền tố `mo-` (nội dung giống hệt nên trùng id giữa nhiều Mascot trong trang là an toàn).
const OUTLINE = '#5D4037';

export const OUTFIT_IDS = ['outfit-pilot', 'outfit-hero'] as const;

export function OutfitDefs() {
  return (
    <defs>
      <linearGradient id="mo-leather" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#D98B3A" />
        <stop offset="0.55" stop-color="#A9591C" />
        <stop offset="1" stop-color="#7A3D10" />
      </linearGradient>
      <radialGradient id="mo-glass" cx="0.35" cy="0.3" r="0.8">
        <stop offset="0" stop-color="#E8FBFF" />
        <stop offset="0.45" stop-color="#6FD3FF" />
        <stop offset="1" stop-color="#2A78D6" />
      </radialGradient>
      <linearGradient id="mo-gold" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#FFF1A6" />
        <stop offset="0.5" stop-color="#FFC52E" />
        <stop offset="1" stop-color="#E08A00" />
      </linearGradient>
      <linearGradient id="mo-scarf" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FFFFFF" />
        <stop offset="1" stop-color="#CFE6FF" />
      </linearGradient>
      <linearGradient id="mo-cape" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#FF6B6B" />
        <stop offset="0.6" stop-color="#E53935" />
        <stop offset="1" stop-color="#B71C1C" />
      </linearGradient>
      <linearGradient id="mo-suit" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#6EC1FF" />
        <stop offset="0.55" stop-color="#2D8CF0" />
        <stop offset="1" stop-color="#1759C0" />
      </linearGradient>
      <linearGradient id="mo-mask" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#7C5CFF" />
        <stop offset="1" stop-color="#3B2BB5" />
      </linearGradient>
    </defs>
  );
}

/** Lớp sau cùng (vẽ trước đuôi + thân): áo choàng. */
export function OutfitBack({ outfit }: { outfit: string }) {
  if (outfit !== 'outfit-hero') return null;
  return (
    <g>
      <path
        d="M66 124 C 30 146, 20 182, 36 195 C 70 200, 130 200, 164 195 C 180 182, 170 146, 134 124 Z"
        fill="url(#mo-cape)"
        stroke={OUTLINE}
        stroke-width="2.5"
        stroke-linejoin="round"
      />
      <path
        d="M72 134 C 46 156, 40 178, 50 189"
        fill="none"
        stroke="#FFD54F"
        stroke-width="5"
        stroke-linecap="round"
      />
      <path
        d="M128 134 C 154 156, 160 178, 150 189"
        fill="none"
        stroke="#FFD54F"
        stroke-width="5"
        stroke-linecap="round"
      />
      <path
        d="M56 160 Q52 178 58 190"
        fill="none"
        stroke="#fff"
        stroke-width="4"
        stroke-linecap="round"
        opacity="0.45"
      />
    </g>
  );
}

/** Lớp thân (dưới tay): áo siêu nhân hoặc khăn phi công. */
export function OutfitBody({ outfit }: { outfit: string }) {
  if (outfit === 'outfit-pilot') {
    return (
      <g stroke={OUTLINE} stroke-width="2.4" stroke-linejoin="round">
        <path
          d="M120 150 Q150 148 160 178 Q146 180 136 168 Q130 160 116 156 Z"
          fill="url(#mo-scarf)"
        />
        <path d="M60 132 Q100 156 140 132 L144 148 Q100 172 56 148 Z" fill="url(#mo-scarf)" />
        <path
          d="M70 142 Q100 158 130 142"
          fill="none"
          stroke="#9CC7F5"
          stroke-width="2"
          stroke-linecap="round"
        />
      </g>
    );
  }
  if (outfit === 'outfit-hero') {
    return (
      <g>
        <ellipse
          cx="100"
          cy="150"
          rx="46"
          ry="40"
          fill="url(#mo-suit)"
          stroke={OUTLINE}
          stroke-width="2.5"
        />
        <path
          d="M66 128 Q82 118 96 126"
          fill="none"
          stroke="#fff"
          stroke-width="5"
          stroke-linecap="round"
          opacity="0.4"
        />
        {/* thắt lưng vàng */}
        <path
          d="M66 172 Q100 188 134 172 L136 181 Q100 197 64 181 Z"
          fill="url(#mo-gold)"
          stroke={OUTLINE}
          stroke-width="2.2"
          stroke-linejoin="round"
        />
        {/* huy hiệu hạt dẻ */}
        <circle cx="100" cy="153" r="17" fill="url(#mo-gold)" stroke={OUTLINE} stroke-width="2.4" />
        <ellipse
          cx="100"
          cy="158"
          rx="8.5"
          ry="9.5"
          fill="#E7B26A"
          stroke={OUTLINE}
          stroke-width="1.8"
        />
        <path
          d="M90 154 Q100 142 110 154 Q100 150 90 154 Z"
          fill="#8A4B1F"
          stroke={OUTLINE}
          stroke-width="1.8"
          stroke-linejoin="round"
        />
        <path d="M100 144 v-4" stroke={OUTLINE} stroke-width="2.2" stroke-linecap="round" />
        <circle cx="96" cy="158" r="2" fill="#fff" opacity="0.7" />
        {/* móc áo choàng */}
        <circle cx="76" cy="131" r="5.5" fill="url(#mo-gold)" stroke={OUTLINE} stroke-width="2" />
        <circle cx="124" cy="131" r="5.5" fill="url(#mo-gold)" stroke={OUTLINE} stroke-width="2" />
      </g>
    );
  }
  return null;
}

/** Lớp đầu (trên mặt): mũ phi công + kính, hoặc mặt nạ siêu nhân. */
export function OutfitHead({ outfit }: { outfit: string }) {
  if (outfit === 'outfit-pilot') {
    return (
      <g stroke={OUTLINE} stroke-width="2.5" stroke-linejoin="round">
        {/* tai mũ */}
        <path d="M49 68 C 38 86, 44 106, 60 103 C 71 101, 71 84, 66 66 Z" fill="url(#mo-leather)" />
        <path
          d="M151 68 C 162 86, 156 106, 140 103 C 129 101, 129 84, 134 66 Z"
          fill="url(#mo-leather)"
        />
        <path
          d="M54 80 C 52 90, 54 96, 60 96"
          fill="none"
          stroke="#F3C27A"
          stroke-width="2"
          stroke-linecap="round"
        />
        <path
          d="M146 80 C 148 90, 146 96, 140 96"
          fill="none"
          stroke="#F3C27A"
          stroke-width="2"
          stroke-linecap="round"
        />
        {/* chóp mũ */}
        <path
          d="M49 76 C 44 38, 74 24, 100 24 C 126 24, 156 38, 151 76 C 140 62, 124 56, 100 56 C 76 56, 60 62, 49 76 Z"
          fill="url(#mo-leather)"
        />
        <path
          d="M100 25 C 100 38, 100 47, 100 56"
          fill="none"
          stroke="#F3C27A"
          stroke-width="1.8"
          stroke-dasharray="3 3"
          stroke-linecap="round"
        />
        <ellipse
          cx="78"
          cy="38"
          rx="15"
          ry="5"
          fill="#fff"
          opacity="0.35"
          transform="rotate(-24 78 38)"
          stroke="none"
        />
        {/* dây kính */}
        <path d="M50 66 C 74 56, 126 56, 150 66 L150 74 C 126 64, 74 64, 50 74 Z" fill="#6B3410" />
        <circle cx="100" cy="46" r="5.2" fill="url(#mo-gold)" />
        {/* kính */}
        <rect x="95" y="50" width="10" height="5" rx="2" fill="url(#mo-gold)" />
        <circle cx="81" cy="52" r="12.5" fill="url(#mo-gold)" />
        <circle cx="119" cy="52" r="12.5" fill="url(#mo-gold)" />
        <circle cx="81" cy="52" r="8.6" fill="url(#mo-glass)" />
        <circle cx="119" cy="52" r="8.6" fill="url(#mo-glass)" />
        <path
          d="M76 48 Q79 45 83 46"
          fill="none"
          stroke="#fff"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-opacity="0.9"
        />
        <path
          d="M114 48 Q117 45 121 46"
          fill="none"
          stroke="#fff"
          stroke-width="2.4"
          stroke-linecap="round"
          stroke-opacity="0.9"
        />
      </g>
    );
  }
  if (outfit === 'outfit-hero') {
    return (
      <g>
        <path
          fill="url(#mo-mask)"
          stroke={OUTLINE}
          stroke-width="2.4"
          stroke-linejoin="round"
          fill-rule="evenodd"
          d="M54 72 C 70 58, 90 62, 100 72 C 110 62, 130 58, 146 72 C 154 90, 136 98, 120 95 C 110 94, 104 88, 100 86 C 96 88, 90 94, 80 95 C 64 98, 46 90, 54 72 Z M68 79 a12 9.5 0 1 0 24 0 a12 9.5 0 1 0 -24 0 Z M108 79 a12 9.5 0 1 0 24 0 a12 9.5 0 1 0 -24 0 Z"
        />
        <path
          d="M60 70 Q74 62 88 68"
          fill="none"
          stroke="#fff"
          stroke-width="3"
          stroke-linecap="round"
          opacity="0.55"
        />
        <path
          d="M112 68 Q126 62 140 70"
          fill="none"
          stroke="#fff"
          stroke-width="3"
          stroke-linecap="round"
          opacity="0.4"
        />
      </g>
    );
  }
  return null;
}
