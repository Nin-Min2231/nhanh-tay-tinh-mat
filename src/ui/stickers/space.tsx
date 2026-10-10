// Sticker chủ đề vũ trụ: stk-21 … stk-30 (21–26 Thường · 27–29 Hiếm · 30 Siêu hiếm). Khung 100×100, vùng an toàn [14, 86].
// Nền thẻ là tím đêm → dùng màu rực, có quầng sáng và vệt sáng trắng.
import { Cheek, Eye, INK, Lin, Rad, Shine, Sparkle, type ArtFn } from './kit';

/** Hố thiên thạch: elip tối + viền sáng ở nửa dưới (tạo cảm giác lõm). */
function Crater({
  x,
  y,
  r,
  dark,
  rim,
}: {
  x: number;
  y: number;
  r: number;
  dark: string;
  rim: string;
}) {
  return (
    <g>
      <ellipse cx={x} cy={y} rx={r} ry={r * 0.75} fill={dark} opacity="0.6" />
      <path
        d={`M${x - r} ${y + r * 0.1} A${r} ${r * 0.75} 0 0 0 ${x + r} ${y + r * 0.1}`}
        fill="none"
        stroke={rim}
        stroke-width="1.3"
        stroke-linecap="round"
        opacity="0.85"
      />
    </g>
  );
}

/** stk-21 Mặt Trăng: trăng khuyết béo, mặt ngủ mỉm cười. */
const MOON_D = 'M60 16 A35.5 35.5 0 1 0 60 84 A44 44 0 0 1 60 16 Z';
const moon: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('body')}
        x1={0.1}
        x2={0.9}
        stops={[
          [0, '#FFFBD0'],
          [0.5, '#FFE677'],
          [1, '#FFBE2E'],
        ]}
      />
      <clipPath id={u('cl')}>
        <path d={MOON_D} />
      </clipPath>
    </defs>
    <g transform="translate(5 0)">
      {/* quầng sáng */}
      <path
        d={MOON_D}
        fill="none"
        stroke="#FFF3A0"
        stroke-width="14"
        stroke-linejoin="round"
        opacity="0.1"
      />
      <path
        d={MOON_D}
        fill="none"
        stroke="#FFF3A0"
        stroke-width="7.5"
        stroke-linejoin="round"
        opacity="0.22"
      />
      <path
        d={MOON_D}
        fill={`url(#${u('body')})`}
        stroke={INK}
        stroke-width="2.5"
        stroke-linejoin="round"
      />
      <g clip-path={`url(#${u('cl')})`}>
        <Crater x={34} y={26} r={4.6} dark="#F0B93A" rim="#FFFBD0" />
        <Crater x={43} y={35} r={2.6} dark="#F0B93A" rim="#FFFBD0" />
        <Crater x={30} y={73} r={4.8} dark="#F0B93A" rim="#FFFBD0" />
        <Crater x={43} y={65} r={2.8} dark="#F0B93A" rim="#FFFBD0" />
        <path
          d="M17 62 Q18 40 28 28"
          fill="none"
          stroke="#FF9F1C"
          stroke-width="3"
          opacity="0.18"
        />
      </g>
      {/* mặt ngủ */}
      <path
        d="M21 47 Q24 44 27 47 M33 47 Q36 44 39 47"
        fill="none"
        stroke={INK}
        stroke-width="2.2"
        stroke-linecap="round"
      />
      <path
        d="M26 55 Q30 60 34 55"
        fill="none"
        stroke={INK}
        stroke-width="2.2"
        stroke-linecap="round"
      />
      <Cheek x={20.5} y={53} r={3.4} />
      <Cheek x={39.5} y={53} r={3.4} />
      <path
        d="M20 40 Q22 28 33 22"
        fill="none"
        stroke="#fff"
        stroke-width="3"
        stroke-linecap="round"
        opacity="0.75"
      />
      <Shine x={24} y={31} rx={2} ry={1.3} rot={-40} opacity={0.8} />
    </g>
    <Sparkle x={76} y={30} s={7} fill="#FFF59D" />
    <Sparkle x={83} y={55} s={4.5} fill="#B3F0FF" />
    <Sparkle x={74} y={75} s={5.5} fill="#FFF59D" />
  </>
);

// Ngôi sao 5 cánh: đỉnh ngoài/đỉnh trong
const STAR_D =
  'M50 20 L59.1 40.5 L81.4 42.8 L64.7 57.8 L69.4 79.7 L50 68.5 L30.6 79.7 L35.3 57.8 L18.6 42.8 L40.9 40.5 Z';

