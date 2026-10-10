// Sticker chủ đề phương tiện: stk-31 … stk-40 (31–36 Thường · 37–39 Hiếm · 40 Siêu hiếm). Khung 100×100, vùng an toàn [14, 86].
import {
  Cheek,
  Eye,
  GroundShadow,
  INK,
  Lin,
  Rad,
  Shine,
  Sparkle,
  type ArtFn,
  type Uid,
} from './kit';

/** Nét viền INK bo tròn. */
const O = (w = 2.4) =>
  ({
    stroke: INK,
    'stroke-width': w,
    'stroke-linejoin': 'round',
    'stroke-linecap': 'round',
  }) as const;

/** Nét trắng bóng (vệt sáng dạng đường). */
const gloss = (d: string, w = 2.4, op = 0.6) => (
  <path d={d} fill="none" stroke="#fff" stroke-width={w} stroke-linecap="round" opacity={op} />
);

/** Mặt đất: đồi cỏ + đường nhựa (hoặc đường ray). Dùng id 'grs'. */
function Road({ u, rail = false }: { u: Uid; rail?: boolean }) {
  return (
    <>
      <defs>
        <Lin
          id={u('grs')}
          stops={[
            [0, '#9BE86A'],
            [1, '#3DB54A'],
          ]}
        />
      </defs>
      <path d="M9 74 Q28 66 48 72 T91 69 L91 84 L9 84 Z" fill={`url(#${u('grs')})`} />
      {rail ? (
        <>
          <rect x="9" y="80" width="82" height="12" fill="#CDB98F" />
          {[11, 25, 39, 53, 67, 81].map((x) => (
            <rect key={x} x={x} y="84" width="9" height="5.5" rx="1.5" fill="#8B5A2B" />
          ))}
          <path d="M9 81.8 H91" stroke={INK} stroke-width="4.4" />
          <path d="M9 81.8 H91" stroke="#E3EBF0" stroke-width="2.2" />
        </>
      ) : (
        <>
          <rect x="9" y="80" width="82" height="12" fill="#5F6F7A" />
          <path d="M9 80.6 H91" stroke="#93A5B1" stroke-width="1.6" />
          <path d="M13 86.5 H88" stroke="#FFE680" stroke-width="1.8" stroke-dasharray="7 5" />
        </>
      )}
    </>
  );
}

/** Bánh xe: lốp, vành bóng, nắp moay-ơ. */
function Wheel({
  id,
  x,
  y,
  r = 8.5,
  hub = '#FFD54F',
}: {
  id: string;
  x: number;
  y: number;
  r?: number;
  hub?: string;
}) {
  return (
    <>
      <defs>
        <Rad
          id={id}
          stops={[
            [0, '#FFFFFF'],
            [0.55, '#D5DEE4'],
            [1, '#8FA3B0'],
          ]}
        />
      </defs>
      <circle cx={x} cy={y} r={r} fill="#546E7A" {...O(2.2)} />
      <circle cx={x} cy={y} r={r * 0.62} fill={`url(#${id})`} stroke={INK} stroke-width="1.2" />
      <circle cx={x} cy={y} r={r * 0.26} fill={hub} stroke={INK} stroke-width="1" />
      {gloss(
        `M${x - r * 0.8} ${y - r * 0.3} A${r * 0.85} ${r * 0.85} 0 0 1 ${x - r * 0.3} ${y - r * 0.8}`,
        1.3,
        0.45,
      )}
    </>
  );
}

const glassStops = [
  [0, '#F0FCFF'],
  [1, '#5CC4F2'],
] as const;

/** stk-31 Ô tô đỏ. */
const car: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('body')}
        stops={[
          [0, '#FF7B72'],
          [0.5, '#F0262F'],
          [1, '#B50F25'],
        ]}
      />
      <Lin id={u('glass')} x1={0} y1={0} x2={1} y2={1} stops={glassStops} />
    </defs>
    <Road u={u} />
    <GroundShadow y={84} rx={36} ry={3.2} />
    {/* cabin */}
    <path
      d="M26 54 C29 42 34 35 43 35 L58 35 C66 35 71 42 76 54 Z"
      fill={`url(#${u('body')})`}
      {...O(2.6)}
    />
    {/* thân xe */}
    <path
      d="M14 66 C14 57 20 53 28 53 L74 53 C83 53 87 58 87 66 L87 72 C87 75 85 77 82 77 L18 77 C15 77 14 75 14 72 Z"
      fill={`url(#${u('body')})`}
      {...O(2.6)}
    />
    <path d="M16 59 H85" stroke="#FFD93B" stroke-width="3" />
    {/* cửa kính */}
    <path
      d="M31 52 C33 44 36 39.5 43 39.5 L47.5 39.5 L47.5 52 Z"
      fill={`url(#${u('glass')})`}
      {...O(1.9)}
    />
    <path
      d="M52.5 39.5 L58 39.5 C63 39.5 66 44 70 52 L52.5 52 Z"
      fill={`url(#${u('glass')})`}
      {...O(1.9)}
    />
    {gloss('M35 49 L40 42', 1.8, 0.8)}
    {gloss('M56 49 L61 43', 1.8, 0.8)}
    {gloss('M36 38 Q42 35.8 50 36.4', 2.2, 0.6)}
    {gloss('M20 56.5 Q42 54.6 66 55.4', 2, 0.5)}
    {/* tay nắm cửa + đèn */}
    <path d="M52 62 H57" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity="0.85" />
    <ellipse cx="82.5" cy="63.5" rx="3.4" ry="4" fill="#FFF3A0" {...O(1.8)} />
    <rect x="14.8" y="60.5" width="4.4" height="6" rx="2" fill="#FF9A1F" {...O(1.6)} />
    {/* vòm bánh + bánh */}
    <path d="M19.5 77 A10.5 10.5 0 0 1 40.5 77 Z" fill="#263238" />
    <path d="M60.5 77 A10.5 10.5 0 0 1 81.5 77 Z" fill="#263238" />
    <Wheel id={u('w1')} x={30} y={76} />
    <Wheel id={u('w2')} x={71} y={76} />
    <Sparkle x={76} y={44} s={3.6} opacity={0.9} />
  </>
);

