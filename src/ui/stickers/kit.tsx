// Bộ công cụ vẽ sticker SVG: gradient, vệt sáng, tia lấp lánh. Khung vẽ 100×100, vùng an toàn x,y ∈ [14, 86].
// Quy ước phong cách (cùng Avatar/Mascot): nét viền tối INK 2–2.5px, chuyển sắc, vệt sáng trắng, đổ bóng mềm.
import type { ComponentChildren } from 'preact';

export const INK = '#37474F';

/** Tạo id duy nhất trong trang: u('a') → 'stk-01-a'. */
export type Uid = (name: string) => string;
export type ArtFn = (u: Uid) => ComponentChildren;

type Stops = readonly (readonly [number, string])[];

/** Chuyển sắc tuyến tính. Mặc định từ trên xuống dưới; truyền x1..y2 (0–1) để đổi hướng. */
export function Lin({
  id,
  stops,
  x1 = 0,
  y1 = 0,
  x2 = 0,
  y2 = 1,
}: {
  id: string;
  stops: Stops;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
}) {
  return (
    <linearGradient id={id} x1={x1} y1={y1} x2={x2} y2={y2}>
      {stops.map(([o, c]) => (
        <stop key={o} offset={o} stop-color={c} />
      ))}
    </linearGradient>
  );
}

/** Chuyển sắc tròn kiểu “quả cầu bóng”: tâm sáng lệch lên trái. */
export function Rad({
  id,
  stops,
  cx = 0.35,
  cy = 0.3,
  r = 0.8,
}: {
  id: string;
  stops: Stops;
  cx?: number;
  cy?: number;
  r?: number;
}) {
  return (
    <radialGradient id={id} cx={cx} cy={cy} r={r} fx={cx} fy={cy}>
      {stops.map(([o, c]) => (
        <stop key={o} offset={o} stop-color={c} />
      ))}
    </radialGradient>
  );
}

/** Vệt sáng bóng (elip trắng mờ). */
export function Shine({
  x,
  y,
  rx,
  ry,
  rot = 0,
  opacity = 0.6,
}: {
  x: number;
  y: number;
  rx: number;
  ry: number;
  rot?: number;
  opacity?: number;
}) {
  return (
    <ellipse
      cx={x}
      cy={y}
      rx={rx}
      ry={ry}
      fill="#fff"
      opacity={opacity}
      transform={rot ? `rotate(${rot} ${x} ${y})` : undefined}
    />
  );
}

/** Tia lấp lánh 4 cánh. */
export function Sparkle({
  x,
  y,
  s = 6,
  fill = '#fff',
  opacity = 1,
}: {
  x: number;
  y: number;
  s?: number;
  fill?: string;
  opacity?: number;
}) {
  const k = s * 0.28;
  return (
    <path
      d={`M${x} ${y - s} Q${x + k} ${y - k} ${x + s} ${y} Q${x + k} ${y + k} ${x} ${y + s} Q${x - k} ${y + k} ${x - s} ${y} Q${x - k} ${y - k} ${x} ${y - s} Z`}
      fill={fill}
      opacity={opacity}
    />
  );
}

/** Mắt tròn có đốm sáng (dùng cho nhân vật dễ thương). */
export function Eye({ x, y, r = 3.4 }: { x: number; y: number; r?: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={r} fill="#263238" />
      <circle cx={x + r * 0.32} cy={y - r * 0.34} r={r * 0.38} fill="#fff" />
    </g>
  );
}

/** Má hồng. */
export function Cheek({ x, y, r = 4 }: { x: number; y: number; r?: number }) {
  return <ellipse cx={x} cy={y} rx={r} ry={r * 0.72} fill="#FF7B9C" opacity="0.55" />;
}

/** Đổ bóng mềm dưới chân hình (elip tối mờ). */
export function GroundShadow({
  x = 50,
  y = 84,
  rx = 26,
  ry = 4.5,
}: {
  x?: number;
  y?: number;
  rx?: number;
  ry?: number;
}) {
  return <ellipse cx={x} cy={y} rx={rx} ry={ry} fill="#263238" opacity="0.18" />;
}