/** stk-22 Ngôi sao: sao vàng nhiều mặt cắt, có mặt cười. */
const star: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('gold')}
        stops={[
          [0, '#FFF59D'],
          [0.5, '#FFD43B'],
          [1, '#FF9F1A'],
        ]}
      />
      <Rad
        id={u('face')}
        cx={0.4}
        cy={0.35}
        r={0.7}
        stops={[
          [0, '#FFFBD6'],
          [1, '#FFD43B'],
        ]}
      />
    </defs>
    <circle cx="50" cy="52" r="38" fill="#FFD43B" opacity="0.12" />
    <path d={STAR_D} fill={INK} stroke={INK} stroke-width="9" stroke-linejoin="round" />
    <path
      d={STAR_D}
      fill={`url(#${u('gold')})`}
      stroke={`url(#${u('gold')})`}
      stroke-width="5"
      stroke-linejoin="round"
    />
    {/* mặt cắt sáng / tối */}
    <path
      d="M50 53 L50 20 L40.9 40.5 Z M50 53 L81.4 42.8 L59.1 40.5 Z M50 53 L69.4 79.7 L64.7 57.8 Z M50 53 L30.6 79.7 L50 68.5 Z M50 53 L18.6 42.8 L35.3 57.8 Z"
      fill="#FFFDE7"
      opacity="0.55"
    />
    <path
      d="M50 53 L50 20 L59.1 40.5 Z M50 53 L81.4 42.8 L64.7 57.8 Z M50 53 L69.4 79.7 L50 68.5 Z M50 53 L30.6 79.7 L35.3 57.8 Z M50 53 L18.6 42.8 L40.9 40.5 Z"
      fill="#F57C00"
      opacity="0.3"
    />
    {/* mặt */}
    <circle cx="50" cy="53" r="11" fill={`url(#${u('face')})`} />
    <Eye x={45.5} y={51} r={2.5} />
    <Eye x={54.5} y={51} r={2.5} />
    <path
      d="M46 57 Q50 61.5 54 57"
      fill="none"
      stroke={INK}
      stroke-width="2"
      stroke-linecap="round"
    />
    <Cheek x={42} y={56.5} r={2.6} />
    <Cheek x={58} y={56.5} r={2.6} />
    <path
      d="M36 33 L45 25"
      fill="none"
      stroke="#fff"
      stroke-width="3"
      stroke-linecap="round"
      opacity="0.8"
    />
    <path
      d="M24 44 L32 45.5"
      fill="none"
      stroke="#fff"
      stroke-width="2.4"
      stroke-linecap="round"
      opacity="0.7"
    />
    <Sparkle x={82} y={22} s={7} />
    <Sparkle x={19} y={70} s={5} fill="#FFF59D" />
    <Sparkle x={84} y={72} s={4} fill="#B3F0FF" />
    <Sparkle x={22} y={24} s={4} fill="#FFF59D" />
  </>
);

/** stk-23 Mặt Trời: 12 tia nắng + gương mặt tươi cười. */
const sun: ArtFn = (u) => (
  <>
    <defs>
      <Rad
        id={u('disc')}
        cx={0.38}
        cy={0.32}
        r={0.8}
        stops={[
          [0, '#FFFBD0'],
          [0.4, '#FFD740'],
          [1, '#FF9100'],
        ]}
      />
    </defs>
    <circle cx="50" cy="50" r="43" fill="#FFD54F" opacity="0.16" />
    {Array.from({ length: 12 }, (_, i) => (
      <path
        key={i}
        d={i % 2 === 0 ? 'M50 9 L56.5 30 L43.5 30 Z' : 'M50 15 L55.5 30 L44.5 30 Z'}
        transform={`rotate(${i * 30} 50 50)`}
        fill={i % 2 === 0 ? '#FFB300' : '#FFE04A'}
        stroke={INK}
        stroke-width="2.2"
        stroke-linejoin="round"
      />
    ))}
    <circle cx="50" cy="50" r="26" fill={`url(#${u('disc')})`} stroke={INK} stroke-width="2.6" />
    <Eye x={42} y={47} r={3.3} />
    <Eye x={58} y={47} r={3.3} />
    <path
      d="M42 55 Q50 64 58 55 Z"
      fill="#C62828"
      stroke={INK}
      stroke-width="2.2"
      stroke-linejoin="round"
    />
    <Cheek x={35.5} y={54} r={4} />
    <Cheek x={64.5} y={54} r={4} />
    <Shine x={39} y={36} rx={7} ry={3.6} rot={-35} opacity={0.7} />
  </>
);

