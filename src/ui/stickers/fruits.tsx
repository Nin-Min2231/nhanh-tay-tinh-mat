// Sticker chủ đề trái cây: stk-11 … stk-20 (11–16 Thường · 17–19 Hiếm · 20 Siêu hiếm). Khung 100×100, vùng an toàn [14, 86].
import { GroundShadow, INK, Lin, Rad, Shine, Sparkle, type ArtFn } from './kit';

/** stk-11 Táo đỏ – bản mẫu phong cách. */
const apple: ArtFn = (u) => (
  <>
    <defs>
      <Rad
        id={u('skin')}
        cx={0.34}
        cy={0.3}
        r={0.85}
        stops={[
          [0, '#FF9A8A'],
          [0.38, '#F2352F'],
          [1, '#B3121F'],
        ]}
      />
      <Lin
        id={u('leaf')}
        x1={0}
        y1={1}
        x2={1}
        y2={0}
        stops={[
          [0, '#2FAE3F'],
          [1, '#8EE05A'],
        ]}
      />
    </defs>
    <GroundShadow y={86} rx={24} />
    <path
      d="M50 31 C 38 22, 17 29, 18 53 C 19 73, 34 89, 50 82 C 66 89, 81 73, 82 53 C 83 29, 62 22, 50 31 Z"
      fill={`url(#${u('skin')})`}
      stroke={INK}
      stroke-width="2.6"
      stroke-linejoin="round"
    />
    <path
      d="M50 31 Q48 37 50 42"
      fill="none"
      stroke="#8F0F1B"
      stroke-width="2.4"
      stroke-linecap="round"
      opacity="0.6"
    />
    {/* cuống + lá */}
    <path
      d="M50 30 Q49 20 56 13"
      fill="none"
      stroke={INK}
      stroke-width="6.6"
      stroke-linecap="round"
    />
    <path
      d="M50 30 Q49 20 56 13"
      fill="none"
      stroke="#8B5A2B"
      stroke-width="3.6"
      stroke-linecap="round"
    />
    <path
      d="M55 22 C 62 10, 78 10, 84 17 C 77 28, 62 30, 55 22 Z"
      fill={`url(#${u('leaf')})`}
      stroke={INK}
      stroke-width="2.2"
      stroke-linejoin="round"
    />
    <path
      d="M58 22 Q70 17 80 17"
      fill="none"
      stroke="#1E7F2B"
      stroke-width="1.6"
      stroke-linecap="round"
    />
    {/* vệt sáng */}
    <path
      d="M26 44 Q27 35 35 32"
      fill="none"
      stroke="#fff"
      stroke-width="5"
      stroke-linecap="round"
      opacity="0.75"
    />
    <Shine x={30} y={55} rx={2.6} ry={4.6} rot={10} opacity={0.6} />
    <Sparkle x={70} y={42} s={4} opacity={0.9} />
    <path
      d="M30 72 Q42 82 56 80"
      fill="none"
      stroke="#7A0C16"
      stroke-width="3"
      stroke-linecap="round"
      opacity="0.28"
    />
  </>
);

// ---------- tiện ích dùng chung cho các sticker bên dưới ----------
const ref = (id: string) => `url(#${id})`;
const r1 = (v: number) => Math.round(v * 10) / 10;
const rad = (deg: number) => (deg * Math.PI) / 180;
/** Nét viền chuẩn (ghi đè stroke-width khi cần). */
const LINE = {
  stroke: INK,
  'stroke-width': 2.4,
  'stroke-linejoin': 'round',
  'stroke-linecap': 'round',
} as const;

