// Sticker chủ đề động vật: stk-01 … stk-10 (01–06 Thường · 07–09 Hiếm · 10 Siêu hiếm). Khung 100×100, vùng an toàn [12, 88].
import { Cheek, Eye, GroundShadow, INK, Lin, Rad, Shine, Sparkle, type ArtFn } from './kit';

const url = (id: string) => `url(#${id})`;

/** Hình bất kỳ có viền INK. */
function Pth({ d, fill, w = 2.4 }: { d: string; fill: string; w?: number }) {
  return (
    <path
      d={d}
      fill={fill}
      stroke={INK}
      stroke-width={w}
      stroke-linejoin="round"
      stroke-linecap="round"
    />
  );
}

/** Elip có viền INK (w = 0: không viền). */
function Ell({
  cx,
  cy,
  rx,
  ry,
  fill,
  w = 2.4,
  rot = 0,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  fill: string;
  w?: number;
  rot?: number;
}) {
  return (
    <ellipse
      cx={cx}
      cy={cy}
      rx={rx}
      ry={ry}
      fill={fill}
      stroke={w ? INK : undefined}
      stroke-width={w || undefined}
      transform={rot ? `rotate(${rot} ${cx} ${cy})` : undefined}
    />
  );
}

/** Nét đường thuần (râu, vân, đường miệng…). */
function Ln({ d, c = INK, w = 2, o }: { d: string; c?: string; w?: number; o?: number }) {
  return (
    <path
      d={d}
      fill="none"
      stroke={c}
      stroke-width={w}
      stroke-linecap="round"
      stroke-linejoin="round"
      opacity={o}
    />
  );
}

/** Ống cong có viền (đuôi, cành): lớp viền dày bên dưới + lớp màu bên trên. */
function Tube({ d, color, w = 6.4 }: { d: string; color: string; w?: number }) {
  return (
    <>
      <Ln d={d} w={w + 3.6} />
      <Ln d={d} c={color} w={w} />
    </>
  );
}

/** stk-01 Mèo con – bản mẫu phong cách. */
const cat: ArtFn = (u) => (
  <g transform="translate(50 51) scale(0.93) translate(-55.7 -52)">
    <defs>
      <Lin
        id={u('fur')}
        stops={[
          [0, '#FFC983'],
          [1, '#FF8E3A'],
        ]}
      />
      <Lin
        id={u('belly')}
        stops={[
          [0, '#FFFFFF'],
          [1, '#FFE6C7'],
        ]}
      />
    </defs>
    <GroundShadow y={87} rx={28} />
    {/* đuôi */}
    <Tube d="M71 78 C 90 78, 92 54, 79 48" color="#FF9B45" />
    <Ln d="M84 61 q5 -2 8 3 M83 70 q5 -1 6 4" c="#C85E12" />
    {/* thân */}
    <Ell cx={50} cy={73} rx={24} ry={15} fill={url(u('fur'))} w={2.5} />
    <Ell cx={50} cy={77} rx={12} ry={9} fill={url(u('belly'))} w={0} />
    <Ell cx={38} cy={85} rx={7.5} ry={4.6} fill="#FFF3E0" w={2.2} />
    <Ell cx={62} cy={85} rx={7.5} ry={4.6} fill="#FFF3E0" w={2.2} />
    {/* tai */}
    <Pth d="M27 41 L28 16 L48 30 Z" fill="#FF9B45" w={2.5} />
    <Pth d="M73 41 L72 16 L52 30 Z" fill="#FF9B45" w={2.5} />
    <path d="M32 35 L32.5 23 L42 30 Z" fill="#FF8FB1" />
    <path d="M68 35 L67.5 23 L58 30 Z" fill="#FF8FB1" />
    {/* đầu */}
    <Ell cx={50} cy={47} rx={26} ry={23} fill={url(u('fur'))} w={2.5} />
    <Ln d="M50 25 v8 M43 26 l2 7 M57 26 l-2 7" c="#C85E12" w={2.6} />
    <Ell cx={50} cy={57} rx={12} ry={8.5} fill={url(u('belly'))} w={0} />
    <Eye x={39.5} y={46} r={4.2} />
    <Eye x={60.5} y={46} r={4.2} />
    <Cheek x={31} y={55} r={4.5} />
    <Cheek x={69} y={55} r={4.5} />
    <Pth d="M47 53 L53 53 L50 57 Z" fill="#FF6F91" w={1.4} />
    <Ln d="M50 57 Q46 62 42 60 M50 57 Q54 62 58 60" />
    <Ln d="M30 51 l-10 -2 M30 55 l-10 3 M70 51 l10 -2 M70 55 l10 3" w={1.6} />
    <Shine x={38} y={33} rx={8} ry={3.4} rot={-20} opacity={0.55} />
  </g>
);