/** stk-32 Xe buýt. */
const bus: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('body')}
        stops={[
          [0, '#FFF06A'],
          [0.45, '#FFC81F'],
          [1, '#F29A00'],
        ]}
      />
      <Lin id={u('glass')} x1={0} y1={0} x2={1} y2={1} stops={glassStops} />
    </defs>
    <Road u={u} />
    <GroundShadow y={84} rx={37} ry={3.2} />
    {/* đèn nóc */}
    <rect x="38" y="26" width="24" height="6" rx="3" fill="#FF8A3D" {...O(1.8)} />
    <path
      d="M14 46 C14 34 20 30 30 30 L70 30 C80 30 86 34 86 46 L86 72 C86 75 84 77 81 77 L19 77 C16 77 14 75 14 72 Z"
      fill={`url(#${u('body')})`}
      {...O(2.6)}
    />
    <path d="M15.5 58 H84.5 V63.5 H15.5 Z" fill="#E8343F" />
    <path d="M15.5 58 H84.5 M15.5 63.5 H84.5" stroke={INK} stroke-width="1.2" opacity="0.5" />
    {/* hàng cửa sổ */}
    {[19, 35.5, 52].map((x) => (
      <g key={x}>
        <rect
          x={x}
          y="36"
          width="13.5"
          height="15"
          rx="3"
          fill={`url(#${u('glass')})`}
          {...O(1.8)}
        />
        {gloss(`M${x + 2.6} 48.5 L${x + 6.2} 39.5`, 1.8, 0.8)}
      </g>
    ))}
    <path d="M69 36 H77 Q82 36 82 41.5 V51 H69 Z" fill={`url(#${u('glass')})`} {...O(1.8)} />
    {gloss('M72 48.5 L75.5 39.5', 1.8, 0.8)}
    {/* hai bạn nhỏ trên xe */}
    <circle cx="42.7" cy="46.5" r="3.7" fill="#FFCBA4" />
    <path d="M39 46 A3.7 3.7 0 0 1 46.4 46 Z" fill="#5D4037" />
    <circle cx="59.7" cy="46.5" r="3.7" fill="#FFCBA4" />
    <path d="M56 46 A3.7 3.7 0 0 1 63.4 46 Z" fill="#FF8A00" />
    <circle cx="41.6" cy="47.6" r="0.8" fill="#263238" />
    <circle cx="43.9" cy="47.6" r="0.8" fill="#263238" />
    <circle cx="58.6" cy="47.6" r="0.8" fill="#263238" />
    <circle cx="60.9" cy="47.6" r="0.8" fill="#263238" />
    {gloss('M20 33.5 H66', 2.2, 0.55)}
    <ellipse cx="82.2" cy="69.5" rx="3" ry="3.5" fill="#FFF3A0" {...O(1.8)} />
    <rect x="14.8" y="66" width="4" height="6" rx="2" fill="#FF3B4E" {...O(1.6)} />
    <path d="M19.5 77 A10.5 10.5 0 0 1 40.5 77 Z" fill="#263238" />
    <path d="M59.5 77 A10.5 10.5 0 0 1 80.5 77 Z" fill="#263238" />
    <Wheel id={u('w1')} x={30} y={76} />
    <Wheel id={u('w2')} x={70} y={76} />
  </>
);

/** Bánh xe đạp: lốp, vành vàng, nan hoa. */
function BikeWheel({ x, y }: { x: number; y: number }) {
  return (
    <>
      <circle cx={x} cy={y} r="14.2" fill="#fff" opacity="0.28" />
      <circle cx={x} cy={y} r="14.2" fill="none" stroke={INK} stroke-width="5" />
      <circle cx={x} cy={y} r="14.2" fill="none" stroke="#546E7A" stroke-width="2.8" />
      <circle cx={x} cy={y} r="11.4" fill="none" stroke="#FFC400" stroke-width="1.6" />
      {[0, 45, 90, 135].map((a) => (
        <path
          key={a}
          d={`M${x - 11.4} ${y} H${x + 11.4}`}
          stroke="#fff"
          stroke-width="0.9"
          opacity="0.95"
          transform={`rotate(${a} ${x} ${y})`}
        />
      ))}
      <circle cx={x} cy={y} r="2.6" fill="#FFD54F" {...O(1.4)} />
      {gloss(`M${x - 11} ${y - 8} A13.6 13.6 0 0 1 ${x - 4} ${y - 13}`, 1.4, 0.5)}
    </>
  );
}