/** stk-12 Chuối – nải 3 quả. */
const BANANA = 'M20 36 C18 70 54 88 85 48 Q87 44 82 43 C60 62 36 57 31 37 Z';
const banana: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('skin')}
        stops={[
          [0, '#FFF78F'],
          [0.5, '#FFDA2B'],
          [1, '#F2A200'],
        ]}
      />
      <Lin
        id={u('crown')}
        x1={0}
        y1={0}
        x2={1}
        y2={1}
        stops={[
          [0, '#B89455'],
          [1, '#6E4B22'],
        ]}
      />
    </defs>
    <GroundShadow y={86} rx={26} />
    <g transform="translate(1 5) scale(0.97)">
      {[30, 15, 0].map((a) => (
        <g key={a} transform={`rotate(${a} 25 36)`}>
          <path d={BANANA} fill={ref(u('skin'))} {...LINE} />
          <path
            d="M25 41 C27 62 53 75 79 48"
            fill="none"
            stroke="#DB9000"
            stroke-width="1.6"
            stroke-linecap="round"
            opacity="0.55"
          />
          <path
            d="M27 51 C31 63 44 68 57 66"
            fill="none"
            stroke="#fff"
            stroke-width="3"
            stroke-linecap="round"
            opacity="0.7"
          />
          <path
            d="M82 43 Q90 42 88 49 Q86 52 83 49 Z"
            fill="#6B4423"
            {...LINE}
            stroke-width="1.8"
          />
          <path
            d="M20 36 L31 37 L30 30 Q25 27 21 30 Z"
            fill="#A58B3A"
            {...LINE}
            stroke-width="1.8"
          />
        </g>
      ))}
      {/* cuống chung */}
      <path
        d="M23 29 Q21 21 26 16"
        fill="none"
        stroke={INK}
        stroke-width="6.6"
        stroke-linecap="round"
      />
      <path
        d="M23 29 Q21 21 26 16"
        fill="none"
        stroke="#8A6A32"
        stroke-width="3.4"
        stroke-linecap="round"
      />
      <ellipse
        cx="25.5"
        cy="32"
        rx="8"
        ry="5.8"
        fill={ref(u('crown'))}
        {...LINE}
        stroke-width="2.2"
      />
    </g>
  </>
);

/** stk-13 Dâu tây. */
const STRAW =
  'M50 86 C26 76 15 54 18 41 C20 28 36 26 50 33 C64 26 80 28 82 41 C85 54 74 76 50 86 Z';
const LEAF = 'M0 0 C5 -6 17 -7 25 -1 C17 5 5 5 0 0 Z';
const SEEDS: readonly (readonly [number, number])[] = [
  [38, 46],
  [62, 46],
  [74, 46],
  [32, 55],
  [44, 56],
  [56, 56],
  [68, 55],
  [26, 64],
  [38, 64],
  [50, 64],
  [62, 64],
  [74, 64],
  [38, 73],
  [50, 73],
  [62, 73],
  [50, 81],
];
const strawberry: ArtFn = (u) => (
  <>
    <defs>
      <Rad
        id={u('skin')}
        cx={0.36}
        cy={0.32}
        r={0.85}
        stops={[
          [0, '#FF8A7A'],
          [0.4, '#EE2B3B'],
          [1, '#A50F26'],
        ]}
      />
      <Lin
        id={u('leaf')}
        x1={0}
        y1={0}
        x2={1}
        y2={0}
        stops={[
          [0, '#1F9A3B'],
          [1, '#8BE35A'],
        ]}
      />
    </defs>
    <GroundShadow y={87} rx={22} />
    {/* lá đài phía sau */}
    {[205, 335].map((a) => (
      <path
        key={a}
        d={LEAF}
        transform={`translate(50 33) rotate(${a}) scale(0.95)`}
        fill={ref(u('leaf'))}
        {...LINE}
        stroke-width="2"
      />
    ))}
    <path d={STRAW} fill={ref(u('skin'))} {...LINE} stroke-width="2.6" />
    {/* hạt vàng */}
    <g fill="#FFE680" stroke="#C98A12" stroke-width="0.8">
      {SEEDS.map(([x, y]) => (
        <ellipse
          key={`${x}-${y}`}
          cx={x}
          cy={y}
          rx="1.7"
          ry="2.6"
          transform={`rotate(${r1((x - 50) * 0.55)} ${x} ${y})`}
        />
      ))}
    </g>
    {/* lá đài phía trước */}
    {[
      [165, 1],
      [15, 1],
      [125, 0.95],
      [55, 0.95],
      [90, 0.8],
    ].map(([a, s]) => (
      <path
        key={a}
        d={LEAF}
        transform={`translate(50 33) rotate(${a}) scale(${s})`}
        fill={ref(u('leaf'))}
        {...LINE}
        stroke-width="2"
      />
    ))}
    <path
      d="M50 33 Q51 25 56 19"
      fill="none"
      stroke={INK}
      stroke-width="6.4"
      stroke-linecap="round"
    />
    <path
      d="M50 33 Q51 25 56 19"
      fill="none"
      stroke="#3DAA48"
      stroke-width="3.4"
      stroke-linecap="round"
    />
    {/* ánh bóng */}
    <path
      d="M23 54 Q21 46 26 41"
      fill="none"
      stroke="#fff"
      stroke-width="4.6"
      stroke-linecap="round"
      opacity="0.7"
    />
    <path
      d="M62 77 Q73 69 77 56"
      fill="none"
      stroke="#7A0C1E"
      stroke-width="3"
      stroke-linecap="round"
      opacity="0.25"
    />
  </>
);