/** stk-02 Cún con: tai cụp nâu, đốm quanh mắt, lè lưỡi, vòng cổ đỏ có thẻ vàng. */
const puppy: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('fur')}
        stops={[
          [0, '#FFE3B3'],
          [1, '#F0A95C'],
        ]}
      />
      <Lin
        id={u('muz')}
        stops={[
          [0, '#FFFFFF'],
          [1, '#FFEBD0'],
        ]}
      />
      <Lin
        id={u('ear')}
        stops={[
          [0, '#C27A42'],
          [1, '#7A4220'],
        ]}
      />
    </defs>
    <GroundShadow y={85} rx={28} />
    {/* đuôi vẫy */}
    <Tube d="M70 76 Q84 75 80 59" color="#F0A95C" />
    {/* thân + chân */}
    <Ell cx={50} cy={73} rx={23} ry={14} fill={url(u('fur'))} w={2.5} />
    <Ell cx={50} cy={77} rx={11} ry={8} fill={url(u('muz'))} w={0} />
    <Ell cx={37} cy={82.6} rx={7.5} ry={4.6} fill={url(u('muz'))} w={2.2} />
    <Ell cx={63} cy={82.6} rx={7.5} ry={4.6} fill={url(u('muz'))} w={2.2} />
    {/* vòng cổ + thẻ vàng */}
    <Tube d="M32 64 Q50 76 68 64" color="#E53935" w={4.2} />
    <circle cx="50" cy="74.5" r="3.6" fill="#FFD54F" stroke={INK} stroke-width="1.8" />
    {/* đầu */}
    <Ell cx={50} cy={46} rx={25} ry={21} fill={url(u('fur'))} w={2.5} />
    <Ell cx={61} cy={44} rx={9} ry={9.5} fill="#B8703A" w={0} rot={-10} />
    <Ell cx={50} cy={57} rx={13} ry={9.5} fill={url(u('muz'))} w={0} />
    <Eye x={40} y={45} r={4.2} />
    <Eye x={60} y={45} r={4.2} />
    <Cheek x={31} y={56} r={4.2} />
    <Cheek x={69} y={56} r={4.2} />
    <ellipse cx="50" cy="52" rx="5.4" ry="3.8" fill="#37474F" />
    <Shine x={48.4} y={50.8} rx={1.8} ry={0.9} opacity={0.8} />
    <Ln d="M50 55.5 V59 M50 59 Q45 64 41 60 M50 59 Q55 64 59 60" />
    <Pth d="M46.5 61.6 Q50 73 53.5 61.6 Z" fill="#FF6F91" w={1.8} />
    <Ln d="M50 63 V67" c="#D6456B" w={1.4} />
    {/* tai cụp */}
    <Pth
      d="M31 30 C 17 27, 10 43, 15 58 C 18 66, 28 64, 31 53 C 33 45, 35 36, 31 30 Z"
      fill={url(u('ear'))}
    />
    <Pth
      d="M69 30 C 83 27, 90 43, 85 58 C 82 66, 72 64, 69 53 C 67 45, 65 36, 69 30 Z"
      fill={url(u('ear'))}
    />
    <Ln d="M20 40 Q16 48 19 56" c="#fff" w={2.4} o={0.45} />
    <Shine x={39} y={34} rx={8} ry={3.2} rot={-20} opacity={0.55} />
  </>
);

/** stk-03 Thỏ trắng: tai dài lòng hồng, răng cửa, cầm củ cà rốt. */
const bunny: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('fur')}
        stops={[
          [0, '#FFFFFF'],
          [1, '#DDE4F4'],
        ]}
      />
      <Lin
        id={u('carrot')}
        x1={0}
        y1={0}
        x2={1}
        y2={1}
        stops={[
          [0, '#FFB74D'],
          [1, '#F0601A'],
        ]}
      />
    </defs>
    <GroundShadow y={85} rx={27} />
    {/* tai dài */}
    <g transform="rotate(-9 38 28)">
      <Ell cx={38} cy={28} rx={7.8} ry={15} fill={url(u('fur'))} />
      <Ell cx={38} cy={30} rx={4} ry={10.5} fill="#FFB3CB" w={0} />
    </g>
    <g transform="rotate(11 62 28)">
      <Ell cx={62} cy={28} rx={7.8} ry={15} fill={url(u('fur'))} />
      <Ell cx={62} cy={30} rx={4} ry={10.5} fill="#FFB3CB" w={0} />
    </g>
    {/* đuôi bông + thân */}
    <Ell cx={70} cy={77} rx={6.5} ry={6} fill="#fff" />
    <Ell cx={50} cy={74} rx={19} ry={12} fill={url(u('fur'))} w={2.5} />
    <Ell cx={35} cy={82.6} rx={9} ry={4.6} fill={url(u('fur'))} w={2.2} />
    <Ell cx={58} cy={82.6} rx={9} ry={4.6} fill={url(u('fur'))} w={2.2} />
    {/* đầu */}
    <Ell cx={50} cy={55} rx={24} ry={20} fill={url(u('fur'))} w={2.5} />
    <Eye x={40} y={53} r={4.3} />
    <Eye x={60} y={53} r={4.3} />
    <Cheek x={31.5} y={62} r={4.4} />
    <Cheek x={68.5} y={62} r={4.4} />
    <Ell cx={50} cy={58.5} rx={2.9} ry={2.1} fill="#FF7FA3" w={1.2} />
    <Ln d="M50 60.5 Q47 64.5 43.5 62.5 M50 60.5 Q53 64.5 56.5 62.5" w={1.8} />
    <rect
      x="47"
      y="63.4"
      width="2.8"
      height="3.8"
      rx="0.9"
      fill="#fff"
      stroke={INK}
      stroke-width="1.2"
    />
    <rect
      x="50.2"
      y="63.4"
      width="2.8"
      height="3.8"
      rx="0.9"
      fill="#fff"
      stroke={INK}
      stroke-width="1.2"
    />
    <Ln d="M31 56 l-10 -2 M31 60 l-10 2 M69 56 l10 -2 M69 60 l10 2" c="#90A4AE" w={1.4} />
    <Shine x={40} y={43} rx={7} ry={2.8} rot={-20} opacity={0.8} />
    {/* cà rốt */}
    <Tube d="M70 68 Q67 61 62 60 M72 67 Q72 60 74 56 M74 68 Q78 62 83 62" color="#3DBE4B" w={3} />
    <Pth
      d="M65.5 72 C 66 66, 76 64, 78 70 C 77 78, 72 84, 68 87 C 65 82, 64 77, 65.5 72 Z"
      fill={url(u('carrot'))}
      w={2.2}
    />
    <Ln d="M69 75 l4 1 M68.5 80 l3.5 1" c="#C24A0A" w={1.5} />
    <Ell cx={66} cy={77} rx={4.6} ry={3.6} fill={url(u('fur'))} w={2} />
  </>
);