/** stk-33 Xe đạp. */
const bike: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('bask')}
        stops={[
          [0, '#F7C97A'],
          [1, '#C98A3C'],
        ]}
      />
      <Lin
        id={u('seat')}
        stops={[
          [0, '#A5622B'],
          [1, '#5B2D0C'],
        ]}
      />
    </defs>
    <Road u={u} />
    <GroundShadow y={84} rx={34} ry={3} />
    <BikeWheel x={29} y={66} />
    <BikeWheel x={71} y={66} />
    {/* xích + giò đạp */}
    <path d="M29 69 L50 70.6" stroke="#263238" stroke-width="1.1" opacity="0.7" />
    {/* khung xe (nền viền + lớp màu + vệt sáng) */}
    {[
      { w: 6.8, c: INK },
      { w: 4, c: '#FF3D86' },
    ].map(({ w, c }) => (
      <g
        key={c}
        fill="none"
        stroke={c}
        stroke-width={w}
        stroke-linejoin="round"
        stroke-linecap="round"
      >
        <path d="M29 66 L42 46 L65 46 L50 66 L29 66 M42 46 L50 66 M65 46 L71 66" />
      </g>
    ))}
    {gloss('M43 49 L63 48.2', 1.1, 0.7)}
    <path d="M50 66 L54 73" {...O(4.4)} />
    <path d="M50 66 L54 73" stroke="#FFD54F" stroke-width="2" stroke-linecap="round" />
    <rect x="51" y="72" width="8" height="3.4" rx="1.7" fill="#FF9A1F" {...O(1.6)} />
    <circle cx="50" cy="66" r="4.4" fill="#FFD54F" {...O(1.8)} />
    {/* yên xe */}
    <path d="M42 46 L40.5 42" {...O(4.4)} />
    <path d="M42 46 L40.5 42" stroke="#CFD8DC" stroke-width="2" stroke-linecap="round" />
    <path
      d="M32.5 40.5 Q40 36.5 47.5 40.5 Q46.5 44.5 40 44.5 Q33.5 44.5 32.5 40.5 Z"
      fill={`url(#${u('seat')})`}
      {...O(2)}
    />
    {gloss('M35 40 Q40 38 44 39.4', 1.3, 0.55)}
    {/* ghi-đông + giỏ hoa */}
    <path d="M65 46 L62 35.5" {...O(4.6)} />
    <path d="M65 46 L62 35.5" stroke="#CFD8DC" stroke-width="2.2" stroke-linecap="round" />
    <path d="M56.5 36.5 Q62 33.6 68.5 36.6" {...O(5)} fill="none" />
    <path
      d="M56.5 36.5 Q62 33.6 68.5 36.6"
      stroke="#CFD8DC"
      stroke-width="2.6"
      stroke-linecap="round"
      fill="none"
    />
    <path d="M55.5 37 L58 35.8" stroke="#FF3B4E" stroke-width="3.6" stroke-linecap="round" />
    <path
      d="M68 40 H85 L82.5 49.5 Q82.3 50.5 81.3 50.5 H71.7 Q70.7 50.5 70.5 49.5 Z"
      fill={`url(#${u('bask')})`}
      {...O(2)}
    />
    <path
      d="M69.5 44.2 H83.5 M70.6 47.6 H82.4 M74 40.5 L75 50 M79 40.5 L78 50"
      stroke="#8B5A2B"
      stroke-width="1.2"
      opacity="0.7"
    />
    <path d="M76.5 40 V33.5" stroke="#2FAE3F" stroke-width="2" stroke-linecap="round" />
    {[0, 72, 144, 216, 288].map((a) => (
      <circle
        key={a}
        cx={76.5 + 3.1 * Math.sin((a * Math.PI) / 180)}
        cy={31.5 - 3.1 * Math.cos((a * Math.PI) / 180)}
        r="2.4"
        fill="#FF7BA9"
        stroke={INK}
        stroke-width="1"
      />
    ))}
    <circle cx="76.5" cy="31.5" r="2" fill="#FFE135" stroke={INK} stroke-width="1" />
    <Sparkle x={22} y={40} s={4.4} opacity={0.9} />
  </>
);

/** stk-34 Thuyền buồm. */
const sailboat: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('hull')}
        stops={[
          [0, '#FF8160'],
          [1, '#D6342F'],
        ]}
      />
      <Lin
        id={u('main')}
        x1={0}
        y1={0}
        x2={1}
        y2={1}
        stops={[
          [0, '#FFF27A'],
          [1, '#FFAA00'],
        ]}
      />
      <Lin
        id={u('jib')}
        x1={1}
        y1={0}
        x2={0}
        y2={1}
        stops={[
          [0, '#FF9CC0'],
          [1, '#E8247A'],
        ]}
      />
      <Lin
        id={u('sea')}
        stops={[
          [0, '#3FC1FF'],
          [1, '#1479D6'],
        ]}
      />
      <Lin
        id={u('sea2')}
        stops={[
          [0, '#8AE6FF'],
          [1, '#2E9BEA'],
        ]}
      />
      <clipPath id={u('hc')}>
        <path d="M16 62 H84 Q81 77 69 78 H31 Q19 77 16 62 Z" />
      </clipPath>
    </defs>
    {/* sóng sau */}
    <path
      d="M9 72 Q17 66 25 72 T41 72 T57 72 T73 72 T89 72 L91 91 L9 91 Z"
      fill={`url(#${u('sea')})`}
    />
    {/* cột buồm */}
    <path d="M50 20 V62" {...O(5)} />
    <path d="M50 20 V62" stroke="#A06A32" stroke-width="2.6" stroke-linecap="round" />
    {/* buồm lớn + buồm nhỏ */}
    <path d="M53 24 C66 33 76 46 80 60 L53 60 Z" fill={`url(#${u('main')})`} {...O(2.4)} />
    <path d="M47 26 C42 40 34 52 22 60 L47 60 Z" fill={`url(#${u('jib')})`} {...O(2.4)} />
    {gloss('M56 34 C64 41 69 49 72 56', 2.4, 0.65)}
    {gloss('M44 34 C41 43 36 50 30 56', 2.2, 0.6)}
    <path
      d="M53 44 C60 47 66 51 70 56"
      stroke="#E08A00"
      stroke-width="1.2"
      fill="none"
      opacity="0.6"
    />
    {/* thân thuyền */}
    <path d="M16 62 H84 Q81 77 69 78 H31 Q19 77 16 62 Z" fill={`url(#${u('hull')})`} {...O(2.6)} />
    <g clip-path={`url(#${u('hc')})`}>
      <rect x="14" y="65" width="72" height="4.5" fill="#fff" opacity="0.92" />
      {[34, 50, 66].map((x) => (
        <circle key={x} cx={x} cy="67.3" r="1.7" fill="#3FA9F5" />
      ))}
    </g>
    <path d="M18 62.5 H82" stroke={INK} stroke-width="3" stroke-linecap="round" />
    {/* cờ nhỏ */}
    <path d="M50 15 L62 18.5 L50 22 Z" fill="#FF3B4E" {...O(1.8)} />
    <circle cx="50" cy="14.2" r="2.2" fill="#FFD54F" {...O(1.4)} />
    {/* sóng trước + bọt */}
    <path
      d="M9 77 Q17 71.5 25 77 T41 77 T57 77 T73 77 T89 77 L91 91 L9 91 Z"
      fill={`url(#${u('sea2')})`}
    />
    <path
      d="M9 77 Q17 71.5 25 77 T41 77 T57 77 T73 77 T89 77"
      fill="none"
      stroke="#fff"
      stroke-width="2.2"
      stroke-linecap="round"
    />
    {gloss('M15 84 Q22 82 28 85 M58 85 Q66 82 74 85', 1.8, 0.7)}
    <Sparkle x={78} y={76} s={3.4} opacity={0.95} />
  </>
);