/** stk-14 Quả cam – quả nguyên + nửa quả mọng nước. */
const SEG = Array.from({ length: 8 }, (_, i) => rad(i * 45 + 22.5));
const orange: ArtFn = (u) => (
  <>
    <defs>
      <Rad
        id={u('skin')}
        stops={[
          [0, '#FFD36B'],
          [0.45, '#FF9A1C'],
          [1, '#E0600A'],
        ]}
      />
      <Rad
        id={u('flesh')}
        cx={0.5}
        cy={0.5}
        r={0.6}
        stops={[
          [0, '#FFE28A'],
          [0.55, '#FFA81F'],
          [1, '#FF8500'],
        ]}
      />
      <Lin
        id={u('leaf')}
        x1={0}
        y1={1}
        x2={1}
        y2={0}
        stops={[
          [0, '#2FAE3F'],
          [1, '#8EE05A'],
        ]}
      />
    </defs>
    <GroundShadow y={87} rx={30} />
    {/* quả nguyên */}
    <circle cx="40" cy="52" r="26" fill={ref(u('skin'))} {...LINE} stroke-width="2.6" />
    <path
      d="M28 44h.1M44 38h.1M52 50h.1M36 60h.1M26 58h.1M47 64h.1M33 33h.1"
      stroke="#C75300"
      stroke-width="1.8"
      stroke-linecap="round"
      opacity="0.45"
    />
    <path
      d="M40 26 Q40 21 44 18"
      fill="none"
      stroke={INK}
      stroke-width="6"
      stroke-linecap="round"
    />
    <path
      d="M40 26 Q40 21 44 18"
      fill="none"
      stroke="#7A4A1E"
      stroke-width="3.2"
      stroke-linecap="round"
    />
    <path
      d="M42 24 C47 13 62 12 69 17 C63 28 49 30 42 24 Z"
      fill={ref(u('leaf'))}
      {...LINE}
      stroke-width="2.2"
    />
    <path
      d="M45 23 Q57 17 66 17"
      fill="none"
      stroke="#1E7F2B"
      stroke-width="1.6"
      stroke-linecap="round"
    />
    <path
      d="M22 46 Q22 37 30 33"
      fill="none"
      stroke="#fff"
      stroke-width="4.6"
      stroke-linecap="round"
      opacity="0.75"
    />
    {/* nửa quả cắt */}
    <circle cx="65" cy="66" r="20" fill={ref(u('skin'))} {...LINE} />
    <circle cx="65" cy="66" r="17" fill="#FFF4D2" />
    <circle cx="65" cy="66" r="15" fill={ref(u('flesh'))} />
    <path
      d={SEG.map((a) => `M65 66L${r1(65 + 15 * Math.cos(a))} ${r1(66 + 15 * Math.sin(a))}`).join(
        '',
      )}
      stroke="#FFF1CC"
      stroke-width="1.7"
      stroke-linecap="round"
    />
    <circle cx="65" cy="66" r="2.2" fill="#FFF1CC" />
    <path
      d="M54 62 Q56 56 62 54 M75 72 Q73 77 68 79"
      fill="none"
      stroke="#fff"
      stroke-width="2.4"
      stroke-linecap="round"
      opacity="0.8"
    />
    <Shine x={57} y={73} rx={1.6} ry={2.6} rot={30} opacity={0.8} />
    <Shine x={73} y={58} rx={1.4} ry={2.2} rot={-30} opacity={0.8} />
  </>
);

