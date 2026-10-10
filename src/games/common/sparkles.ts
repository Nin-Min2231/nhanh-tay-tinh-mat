// Hạt lấp lánh khi chạm đúng. Pool cố định → không tạo object mới trong vòng lặp game.
import type { Rng } from '../../app/rng';

const COLORS = ['#FFD93D', '#FF5FA2', '#29B6F6', '#8E6CF0', '#43D675', '#FF8A3D'] as const;
const TAU = Math.PI * 2;

interface Particle {
  on: boolean;
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  max: number;
  color: number;
}

export class Sparkles {
  private readonly pool: Particle[];

  constructor(size = 40) {
    this.pool = Array.from({ length: size }, () => ({
      on: false,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      life: 0,
      max: 1,
      color: 0,
    }));
  }

  burst(x: number, y: number, count: number, rng: Rng): void {
    let made = 0;
    for (const p of this.pool) {
      if (p.on) continue;
      const a = rng() * TAU;
      const v = 0.12 + rng() * 0.24;
      p.on = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(a) * v;
      p.vy = Math.sin(a) * v - 0.06;
      p.life = p.max = 420 + rng() * 260;
      p.color = Math.floor(rng() * COLORS.length);
      if (++made >= count) break;
    }
  }

  update(dtMs: number): void {
    for (const p of this.pool) {
      if (!p.on) continue;
      p.life -= dtMs;
      if (p.life <= 0) {
        p.on = false;
        continue;
      }
      p.x += p.vx * dtMs;
      p.y += p.vy * dtMs;
      p.vy += 0.0006 * dtMs;
    }
  }

  draw(c: CanvasRenderingContext2D): void {
    for (const p of this.pool) {
      if (!p.on) continue;
      const k = p.life / p.max;
      c.beginPath();
      c.arc(p.x, p.y, 3 + 6 * k, 0, TAU);
      c.globalAlpha = Math.min(1, k * 1.6);
      c.fillStyle = COLORS[p.color] as string;
      c.fill();
    }
    c.globalAlpha = 1;
  }
}