type Dot = readonly [number, number, number];
/** Cụm khói của đầu tàu (x, y, bán kính). */
const PUFFS: readonly Dot[] = [
  [71, 22.5, 4.4],
  [64, 19, 4.8],
  [56.5, 16.5, 4],
];
/** Bong bóng dưới nước của tàu ngầm. */
const BUBBLES: readonly Dot[] = [
  [34, 30, 2.6],
  [28, 22, 1.8],
  [76, 34, 2.6],
  [82, 26, 1.8],
  [86, 42, 1.5],
];

/** stk-35 Tàu hỏa. */
const train: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('boil')}
        stops={[
          [0, '#78D8FF'],
          [0.5, '#2A8BEB'],
          [1, '#1750B8'],
        ]}
      />
      <Lin
        id={u('red')}
        stops={[
          [0, '#FF8074'],
          [0.5, '#F0303A'],
          [1, '#B5122B'],
        ]}
      />
      <Lin
        id={u('gold')}
        stops={[
          [0, '#FFF08A'],
          [1, '#FFB400'],
        ]}
      />
      <Lin id={u('glass')} x1={0} y1={0} x2={1} y2={1} stops={glassStops} />
    </defs>
    <Road u={u} rail />
    <GroundShadow y={83.6} rx={36} ry={2.6} />
    {/* khói */}
    {PUFFS.map(([x, y, r]) => (
      <g key={x}>
        <circle cx={x} cy={y} r={r} fill="#fff" stroke="#A9C4D6" stroke-width="1.6" />
        <circle cx={x - r * 0.35} cy={y - r * 0.3} r={r * 0.32} fill="#DDF1FF" />
      </g>
    ))}
    {/* ống khói */}
    <path
      d="M63 47 L64.5 35 L60 31 Q60 28.5 62.5 28.5 L76.5 28.5 Q79 28.5 79 31 L74.5 35 L76 47 Z"
      fill={`url(#${u('red')})`}
      {...O(2.2)}
    />
    <rect x="59" y="27" width="21" height="4.6" rx="2.3" fill={`url(#${u('gold')})`} {...O(1.8)} />
    {/* nồi hơi */}
    <path
      d="M34 46 H78 Q86 46 86 56 V62 Q86 66 82 66 H34 Z"
      fill={`url(#${u('boil')})`}
      {...O(2.4)}
    />
    <path d="M47 46 Q47 37.5 53 37.5 Q59 37.5 59 46 Z" fill={`url(#${u('gold')})`} {...O(2)} />
    <rect
      x="39"
      y="46"
      width="4"
      height="20"
      fill={`url(#${u('gold')})`}
      stroke={INK}
      stroke-width="1.6"
    />
    <rect
      x="77"
      y="46.5"
      width="4"
      height="19"
      fill={`url(#${u('gold')})`}
      stroke={INK}
      stroke-width="1.5"
    />
    <circle cx="82.5" cy="43" r="3.8" fill="#FFF3A0" {...O(1.8)} />
    {gloss('M45 49.5 H74', 2, 0.55)}
    {/* khuôn mặt vui vẻ */}
    <Eye x={52} y={55} r={3.2} />
    <Eye x={67} y={55} r={3.2} />
    <Cheek x={47} y={60.5} r={3.2} />
    <Cheek x={72} y={60.5} r={3.2} />
    <path
      d="M56 59.5 Q59.5 63.5 63 59.5"
      fill="none"
      stroke="#263238"
      stroke-width="1.8"
      stroke-linecap="round"
    />
    {/* cabin lái */}
    <path d="M14 38 H37 V66 H14 Z" fill={`url(#${u('red')})`} {...O(2.4)} />
    <rect x="13" y="31" width="26" height="8" rx="3.6" fill={`url(#${u('gold')})`} {...O(2.2)} />
    <rect x="19" y="43.5" width="12" height="12" rx="3" fill={`url(#${u('glass')})`} {...O(1.9)} />
    {gloss('M21.5 53 L25 46', 1.6, 0.8)}
    {/* khung gầm + cản trước */}
    <rect x="13" y="65" width="73" height="6.5" rx="2.4" fill="#455A64" {...O(2)} />
    <path d="M83 66 L87.2 72.5 L83 72.5 Z" fill={`url(#${u('gold')})`} {...O(1.7)} />
    <path d="M32 73 H70" {...O(4.6)} />
    <path d="M32 73 H70" stroke="#FFD54F" stroke-width="2" />
    <Wheel id={u('w1')} x={32} y={73} hub="#FF4B4B" />
    <Wheel id={u('w2')} x={52} y={73} hub="#FF4B4B" />
    <Wheel id={u('w3')} x={70} y={73} hub="#FF4B4B" />
  </>
);

