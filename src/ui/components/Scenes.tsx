// Hình nền tự vẽ (SVG, khung 400×220, co giãn kiểu “cover”): Rừng Kẹo và Đáy Biển.
// Gradient có tiền tố `sc-`; id trùng giữa nhiều thẻ xem trước là an toàn (nội dung giống hệt).
const INK = '#37474F';

/** Đường xoắn ốc (kẹo mút) tính sẵn bằng JS: không dùng random, kết quả cố định. */
function spiral(cx: number, cy: number, radius: number, turns = 2.6): string {
  const steps = 44;
  let d = `M${cx} ${cy}`;
  for (let i = 1; i <= steps; i++) {
    const t = (i / steps) * turns * Math.PI * 2;
    const r = (radius * 0.92 * i) / steps;
    d += ` L${(cx + Math.cos(t) * r).toFixed(1)} ${(cy + Math.sin(t) * r).toFixed(1)}`;
  }
  return d;
}

function Lollipop({ x, y, r, a, b }: { x: number; y: number; r: number; a: string; b: string }) {
  const id = `sc-lp-${a.slice(1)}${b.slice(1)}`;
  return (
    <g>
      <defs>
        <radialGradient id={id} cx="0.35" cy="0.3" r="0.9">
          <stop offset="0" stop-color={b} />
          <stop offset="1" stop-color={a} />
        </radialGradient>
      </defs>
      <rect
        x={x - 3.2}
        y={y}
        width="6.4"
        height={190 - y}
        rx="3"
        fill="#fff"
        stroke={INK}
        stroke-width="2"
      />
      <path
        d={`M${x - 3.2} ${y + 14} l6.4 -6 M${x - 3.2} ${y + 30} l6.4 -6`}
        stroke="#FF8FB8"
        stroke-width="2.4"
      />
      <circle cx={x} cy={y} r={r} fill={`url(#${id})`} stroke={INK} stroke-width="2.4" />
      <path
        d={spiral(x, y, r)}
        fill="none"
        stroke="#fff"
        stroke-width={Math.max(2.4, r * 0.2)}
        stroke-linecap="round"
        opacity="0.88"
      />
      <ellipse
        cx={x - r * 0.38}
        cy={y - r * 0.42}
        rx={r * 0.22}
        ry={r * 0.13}
        fill="#fff"
        opacity="0.8"
        transform={`rotate(-35 ${x - r * 0.38} ${y - r * 0.42})`}
      />
    </g>
  );
}

function CandyCane({ x, y, h }: { x: number; y: number; h: number }) {
  const d = `M${x} ${y} V${y - h} a11 11 0 0 1 22 0`;
  return (
    <g fill="none" stroke-linecap="round">
      <path d={d} stroke={INK} stroke-width="12" />
      <path d={d} stroke="#fff" stroke-width="8" />
      <path d={d} stroke="#FF4D6D" stroke-width="8" stroke-dasharray="6 9" />
    </g>
  );
}

function Gumdrop({ x, y, w, c1, c2 }: { x: number; y: number; w: number; c1: string; c2: string }) {
  const id = `sc-gd-${c1.slice(1)}`;
  return (
    <g>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color={c2} />
          <stop offset="1" stop-color={c1} />
        </linearGradient>
      </defs>
      <path
        d={`M${x} ${y} a${w / 2} ${w * 0.42} 0 0 1 ${w} 0 Z`}
        fill={`url(#${id})`}
        stroke={INK}
        stroke-width="2"
        stroke-linejoin="round"
      />
      <path
        d={`M${x + w * 0.2} ${y - w * 0.12} q${w * 0.12} -${w * 0.16} ${w * 0.3} -${w * 0.17}`}
        fill="none"
        stroke="#fff"
        stroke-width="2.4"
        stroke-linecap="round"
        opacity="0.85"
      />
    </g>
  );
}