/** stk-24 Sao Hỏa: quả cầu đỏ cam, hố thiên thạch, mũ băng cực, vệ tinh nhỏ. */
const mars: ArtFn = (u) => (
  <>
    <defs>
      <Rad
        id={u('sph')}
        cx={0.34}
        cy={0.3}
        r={0.9}
        stops={[
          [0, '#FFB59E'],
          [0.4, '#F4511E'],
          [1, '#7A1A0C'],
        ]}
      />
      <Lin
        id={u('cap')}
        stops={[
          [0, '#FFFFFF'],
          [1, '#CDEEFF'],
        ]}
      />
      <Rad
        id={u('moon')}
        stops={[
          [0, '#F5F7F8'],
          [1, '#7D8F9A'],
        ]}
      />
      <clipPath id={u('cl')}>
        <circle cx="50" cy="52" r="31" />
      </clipPath>
    </defs>
    <circle cx="50" cy="52" r="38" fill="#FFAB91" opacity="0.16" />
    <circle cx="50" cy="52" r="34.5" fill="#FF8A65" opacity="0.3" />
    <circle cx="50" cy="52" r="31" fill={`url(#${u('sph')})`} />
    <g clip-path={`url(#${u('cl')})`}>
      <path
        d="M19 56 C30 48 40 60 52 54 C62 49 72 56 82 52 L82 62 C70 68 62 60 52 65 C40 70 28 62 19 66 Z"
        fill="#7A1A0C"
        opacity="0.4"
      />
      <ellipse cx="50" cy="22" rx="19" ry="9" fill={`url(#${u('cap')})`} />
      <Crater x={36} y={40} r={5.5} dark="#8E230F" rim="#FFB59E" />
      <Crater x={62} y={43} r={4} dark="#8E230F" rim="#FFB59E" />
      <Crater x={42} y={72} r={6} dark="#8E230F" rim="#FFB59E" />
      <Crater x={67} y={66} r={4.4} dark="#8E230F" rim="#FFB59E" />
      <Crater x={27} y={61} r={3} dark="#8E230F" rim="#FFB59E" />
    </g>
    <circle cx="50" cy="52" r="31" fill="none" stroke={INK} stroke-width="2.5" />
    <Shine x={36} y={34} rx={7.5} ry={4} rot={-35} opacity={0.5} />
    <circle cx="79" cy="23" r="5.2" fill={`url(#${u('moon')})`} stroke={INK} stroke-width="1.9" />
    <circle cx="77.5" cy="24.5" r="1.3" fill="#7D8F9A" opacity="0.7" />
    <Sparkle x={21} y={80} s={5} fill="#FFE0B2" />
    <Sparkle x={82} y={78} s={4} fill="#FFE0B2" />
  </>
);

/** stk-25 Sao chổi: đầu băng sáng, đuôi cong nhiều màu. */
const comet: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('t1')}
        x1={0.2}
        y1={0.8}
        x2={1}
        y2={0}
        stops={[
          [0, '#FF3FA0'],
          [0.5, '#C26BFF'],
          [1, 'rgba(120,100,255,0.3)'],
        ]}
      />
      <Lin
        id={u('t2')}
        x1={0.2}
        y1={0.8}
        x2={1}
        y2={0}
        stops={[
          [0, '#FF9A1F'],
          [0.55, '#FFD84A'],
          [1, 'rgba(255,226,122,0.35)'],
        ]}
      />
      <Lin
        id={u('t3')}
        x1={0.2}
        y1={0.8}
        x2={1}
        y2={0}
        stops={[
          [0, '#FFFFFF'],
          [1, 'rgba(190,250,255,0.4)'],
        ]}
      />
      <Rad
        id={u('head')}
        stops={[
          [0, '#FFFFFF'],
          [0.5, '#BDF1FF'],
          [1, '#35B2F0'],
        ]}
      />
    </defs>
    <path d="M17 55 C24 34 56 15 86 14 C68 36 54 62 44 81 Z" fill={`url(#${u('t1')})`} />
    <path d="M21 59 C29 42 54 26 80 21 C66 38 52 58 39 77 Z" fill={`url(#${u('t2')})`} />
    <path d="M26 62.5 C32 50 50 36 70 29 C57 46 46 60 35 72 Z" fill={`url(#${u('t3')})`} />
    <path
      d="M40 34 Q54 22 70 17 M52 50 Q62 40 76 34"
      fill="none"
      stroke="#D8B4FF"
      stroke-width="1.8"
      stroke-linecap="round"
      opacity="0.7"
    />
    <circle cx="31" cy="67" r="22" fill="#7FE7FF" opacity="0.2" />
    <circle cx="31" cy="67" r="19" fill="#7FE7FF" opacity="0.25" />
    <circle cx="31" cy="67" r="16" fill={`url(#${u('head')})`} stroke={INK} stroke-width="2.5" />
    <Eye x={26.5} y={65} r={2.5} />
    <Eye x={36} y={65} r={2.5} />
    <path
      d="M27 70.5 Q31.5 75 36 70.5"
      fill="none"
      stroke={INK}
      stroke-width="2"
      stroke-linecap="round"
    />
    <Cheek x={22} y={70} r={2.8} />
    <Cheek x={40.5} y={70} r={2.8} />
    <Shine x={24} y={58} rx={4.5} ry={2.4} rot={-40} opacity={0.9} />
    <Sparkle x={60} y={22} s={5} />
    <Sparkle x={76} y={46} s={5} fill="#B3F0FF" />
    <Sparkle x={52} y={44} s={3.5} fill="#FFF59D" />
    <circle cx="80" cy="30" r="1.8" fill="#fff" />
    <circle cx="66" cy="52" r="1.4" fill="#FFF59D" />
  </>
);

