// Phần vẽ HUD dùng chung cho các game canvas: số điểm bên trái + thanh thời gian của lượt.
export const HUD_HEIGHT = 44;
const INK = '#263238';
const BAR_X = 96;

export function makeBarGradient(c: CanvasRenderingContext2D, width: number): CanvasGradient {
  const g = c.createLinearGradient(0, 0, Math.max(1, width), 0);
  g.addColorStop(0, '#43D675');
  g.addColorStop(0.5, '#FFD93D');
  g.addColorStop(1, '#FF8A3D');
  return g;
}

export function starPath(c: CanvasRenderingContext2D, cx: number, cy: number, r: number): void {
  c.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.45;
    const a = -Math.PI / 2 + (i * Math.PI) / 5;
    const px = cx + Math.cos(a) * rad;
    const py = cy + Math.sin(a) * rad;
    if (i === 0) c.moveTo(px, py);
    else c.lineTo(px, py);
  }
  c.closePath();
}

export interface HudState {
  /** Chuỗi đã định dạng sẵn (đừng tạo chuỗi mới mỗi khung hình). */
  countText: string;
  /** 0–1 */
  progress: number;
  gradient: CanvasGradient | null;
  /** Chữ nhỏ ở góc phải dưới HUD (đồng hồ FPS khi ?debug=1). */
  debugText?: string;
  /** Màu chữ/viền: sáng khi nền tối. */
  dark?: boolean;
}

export function drawHud(c: CanvasRenderingContext2D, width: number, hud: HudState): void {
  const ink = hud.dark ? '#FFFFFF' : INK;
  starPath(c, 26, HUD_HEIGHT / 2, 13);
  c.fillStyle = '#FFD93D';
  c.fill();
  c.lineWidth = 3;
  c.lineJoin = 'round';
  c.strokeStyle = INK;
  c.stroke();
  c.fillStyle = ink;
  c.font = '800 22px Nunito, system-ui, sans-serif';
  c.textBaseline = 'middle';
  c.textAlign = 'left';
  c.fillText(hud.countText, 48, HUD_HEIGHT / 2 + 1);

  const bw = Math.max(10, width - BAR_X - 16);
  const frac = Math.min(1, Math.max(0, hud.progress));
  c.beginPath();
  c.roundRect(BAR_X, 13, bw, 18, 9);
  c.fillStyle = 'rgba(255,255,255,0.85)';
  c.fill();
  if (frac > 0.01) {
    c.beginPath();
    c.roundRect(BAR_X, 13, bw * frac, 18, 9);
    c.fillStyle = hud.gradient ?? '#43D675';
    c.fill();
  }
  c.beginPath();
  c.roundRect(BAR_X, 13, bw, 18, 9);
  c.lineWidth = 3;
  c.strokeStyle = INK;
  c.stroke();
  if (hud.debugText) {
    c.font = '700 14px Nunito, system-ui, sans-serif';
    c.fillStyle = ink;
    c.textAlign = 'right';
    c.fillText(hud.debugText, width - 20, HUD_HEIGHT + 14);
  }
}