/** stk-04 Gấu nâu: tai tròn, mõm kem, ôm hũ mật ong. */
const bear: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('fur')}
        stops={[
          [0, '#DB9A62'],
          [1, '#98592F'],
        ]}
      />
      <Lin
        id={u('muz')}
        stops={[
          [0, '#FFF1D6'],
          [1, '#F0C48A'],
        ]}
      />
      <Lin
        id={u('honey')}
        stops={[
          [0, '#FFE066'],
          [1, '#F29A0E'],
        ]}
      />
    </defs>
    <GroundShadow y={85} rx={28} />
    {/* thân + chân */}
    <Ell cx={50} cy={72} rx={24} ry={14} fill={url(u('fur'))} w={2.5} />
    <Ell cx={50} cy={76} rx={13} ry={9} fill={url(u('muz'))} w={0} />
    <Ell cx={36} cy={82.6} rx={8} ry={4.8} fill={url(u('muz'))} w={2.2} />
    {/* tai tròn */}
    <Ell cx={28} cy={27} rx={9.5} ry={9.5} fill={url(u('fur'))} />
    <Ell cx={72} cy={27} rx={9.5} ry={9.5} fill={url(u('fur'))} />
    <Ell cx={28} cy={27.5} rx={5} ry={5} fill="#F2C48C" w={0} />
    <Ell cx={72} cy={27.5} rx={5} ry={5} fill="#F2C48C" w={0} />
    {/* đầu */}
    <Ell cx={50} cy={46} rx={26} ry={23} fill={url(u('fur'))} w={2.5} />
    <Ell cx={50} cy={55} rx={12.5} ry={9.5} fill={url(u('muz'))} w={0} />
    <Eye x={39.5} y={43.5} r={4.2} />
    <Eye x={60.5} y={43.5} r={4.2} />
    <Cheek x={30.5} y={54} r={4.5} />
    <Cheek x={69.5} y={54} r={4.5} />
    <ellipse cx="50" cy="51" rx="4.9" ry="3.4" fill="#4E342E" />
    <Shine x={48.4} y={49.9} rx={1.7} ry={0.9} opacity={0.8} />
    <Ln d="M50 54 V57 M50 57 Q45 62 41.5 58.5 M50 57 Q55 62 58.5 58.5" />
    <Shine x={38} y={31} rx={8} ry={3.4} rot={-20} opacity={0.5} />
    {/* hũ mật ong */}
    <Pth d="M60 74 C 55 78, 56 87, 68 87 C 80 87, 81 78, 76 74 Z" fill={url(u('honey'))} />
    <rect
      x="59.5"
      y="68.5"
      width="17"
      height="6.5"
      rx="2.6"
      fill="#A0622D"
      stroke={INK}
      stroke-width="2"
    />
    <Pth
      d="M68 85 C 63 81.5, 64.5 78.6, 68 80.6 C 71.5 78.6, 73 81.5, 68 85 Z"
      fill="#FF7B9C"
      w={1.3}
    />
    <Ln d="M59.5 79 Q60 82.5 62.8 84.5" c="#fff" w={2.2} o={0.75} />
    <Ell cx={61} cy={76} rx={5} ry={3.8} fill={url(u('fur'))} w={2} />
  </>
);