/** stk-26 Trái Đất: đại dương, lục địa xanh, mây trắng, viền khí quyển. */
const earth: ArtFn = (u) => (
  <>
    <defs>
      <Rad
        id={u('sea')}
        cx={0.34}
        cy={0.3}
        r={0.9}
        stops={[
          [0, '#9AEAFF'],
          [0.45, '#2D9BF0'],
          [1, '#0A3A8C'],
        ]}
      />
      <Lin
        id={u('land')}
        stops={[
          [0, '#B4EE6A'],
          [1, '#2E9E45'],
        ]}
      />
      <Rad
        id={u('shade')}
        cx={0.34}
        cy={0.3}
        r={0.85}
        stops={[
          [0.5, 'rgba(5,20,80,0)'],
          [1, 'rgba(5,20,80,0.5)'],
        ]}
      />
      <clipPath id={u('cl')}>
        <circle cx="50" cy="50" r="32" />
      </clipPath>
    </defs>
    <circle cx="50" cy="50" r="39" fill="#7FE7FF" opacity="0.16" />
    <circle
      cx="50"
      cy="50"
      r="35.5"
      fill="none"
      stroke="#9FF0FF"
      stroke-width="3.2"
      opacity="0.5"
    />
    <circle cx="50" cy="50" r="32" fill={`url(#${u('sea')})`} />
    <g clip-path={`url(#${u('cl')})`}>
      <g fill={`url(#${u('land')})`} stroke="#1E7A34" stroke-width="1.2" stroke-linejoin="round">
        <path d="M30 24 C40 20 52 27 50 37 C49 46 40 46 40 55 C40 62 46 66 42 75 C35 75 29 66 29 58 C28 50 21 46 21 38 C21 31 25 27 30 24 Z" />
        <path d="M62 33 C72 29 83 38 81 48 C79 56 71 56 67 64 C63 68 58 62 60 54 C62 48 56 44 56 40 C56 36 58 34 62 33 Z" />
        <ellipse cx="71" cy="73" rx="6.5" ry="4" />
      </g>
      <g fill="#fff" opacity="0.93">
        <ellipse cx="62" cy="25" rx="9" ry="3.2" />
        <ellipse cx="66" cy="22.5" rx="5.5" ry="3" />
        <ellipse cx="28" cy="62" rx="8" ry="3" />
        <ellipse cx="32" cy="59.5" rx="5" ry="2.8" />
        <ellipse cx="60" cy="70" rx="9" ry="3.2" />
        <ellipse cx="55" cy="68" rx="5" ry="2.8" />
      </g>
      <path
        d="M22 48 Q32 42 44 47"
        fill="none"
        stroke="#fff"
        stroke-width="2.4"
        stroke-linecap="round"
        opacity="0.8"
      />
      <circle cx="50" cy="50" r="32" fill={`url(#${u('shade')})`} />
    </g>
    <circle cx="50" cy="50" r="32" fill="none" stroke={INK} stroke-width="2.5" />
    <Shine x={36} y={31} rx={8} ry={4.4} rot={-35} opacity={0.55} />
    <Sparkle x={20} y={20} s={4} />
    <Sparkle x={82} y={82} s={4} fill="#B3F0FF" />
  </>
);