const SPRINKLE_COLORS = ['#FF4D8D', '#FFD93D', '#29B6F6', '#8E6CF0', '#fff', '#FF8A3D'];

function Sprinkles() {
  return (
    <g>
      {Array.from({ length: 34 }, (_, i) => {
        const x = (i * 97 + 23) % 400;
        const y = 178 + ((i * 53) % 38);
        const rot = (i * 71) % 180;
        return (
          <rect
            key={i}
            x={x}
            y={y}
            width="7"
            height="2.6"
            rx="1.3"
            fill={SPRINKLE_COLORS[i % SPRINKLE_COLORS.length]}
            transform={`rotate(${rot} ${x} ${y})`}
          />
        );
      })}
    </g>
  );
}

function CandyForest() {
  return (
    <svg
      class="scene"
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sc-candy-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#8FD8FF" />
          <stop offset="0.55" stop-color="#FFC9E8" />
          <stop offset="1" stop-color="#FFF1BC" />
        </linearGradient>
        <linearGradient id="sc-candy-hill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#C9A8FF" />
          <stop offset="1" stop-color="#9F7BFF" />
        </linearGradient>
        <linearGradient id="sc-candy-ground" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#9BF0C0" />
          <stop offset="1" stop-color="#3FD596" />
        </linearGradient>
      </defs>
      <rect width="400" height="220" fill="url(#sc-candy-sky)" />
      {/* cầu vồng */}
      <g fill="none" stroke-width="7" opacity="0.9">
        <path d="M60 176 A140 140 0 0 1 340 176" stroke="#FF5C7A" />
        <path d="M67 176 A133 133 0 0 1 333 176" stroke="#FF9F43" />
        <path d="M74 176 A126 126 0 0 1 326 176" stroke="#FFE066" />
        <path d="M81 176 A119 119 0 0 1 319 176" stroke="#5CE08A" />
        <path d="M88 176 A112 112 0 0 1 312 176" stroke="#4DB8FF" />
        <path d="M95 176 A105 105 0 0 1 305 176" stroke="#9B7BFF" />
      </g>
      {/* mây kem */}
      <g fill="#fff" stroke={INK} stroke-width="2" stroke-linejoin="round">
        <path d="M30 70 a14 14 0 0 1 14 -14 a18 18 0 0 1 34 4 a12 12 0 0 1 4 24 H40 a10 10 0 0 1 -10 -14 Z" />
        <path d="M300 44 a12 12 0 0 1 12 -12 a16 16 0 0 1 30 4 a11 11 0 0 1 4 21 H310 a9 9 0 0 1 -10 -13 Z" />
      </g>
      {/* đồi tím */}
      <path
        d="M-10 190 Q40 120 100 160 Q150 110 210 156 Q270 112 330 156 Q372 130 420 170 V220 H-10 Z"
        fill="url(#sc-candy-hill)"
        stroke={INK}
        stroke-width="2"
      />
      <Gumdrop x={18} y={150} w={26} c1="#FF4D8D" c2="#FF9CC2" />
      <Gumdrop x={352} y={150} w={30} c1="#29B6F6" c2="#9BE3FF" />
      <CandyCane x={118} y={175} h={52} />
      <CandyCane x={284} y={175} h={44} />
      <Lollipop x={64} y={88} r={30} a="#FF4D8D" b="#FFB3D1" />
      <Lollipop x={340} y={80} r={34} a="#8E6CF0" b="#D5C6FF" />
      <Lollipop x={200} y={110} r={20} a="#FFB300" b="#FFE680" />
      <Lollipop x={162} y={124} r={14} a="#18C9B9" b="#A5F3EA" />
      <Lollipop x={252} y={128} r={13} a="#FF8A3D" b="#FFD0A8" />
      {/* nền kem xanh bạc hà */}
      <path
        d="M-10 184 Q50 170 110 182 T230 180 T350 178 T420 184 V222 H-10 Z"
        fill="url(#sc-candy-ground)"
        stroke={INK}
        stroke-width="2.4"
        stroke-linejoin="round"
      />
      <path
        d="M-10 186 Q50 174 110 184 T230 182 T350 180 T420 186"
        fill="none"
        stroke="#fff"
        stroke-width="5"
        stroke-linecap="round"
        opacity="0.85"
      />
      <Sprinkles />
      <Gumdrop x={92} y={196} w={22} c1="#FFB300" c2="#FFE680" />
      <Gumdrop x={300} y={198} w={24} c1="#FF4D8D" c2="#FF9CC2" />
    </svg>
  );
}