/** stk-15 Nho tím – chùm nho + lá + cuống. */
const GRAPES: readonly (readonly [number, number])[] = [
  [26, 39],
  [42, 39],
  [58, 39],
  [74, 39],
  [34, 50.5],
  [50, 50.5],
  [66, 50.5],
  [42, 62],
  [58, 62],
  [50, 73.5],
];
const grapes: ArtFn = (u) => (
  <>
    <defs>
      <Rad
        id={u('a')}
        stops={[
          [0, '#DDAEFF'],
          [0.4, '#9B4DE6'],
          [1, '#5B1FA0'],
        ]}
      />
      <Rad
        id={u('b')}
        stops={[
          [0, '#CDB0FF'],
          [0.4, '#7E5CF0'],
          [1, '#401F9C'],
        ]}
      />
      <Lin
        id={u('leaf')}
        x1={0}
        y1={1}
        x2={1}
        y2={0}
        stops={[
          [0, '#1F9A3B'],
          [1, '#8BE35A'],
        ]}
      />
    </defs>
    <GroundShadow y={87} rx={20} />
    {/* lá */}
    <path
      d="M52 33 L47 24 L54 26 L53 18 L60 22 L63 13 L68 21 L76 16 L75 25 L85 24 L79 31 L86 36 L75 37 L52 33 Z"
      fill={ref(u('leaf'))}
      {...LINE}
      stroke-width="2.2"
    />
    <path
      d="M54 32 L63 22 M58 33 L77 26 M57 33 L81 33"
      fill="none"
      stroke="#1E7F2B"
      stroke-width="1.4"
      stroke-linecap="round"
    />
    {/* cuống + tua cuốn */}
    <path
      d="M50 34 Q50 22 44 15"
      fill="none"
      stroke={INK}
      stroke-width="6.4"
      stroke-linecap="round"
    />
    <path
      d="M50 34 Q50 22 44 15"
      fill="none"
      stroke="#8B5A2B"
      stroke-width="3.4"
      stroke-linecap="round"
    />
    <path
      d="M46 17 Q36 15 33 21 Q31 27 37 27"
      fill="none"
      stroke="#3DAA48"
      stroke-width="1.8"
      stroke-linecap="round"
    />
    {GRAPES.map(([x, y], i) => (
      <g key={`${x}-${y}`}>
        <circle cx={x} cy={y} r="10" fill={ref(u(i % 2 ? 'b' : 'a'))} {...LINE} stroke-width="2" />
        <Shine x={x - 3.6} y={y - 4} rx={3} ry={1.9} rot={-35} opacity={0.8} />
        <circle cx={x + 3.5} cy={y + 5} r="1.2" fill="#fff" opacity="0.45" />
      </g>
    ))}
  </>
);

/** stk-16 Dưa hấu – miếng hình bán nguyệt. */
const half = (rx: number, ry: number) =>
  `M${50 - rx} 26L${50 + rx} 26A${rx} ${ry} 0 0 1 ${50 - rx} 26Z`;
const seedAt = (x: number, y: number) => {
  const t = r1((Math.atan2(50 - x, y - 26) * 180) / Math.PI);
  return `translate(${x} ${y}) rotate(${t})`;
};
const SEEDS_W: readonly (readonly [number, number])[] = [
  [30, 37],
  [50, 37],
  [70, 37],
  [40, 48],
  [60, 48],
  [50, 57],
];
const melon: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('rind')}
        stops={[
          [0, '#3DBE52'],
          [1, '#14792F'],
        ]}
      />
      <Rad
        id={u('flesh')}
        cx={0.5}
        cy={0}
        r={1}
        stops={[
          [0, '#FF4D62'],
          [0.65, '#EE2A45'],
          [1, '#FF8A98'],
        ]}
      />
    </defs>
    <GroundShadow x={54} y={79} rx={25} />
    <g transform="translate(-1 8) rotate(-12 50 26)">
      <path d={half(36, 42)} fill={ref(u('rind'))} {...LINE} stroke-width="2.6" />
      <path d={half(34.3, 40)} fill="none" stroke="#8EE07A" stroke-width="1.2" opacity="0.7" />
      <path d={half(32.5, 38.2)} fill="#F2FBD2" />
      <path d={half(29.5, 35.2)} fill={ref(u('flesh'))} />
      {SEEDS_W.map(([x, y]) => (
        <path
          key={`${x}-${y}`}
          d="M0 -3.6 Q3 0 2 3 Q0 4.4 -2 3 Q-3 0 0 -3.6 Z"
          transform={seedAt(x, y)}
          fill="#263238"
        />
      ))}
      <path
        d="M22 31 Q22 41 30 50"
        fill="none"
        stroke="#fff"
        stroke-width="3.4"
        stroke-linecap="round"
        opacity="0.6"
      />
      <Shine x={40} y={31} rx={1.5} ry={2.6} rot={-20} opacity={0.75} />
      <Shine x={72} y={45} rx={1.4} ry={2.4} rot={20} opacity={0.7} />
    </g>
  </>
);