/** stk-27 Phi hành gia (Hiếm): trôi lơ lửng, mũ kính vàng, ba lô, ống dây, huy hiệu. */
const astronaut: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('suit')}
        x1={0}
        x2={1}
        y2={1}
        stops={[
          [0, '#FFFFFF'],
          [1, '#C5D3DF'],
        ]}
      />
      <Rad
        id={u('helm')}
        stops={[
          [0, '#FFFFFF'],
          [0.7, '#E8F1F8'],
          [1, '#B3C5D5'],
        ]}
      />
      <Lin
        id={u('visor')}
        x1={0.1}
        x2={0.9}
        stops={[
          [0, '#FFEAA6'],
          [0.45, '#FFB62E'],
          [1, '#B85A00'],
        ]}
      />
      <Lin
        id={u('pack')}
        stops={[
          [0, '#A7BBCC'],
          [1, '#5F7A92'],
        ]}
      />
    </defs>
    {/* dây nối */}
    <path
      d="M66 70 C82 70 72 82 84 82"
      fill="none"
      stroke={INK}
      stroke-width="4.4"
      stroke-linecap="round"
    />
    <path
      d="M66 70 C82 70 72 82 84 82"
      fill="none"
      stroke="#FFD740"
      stroke-width="2.2"
      stroke-linecap="round"
    />
    <g transform="rotate(-9 50 52)">
      {/* ba lô */}
      <rect
        x="29"
        y="45"
        width="42"
        height="28"
        rx="10"
        fill={`url(#${u('pack')})`}
        stroke={INK}
        stroke-width="2.4"
      />
      <rect x="32" y="52" width="5" height="14" rx="2.5" fill="#FF8A65" />
      <rect x="63" y="52" width="5" height="14" rx="2.5" fill="#FF8A65" />
      {/* chân + giày */}
      <path d="M43 68 L40 79" fill="none" stroke={INK} stroke-width="11" stroke-linecap="round" />
      <path
        d="M43 68 L40 79"
        fill="none"
        stroke="#EAF1F6"
        stroke-width="7"
        stroke-linecap="round"
      />
      <path d="M57 68 L61 78" fill="none" stroke={INK} stroke-width="11" stroke-linecap="round" />
      <path
        d="M57 68 L61 78"
        fill="none"
        stroke="#EAF1F6"
        stroke-width="7"
        stroke-linecap="round"
      />
      <ellipse cx="39" cy="82" rx="6.6" ry="4.2" fill="#3FA9F5" stroke={INK} stroke-width="2.2" />
      <ellipse cx="62" cy="81" rx="6.6" ry="4.2" fill="#3FA9F5" stroke={INK} stroke-width="2.2" />
      {/* thân */}
      <rect
        x="36"
        y="44"
        width="28"
        height="27"
        rx="12"
        fill={`url(#${u('suit')})`}
        stroke={INK}
        stroke-width="2.5"
      />
      <rect
        x="43"
        y="52"
        width="14"
        height="9"
        rx="2.5"
        fill="#CFD8DC"
        stroke={INK}
        stroke-width="1.6"
      />
      <circle cx="47" cy="56.5" r="1.8" fill="#FF5252" />
      <circle cx="51" cy="56.5" r="1.8" fill="#43E08A" />
      <circle cx="55" cy="56.5" r="1.8" fill="#FFD740" />
      {/* tay: trái vẫy, phải thả */}
      <path
        d="M38 51 Q27 50 24 38"
        fill="none"
        stroke={INK}
        stroke-width="12"
        stroke-linecap="round"
      />
      <path
        d="M38 51 Q27 50 24 38"
        fill="none"
        stroke="#F1F6FA"
        stroke-width="8"
        stroke-linecap="round"
      />
      <circle cx="23.5" cy="34.5" r="5" fill="#FFB74D" stroke={INK} stroke-width="2.2" />
      <path
        d="M62 51 Q72 51 77 61"
        fill="none"
        stroke={INK}
        stroke-width="12"
        stroke-linecap="round"
      />
      <path
        d="M62 51 Q72 51 77 61"
        fill="none"
        stroke="#F1F6FA"
        stroke-width="8"
        stroke-linecap="round"
      />
      <circle cx="68.5" cy="53" r="3.2" fill="#2979FF" stroke={INK} stroke-width="1.3" />
      <Sparkle x={68.5} y={53} s={1.9} />
      <circle cx="77.5" cy="62.5" r="5" fill="#FFB74D" stroke={INK} stroke-width="2.2" />
      {/* mũ */}
      <ellipse cx="50" cy="46" rx="13" ry="4" fill="#4FC3F7" stroke={INK} stroke-width="2" />
      <circle
        cx="50"
        cy="30"
        r="18.5"
        fill={`url(#${u('helm')})`}
        stroke={INK}
        stroke-width="2.6"
      />
      <circle cx="31.5" cy="31" r="3.6" fill="#90A4AE" stroke={INK} stroke-width="1.8" />
      <circle cx="68.5" cy="31" r="3.6" fill="#90A4AE" stroke={INK} stroke-width="1.8" />
      <ellipse
        cx="50"
        cy="31.5"
        rx="13.8"
        ry="12"
        fill={`url(#${u('visor')})`}
        stroke={INK}
        stroke-width="2.2"
      />
      <ellipse cx="50" cy="39" rx="9" ry="3" fill="#FFE082" opacity="0.5" />
      <circle cx="57" cy="35.5" r="4.4" fill="#4FC3F7" opacity="0.85" />
      <path d="M53 35 Q57 33 61 36" fill="none" stroke="#fff" stroke-width="1.2" opacity="0.8" />
      <Sparkle x={44} y={36} s={3} />
      <path
        d="M40 26 Q42 21 49 20"
        fill="none"
        stroke="#fff"
        stroke-width="2.8"
        stroke-linecap="round"
        opacity="0.85"
      />
      <Shine x={38} y={19} rx={5} ry={2.4} rot={-35} opacity={0.7} />
    </g>
    <Sparkle x={17} y={70} s={6} fill="#FFF59D" />
    <Sparkle x={84} y={24} s={7} />
    <Sparkle x={80} y={46} s={3.5} fill="#B3F0FF" />
    <Sparkle x={20} y={20} s={4} fill="#B3F0FF" />
  </>
);