/** stk-05 Vịt vàng: bơi trên vũng nước, mỏ cam, chỏm lông. */
const duck: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('fur')}
        stops={[
          [0, '#FFF59D'],
          [1, '#FFCA28'],
        ]}
      />
      <Lin
        id={u('wing')}
        stops={[
          [0, '#FFD54F'],
          [1, '#FFA000'],
        ]}
      />
      <Lin
        id={u('beak')}
        stops={[
          [0, '#FFB74D'],
          [1, '#FF7A00'],
        ]}
      />
      <Lin
        id={u('water')}
        stops={[
          [0, '#7ED6FF'],
          [1, '#2F9BEA'],
        ]}
      />
    </defs>
    <Ell cx={50} cy={81} rx={31} ry={6.5} fill={url(u('water'))} w={2.2} />
    {/* thân + đuôi + cánh */}
    <Pth d="M72 58 Q84 50 83 62 Q80 69 73 68 Z" fill={url(u('fur'))} />
    <Ell cx={50} cy={66} rx={27} ry={18} fill={url(u('fur'))} w={2.5} />
    <Ell cx={60} cy={68} rx={12} ry={7.5} fill={url(u('wing'))} w={2.2} rot={-18} />
    <Ln d="M54 66 q4 2 8 0 M58 71 q4 1 8 -1" c="#E08A00" w={1.5} />
    {/* nước phía trước */}
    <path
      d="M19 80 Q34 72 50 77 T81 80 Q80 87.5 50 87.5 Q20 87.5 19 80 Z"
      fill={url(u('water'))}
      stroke={INK}
      stroke-width="2.2"
      stroke-linejoin="round"
    />
    <Ln d="M26 82 Q33 85 41 83 M58 85 Q66 87 73 84" c="#fff" w={2} o={0.7} />
    {/* đầu */}
    <Ell cx={50} cy={40} rx={22} ry={22} fill={url(u('fur'))} w={2.5} />
    <Tube d="M47 19.5 Q46 15.5 42 16.5 M52 19 Q54 14.5 58 15.5" color="#FFCA28" w={1.8} />
    <Eye x={40} y={37} r={4} />
    <Eye x={60} y={37} r={4} />
    <Cheek x={31.5} y={47} r={4.5} />
    <Cheek x={68.5} y={47} r={4.5} />
    <Pth d="M38 45 Q50 39 62 45 Q62 56 50 56 Q38 56 38 45 Z" fill={url(u('beak'))} w={2.2} />
    <Ln d="M41 49.5 Q50 53 59 49.5" w={1.6} />
    <circle cx="46" cy="45.5" r="1" fill={INK} />
    <circle cx="54" cy="45.5" r="1" fill={INK} />
    <Shine x={45.5} y={43.6} rx={3.6} ry={1.2} rot={-8} opacity={0.7} />
    <Shine x={38} y={27} rx={7} ry={3} rot={-25} opacity={0.6} />
  </>
);

/** stk-06 Heo hồng: mõm to hai lỗ mũi, tai gập, đuôi xoắn. */
const pig: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('fur')}
        stops={[
          [0, '#FFCADA'],
          [1, '#FF86AC'],
        ]}
      />
      <Lin
        id={u('snout')}
        stops={[
          [0, '#FFC0D5'],
          [1, '#FF8CB0'],
        ]}
      />
    </defs>
    <GroundShadow y={85} rx={28} />
    {/* đuôi xoắn */}
    <Tube d="M72 72 C 83 72, 85 63, 80 62 C 76 61.5, 76 67, 81 66.5" color="#FF8FB1" w={3} />
    {/* thân + chân */}
    <Ell cx={50} cy={73} rx={24} ry={13} fill={url(u('fur'))} w={2.5} />
    <Ell cx={50} cy={77} rx={12} ry={8} fill="#FFE2EC" w={0} />
    <Ell cx={37} cy={82.6} rx={7.5} ry={4.4} fill="#FF9FBD" w={2.2} />
    <Ell cx={63} cy={82.6} rx={7.5} ry={4.4} fill="#FF9FBD" w={2.2} />
    {/* tai gập */}
    <Pth d="M28 38 C 14 36, 12 20, 20 17 C 28 16, 38 24, 40 31 Z" fill="#FF9DBB" />
    <Pth d="M72 38 C 86 36, 88 20, 80 17 C 72 16, 62 24, 60 31 Z" fill="#FF9DBB" />
    <path d="M26 31 C 19 30, 18 23, 21 21 C 26 21, 31 25, 33 29 Z" fill="#FF6F9C" />
    <path d="M74 31 C 81 30, 82 23, 79 21 C 74 21, 69 25, 67 29 Z" fill="#FF6F9C" />
    {/* đầu */}
    <Ell cx={50} cy={47} rx={27} ry={23} fill={url(u('fur'))} w={2.5} />
    <Eye x={37} y={43.5} r={4.2} />
    <Eye x={63} y={43.5} r={4.2} />
    <Cheek x={28.5} y={53} r={4.6} />
    <Cheek x={71.5} y={53} r={4.6} />
    <Ell cx={50} cy={56} rx={12.5} ry={9} fill={url(u('snout'))} w={2.2} />
    <ellipse cx="45.3" cy="56" rx="2.2" ry="3.2" fill="#C2185B" />
    <ellipse cx="54.7" cy="56" rx="2.2" ry="3.2" fill="#C2185B" />
    <Shine x={46} y={51.4} rx={4} ry={1.4} rot={-8} opacity={0.65} />
    <Ln d="M45 66.5 Q50 70 55 66.5" w={1.8} />
    <Shine x={37} y={32} rx={8} ry={3.4} rot={-20} opacity={0.6} />
  </>
);