function Fish({
  x,
  y,
  s,
  flip = false,
  c1,
  c2,
}: {
  x: number;
  y: number;
  s: number;
  flip?: boolean;
  c1: string;
  c2: string;
}) {
  const id = `sc-fish-${c1.slice(1)}`;
  return (
    <g
      transform={`translate(${x} ${y}) scale(${flip ? -s : s} ${s})`}
      stroke={INK}
      stroke-width="2"
      stroke-linejoin="round"
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color={c1} />
          <stop offset="1" stop-color={c2} />
        </linearGradient>
      </defs>
      <path d="M-16 0 L-30 -12 Q-26 0 -30 12 Z" fill={c2} />
      <path d="M-4 -12 Q4 -22 12 -12 Z" fill={c2} />
      <ellipse cx="0" cy="0" rx="20" ry="13" fill={`url(#${id})`} />
      <path d="M-6 -12 Q-2 0 -6 12" fill="none" stroke="#fff" stroke-width="3" opacity="0.8" />
      <circle cx="11" cy="-3" r="3.6" fill="#fff" />
      <circle cx="12" cy="-3" r="1.8" fill="#263238" stroke="none" />
      <path d="M17 5 q-3 2 -6 0" fill="none" stroke-linecap="round" />
    </g>
  );
}

