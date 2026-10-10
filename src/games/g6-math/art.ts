// G6 – hình vẽ SVG tự thiết kế: táo bóng bẩy (4 màu), giỏ đan. Chuyển sắc, vệt sáng, viền mềm.

/** 4 kiểu táo: đỏ, xanh, vàng cam, hồng. [sáng, vừa, tối, viền]. */
const APPLES: readonly (readonly [string, string, string, string])[] = [
  ['#ff9a8f', '#ec3b3b', '#b01e2a', '#7d1020'],
  ['#d9ff9f', '#7cc63d', '#3c8a1f', '#25601a'],
  ['#fff3a0', '#ffb62e', '#e8670c', '#a8430a'],
  ['#ffc2dc', '#f0508f', '#b81f66', '#7e1245'],
];

export const APPLE_KINDS = APPLES.length;

/** Khối <defs> dùng chung cho cả vùng chơi (chèn 1 lần, ẩn). */
export function appleDefs(): string {
  const grads = APPLES.map(
    ([light, mid, dark], i) =>
      `<radialGradient id="g6-ap${i}" cx="34%" cy="30%" r="82%">
        <stop offset="0" stop-color="${light}"/><stop offset="0.5" stop-color="${mid}"/><stop offset="1" stop-color="${dark}"/>
      </radialGradient>`,
  ).join('');
  return `<svg class="g6-defs" width="0" height="0" aria-hidden="true" focusable="false">
    <defs>
      ${grads}
      <linearGradient id="g6-leaf" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0" stop-color="#b6f06a"/><stop offset="1" stop-color="#2f9e3a"/>
      </linearGradient>
      <linearGradient id="g6-wicker" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#f6c777"/><stop offset="1" stop-color="#b9772a"/>
      </linearGradient>
      <pattern id="g6-weave" width="14" height="12" patternUnits="userSpaceOnUse">
        <path d="M0 6 H14 M3 0 V12 M10 0 V12" stroke="#8a5420" stroke-opacity="0.55" stroke-width="2" fill="none"/>
      </pattern>
    </defs>
  </svg>`;
}

/** Quả táo (viewBox 100×110). `kind` 0–3. Số ghi lên quả là phần tử HTML đè lên, không nằm trong SVG. */
export function appleSvg(kind: number): string {
  const [, , , line] = APPLES[kind % APPLES.length] as (typeof APPLES)[number];
  return `<svg class="g6-apple-art" viewBox="0 0 100 110" aria-hidden="true" focusable="false">
    <ellipse cx="50" cy="104" rx="30" ry="5" fill="rgba(38,50,56,0.18)"/>
    <path d="M50 30 C 31 15, 6 27, 8 57 C 10 85, 30 103, 50 99 C 70 103, 90 85, 92 57 C 94 27, 69 15, 50 30 Z"
      fill="url(#g6-ap${kind % APPLES.length})" stroke="${line}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M50 31 C 50 21, 53 14, 60 8" fill="none" stroke="#6d4320" stroke-width="5" stroke-linecap="round"/>
    <path d="M56 17 C 64 3, 82 5, 87 14 C 78 24, 62 24, 56 17 Z" fill="url(#g6-leaf)" stroke="#2c6b27" stroke-width="2.5" stroke-linejoin="round"/>
    <path d="M60 17 C 68 13, 76 12, 83 14" fill="none" stroke="#2c6b27" stroke-opacity="0.55" stroke-width="1.6" stroke-linecap="round"/>
    <ellipse cx="29" cy="44" rx="11" ry="6.5" transform="rotate(-38 29 44)" fill="#fff" fill-opacity="0.55"/>
    <circle cx="22" cy="58" r="3" fill="#fff" fill-opacity="0.45"/>
    <path d="M70 92 C 80 86, 88 74, 89 62" fill="none" stroke="#000" stroke-opacity="0.12" stroke-width="5" stroke-linecap="round"/>
  </svg>`;
}

/** Giỏ đan (viewBox 160×100). */
export function basketSvg(): string {
  return `<svg class="g6-basket-art" viewBox="0 0 160 100" aria-hidden="true" focusable="false">
    <path d="M26 44 C 26 6, 134 6, 134 44" fill="none" stroke="#9a5d1c" stroke-width="7" stroke-linecap="round"/>
    <path d="M26 44 C 26 12, 134 12, 134 44" fill="none" stroke="#f0b862" stroke-width="3" stroke-linecap="round" stroke-opacity="0.8"/>
    <path d="M12 46 H148 L132 92 Q130 97 124 97 H36 Q30 97 28 92 Z" fill="url(#g6-wicker)" stroke="#7a4513" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M12 46 H148 L132 92 Q130 97 124 97 H36 Q30 97 28 92 Z" fill="url(#g6-weave)"/>
    <rect x="8" y="40" width="144" height="13" rx="6.5" fill="#f4c56d" stroke="#7a4513" stroke-width="3.5"/>
    <rect x="16" y="43" width="60" height="3" rx="1.5" fill="#fff" fill-opacity="0.55"/>
  </svg>`;
}
