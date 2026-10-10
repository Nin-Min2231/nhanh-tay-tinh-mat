// Viên nhạc (gem) bóng bẩy cho G5: chuyển sắc, vệt sáng, quầng sáng và nốt ♪ trắng. Vẽ 1 lần vào sprite.
const TAU = Math.PI * 2;

export interface LanePalette {
  base: string;
  light: string;
  dark: string;
}

/** 4 làn rực rỡ: hồng · vàng · xanh lá · xanh trời. */
export const LANE_COLORS: readonly LanePalette[] = [
  { base: '#FF5FA2', light: '#FFC2DD', dark: '#B8236B' },
  { base: '#FFC93D', light: '#FFF2A8', dark: '#B87F00' },
  { base: '#3DDC6E', light: '#C3F7D1', dark: '#168A3F' },
  { base: '#29B6F6', light: '#BDEBFF', dark: '#1068A8' },
];

/** Sprite vuông cạnh d × 1,45 (chừa chỗ cho quầng sáng). */
export function renderGem(p: LanePalette, d: number, dpr: number, grey = false): HTMLCanvasElement {
  const side = d * 1.45;
  const cv = document.createElement('canvas');
  const px = Math.max(8, Math.round(side * dpr));
  cv.width = px;
  cv.height = px;
  const c = cv.getContext('2d');
  if (!c) return cv;
  c.scale(px / side, px / side);
  const cx = side / 2;
  const cy = side / 2;
  const r = d / 2;
  const base = grey ? '#9AA5B1' : p.base;
  const light = grey ? '#DDE3EA' : p.light;
  const dark = grey ? '#5E6A78' : p.dark;

  // quầng sáng
  const glow = c.createRadialGradient(cx, cy, r * 0.6, cx, cy, side * 0.5);
  glow.addColorStop(0, grey ? 'rgba(160,170,180,0.25)' : `${base}99`);
  glow.addColorStop(1, `${base}00`);
  c.fillStyle = glow;
  c.fillRect(0, 0, side, side);

  // thân viên ngọc
  const body = c.createRadialGradient(cx - r * 0.3, cy - r * 0.35, r * 0.05, cx, cy, r * 1.05);
  body.addColorStop(0, light);
  body.addColorStop(0.45, base);
  body.addColorStop(1, dark);
  c.beginPath();
  c.arc(cx, cy, r, 0, TAU);
  c.fillStyle = body;
  c.fill();
  c.lineWidth = Math.max(2, r * 0.07);
  c.strokeStyle = 'rgba(30,20,60,0.55)';
  c.stroke();
  // viền sáng bên trong
  c.beginPath();
  c.arc(cx, cy, r * 0.86, Math.PI * 0.1, Math.PI * 0.9);
  c.lineWidth = r * 0.08;
  c.strokeStyle = 'rgba(255,255,255,0.28)';
  c.stroke();
  // vệt phản chiếu
  c.save();
  c.translate(cx - r * 0.34, cy - r * 0.46);
  c.rotate(-0.55);
  c.beginPath();
  c.ellipse(0, 0, r * 0.36, r * 0.18, 0, 0, TAU);
  c.fillStyle = 'rgba(255,255,255,0.78)';
  c.fill();
  c.restore();

  // nốt ♪ trắng (có bóng)
  c.save();
  c.shadowColor = 'rgba(30,10,60,0.35)';
  c.shadowBlur = r * 0.12;
  c.shadowOffsetY = r * 0.05;
  c.fillStyle = '#FFFFFF';
  c.beginPath();
  c.ellipse(cx - r * 0.14, cy + r * 0.3, r * 0.24, r * 0.17, -0.35, 0, TAU);
  c.fill();
  c.fillRect(cx + r * 0.04, cy - r * 0.42, r * 0.1, r * 0.74);
  c.beginPath();
  c.moveTo(cx + r * 0.14, cy - r * 0.42);
  c.quadraticCurveTo(cx + r * 0.48, cy - r * 0.34, cx + r * 0.4, cy - r * 0.02);
  c.quadraticCurveTo(cx + r * 0.36, cy - r * 0.22, cx + r * 0.14, cy - r * 0.2);
  c.closePath();
  c.fill();
  c.restore();
  return cv;
}