function SeaFloor() {
  return (
    <svg
      class="scene"
      viewBox="0 0 400 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="sc-sea-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#6FE6FF" />
          <stop offset="0.5" stop-color="#1FA0EC" />
          <stop offset="1" stop-color="#1A56C6" />
        </linearGradient>
        <linearGradient id="sc-sea-sand" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FFEDB5" />
          <stop offset="1" stop-color="#F2C066" />
        </linearGradient>
        <linearGradient id="sc-sea-coral" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FF9CC8" />
          <stop offset="1" stop-color="#FF4D8D" />
        </linearGradient>
        <linearGradient id="sc-sea-fan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="#FFD27A" />
          <stop offset="1" stop-color="#FF8A3D" />
        </linearGradient>
        <radialGradient id="sc-sea-jelly" cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stop-color="#F3E8FF" />
          <stop offset="1" stop-color="#B07CFF" />
        </radialGradient>
      </defs>
      <rect width="400" height="220" fill="url(#sc-sea-water)" />
      {/* tia nắng */}
      <g fill="#fff" opacity="0.14">
        <path d="M60 0 L110 0 L170 190 L90 190 Z" />
        <path d="M170 0 L205 0 L260 190 L200 190 Z" />
        <path d="M290 0 L330 0 L370 190 L300 190 Z" />
      </g>
      {/* bong bóng */}
      <g fill="#fff" fill-opacity="0.18" stroke="#fff" stroke-width="1.6" stroke-opacity="0.85">
        <circle cx="48" cy="60" r="7" />
        <circle cx="62" cy="38" r="4.5" />
        <circle cx="146" cy="84" r="5" />
        <circle cx="236" cy="44" r="6.5" />
        <circle cx="250" cy="70" r="3.6" />
        <circle cx="372" cy="110" r="6" />
        <circle cx="352" cy="132" r="3.6" />
      </g>
      {/* sứa */}
      <g stroke={INK} stroke-width="2" stroke-linejoin="round">
        <path
          d="M296 70 q-2 -24 22 -24 q24 0 22 24 q-22 8 -44 0 Z"
          fill="url(#sc-sea-jelly)"
          fill-opacity="0.92"
        />
        <path
          d="M304 72 q-4 14 2 24 M318 74 q4 14 -2 28 M332 72 q4 12 -1 22"
          fill="none"
          stroke="#C6A0FF"
          stroke-width="3"
          stroke-linecap="round"
        />
        <ellipse cx="308" cy="56" rx="6" ry="3" fill="#fff" opacity="0.7" stroke="none" />
      </g>
      {/* cá */}
      <Fish x={92} y={96} s={1.15} c1="#FFE45C" c2="#FF9F1C" />
      <Fish x={206} y={128} s={0.85} flip c1="#7CF0D0" c2="#1CA7A0" />
      <Fish x={330} y={160} s={1} c1="#FF9CC8" c2="#B84DE0" />
      {/* san hô + rong */}
      <g stroke={INK} stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
        <path
          d="M40 200 q-12 -26 4 -48 M44 176 q18 -8 22 -26 M42 168 q-14 -4 -18 -20"
          fill="none"
          stroke={INK}
          stroke-width="13"
        />
        <path
          d="M40 200 q-12 -26 4 -48 M44 176 q18 -8 22 -26 M42 168 q-14 -4 -18 -20"
          fill="none"
          stroke="#FF5FA2"
          stroke-width="8.5"
        />
        <path
          d="M150 204 q-4 -34 8 -58 q8 18 4 34 q10 -16 20 -22 q0 28 -14 46 Z"
          fill="url(#sc-sea-fan)"
        />
        <path
          d="M250 206 q-8 -30 6 -52 M262 204 q2 -32 14 -46 M274 206 q8 -24 22 -36"
          fill="none"
          stroke={INK}
          stroke-width="11"
        />
        <path
          d="M250 206 q-8 -30 6 -52 M262 204 q2 -32 14 -46 M274 206 q8 -24 22 -36"
          fill="none"
          stroke="#2BD670"
          stroke-width="6.5"
        />
        <path
          d="M356 206 q-10 -20 0 -40 q10 -18 0 -36"
          fill="none"
          stroke={INK}
          stroke-width="11"
        />
        <path
          d="M356 206 q-10 -20 0 -40 q10 -18 0 -36"
          fill="none"
          stroke="#1FBF63"
          stroke-width="6.5"
        />
      </g>
      {/* cát */}
      <path
        d="M-10 196 Q60 184 130 194 T270 192 T420 190 V222 H-10 Z"
        fill="url(#sc-sea-sand)"
        stroke={INK}
        stroke-width="2.4"
        stroke-linejoin="round"
      />
      <g fill="#fff" opacity="0.55">
        <circle cx="30" cy="208" r="2.4" />
        <circle cx="120" cy="212" r="2" />
        <circle cx="210" cy="209" r="2.6" />
        <circle cx="320" cy="212" r="2.2" />
      </g>
      {/* sao biển */}
      <path
        d="M96 204 l4 -9 l4 9 l9 1 l-7 6 l2 9 l-8 -5 l-8 5 l2 -9 l-7 -6 Z"
        fill="#FF8A3D"
        stroke={INK}
        stroke-width="2"
        stroke-linejoin="round"
        transform="translate(0 -4)"
      />
      <ellipse cx="196" cy="206" rx="9" ry="6" fill="#fff" stroke={INK} stroke-width="2" />
      <path d="M190 206 q6 -4 12 0" fill="none" stroke="#FF8FB8" stroke-width="2" />
    </svg>
  );
}

/** Hình nền theo id phần thưởng (bg-candy / bg-sea). */
export function Scene({ id }: { id: string }) {
  if (id === 'bg-candy') return <CandyForest />;
  if (id === 'bg-sea') return <SeaFloor />;
  return null;
}