/** stk-17 Quả dứa – thân vàng ô quả trám, vương miện lá nhọn (Hiếm). */
const blade = (len: number, w: number) =>
  `M${50 - w} 42Q${50 - w * 0.9} ${42 - len * 0.55} 50 ${42 - len}Q${50 + w * 0.9} ${42 - len * 0.55} ${50 + w} 42Z`;
const CROWN: readonly (readonly [number, number])[] = [
  [-62, 16],
  [62, 16],
  [-46, 21],
  [46, 21],
  [-31, 26],
  [31, 26],
  [-15, 29],
  [15, 29],
  [0, 30],
];
const LATTICE = (() => {
  const lines: string[] = [];
  for (let i = -6; i <= 4; i++) {
    const a = 4 + 12 * i;
    lines.push(`M${a + 20} 20L${a + 100} 100`);
    lines.push(`M${96 - 12 * i - 20} 20L${96 - 12 * i - 100} 100`);
  }
  const marks: string[] = [];
  for (let p = -4; p <= 4; p++) {
    for (let m = -6; m <= 1; m++) {
      if ((p + m) % 2 === 0) continue;
      const x = 50 + 6 * p;
      const y = 46 - 6 * m;
      if (((x - 50) / 22.5) ** 2 + ((y - 59) / 25) ** 2 > 1) continue;
      marks.push(`M${x - 2} ${y - 1.6}L${x} ${y + 0.8}L${x + 2} ${y - 1.6}`);
    }
  }
  return { grid: lines.join(''), marks: marks.join('') };
})();
const pineapple: ArtFn = (u) => (
  <>
    <defs>
      <Rad
        id={u('body')}
        stops={[
          [0, '#FFE96E'],
          [0.55, '#FFC21A'],
          [1, '#EA8A00'],
        ]}
      />
      <Lin
        id={u('g1')}
        stops={[
          [0, '#86E25C'],
          [1, '#1E9A3C'],
        ]}
      />
      <Lin
        id={u('g2')}
        stops={[
          [0, '#4CC24A'],
          [1, '#12802F'],
        ]}
      />
      <linearGradient id={u('shade')} x1="0" y1="0" x2="1" y2="0">
        <stop offset="0" stop-color="#fff" stop-opacity="0.4" />
        <stop offset="0.35" stop-color="#fff" stop-opacity="0" />
        <stop offset="0.7" stop-color="#A84F00" stop-opacity="0" />
        <stop offset="1" stop-color="#A84F00" stop-opacity="0.5" />
      </linearGradient>
      <clipPath id={u('bclip')}>
        <ellipse cx="50" cy="59" rx="24" ry="26.5" />
      </clipPath>
    </defs>
    <GroundShadow y={86} rx={20} />
    {/* vương miện lá */}
    {CROWN.map(([a, len], i) => (
      <g key={a} transform={`rotate(${a} 50 42)`}>
        <path d={blade(len, 9)} fill={ref(u(i % 2 ? 'g2' : 'g1'))} {...LINE} stroke-width="1.9" />
        <path
          d={`M50 40L50 ${42 - len * 0.8}`}
          stroke="#B6F27A"
          stroke-width="1.2"
          stroke-linecap="round"
          opacity="0.7"
        />
      </g>
    ))}
    <ellipse cx="50" cy="59" rx="24" ry="26.5" fill={ref(u('body'))} />
    <g clip-path={ref(u('bclip'))}>
      <path d={LATTICE.grid} stroke="#D9780A" stroke-width="1.8" />
      <path
        d={LATTICE.marks}
        fill="none"
        stroke="#A85A00"
        stroke-width="1.2"
        stroke-linecap="round"
        stroke-linejoin="round"
      />
      <ellipse cx="50" cy="59" rx="24" ry="26.5" fill={ref(u('shade'))} />
    </g>
    <ellipse cx="50" cy="59" rx="24" ry="26.5" fill="none" {...LINE} stroke-width="2.6" />
    <path
      d="M33 48 Q31 58 35 67"
      fill="none"
      stroke="#fff"
      stroke-width="2.8"
      stroke-linecap="round"
      opacity="0.6"
    />
    <Sparkle x={21} y={36} s={5} />
    <Sparkle x={79} y={52} s={4.5} />
  </>
);