/** stk-36 Xe cứu hỏa. */
const fireTruck: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('red')}
        stops={[
          [0, '#FF7468'],
          [0.5, '#F02A30'],
          [1, '#B4102A'],
        ]}
      />
      <Lin id={u('glass')} x1={0} y1={0} x2={1} y2={1} stops={glassStops} />
      <Lin
        id={u('met')}
        stops={[
          [0, '#FFFFFF'],
          [1, '#A9BAC6'],
        ]}
      />
    </defs>
    <Road u={u} />
    <GroundShadow y={84} rx={37} ry={3.2} />
    {/* thang */}
    <path d="M16 40 L58 35 M16 46 L58 41" {...O(6)} fill="none" />
    <path
      d="M16 40 L58 35 M16 46 L58 41"
      stroke="#FFD93B"
      stroke-width="3"
      stroke-linecap="round"
      fill="none"
    />
    {[22, 29, 36, 43, 50].map((x) => (
      <path
        key={x}
        d={`M${x} ${40.8 - ((x - 16) * 5) / 42} V${46.8 - ((x - 16) * 5) / 42}`}
        stroke={INK}
        stroke-width="2"
      />
    ))}
    {/* thùng xe + cabin */}
    <path d="M13 53 Q13 48 18 48 H58 V72 H13 Z" fill={`url(#${u('red')})`} {...O(2.6)} />
    <path
      d="M58 40 H71 Q75 40 78 45.5 L84 55 Q86 57.5 86 61 V72 H58 Z"
      fill={`url(#${u('red')})`}
      {...O(2.6)}
    />
    <path d="M15 59.5 H85" stroke="#FFD93B" stroke-width="2.6" />
    <path
      d="M62 44.5 H70.5 Q72.5 44.5 74 48 L78 55 H62 Z"
      fill={`url(#${u('glass')})`}
      {...O(1.9)}
    />
    {gloss('M65 53 L68.5 47', 1.6, 0.8)}
    {/* ngăn kéo cuốn */}
    <rect x="19" y="52" width="16" height="16" rx="2.4" fill={`url(#${u('met')})`} {...O(1.8)} />
    <rect x="39" y="52" width="15" height="16" rx="2.4" fill={`url(#${u('met')})`} {...O(1.8)} />
    <path d="M20 57 H34 M20 62 H34 M40 57 H53 M40 62 H53" stroke="#78909C" stroke-width="1.1" />
    {gloss('M17 50.4 H56', 1.8, 0.5)}
    {/* đèn nóc */}
    <path d="M60 40 V37.5 Q60 33.5 64 33.5 Q68 33.5 68 37.5 V40 Z" fill="#35B6FF" {...O(1.8)} />
    <path d="M68 40 V37.5 Q68 33.5 72 33.5 Q76 33.5 76 37.5 V40 Z" fill="#FF8A1F" {...O(1.8)} />
    <Shine x={63} y={36.6} rx={1.5} ry={2.2} opacity={0.85} />
    <Shine x={71} y={36.6} rx={1.5} ry={2.2} opacity={0.85} />
    <ellipse cx="82.6" cy="64" rx="3" ry="3.6" fill="#FFF3A0" {...O(1.8)} />
    <rect x="79" y="69" width="8.5" height="4" rx="2" fill="#CFD8DC" {...O(1.6)} />
    <rect x="13.5" y="62" width="3.6" height="6" rx="1.8" fill="#FF9A1F" {...O(1.4)} />
    <path d="M18.5 72 A10.5 10.5 0 0 1 39.5 72 Z" fill="#263238" />
    <path d="M62.5 72 A10.5 10.5 0 0 1 83.5 72 Z" fill="#263238" />
    <Wheel id={u('w1')} x={29} y={74} />
    <Wheel id={u('w2')} x={73} y={74} />
  </>
);

/** stk-37 Trực thăng (hiếm). */
const heli: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('body')}
        stops={[
          [0, '#FFB872'],
          [0.4, '#FF7A2F'],
          [1, '#DC2F1F'],
        ]}
      />
      <Lin id={u('glass')} x1={0} y1={0} x2={1} y2={1} stops={glassStops} />
      <clipPath id={u('bc')}>
        <path d="M37 54 C37 42 47 38 59 38 C75 38 86 46 86 57 C86 67 78 71 67 71 L49 71 C41 71 37 64 37 54 Z" />
      </clipPath>
    </defs>
    <GroundShadow y={86} rx={22} ry={2.6} />
    {/* cánh quạt đuôi + đuôi */}
    <ellipse cx="14.8" cy="42" rx="2.4" ry="7.6" fill="#78909C" opacity="0.4" />
    <path d="M40 50 L17 45.5 L15.5 52 L40 60 Z" fill={`url(#${u('body')})`} {...O(2.4)} />
    <path d="M18 47 L13.5 33.5 Q21 33 27 47.5 Z" fill="#FFD21F" {...O(2.2)} />
    <circle cx="16" cy="45.5" r="2" fill="#37474F" />
    {/* chân trượt */}
    <path d="M52 70 L49.5 79 M70 70 L72 79 M40 80 H80 Q84.5 80 85.5 75.5" fill="none" {...O(5.4)} />
    <path
      d="M52 70 L49.5 79 M70 70 L72 79 M40 80 H80 Q84.5 80 85.5 75.5"
      fill="none"
      stroke="#FFD21F"
      stroke-width="2.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    {/* thân */}
    <path
      d="M37 54 C37 42 47 38 59 38 C75 38 86 46 86 57 C86 67 78 71 67 71 L49 71 C41 71 37 64 37 54 Z"
      fill={`url(#${u('body')})`}
      {...O(2.6)}
    />
    <g clip-path={`url(#${u('bc')})`}>
      <rect x="30" y="61" width="60" height="4.4" fill="#FFD21F" />
      <rect x="30" y="66" width="60" height="8" fill="#9B0F1F" opacity="0.28" />
    </g>
    <path d="M61 41 C74 41 83 48 84 57 H61 Z" fill={`url(#${u('glass')})`} {...O(2)} />
    <rect x="46" y="45" width="12" height="11" rx="3" fill={`url(#${u('glass')})`} {...O(1.9)} />
    {gloss('M66 44.2 Q76 45 81 52', 2.2, 0.85)}
    {gloss('M49 53 L52 47.5', 1.5, 0.8)}
    {gloss('M42 44 Q47 41 54 40.4', 2.2, 0.55)}
    {/* cánh quạt chính (mờ vì quay) */}
    <ellipse
      cx="57"
      cy="30.5"
      rx="29"
      ry="4.8"
      fill="#78909C"
      opacity="0.4"
      stroke="#fff"
      stroke-width="0.8"
    />
    <path d="M28.5 31.2 L57 28.2 L85.5 31.2 L57 32.6 Z" fill="#37474F" opacity="0.9" />
    <path
      d="M32 29.4 Q57 25.6 82 29.4"
      fill="none"
      stroke="#fff"
      stroke-width="1.3"
      opacity="0.7"
    />
    <rect x="55" y="31" width="4" height="8" fill="#546E7A" {...O(1.6)} />
    <circle cx="57" cy="30.6" r="3.2" fill="#FFD21F" {...O(1.8)} />
    <Sparkle x={24} y={64} s={5} opacity={0.95} />
    <Sparkle x={78} y={28} s={3.6} opacity={0.9} />
    <Sparkle x={26} y={76} s={3} opacity={0.8} />
  </>
);