/** stk-07 Gấu trúc (Hiếm): vằn mắt đen, ôm cây tre, lấp lánh. */
const panda: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('fur')}
        stops={[
          [0, '#FFFFFF'],
          [1, '#DCE5EB'],
        ]}
      />
      <Lin
        id={u('blk')}
        stops={[
          [0, '#5C6E78'],
          [1, '#263238'],
        ]}
      />
      <Lin
        id={u('bam')}
        x1={0}
        x2={1}
        stops={[
          [0, '#2E9E3F'],
          [0.45, '#A6F07A'],
          [1, '#3DB04C'],
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
    <GroundShadow y={85} rx={29} />
    {/* cây tre */}
    <g transform="rotate(3 80 50)">
      <rect
        x="76.5"
        y="15"
        width="7"
        height="22"
        rx="2"
        fill={url(u('bam'))}
        stroke={INK}
        stroke-width="2"
      />
      <rect
        x="76.5"
        y="38"
        width="7"
        height="22"
        rx="2"
        fill={url(u('bam'))}
        stroke={INK}
        stroke-width="2"
      />
      <rect
        x="76.5"
        y="61"
        width="7"
        height="25"
        rx="2"
        fill={url(u('bam'))}
        stroke={INK}
        stroke-width="2"
      />
      <Ell cx={80} cy={37.5} rx={5} ry={2} fill="#1F7A2E" w={1.6} />
      <Ell cx={80} cy={60.5} rx={5} ry={2} fill="#1F7A2E" w={1.6} />
    </g>
    <Pth d="M82 28 C 80 20, 84 14, 88 13 C 89 20, 87 27, 82 28 Z" fill={url(u('leaf'))} w={2} />
    <Pth d="M83 47 C 85 42, 88 40, 88.5 41 C 88 46, 87 49, 83 47 Z" fill={url(u('leaf'))} w={2} />
    <g transform="translate(-4 0)">
      {/* tai + thân + chân */}
      <Ell cx={28} cy={27} rx={9.5} ry={9.5} fill={url(u('blk'))} />
      <Ell cx={72} cy={27} rx={9.5} ry={9.5} fill={url(u('blk'))} />
      <Ell cx={50} cy={73} rx={23} ry={14.5} fill={url(u('fur'))} w={2.5} />
      <Ell cx={50} cy={77} rx={12} ry={8} fill="#E9F0F4" w={0} />
      <Ell cx={36} cy={82.6} rx={9} ry={5.4} fill={url(u('blk'))} w={2.2} />
      <Ell cx={64} cy={82.6} rx={9} ry={5.4} fill={url(u('blk'))} w={2.2} />
      <Ell cx={28.5} cy={70} rx={6.8} ry={11} fill={url(u('blk'))} w={2.2} rot={16} />
      {/* đầu */}
      <Ell cx={50} cy={45} rx={26} ry={22} fill={url(u('fur'))} w={2.5} />
      <Ell cx={38.5} cy={45} rx={6.3} ry={8.2} fill={url(u('blk'))} w={0} rot={22} />
      <Ell cx={61.5} cy={45} rx={6.3} ry={8.2} fill={url(u('blk'))} w={0} rot={-22} />
      <Eye x={39.5} y={45} r={3.4} />
      <Eye x={60.5} y={45} r={3.4} />
      <circle cx="38.4" cy="47.2" r="0.9" fill="#fff" opacity="0.8" />
      <circle cx="59.4" cy="47.2" r="0.9" fill="#fff" opacity="0.8" />
      <Cheek x={30.5} y={57} r={4.4} />
      <Cheek x={69.5} y={57} r={4.4} />
      <ellipse cx="50" cy="54" rx="4.4" ry="3" fill="#263238" />
      <Shine x={48.6} y={53} rx={1.6} ry={0.8} opacity={0.8} />
      <Ln d="M50 57 Q46 62.5 42 59.5 M50 57 Q54 62.5 58 59.5" />
      <Shine x={26} y={23} rx={3.2} ry={1.6} rot={-30} opacity={0.5} />
      <Shine x={74} y={23} rx={3.2} ry={1.6} rot={30} opacity={0.5} />
      <Shine x={34} y={81.5} rx={4} ry={1.4} rot={-8} opacity={0.4} />
    </g>
    {/* tay ôm tre */}
    <Tube d="M62 66 Q70 65 77 69" color="#37474F" w={8.4} />
    <Ln d="M64 63.5 Q70 62.5 75 65.5" c="#fff" w={1.6} o={0.4} />
    <Sparkle x={17} y={34} s={5} />
    <Sparkle x={21} y={64} s={3.6} opacity={0.9} />
  </>
);

/** stk-08 Cáo cam (Hiếm): má trắng, đuôi xù đầu trắng, khăn quàng ngọc. */
const FOX_TAIL = 'M58 72 C 62 88, 90 90, 88 62 C 87 48, 82 40, 79 30 C 76 44, 68 56, 56 62 Z';
const FOX_HEAD =
  'M50 28 C 39.7 28, 32.8 33, 29.4 40 C 24.2 44, 20.8 48, 19.9 55 C 29.4 62, 39.7 70, 50 70 C 60.3 70, 70.6 62, 80.1 55 C 79.2 48, 75.8 44, 70.6 40 C 67.2 33, 60.3 28, 50 28 Z';
const fox: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('fur')}
        stops={[
          [0, '#FFB45A'],
          [1, '#F26A1E'],
        ]}
      />
      <Lin
        id={u('white')}
        stops={[
          [0, '#FFFFFF'],
          [1, '#FFE6CC'],
        ]}
      />
      <Lin
        id={u('scarf')}
        stops={[
          [0, '#4FDDEE'],
          [1, '#0E9FC0'],
        ]}
      />
      <clipPath id={u('tail')}>
        <path d={FOX_TAIL} />
      </clipPath>
      <clipPath id={u('head')}>
        <path d={FOX_HEAD} />
      </clipPath>
    </defs>
    <GroundShadow y={85} rx={29} />
    {/* đuôi xù đầu trắng */}
    <Pth d={FOX_TAIL} fill={url(u('fur'))} w={2.5} />
    <g clip-path={url(u('tail'))}>
      <path d="M62 62 L69 53 L75 60 L81 51 L87 59 L95 53 V20 H62 Z" fill="#fff" />
      <Ln d="M64 76 Q80 74 83 62" c="#C94E0E" w={2.2} o={0.5} />
    </g>
    <Ln d={FOX_TAIL} w={2.5} />
    <Ln d="M84 36 Q82 40 83 45" c="#fff" w={1.6} o={0.6} />
    <g transform="translate(-3 0)">
      {/* thân + chân */}
      <Ell cx={50} cy={77} rx={19} ry={10} fill={url(u('fur'))} w={2.5} />
      <Ell cx={40} cy={83} rx={7} ry={4.2} fill="#5D3A22" w={2.2} />
      <Ell cx={60} cy={83} rx={7} ry={4.2} fill="#5D3A22" w={2.2} />
      {/* khăn quàng */}
      <Pth d="M29 66 Q50 82 71 66 L73 73 Q50 90 27 73 Z" fill={url(u('scarf'))} w={2.2} />
      <Ln d="M32 74.5 Q50 86 68 74.5" c="#fff" w={1.8} o={0.45} />
      {/* tai */}
      <Pth d="M27 42 L24 15 L45 31 Z" fill="#F7852F" w={2.5} />
      <Pth d="M73 42 L76 15 L55 31 Z" fill="#F7852F" w={2.5} />
      <path d="M24.6 17.5 L25.4 25.5 L31.5 22 Z" fill="#5D3A22" />
      <path d="M75.4 17.5 L74.6 25.5 L68.5 22 Z" fill="#5D3A22" />
      <path d="M29.5 38 L27.5 26 L39 33 Z" fill="#FFE6C9" />
      <path d="M70.5 38 L72.5 26 L61 33 Z" fill="#FFE6C9" />
      {/* đầu + má trắng */}
      <Pth d={FOX_HEAD} fill={url(u('fur'))} w={2.5} />
      <g clip-path={url(u('head'))}>
        <path
          d="M10 56 C 24 58, 36 56, 42 48 Q50 45 58 48 C 64 56, 76 58, 90 56 V76 H10 Z"
          fill={url(u('white'))}
        />
      </g>
      <Ln d={FOX_HEAD} w={2.5} />
      <Eye x={39} y={44} r={3.9} />
      <Eye x={61} y={44} r={3.9} />
      <Cheek x={33} y={56.5} r={4.2} />
      <Cheek x={67} y={56.5} r={4.2} />
      <ellipse cx="50" cy="59" rx="4.6" ry="3.4" fill="#37474F" />
      <Shine x={48.4} y={57.8} rx={1.7} ry={0.9} opacity={0.8} />
      <Ln d="M50 62.4 Q46 67 42.5 64.5 M50 62.4 Q54 67 57.5 64.5" />
      <Shine x={42} y={33.5} rx={8} ry={3} rot={-14} opacity={0.5} />
    </g>
    <Sparkle x={86} y={22} s={5} />
    <Sparkle x={17} y={74} s={3.8} opacity={0.9} />
  </>
);