/** stk-18 Anh đào – hai quả bóng bẩy, cuống cong, lá (Hiếm). */
const CHERRIES: readonly (readonly [number, number, string])[] = [
  [32, 65, 'a'],
  [67, 69, 'b'],
];
const cherry: ArtFn = (u) => (
  <>
    <defs>
      <Rad
        id={u('a')}
        stops={[
          [0, '#FF8F95'],
          [0.35, '#F01E3C'],
          [1, '#9A0A22'],
        ]}
      />
      <Rad
        id={u('b')}
        stops={[
          [0, '#FF7A86'],
          [0.4, '#D8102F'],
          [1, '#7E0720'],
        ]}
      />
      <Lin
        id={u('leaf')}
        x1={0}
        y1={1}
        x2={1}
        y2={0}
        stops={[
          [0, '#2FAE3F'],
          [1, '#8EE05A'],
        ]}
      />
    </defs>
    <GroundShadow y={87} rx={30} />
    {/* lá */}
    <path
      d="M55 22 C61 11 77 11 84 18 C77 28 63 29 55 22 Z"
      fill={ref(u('leaf'))}
      {...LINE}
      stroke-width="2.2"
    />
    <path
      d="M58 22 Q70 16 80 18"
      fill="none"
      stroke="#1E7F2B"
      stroke-width="1.6"
      stroke-linecap="round"
    />
    {/* cuống */}
    {['M55 22 C47 28 36 36 34 50', 'M55 22 C58 32 62 42 64 54'].map((d) => (
      <g key={d} fill="none" stroke-linecap="round">
        <path d={d} stroke={INK} stroke-width="5.6" />
        <path d={d} stroke="#7CB342" stroke-width="3" />
      </g>
    ))}
    <circle cx="55" cy="22" r="3.4" fill="#8B5A2B" {...LINE} stroke-width="1.8" />
    {CHERRIES.map(([x, y, g]) => (
      <g key={g}>
        <circle cx={x} cy={y} r="17" fill={ref(u(g))} {...LINE} stroke-width="2.6" />
        <path
          d={`M${x + 8} ${y + 14}Q${x + 15} ${y + 8} ${x + 16} ${y - 2}`}
          fill="none"
          stroke="#FF8A80"
          stroke-width="2.4"
          stroke-linecap="round"
          opacity="0.6"
        />
        <path
          d={`M${x - 7} ${y - 15}Q${x} ${y - 9} ${x + 7} ${y - 15}`}
          fill="none"
          stroke="#8A0A1E"
          stroke-width="2.2"
          stroke-linecap="round"
          opacity="0.6"
        />
        <Shine x={x - 7} y={y - 5} rx={4.4} ry={6.8} rot={22} opacity={0.8} />
        <circle cx={x - 10} cy={y + 5} r="1.7" fill="#fff" opacity="0.75" />
      </g>
    ))}
    <Sparkle x={80} y={46} s={5} />
    <Sparkle x={21} y={38} s={4} />
  </>
);

