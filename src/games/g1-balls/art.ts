// G1 – hình bóng/khối bóng bẩy, vẽ MỘT LẦN mỗi khi đổi kích thước rồi drawImage mỗi khung hình (quy tắc 17: không tạo
// gradient/đối tượng mới trong vòng lặp). Hình dạng và dấu hiệu giữ nguyên để phân biệt không cần màu (mù màu, TC-028):
// xanh = tròn + mặt cười · đỏ = vuông + ✕ · vàng = tam giác + ! · nâu = thoi + ~. Chỉ đổi cách tô: chuyển sắc, vệt sáng.
import type { BallKind } from './config';

const TAU = Math.PI * 2;
const INK = '#263238';
/** Vẽ lớn hơn 25% để lúc bóng “nảy” ra (phóng tới 1,2×) vẫn nét. */
const SUPERSAMPLE = 1.25;

export interface BallSprite {
  canvas: HTMLCanvasElement;
  /** Nửa cạnh (CSS px) của vùng sprite, tính từ tâm bóng. */
  half: number;
}

function glossEllipse(
  c: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  rot: number,
  alpha: number,
): void {
  c.beginPath();
  c.ellipse(x, y, rx, ry, rot, 0, TAU);
  c.fillStyle = `rgba(255,255,255,${alpha})`;
  c.fill();
}

function drawGreen(c: CanvasRenderingContext2D, r: number): void {
  const g = c.createRadialGradient(-r * 0.32, -r * 0.4, r * 0.06, 0, 0, r * 1.04);
  g.addColorStop(0, '#E8FFEF');
  g.addColorStop(0.32, '#74EC9A');
  g.addColorStop(0.68, '#3DDC6E');
  g.addColorStop(1, '#22A04B');
  c.beginPath();
  c.arc(0, 0, r, 0, TAU);
  c.fillStyle = g;
  c.fill();
  c.lineWidth = 5;
  c.strokeStyle = '#17803B';
  c.stroke();
  // má hồng + mặt cười
  c.fillStyle = 'rgba(255,120,150,0.85)';
  c.beginPath();
  c.ellipse(-r * 0.58, r * 0.2, r * 0.15, r * 0.1, 0, 0, TAU);
  c.ellipse(r * 0.58, r * 0.2, r * 0.15, r * 0.1, 0, 0, TAU);
  c.fill();
  c.fillStyle = INK;
  c.beginPath();
  c.arc(-r * 0.32, -r * 0.2, r * 0.1, 0, TAU);
  c.arc(r * 0.32, -r * 0.2, r * 0.1, 0, TAU);
  c.fill();
  c.fillStyle = '#FFFFFF';
  c.beginPath();
  c.arc(-r * 0.29, -r * 0.235, r * 0.035, 0, TAU);
  c.arc(r * 0.35, -r * 0.235, r * 0.035, 0, TAU);
  c.fill();
  c.beginPath();
  c.arc(0, r * 0.02, r * 0.52, 0.2 * Math.PI, 0.8 * Math.PI);
  c.lineWidth = r * 0.12;
  c.strokeStyle = INK;
  c.stroke();
  glossEllipse(c, -r * 0.42, -r * 0.55, r * 0.27, r * 0.13, -0.62, 0.6);
}

function drawRed(c: CanvasRenderingContext2D, r: number): void {
  const h = r * 0.9;
  const g = c.createLinearGradient(-h, -h, h, h);
  g.addColorStop(0, '#FFB6BD');
  g.addColorStop(0.42, '#FF4D5E');
  g.addColorStop(1, '#BC2135');
  c.beginPath();
  c.roundRect(-h, -h, h * 2, h * 2, r * 0.3);
  c.fillStyle = g;
  c.fill();
  c.lineWidth = 5;
  c.strokeStyle = '#A3192D';
  c.stroke();
  // vệt sáng góc trên-trái
  c.beginPath();
  c.roundRect(-h * 0.8, -h * 0.82, h * 1.05, h * 0.34, r * 0.17);
  c.fillStyle = 'rgba(255,255,255,0.3)';
  c.fill();
  // ✕ trắng có bóng
  const x = r * 0.42;
  for (const [dy, color, width] of [
    [r * 0.045, 'rgba(110,12,28,0.38)', r * 0.27],
    [0, '#FFFFFF', r * 0.2],
  ] as const) {
    c.beginPath();
    c.moveTo(-x, -x + dy);
    c.lineTo(x, x + dy);
    c.moveTo(x, -x + dy);
    c.lineTo(-x, x + dy);
    c.lineWidth = width;
    c.strokeStyle = color;
    c.stroke();
  }
}