/** stk-09 Cá heo (Hiếm): nhảy lên khỏi sóng, nước bắn tung toé. */
const DOLPHIN_BODY =
  'M22 50 C 30 40, 44 31, 60 32 C 68 32, 74 34, 77 40 Q 80 43, 88 45 Q 92 47, 87 49 L 77 51 C 72 60, 62 66, 50 66 C 38 66, 28 60, 22 50 Z';
const DROP = 'M0 -5 C 3 -1, 3.6 2, 0 3.6 C -3.6 2, -3 -1, 0 -5 Z';
const dolphin: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('body')}
        stops={[
          [0, '#2F73E4'],
          [1, '#62BDFF'],
        ]}
      />
      <Lin
        id={u('belly')}
        stops={[
          [0, '#FFFFFF'],
          [1, '#CFEBFF'],
        ]}
      />
      <Lin
        id={u('sea1')}
        stops={[
          [0, '#5CC3F8'],
          [1, '#1E88E5'],
        ]}
      />
      <Lin
        id={u('sea2')}
        stops={[
          [0, '#2FA5F2'],
          [1, '#1262C0'],
        ]}
      />
      <clipPath id={u('bclip')}>
        <path d={DOLPHIN_BODY} />
      </clipPath>
    </defs>
    {/* sóng sau */}
    <Pth
      d="M6 68 Q16 60 26 68 T46 68 T66 68 T86 68 T106 68 V94 H6 Z"
      fill={url(u('sea1'))}
      w={2.2}
    />
    {/* cá heo */}
    <g transform="translate(55 46) rotate(-35) scale(0.98) translate(-52 -50)">
      <Pth
        d="M30 50 C 22 48, 16 42, 8 40 C 10 46, 12 50, 14 51 C 12 53, 10 57, 8 62 C 16 60, 22 54, 30 52 Z"
        fill={url(u('body'))}
      />
      <Pth d="M56 34 C 54 24, 46 20, 39 20 C 43 25, 44 31, 44 37 Z" fill={url(u('body'))} />
      <Pth d="M52 60 C 53 68, 47 74, 40 74 C 43 69, 43 64, 44 58 Z" fill={url(u('body'))} />
      <Pth d={DOLPHIN_BODY} fill={url(u('body'))} w={2.5} />
      <g clip-path={url(u('bclip'))}>
        <path
          d="M18 52 C 34 59, 50 56, 62 54 C 70 52, 76 52, 94 50 V80 H18 Z"
          fill={url(u('belly'))}
        />
      </g>
      <Ln d={DOLPHIN_BODY} w={2.5} />
      <Ln d="M38 41 Q47 34 60 36" c="#fff" w={3.4} o={0.65} />
      <Eye x={69} y={42.5} r={3.4} />
      <Cheek x={64} y={50} r={3.8} />
      <Ln d="M87 49 Q79 54 71 51" w={1.8} />
    </g>
    {/* sóng trước + bọt */}
    <Pth
      d="M6 77 Q16 70 26 77 T46 77 T66 77 T86 77 T106 77 V94 H6 Z"
      fill={url(u('sea2'))}
      w={2.2}
    />
    <Ln d="M10 78 Q16 73 22 78 M34 78 Q40 73 46 78 M62 78 Q68 73 74 78" c="#fff" w={2.2} o={0.8} />
    {/* giọt nước */}
    <g fill="#E3F6FF" stroke={INK} stroke-width="1.3" stroke-linejoin="round">
      <path d={DROP} transform="translate(17 55) scale(1.1)" />
      <path d={DROP} transform="translate(27 49) scale(0.8)" />
      <path d={DROP} transform="translate(13 66) scale(0.8)" />
      <path d={DROP} transform="translate(83 61) scale(0.95)" />
      <path d={DROP} transform="translate(76 70) scale(0.7)" />
    </g>
  </>
);