/** stk-19 Quả kiwi – quả nguyên lông nâu + nửa quả xanh (Hiếm). */
const FUZZ: readonly (readonly [number, number])[] = [
  [22, 44],
  [28, 36],
  [35, 31],
  [43, 29],
  [32, 41],
  [40, 38],
  [48, 36],
  [26, 50],
  [36, 48],
  [45, 45],
  [52, 42],
  [31, 55],
  [41, 53],
  [24, 41],
];
const RAYS_K = Array.from({ length: 18 }, (_, i) => rad(i * 20));
const kiwi: ArtFn = (u) => (
  <>
    <defs>
      <Rad
        id={u('skin')}
        stops={[
          [0, '#D8AE78'],
          [0.5, '#A06E3A'],
          [1, '#5F3A1C'],
        ]}
      />
      <Rad
        id={u('flesh')}
        cx={0.5}
        cy={0.5}
        r={0.55}
        stops={[
          [0, '#EAFBB4'],
          [0.4, '#A9EA3E'],
          [1, '#4FB614'],
        ]}
      />
    </defs>
    <GroundShadow y={87} rx={30} />
    {/* quả nguyên */}
    <g transform="rotate(-25 36 40)">
      <ellipse cx="36" cy="40" rx="22" ry="17" fill={ref(u('skin'))} {...LINE} stroke-width="2.6" />
      <ellipse cx="14.5" cy="40" rx="2" ry="3" fill="#4A2C12" />
      <path
        d={FUZZ.map(([x, y]) => `M${x} ${y}l2.4 -1.3`).join('')}
        stroke="#6B4423"
        stroke-width="1.2"
        stroke-linecap="round"
      />
      <path
        d={FUZZ.map(([x, y]) => `M${x + 3} ${y + 3}l2 -1`).join('')}
        stroke="#E8C792"
        stroke-width="1.1"
        stroke-linecap="round"
        opacity="0.8"
      />
      <path
        d="M20 34 Q24 26 34 24"
        fill="none"
        stroke="#fff"
        stroke-width="3.6"
        stroke-linecap="round"
        opacity="0.5"
      />
    </g>
    {/* nửa quả cắt */}
    <g transform="rotate(-12 60 62)">
      <ellipse cx="60" cy="62" rx="25" ry="22" fill={ref(u('skin'))} {...LINE} stroke-width="2.6" />
      <ellipse cx="60" cy="62" rx="22.6" ry="19.6" fill="#D3F27A" />
      <ellipse cx="60" cy="62" rx="21.2" ry="18.2" fill={ref(u('flesh'))} />
      <path
        d={RAYS_K.map(
          (a) =>
            `M${r1(60 + 7.5 * Math.cos(a))} ${r1(62 + 6.5 * Math.sin(a))}L${r1(60 + 19.5 * Math.cos(a))} ${r1(62 + 17 * Math.sin(a))}`,
        ).join('')}
        stroke="#6FCB22"
        stroke-width="1"
        stroke-linecap="round"
        opacity="0.55"
      />
      <ellipse cx="60" cy="62" rx="6.8" ry="5.8" fill="#FBFFE2" stroke="#DDF2A0" stroke-width="1" />
      {RAYS_K.map((a, i) => (
        <ellipse
          key={i}
          cx={r1(60 + 11.5 * Math.cos(a))}
          cy={r1(62 + 10 * Math.sin(a))}
          rx="0.95"
          ry="1.9"
          fill="#263238"
          transform={`rotate(${i * 20 + 90} ${r1(60 + 11.5 * Math.cos(a))} ${r1(62 + 10 * Math.sin(a))})`}
        />
      ))}
      <path
        d="M42 56 Q44 49 51 46"
        fill="none"
        stroke="#fff"
        stroke-width="2.8"
        stroke-linecap="round"
        opacity="0.75"
      />
    </g>
    <Sparkle x={75} y={50} s={4} />
  </>
);