/** stk-28 Sao Thổ (Hiếm): hành tinh sọc kem/cam/tím, vành đai đi trước và sau quả cầu. */
const RING_FRONT = 'M14 50 A36 11 0 0 0 86 50';
const RING_LAYERS = [
  [INK, 10.6],
  ['#B388FF', 8],
  ['#FFD54F', 5],
  ['#FFF4C2', 2],
] as const;
const saturn: ArtFn = (u) => (
  <>
    <defs>
      <Rad
        id={u('sph')}
        cx={0.34}
        cy={0.3}
        r={0.9}
        stops={[
          [0, '#FFF3C9'],
          [0.5, '#FFB65C'],
          [1, '#A94A2C'],
        ]}
      />
      <Rad
        id={u('shade')}
        cx={0.34}
        cy={0.3}
        r={0.85}
        stops={[
          [0.5, 'rgba(60,10,70,0)'],
          [1, 'rgba(60,10,70,0.45)'],
        ]}
      />
      <clipPath id={u('cl')}>
        <circle cx="50" cy="50" r="22" />
      </clipPath>
    </defs>
    <circle cx="50" cy="50" r="40" fill="#C9A0FF" opacity="0.12" />
    <g transform="rotate(-22 50 50)">
      {RING_LAYERS.map(([c, w]) => (
        <ellipse key={w} cx="50" cy="50" rx="36" ry="11" fill="none" stroke={c} stroke-width={w} />
      ))}
      <circle cx="50" cy="50" r="22" fill={`url(#${u('sph')})`} />
      <g clip-path={`url(#${u('cl')})`}>
        <rect x="26" y="33" width="48" height="6" fill="#FF8F3D" opacity="0.7" />
        <rect x="26" y="42" width="48" height="4" fill="#FFF0B8" opacity="0.85" />
        <rect x="26" y="49" width="48" height="6" fill="#C48BF0" opacity="0.75" />
        <rect x="26" y="58" width="48" height="5" fill="#FF7A50" opacity="0.7" />
        <path
          d={RING_FRONT}
          transform="translate(0 4)"
          fill="none"
          stroke="#4A1E7A"
          stroke-width="5"
          opacity="0.3"
        />
        <circle cx="50" cy="50" r="22" fill={`url(#${u('shade')})`} />
      </g>
      <circle cx="50" cy="50" r="22" fill="none" stroke={INK} stroke-width="2.5" />
      <Shine x={41} y={38} rx={6} ry={3} rot={-35} opacity={0.6} />
      {RING_LAYERS.map(([c, w]) => (
        <path key={w} d={RING_FRONT} fill="none" stroke={c} stroke-width={w} />
      ))}
      <path
        d="M22 54 Q34 62 50 61.2"
        fill="none"
        stroke="#fff"
        stroke-width="1.4"
        stroke-linecap="round"
        opacity="0.7"
      />
    </g>
    <circle cx="20" cy="26" r="4.2" fill="#E1D5FF" stroke={INK} stroke-width="1.8" />
    <circle cx="19" cy="27" r="1.2" fill="#B39DDB" />
    <Sparkle x={79} y={22} s={6} />
    <Sparkle x={22} y={78} s={5} fill="#FFF59D" />
    <Sparkle x={82} y={76} s={3.5} fill="#B3F0FF" />
  </>
);