/** stk-38 Tàu ngầm (hiếm). */
const submarine: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('wat')}
        stops={[
          [0, '#59D8FF'],
          [0.5, '#1E9BE0'],
          [1, '#0B5FB0'],
        ]}
      />
      <Lin
        id={u('hull')}
        stops={[
          [0, '#FFC863'],
          [0.45, '#FF8E1C'],
          [1, '#E2600A'],
        ]}
      />
      <Lin
        id={u('teal')}
        stops={[
          [0, '#5CEBD8'],
          [1, '#0E9C94'],
        ]}
      />
      <Lin
        id={u('sand')}
        stops={[
          [0, '#FFE9A8'],
          [1, '#E8B95A'],
        ]}
      />
      <Rad
        id={u('glass')}
        stops={[
          [0, '#F0FDFF'],
          [1, '#3AA8E8'],
        ]}
      />
      <clipPath id={u('bc')}>
        <path d="M32 42 H72 Q86 42 86 56 Q86 70 72 70 H32 Q20 70 20 56 Q20 42 32 42 Z" />
      </clipPath>
    </defs>
    {/* nước + tia sáng */}
    <path
      d="M9 22 Q17 18 25 22 T41 22 T57 22 T73 22 T89 22 L91 92 L9 92 Z"
      fill={`url(#${u('wat')})`}
    />
    <path
      d="M24 22 L40 22 L52 86 L22 86 Z M58 22 L66 22 L82 86 L66 86 Z"
      fill="#fff"
      opacity="0.1"
    />
    <path
      d="M9 22 Q17 18 25 22 T41 22 T57 22 T73 22 T89 22"
      fill="none"
      stroke="#fff"
      stroke-width="2"
      opacity="0.85"
    />
    {/* đáy biển + rong + san hô */}
    <path d="M9 86 Q30 79 50 84 T91 82 L91 92 L9 92 Z" fill={`url(#${u('sand')})`} />
    <path
      d="M17 87 Q12 79 18 72 Q21 79 19 87 M23 87 Q21 80 26 76 Q27 82 25 87"
      fill="#3DD16B"
      stroke={INK}
      stroke-width="1.4"
      stroke-linejoin="round"
    />
    <path
      d="M74 86 V78 M74 80 L69 75 M74 79 L79 74"
      stroke="#FF5C93"
      stroke-width="3"
      stroke-linecap="round"
      fill="none"
    />
    {/* vây + chong chóng */}
    <path d="M25 44 L17.5 31.5 Q28 30 33 43 Z" fill={`url(#${u('teal')})`} {...O(2.2)} />
    <path d="M25 68 L19.5 78 Q27 79 32 69 Z" fill={`url(#${u('teal')})`} {...O(2.2)} />
    <ellipse cx="16" cy="49.5" rx="2.8" ry="6.2" fill="#E3EBF0" {...O(1.8)} />
    <ellipse cx="16" cy="62.5" rx="2.8" ry="6.2" fill="#E3EBF0" {...O(1.8)} />
    {/* kính tiềm vọng + tháp */}
    <path d="M53 30 V20 H61" fill="none" {...O(5.4)} />
    <path
      d="M53 30 V20 H61"
      fill="none"
      stroke="#CFD8DC"
      stroke-width="2.6"
      stroke-linecap="round"
      stroke-linejoin="round"
    />
    <circle cx="61.5" cy="20" r="2.4" fill="#FFF3A0" {...O(1.5)} />
    <path
      d="M43 42.5 L45 31.5 Q45.5 29.5 48 29.5 H58 Q60.5 29.5 61 31.5 L63 42.5 Z"
      fill={`url(#${u('teal')})`}
      {...O(2.4)}
    />
    <rect
      x="49.5"
      y="33.5"
      width="7"
      height="5"
      rx="2.2"
      fill={`url(#${u('glass')})`}
      {...O(1.5)}
    />
    {/* thân */}
    <path
      d="M32 42 H72 Q86 42 86 56 Q86 70 72 70 H32 Q20 70 20 56 Q20 42 32 42 Z"
      fill={`url(#${u('hull')})`}
      {...O(2.6)}
    />
    <g clip-path={`url(#${u('bc')})`}>
      <path
        d="M14 62.5 Q35 58.5 52 62.5 T92 60 V74 H14 Z"
        fill={`url(#${u('teal')})`}
        stroke={INK}
        stroke-width="1.6"
      />
    </g>
    {[37, 53, 69].map((x) => (
      <g key={x}>
        <circle cx={x} cy="53" r="5.8" fill="#FFD54F" {...O(1.8)} />
        <circle cx={x} cy="53" r="4" fill={`url(#${u('glass')})`} stroke={INK} stroke-width="1.2" />
        <Shine x={x - 1.3} y={51.6} rx={1.3} ry={0.9} rot={-30} opacity={0.95} />
      </g>
    ))}
    {gloss('M29 46 Q52 43.6 76 46', 2.4, 0.6)}
    <Shine x={81} y={52} rx={1.6} ry={3.2} opacity={0.65} />
    {/* bong bóng */}
    {BUBBLES.map(([x, y, r]) => (
      <g key={x}>
        <circle
          cx={x}
          cy={y}
          r={r}
          fill="#fff"
          fill-opacity="0.28"
          stroke="#fff"
          stroke-width="1.2"
        />
        <circle cx={x - r * 0.35} cy={y - r * 0.35} r={r * 0.22} fill="#fff" />
      </g>
    ))}
    <Sparkle x={80} y={72} s={3.4} opacity={0.9} />
  </>
);