/** stk-20 Táo vàng thần kỳ – cánh nhỏ, quầng sáng, tia nắng, lấp lánh (Siêu hiếm). */
const SUN = Array.from({ length: 12 }, (_, i) => {
  const R = i % 2 ? 32 : 39;
  const p = (d: number) => `${r1(50 + R * Math.cos(rad(d)))} ${r1(52 + R * Math.sin(rad(d)))}`;
  return `M50 52L${p(i * 30 - 7.5)}L${p(i * 30 + 7.5)}Z`;
}).join('');
const FEATHERS: readonly (readonly [number, number])[] = [
  [-70, 34],
  [-52, 34],
  [-33, 28],
  [-14, 23],
  [8, 19],
];
const goldApple: ArtFn = (u) => {
  const wing = () => (
    <g>
      {FEATHERS.map(([a, len]) => (
        <g key={a} transform={`translate(64 56) rotate(${a}) scale(${r1(len / 30)})`}>
          <path
            d="M0 0 C5 -9 21 -11 29 -4 Q32 0 29 4 C21 11 5 9 0 0 Z"
            fill={ref(u('fe'))}
            {...LINE}
            stroke-width="1.8"
          />
          <path d="M3 0L25 0" stroke="#E6B94D" stroke-width="1.1" stroke-linecap="round" />
        </g>
      ))}
    </g>
  );
  return (
    <>
      <defs>
        <radialGradient id={u('glow')} gradientUnits="userSpaceOnUse" cx="50" cy="52" r="40">
          <stop offset="0" stop-color="#FFFCE6" stop-opacity="1" />
          <stop offset="0.5" stop-color="#FFE66E" stop-opacity="0.85" />
          <stop offset="1" stop-color="#FFC400" stop-opacity="0" />
        </radialGradient>
        <radialGradient id={u('sun')} gradientUnits="userSpaceOnUse" cx="50" cy="52" r="40">
          <stop offset="0" stop-color="#FFF3A0" stop-opacity="0.95" />
          <stop offset="1" stop-color="#FF9F00" stop-opacity="0.8" />
        </radialGradient>
        <Lin
          id={u('fe')}
          x1={0}
          y1={0}
          x2={1}
          y2={0}
          stops={[
            [0, '#FFFFFF'],
            [0.6, '#FFF6CF'],
            [1, '#FFD769'],
          ]}
        />
        <Rad
          id={u('gold')}
          cx={0.34}
          cy={0.3}
          r={0.85}
          stops={[
            [0, '#FFF8C4'],
            [0.25, '#FFE04A'],
            [0.62, '#FFB800'],
            [1, '#D97700'],
          ]}
        />
        <Lin
          id={u('leaf')}
          x1={0}
          y1={1}
          x2={1}
          y2={0}
          stops={[
            [0, '#2FAE3F'],
            [1, '#B7F06A'],
          ]}
        />
      </defs>
      <circle cx="50" cy="52" r="40" fill={ref(u('glow'))} />
      <path d={SUN} fill={ref(u('sun'))} />
      {/* vòng phép thuật */}
      <circle
        cx="50"
        cy="52"
        r="35"
        fill="none"
        stroke="#FFFBE0"
        stroke-width="1.8"
        stroke-dasharray="0.1 5"
        stroke-linecap="round"
      />
      <GroundShadow y={86} rx={20} />
      {wing()}
      <g transform="translate(100 0) scale(-1 1)">{wing()}</g>
      <g transform="translate(-4 -5) scale(1.08)">
        <path
          d="M50 46 C41 38 26 43 27 60 C28 74 40 86 50 80 C60 86 72 74 73 60 C74 43 59 38 50 46 Z"
          fill={ref(u('gold'))}
          {...LINE}
        />
        <path
          d="M50 46 Q48 51 50 55"
          fill="none"
          stroke="#B86A00"
          stroke-width="2.2"
          stroke-linecap="round"
          opacity="0.6"
        />
        <path
          d="M50 45 Q51 38 55 33"
          fill="none"
          stroke={INK}
          stroke-width="6"
          stroke-linecap="round"
        />
        <path
          d="M50 45 Q51 38 55 33"
          fill="none"
          stroke="#A8742A"
          stroke-width="3.2"
          stroke-linecap="round"
        />
        <path
          d="M53 39 C57 29 69 28 74 33 C69 42 58 44 53 39 Z"
          fill={ref(u('leaf'))}
          {...LINE}
          stroke-width="2"
        />
        <path
          d="M33 52 Q32 46 38 43"
          fill="none"
          stroke="#fff"
          stroke-width="4.4"
          stroke-linecap="round"
          opacity="0.85"
        />
        <Shine x={34} y={62} rx={2.2} ry={4.2} rot={10} opacity={0.65} />
        <path
          d="M36 74 Q46 82 56 79"
          fill="none"
          stroke="#B86A00"
          stroke-width="2.6"
          stroke-linecap="round"
          opacity="0.3"
        />
        <Sparkle x={62} y={58} s={5} />
        <path
          d="M67 52 Q71 62 64 73"
          fill="none"
          stroke="#FFF3A0"
          stroke-width="2.8"
          stroke-linecap="round"
          opacity="0.55"
        />
      </g>
      <Sparkle x={50} y={20} s={7} fill="#FFFDE0" />
      <Sparkle x={20} y={74} s={5} fill="#FFFDE0" />
      <Sparkle x={82} y={72} s={6} fill="#FFFDE0" />
      <Sparkle x={26} y={22} s={4} fill="#FFFDE0" />
      <circle cx="14" cy="52" r="1.6" fill="#FFF3A0" />
      <circle cx="86" cy="50" r="1.6" fill="#FFF3A0" />
      <circle cx="66" cy="18" r="1.4" fill="#FFF3A0" />
    </>
  );
};

export const FRUIT_ART: Record<string, ArtFn> = {
  'stk-11': apple,
  'stk-12': banana,
  'stk-13': strawberry,
  'stk-14': orange,
  'stk-15': grapes,
  'stk-16': melon,
  'stk-17': pineapple,
  'stk-18': cherry,
  'stk-19': kiwi,
  'stk-20': goldApple,
};