/** stk-29 Đĩa bay (Hiếm): mái kính có người ngoài hành tinh, đĩa kim loại đèn nhấp nháy, tia sáng. */
const ufo: ArtFn = (u) => (
  <>
    <defs>
      <Lin
        id={u('beam')}
        stops={[
          [0, 'rgba(190,255,110,0.8)'],
          [1, 'rgba(190,255,110,0)'],
        ]}
      />
      <Lin
        id={u('metal')}
        stops={[
          [0, '#F5F2FF'],
          [0.5, '#BDB6DB'],
          [1, '#7C74A8'],
        ]}
      />
      <Rad
        id={u('alien')}
        stops={[
          [0, '#C8FF8A'],
          [1, '#4CC94A'],
        ]}
      />
      <Rad
        id={u('glass')}
        cx={0.35}
        cy={0.25}
        r={0.9}
        stops={[
          [0, 'rgba(255,255,255,0.35)'],
          [1, 'rgba(150,215,255,0.12)'],
        ]}
      />
    </defs>
    <path d="M41 75 L20 87 L80 87 L59 75 Z" fill={`url(#${u('beam')})`} />
    <path d="M46 75 L38 87 L62 87 L54 75 Z" fill="#fff" opacity="0.28" />
    {/* bụng đĩa */}
    <ellipse cx="50" cy="70" rx="16" ry="6.5" fill="#8A7CC8" stroke={INK} stroke-width="2.3" />
    {/* người ngoài hành tinh */}
    <ellipse
      cx="50"
      cy="46"
      rx="10"
      ry="9.5"
      fill={`url(#${u('alien')})`}
      stroke={INK}
      stroke-width="2.2"
    />
    <ellipse cx="45.4" cy="45" rx="3.1" ry="4" fill="#263238" transform="rotate(12 45.4 45)" />
    <ellipse cx="54.6" cy="45" rx="3.1" ry="4" fill="#263238" transform="rotate(-12 54.6 45)" />
    <circle cx="46.3" cy="43.4" r="1.2" fill="#fff" />
    <circle cx="55.5" cy="43.4" r="1.2" fill="#fff" />
    <path
      d="M47 50.5 Q50 53 53 50.5"
      fill="none"
      stroke={INK}
      stroke-width="1.7"
      stroke-linecap="round"
    />
    {/* mái kính */}
    <path
      d="M30 58 A20 20 0 0 1 70 58 Z"
      fill={`url(#${u('glass')})`}
      stroke={INK}
      stroke-width="2.4"
      stroke-linejoin="round"
    />
    <path
      d="M36 50 Q37.5 42 45 39.5"
      fill="none"
      stroke="#fff"
      stroke-width="2.6"
      stroke-linecap="round"
      opacity="0.9"
    />
    {/* ăng-ten */}
    <path d="M50 38 L50 27" fill="none" stroke={INK} stroke-width="3.6" stroke-linecap="round" />
    <path
      d="M50 38 L50 27"
      fill="none"
      stroke="#7CE35A"
      stroke-width="1.6"
      stroke-linecap="round"
    />
    <circle cx="50" cy="24" r="4.6" fill="#FF6FB1" opacity="0.35" />
    <circle cx="50" cy="24" r="3.3" fill="#FF6FB1" stroke={INK} stroke-width="1.6" />
    <circle cx="49" cy="23" r="1" fill="#fff" />
    {/* đĩa kim loại */}
    <ellipse
      cx="50"
      cy="62"
      rx="37"
      ry="9.5"
      fill={`url(#${u('metal')})`}
      stroke={INK}
      stroke-width="2.5"
    />
    <path
      d="M18 59 Q50 50 82 59"
      fill="none"
      stroke="#fff"
      stroke-width="2.4"
      stroke-linecap="round"
      opacity="0.7"
    />
    <path d="M17 65 Q50 75 83 65" fill="none" stroke="#6A5FA0" stroke-width="1.8" opacity="0.5" />
    {(
      [
        [22, 63.5, '#FFE94A'],
        [36, 66, '#FF6FB1'],
        [50, 67, '#5CF2FF'],
        [64, 66, '#9CFF6B'],
        [78, 63.5, '#FFB74D'],
      ] as const
    ).map(([x, y, c]) => (
      <g key={x}>
        <circle cx={x} cy={y} r="5.2" fill={c} opacity="0.35" />
        <circle cx={x} cy={y} r="3" fill={c} stroke={INK} stroke-width="1.3" />
        <circle cx={x - 0.9} cy={y - 0.9} r="0.9" fill="#fff" />
      </g>
    ))}
    <Sparkle x={17} y={32} s={5} />
    <Sparkle x={84} y={38} s={4.5} fill="#B3F0FF" />
    <Sparkle x={82} y={80} s={3.5} fill="#FFF59D" />
  </>
);

/** stk-30 Thiên hà (Siêu hiếm): 4 nhánh xoắn ốc nhiều màu, nhân sáng, rất nhiều sao. */
// Một nhánh xoắn ốc thon dần (tô màu), xoay 4 lần quanh tâm
const ARM_D =
  'M-4.4 1.7C-4.3 1.7 -3.8 1.8 -3.5 1.7C-3.2 1.6 -2.8 1.2 -2.6 1.2C-2.4 1.2 -2.1 1.4 -2 1.7C-2 2 -2.1 2.5 -2.5 2.8C-2.9 3.1 -3.5 3.6 -4.4 3.7C-5.2 3.8 -6.4 3.8 -7.5 3.4C-8.7 2.9 -10.1 2.2 -11.2 0.9C-12.3 -0.4 -13.6 -2.1 -14.2 -4.2C-14.8 -6.4 -15.2 -9.1 -14.7 -11.9C-14.3 -14.7 -13.3 -18 -11.3 -21C-9.3 -23.9 -6.4 -27.2 -2.6 -29.4C1.2 -31.7 9.3 -33.6 11.7 -34.4L11.2 -36C8.7 -35.2 0.4 -33.8 -3.8 -31.7C-8.1 -29.6 -11.6 -26.4 -14.3 -23.3C-16.9 -20.2 -18.6 -16.4 -19.6 -13.1C-20.6 -9.7 -20.7 -6.1 -20.3 -3.1C-20 -0.1 -18.8 2.8 -17.4 5.2C-16.1 7.5 -14.1 9.5 -12.2 10.9C-10.2 12.4 -7.9 13.3 -5.7 13.8C-3.6 14.3 -1.3 14.3 0.8 13.9C2.8 13.5 4.8 12.7 6.4 11.6C8 10.5 9.4 9 10.4 7.4C11.3 5.8 11.9 3.7 12.3 2.2C12.6 0.7 12.4 -1.1 12.4 -1.7Z';