/** stk-10 Kỳ lân cầu vồng (Siêu hiếm): sừng vàng xoắn, bờm 7 sắc, quầng sáng, mây và sao. */
const UNI_HEAD =
  'M50 35 C 33 35, 24 47, 26 59 C 28 71, 37 79, 50 79 C 63 79, 72 71, 74 59 C 76 47, 67 35, 50 35 Z';
const UNI_MANE =
  'M48 33 C 28 26, 12 40, 13 58 C 14 66, 20 68, 19 73 C 18 78, 26 79, 29 74 C 32 69, 31 66, 37 63 L 48 50 Z';
const STAR =
  'M0 -6 L1.8 -1.9 L6.2 -1.7 L2.8 1.1 L3.9 5.4 L0 3 L-3.9 5.4 L-2.8 1.1 L-6.2 -1.7 L-1.8 -1.9 Z';
function UniEye({ x, y, fill, dir }: { x: number; y: number; fill: string; dir: 1 | -1 }) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx="4.6" ry="5.4" fill={fill} />
      <circle cx={x + 1.4} cy={y - 1.8} r="1.9" fill="#fff" />
      <circle cx={x - 1.4} cy={y + 2} r="0.9" fill="#fff" opacity="0.85" />
      <Ln
        d={`M${x + dir * 3.8} ${y - 3.6} l${dir * 2.6} -2 M${x + dir * 4.6} ${y - 1} l${dir * 2.8} -0.8`}
        w={1.5}
      />
    </g>
  );
}
const unicorn: ArtFn = (u) => (
  <>
    <defs>
      <radialGradient id={u('glow')} cx="0.5" cy="0.5" r="0.5">
        <stop offset="0" stop-color="#FFF9C4" stop-opacity="0.95" />
        <stop offset="0.6" stop-color="#FFE98A" stop-opacity="0.4" />
        <stop offset="1" stop-color="#FFE98A" stop-opacity="0" />
      </radialGradient>
      <linearGradient id={u('hair')} gradientUnits="userSpaceOnUse" x1="12" y1="0" x2="31" y2="0">
        <stop offset="0" stop-color="#FF4F6D" />
        <stop offset="0.2" stop-color="#FF9A3D" />
        <stop offset="0.4" stop-color="#FFD93D" />
        <stop offset="0.6" stop-color="#4CD964" />
        <stop offset="0.8" stop-color="#3AA7FF" />
        <stop offset="1" stop-color="#9B59F0" />
      </linearGradient>
      <Lin
        id={u('skin')}
        stops={[
          [0, '#FFFFFF'],
          [1, '#EBDDFF'],
        ]}
      />
      <Lin
        id={u('horn')}
        x1={0}
        x2={1}
        stops={[
          [0, '#FFF6B8'],
          [0.5, '#FFC933'],
          [1, '#E68A00'],
        ]}
      />
      <Lin
        id={u('fore')}
        x1={0}
        y1={0}
        x2={1}
        y2={1}
        stops={[
          [0, '#FF8FD0'],
          [1, '#9B6BFF'],
        ]}
      />
      <Lin
        id={u('cloud')}
        stops={[
          [0, '#FFFFFF'],
          [1, '#BFDDFF'],
        ]}
      />
      <Lin
        id={u('muz')}
        stops={[
          [0, '#FFF3F8'],
          [1, '#FFC2DA'],
        ]}
      />
      <clipPath id={u('hclip')}>
        <path d="M43.5 38 L50 11 L56.5 38 Z" />
      </clipPath>
      <Rad
        id={u('iris')}
        cx={0.4}
        cy={0.35}
        r={0.8}
        stops={[
          [0, '#9A7DF5'],
          [1, '#2A1B6B'],
        ]}
      />
    </defs>
    <circle cx="50" cy="48" r="40" fill={url(u('glow'))} opacity="0.7" />
    {/* mây nền */}
    <Pth
      d="M22 87 C 14 87, 14 77, 23 77 C 25 70, 35 69, 39 74 C 43 68, 55 68, 59 74 C 64 70, 75 71, 77 77 C 86 77, 87 87, 78 87 Z"
      fill={url(u('cloud'))}
      w={2.2}
    />
    <Ln d="M24 82 Q30 84.5 36 82 M64 82 Q70 84.5 76 82" c="#9CC4F2" w={1.8} o={0.7} />
    <g transform="translate(50 47) scale(0.9) translate(-50 -47)">
      {/* bờm cầu vồng + tai (đối xứng) */}
      <g>
        <Pth d={UNI_MANE} fill={url(u('hair'))} w={2.4} />
        <Ln d="M17 52 Q15 62 22 70 M24 44 Q20 50 21 58" c="#fff" w={1.8} o={0.45} />
        <Pth d="M32 42 L27 21 L45 36 Z" fill={url(u('skin'))} w={2.2} />
        <path d="M32.6 38 L29.6 26 L40 35 Z" fill="#FFB3CF" />
      </g>
      <g transform="translate(100 0) scale(-1 1)">
        <Pth d={UNI_MANE} fill={url(u('hair'))} w={2.4} />
        <Ln d="M17 52 Q15 62 22 70 M24 44 Q20 50 21 58" c="#fff" w={1.8} o={0.45} />
        <Pth d="M32 42 L27 21 L45 36 Z" fill={url(u('skin'))} w={2.2} />
        <path d="M32.6 38 L29.6 26 L40 35 Z" fill="#FFB3CF" />
      </g>
      {/* sừng vàng xoắn */}
      <circle cx="50" cy="26" r="17" fill={url(u('glow'))} />
      <Pth d="M43.5 38 L50 11 L56.5 38 Z" fill={url(u('horn'))} w={2.2} />
      <g clip-path={url(u('hclip'))}>
        <Ln d="M40 37 L60 29 M40 30 L60 22 M40 23 L60 15 M40 16 L60 8" c="#E5890A" w={3.2} />
      </g>
      <Ln d="M47 34 L49 17" c="#fff" w={1.6} o={0.65} />
      {/* đầu */}
      <Pth d={UNI_HEAD} fill={url(u('skin'))} w={2.5} />
      <Ell cx={50} cy={69} rx={11.5} ry={8.2} fill={url(u('muz'))} w={0} />
      <UniEye x={39.5} y={57} fill={url(u('iris'))} dir={-1} />
      <UniEye x={60.5} y={57} fill={url(u('iris'))} dir={1} />
      <Cheek x={31.5} y={66} r={4.2} />
      <Cheek x={68.5} y={66} r={4.2} />
      <ellipse cx="45.8" cy="68" rx="1.5" ry="2.1" fill="#D9648F" />
      <ellipse cx="54.2" cy="68" rx="1.5" ry="2.1" fill="#D9648F" />
      <Ln d="M45.5 73.5 Q50 77.5 54.5 73.5" w={1.8} />
      {/* tóc mái */}
      <Pth
        d="M36 38 C 34 47, 42 49, 46 42 C 48 48, 56 49, 58 42 C 61 47, 66 45, 65 38 C 58 31, 43 31, 36 38 Z"
        fill={url(u('fore'))}
        w={2.2}
      />
      <Shine x={36} y={52} rx={5} ry={2} rot={-30} opacity={0.7} />
      <path
        d={STAR}
        transform="translate(50 41) scale(0.6)"
        fill="#FFD54F"
        stroke={INK}
        stroke-width="2.4"
        stroke-linejoin="round"
      />
    </g>
    {/* sao + lấp lánh */}
    <path
      d={STAR}
      transform="translate(79 31)"
      fill="#FFD54F"
      stroke={INK}
      stroke-width="1.4"
      stroke-linejoin="round"
    />
    <path
      d={STAR}
      transform="translate(20 28) scale(0.8)"
      fill="#FF8FD0"
      stroke={INK}
      stroke-width="1.6"
      stroke-linejoin="round"
    />
    <Sparkle x={83} y={57} s={4.5} fill="#FFF3A0" />
    <Sparkle x={58} y={16} s={4} />
    <Sparkle x={17} y={46} s={4} fill="#FFF3A0" />
    <Sparkle x={77} y={78} s={4.5} fill="#fff" />
  </>
);

export const ANIMAL_ART: Record<string, ArtFn> = {
  'stk-01': cat,
  'stk-02': puppy,
  'stk-03': bunny,
  'stk-04': bear,
  'stk-05': duck,
  'stk-06': pig,
  'stk-07': panda,
  'stk-08': fox,
  'stk-09': dolphin,
  'stk-10': unicorn,
};