function drawYellow(c: CanvasRenderingContext2D, r: number): void {
  const g = c.createLinearGradient(0, -r, 0, r);
  g.addColorStop(0, '#FFF59A');
  g.addColorStop(0.5, '#FFD93D');
  g.addColorStop(1, '#E39B00');
  c.beginPath();
  c.moveTo(0, -r * 1.02);
  c.lineTo(r, r * 0.82);
  c.lineTo(-r, r * 0.82);
  c.closePath();
  c.fillStyle = g;
  c.fill();
  c.lineWidth = 5;
  c.strokeStyle = '#B58500';
  c.stroke();
  // vệt sáng dọc cạnh trái
  c.beginPath();
  c.moveTo(-r * 0.12, -r * 0.6);
  c.lineTo(-r * 0.58, r * 0.24);
  c.lineWidth = r * 0.1;
  c.strokeStyle = 'rgba(255,255,255,0.6)';
  c.stroke();
  // dấu !
  c.beginPath();
  c.moveTo(0, -r * 0.3);
  c.lineTo(0, r * 0.22);
  c.lineWidth = r * 0.2;
  c.strokeStyle = INK;
  c.stroke();
  c.beginPath();
  c.arc(0, r * 0.5, r * 0.11, 0, TAU);
  c.fillStyle = INK;
  c.fill();
}

function drawBrown(c: CanvasRenderingContext2D, r: number): void {
  const g = c.createLinearGradient(-r, -r, r, r);
  g.addColorStop(0, '#E5B084');
  g.addColorStop(0.45, '#B9774A');
  g.addColorStop(1, '#7B4724');
  c.beginPath();
  c.moveTo(0, -r * 1.06);
  c.lineTo(r * 1.06, 0);
  c.lineTo(0, r * 1.06);
  c.lineTo(-r * 1.06, 0);
  c.closePath();
  c.fillStyle = g;
  c.fill();
  c.lineWidth = 5;
  c.strokeStyle = '#5E3418';
  c.stroke();
  // vệt sáng dọc cạnh trên-trái
  c.beginPath();
  c.moveTo(-r * 0.12, -r * 0.74);
  c.lineTo(-r * 0.74, -r * 0.12);
  c.lineWidth = r * 0.09;
  c.strokeStyle = 'rgba(255,255,255,0.5)';
  c.stroke();
  // dấu ~
  c.beginPath();
  c.moveTo(-r * 0.5, r * 0.04);
  c.quadraticCurveTo(-r * 0.25, -r * 0.34, 0, 0);
  c.quadraticCurveTo(r * 0.25, r * 0.34, r * 0.5, -r * 0.04);
  c.lineWidth = r * 0.17;
  c.strokeStyle = '#FFFFFF';
  c.stroke();
}

const PAINT: Record<BallKind, (c: CanvasRenderingContext2D, r: number) => void> = {
  green: drawGreen,
  red: drawRed,
  yellow: drawYellow,
  brown: drawBrown,
};

/** Vẽ sẵn sprite một loại bóng (đường kính `diameter` CSS px, tỉ lệ điểm ảnh `dpr`). */
export function renderBallSprite(kind: BallKind, diameter: number, dpr: number): BallSprite {
  const r = diameter / 2;
  const half = Math.ceil(r * 1.1 + 4); // đủ chỗ cho hình rộng nhất (thoi ±1,06r) + nét viền
  const scale = Math.max(1, dpr) * SUPERSAMPLE;
  const canvas = document.createElement('canvas');
  const side = Math.max(2, Math.ceil(half * 2 * scale));
  canvas.width = side;
  canvas.height = side;
  const c = canvas.getContext('2d');
  if (c) {
    c.setTransform(scale, 0, 0, scale, side / 2, side / 2);
    c.lineJoin = 'round';
    c.lineCap = 'round';
    PAINT[kind](c, r);
  }
  return { canvas, half };
}