const ARMS = [
  [0, '#FF4FD8', '#FFC2F2'],
  [90, '#8F6BFF', '#D6C8FF'],
  [180, '#3DE0FF', '#C9F7FF'],
  [270, '#FFD54F', '#FFF4BF'],
] as const;
// Cụm sao dọc các nhánh (5 sao/nhánh, đã tính sẵn toạ độ sau khi nghiêng)
const CLUSTER = [
  [54, 54.1],
  [47.9, 58.4],
  [37.6, 57.6],
  [30.3, 47.2],
  [37.9, 28.5],
  [44.5, 54.1],
  [40.4, 49.5],
  [42.9, 40.5],
  [56.4, 32.6],
  [77.4, 36.2],
  [46, 45.9],
  [52.1, 41.6],
  [62.4, 42.4],
  [69.7, 52.8],
  [62.1, 71.5],
  [55.5, 45.9],
  [59.6, 50.5],
  [57.1, 59.5],
  [43.6, 67.4],
  [22.6, 63.8],
] as const;
const STARS = [
  [20, 40, 1.6],
  [33, 20, 1.3],
  [71, 22, 1.6],
  [82, 45, 1.4],
  [21, 67, 1.5],
  [46, 82, 1.3],
  [66, 78, 1.6],
  [79, 66, 1.2],
  [55, 15, 1.3],
  [27, 53, 1.1],
  [62, 60, 1.2],
  [40, 33, 1.1],
  [58, 38, 1.0],
  [36, 64, 1.0],
] as const;
const galaxy: ArtFn = (u) => (
  <>
    <defs>
      <Rad
        id={u('halo')}
        cx={0.5}
        cy={0.5}
        r={0.5}
        stops={[
          [0, 'rgba(255,120,230,0.6)'],
          [0.55, 'rgba(150,90,255,0.3)'],
          [1, 'rgba(120,70,255,0)'],
        ]}
      />
      <Rad
        id={u('core')}
        cx={0.5}
        cy={0.5}
        r={0.5}
        stops={[
          [0, '#FFFFFF'],
          [0.4, '#FFF3A8'],
          [1, 'rgba(255,190,80,0)'],
        ]}
      />
      <path id={u('arm')} d={ARM_D} />
    </defs>
    <ellipse
      cx="50"
      cy="50"
      rx="40"
      ry="33"
      transform="rotate(-22 50 50)"
      fill={`url(#${u('halo')})`}
    />
    <g transform="translate(50 50) rotate(-22) scale(1 0.8)" stroke-linejoin="round">
      {ARMS.map(([a, c, t]) => (
        <g key={a} transform={`rotate(${a})`}>
          <use href={`#${u('arm')}`} fill={t} stroke={t} stroke-width="8" opacity="0.2" />
          <use href={`#${u('arm')}`} fill={c} stroke={t} stroke-width="1" />
        </g>
      ))}
    </g>
    {CLUSTER.map(([x, y], i) => (
      <circle key={i} cx={x} cy={y} r={1.1 + (i % 3) * 0.3} fill={ARMS[Math.floor(i / 5)]?.[2]} />
    ))}
    <circle cx="50" cy="50" r="17" fill={`url(#${u('core')})`} />
    <ellipse cx="50" cy="50" rx="17" ry="1.5" fill="#fff" opacity="0.75" />
    <ellipse cx="50" cy="50" rx="1.5" ry="17" fill="#fff" opacity="0.75" />
    <circle cx="50" cy="50" r="5.5" fill="#fff" />
    <Sparkle x={50} y={50} s={8} />
    {STARS.map(([x, y, r]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r={r} fill="#fff" opacity="0.9" />
    ))}
    <Sparkle x={24} y={28} s={5} fill="#FFC2F2" />
    <Sparkle x={77} y={29} s={6} fill="#FFF3A8" />
    <Sparkle x={74} y={73} s={5} fill="#C9F7FF" />
    <Sparkle x={29} y={74} s={4} fill="#FFC2F2" />
  </>
);

export const SPACE_ART: Record<string, ArtFn> = {
  'stk-21': moon,
  'stk-22': star,
  'stk-23': sun,
  'stk-24': mars,
  'stk-25': comet,
  'stk-26': earth,
  'stk-27': astronaut,
  'stk-28': saturn,
  'stk-29': ufo,
  'stk-30': galaxy,
};