/** Đường meridian của quả khí cầu (t ∈ [-1, 1]). */
const gore = (t1: number, t2: number) =>
  `M50 13 C${50 + t1 * 27} 13 ${50 + t1 * 29} 44 ${50 + t1 * 6} 62 L${50 + t2 * 6} 62 C${50 + t2 * 29} 44 ${50 + t2 * 27} 13 50 13 Z`;
const BALLOON_COLORS = ['#FF3B4E', '#FF9A1F', '#FFE135', '#3DD16B', '#2D9BFF', '#9B5CFF'];
const BALLOON_SHAPE = 'M50 13 C77 13 79 44 56 62 L44 62 C21 44 23 13 50 13 Z';

/** Đám mây nhỏ (dưới là lớp bóng xanh nhạt). */
const Cloud = ({ x, y, k = 1 }: { x: number; y: number; k?: number }) => (
  <g transform={`translate(${x} ${y}) scale(${k})`}>
    <g fill="#B9E2F7">
      <ellipse cx="0" cy="2" rx="11" ry="4.6" />
      <circle cx="-4.5" cy="-1.5" r="4.6" />
      <circle cx="3.5" cy="-2.5" r="5.6" />
    </g>
    <g fill="#fff">
      <ellipse cx="0" cy="0.6" rx="11" ry="4.2" />
      <circle cx="-4.5" cy="-2.6" r="4.4" />
      <circle cx="3.5" cy="-3.6" r="5.4" />
    </g>
  </g>
);

/** stk-39 Khinh khí cầu (hiếm). */
const balloon: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('bask')}
        stops={[
          [0, '#F7C97A'],
          [1, '#B8742F'],
        ]}
      />
      <radialGradient id={u('sh')} cx="0.32" cy="0.3" r="0.8">
        <stop offset="0" stop-color="#fff" stop-opacity="0.5" />
        <stop offset="0.45" stop-color="#fff" stop-opacity="0" />
        <stop offset="1" stop-color="#1A237E" stop-opacity="0.32" />
      </radialGradient>
    </defs>
    <Cloud x={24} y={79} k={0.95} />
    <Cloud x={78} y={73} k={0.8} />
    {/* dây treo + giỏ */}
    <path
      d="M35 56 L42 72 M65 56 L58 72 M46 62 L45 72 M54 62 L55 72"
      stroke={INK}
      stroke-width="1.6"
      fill="none"
      stroke-linecap="round"
    />
    <path
      d="M41.5 72 H58.5 L56.8 85 Q56.7 86.2 55.5 86.2 H44.5 Q43.3 86.2 43.2 85 Z"
      fill={`url(#${u('bask')})`}
      {...O(2.2)}
    />
    <path
      d="M42.5 77 H57.5 M43 81.5 H57 M47 73 L46 85.5 M53 73 L54 85.5"
      stroke="#7A4A1C"
      stroke-width="1.1"
      opacity="0.7"
    />
    <rect x="39.5" y="70" width="21" height="4.6" rx="2.2" fill="#9A5A22" {...O(1.9)} />
    {/* quả khí cầu: dải cầu vồng */}
    {BALLOON_COLORS.map((c, i) => (
      <path key={c} d={gore(-1 + i / 3, -1 + (i + 1) / 3)} fill={c} />
    ))}
    <path d={BALLOON_SHAPE} fill={`url(#${u('sh')})`} />
    <path
      d="M50 13 C34 20 40 46 47 62 M50 13 C66 20 60 46 53 62"
      fill="none"
      stroke={INK}
      stroke-width="0.9"
      opacity="0.3"
    />
    <path d={BALLOON_SHAPE} fill="none" {...O(2.6)} />
    {gloss('M32 30 Q34 21 43 17', 3.4, 0.7)}
    <Shine x={31} y={39} rx={1.8} ry={4} rot={8} opacity={0.55} />
    {/* miệng khí cầu + ngọn lửa */}
    <path d="M44 62 H56 L55 66 H45 Z" fill="#FFD54F" {...O(1.8)} />
    <path d="M50 64 Q46.5 69 50 72 Q53.5 69 50 64 Z" fill="#FF8A1F" />
    <path d="M50 67 Q48.5 69.5 50 71 Q51.5 69.5 50 67 Z" fill="#FFF3A0" />
    <Sparkle x={22} y={32} s={4.6} opacity={0.95} />
    <Sparkle x={79} y={22} s={3.6} opacity={0.9} />
    <Sparkle x={82} y={52} s={3} opacity={0.85} />
  </>
);

