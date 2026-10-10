// Icon nhỏ cho thanh công cụ (SVG tự vẽ, nét 2.5px).
const common = {
  width: 28,
  height: 28,
  viewBox: '0 0 32 32',
  fill: 'none',
  stroke: 'currentColor',
  'stroke-width': 2.5,
  'stroke-linecap': 'round' as const,
  'stroke-linejoin': 'round' as const,
  'aria-hidden': true,
};

export function IconAlbum() {
  return (
    <svg {...common}>
      <rect x="5" y="5" width="22" height="22" rx="4" />
      <path d="M11 5 V27" />
      <path d="M17 13 L20 10 L23 13 L20 17 Z" />
    </svg>
  );
}

export function IconSwitch() {
  return (
    <svg {...common}>
      <circle cx="11" cy="11" r="4" />
      <circle cx="22" cy="12" r="3" />
      <path d="M4 26 Q4 17 11 17 Q18 17 18 26" />
      <path d="M20 26 Q20 19 25 19 Q29 19 29 25" />
    </svg>
  );
}

export function IconLock() {
  return (
    <svg {...common}>
      <rect x="7" y="14" width="18" height="13" rx="3" />
      <path d="M11 14 V10 Q11 5 16 5 Q21 5 21 10 V14" />
      <circle cx="16" cy="20.5" r="1.6" fill="currentColor" />
    </svg>
  );
}

export function IconPause() {
  return (
    <svg {...common}>
      <path d="M11 8 V24 M21 8 V24" stroke-width="4" />
    </svg>
  );
}

export function IconBack() {
  return (
    <svg {...common}>
      <path d="M19 6 L9 16 L19 26" />
    </svg>
  );
}

export function IconCheck() {
  return (
    <svg {...common}>
      <path d="M7 17 L13 23 L25 9" />
    </svg>
  );
}