/** stk-40 Tên lửa (siêu hiếm): thân kim loại, ngọn lửa nhiều lớp, ánh vàng. */
const rocket: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('sky')}
        stops={[
          [0, '#2A1B96'],
          [0.5, '#5A6BFF'],
          [1, '#8FDCFF'],
        ]}
      />
      <linearGradient id={u('fade')} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#fff" stop-opacity="1" />
        <stop offset="0.62" stop-color="#fff" stop-opacity="0.9" />
        <stop offset="1" stop-color="#fff" stop-opacity="0" />
      </linearGradient>
      <mask id={u('skm')}>
        <rect x="9" y="9" width="82" height="82" fill={`url(#${u('fade')})`} />
      </mask>
      <Lin
        id={u('met')}
        x1={0}
        y1={0}
        x2={1}
        y2={0}
        stops={[
          [0, '#B4C8DA'],
          [0.3, '#FFFFFF'],
          [0.68, '#DCE7F2'],
          [1, '#8FA6BE'],
        ]}
      />
      <Lin
        id={u('red')}
        x1={0}
        y1={0}
        x2={1}
        y2={0}
        stops={[
          [0, '#FF8A80'],
          [0.4, '#F0262F'],
          [1, '#A60F26'],
        ]}
      />
      <Lin
        id={u('blue')}
        stops={[
          [0, '#5AA8FF'],
          [1, '#1F4FD0'],
        ]}
      />
      <Lin
        id={u('gold')}
        x1={0}
        y1={0}
        x2={1}
        y2={1}
        stops={[
          [0, '#FFF6B0'],
          [0.5, '#FFC21A'],
          [1, '#D98A00'],
        ]}
      />
      <Lin
        id={u('fo')}
        stops={[
          [0, '#FF3B1F'],
          [1, '#FF9A1F'],
        ]}
      />
      <Rad
        id={u('glass')}
        stops={[
          [0, '#E8FBFF'],
          [0.5, '#4CB8F5'],
          [1, '#1B5FC8'],
        ]}
      />
      <radialGradient id={u('glow')}>
        <stop offset="0" stop-color="#FFE56A" stop-opacity="0.85" />
        <stop offset="1" stop-color="#FFB400" stop-opacity="0" />
      </radialGradient>
      <clipPath id={u('bc')}>
        <path d="M50 11 C63 22 67 40 65 62 H35 C33 40 37 22 50 11 Z" />
      </clipPath>
    </defs>
    {/* bầu trời chuyển sang vũ trụ + sao */}
    <rect
      x="9"
      y="9"
      width="82"
      height="82"
      fill={`url(#${u('sky')})`}
      mask={`url(#${u('skm')})`}
    />
    {[
      [20, 22, 1.1],
      [33, 14, 0.9],
      [80, 40, 1.1],
      [86, 24, 0.9],
      [24, 44, 0.8],
      [74, 60, 0.9],
    ].map(([x, y, r]) => (
      <circle key={x} cx={x} cy={y} r={r} fill="#fff" opacity="0.9" />
    ))}
    {/* khói phóng phía sau */}
    <Cloud x={23} y={80} k={0.85} />
    <Cloud x={17} y={68} k={0.55} />
    <circle cx="52" cy="52" r="38" fill={`url(#${u('glow')})`} opacity="0.45" />
    <g transform="translate(51 50) rotate(24) scale(0.86) translate(-50 -53.5)">
      {/* quầng sáng + lửa nhiều lớp */}
      <circle cx="50" cy="80" r="23" fill={`url(#${u('glow')})`} />
      <path
        d="M38 66 C31 78 40 86 45 91 C46.5 94 48.5 96 50 99 C51.5 96 53.5 94 55 91 C60 86 69 78 62 66 Z"
        fill={`url(#${u('fo')})`}
        {...O(2.2)}
      />
      <path
        d="M42 66 C39 75 45 81 48 86 C49 89 49.5 91 50 93 C50.5 91 51 89 52 86 C55 81 61 75 58 66 Z"
        fill="#FFC21A"
      />
      <path d="M46 66 C45 71 48 75 50 80 C52 75 55 71 54 66 Z" fill="#FFF6B0" />
      {/* cánh + vòi phun */}
      <path
        d="M36 46 C27 50 23 58 23.5 70 C30 69 35 66 36 62 Z"
        fill={`url(#${u('red')})`}
        {...O(2.4)}
      />
      <path
        d="M64 46 C73 50 77 58 76.5 70 C70 69 65 66 64 62 Z"
        fill={`url(#${u('red')})`}
        {...O(2.4)}
      />
      <path d="M40 62 H60 L62.5 67.5 H37.5 Z" fill={`url(#${u('gold')})`} {...O(2.2)} />
      {/* thân */}
      <path d="M50 11 C63 22 67 40 65 62 H35 C33 40 37 22 50 11 Z" fill={`url(#${u('met')})`} />
      <g clip-path={`url(#${u('bc')})`}>
        <path d="M30 6 H70 V30 Q50 37 30 30 Z" fill={`url(#${u('red')})`} />
        <path d="M28 30 Q50 37 72 30" fill="none" stroke={INK} stroke-width="1.6" />
        <path
          d="M28 31.6 Q50 38.6 72 31.6"
          fill="none"
          stroke={`url(#${u('gold')})`}
          stroke-width="2.4"
        />
        <rect
          x="28"
          y="50"
          width="44"
          height="11"
          fill={`url(#${u('blue')})`}
          stroke={INK}
          stroke-width="1.6"
        />
        <path
          d="M59 16 Q66 38 63 62"
          fill="none"
          stroke="#5C7792"
          stroke-width="5"
          opacity="0.28"
        />
      </g>
      <path d="M50 11 C63 22 67 40 65 62 H35 C33 40 37 22 50 11 Z" fill="none" {...O(2.6)} />
      {/* cửa sổ tròn viền vàng */}
      <circle cx="50" cy="41" r="8.2" fill={`url(#${u('gold')})`} {...O(2)} />
      <circle
        cx="50"
        cy="41"
        r="5.8"
        fill={`url(#${u('glass')})`}
        stroke={INK}
        stroke-width="1.4"
      />
      {gloss('M46.4 38.8 Q47.6 36.8 50 36.4', 1.6, 0.9)}
      <Sparkle x={52.4} y={43.4} s={1.9} opacity={0.95} />
      {/* sao vàng trên dải xanh */}
      <path
        d="M50 52.2 L51.4 55.2 L54.6 55.5 L52.2 57.6 L52.9 60.7 L50 59 L47.1 60.7 L47.8 57.6 L45.4 55.5 L48.6 55.2 Z"
        fill={`url(#${u('gold')})`}
        stroke={INK}
        stroke-width="0.9"
        stroke-linejoin="round"
      />
      {gloss('M43 22 Q40 36 41 55', 3, 0.75)}
      <circle cx="50" cy="12.6" r="1.8" fill={`url(#${u('gold')})`} />
    </g>
    <Sparkle x={26} y={28} s={6.4} fill="#FFFDE0" />
    <Sparkle x={72} y={74} s={5} fill="#FFFDE0" />
    <Sparkle x={80} y={52} s={3.4} fill="#FFE56A" />
    <Sparkle x={22} y={44} s={3.6} fill="#FFE56A" />
  </>
);

export const VEHICLE_ART: Record<string, ArtFn> = {
  'stk-31': car,
  'stk-32': bus,
  'stk-33': bike,
  'stk-34': sailboat,
  'stk-35': train,
  'stk-36': fireTruck,
  'stk-37': heli,
  'stk-38': submarine,
  'stk-39': balloon,
  'stk-40': rocket,
};
