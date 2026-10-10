// G1 – vẽ canvas + nhận chạm. Quy tắc: đo RT bằng event.timeStamp − onset (onset = lúc khung hình đầu tiên có bóng),
// chỉ nhận chạm đầu, không tạo object mới mỗi khung hình (dùng pool cố định).
import { DEBUG, E2E } from '../../app/e2e';
import { mulberry32, pick, type Rng } from '../../app/rng';
import { vi } from '../../i18n/vi';
import { createCanvasStage } from '../common/CanvasStage';
import { createHintBubble } from '../common/HintBubble';
import { drawHud, makeBarGradient } from '../common/hud';
import { attachPointerInput, type TapEvent } from '../common/PointerInput';
import type { GameContext, GameInstance } from '../common/types';
import { readG1Options, resolveG1Params, type BallKind, type G1Params } from './config';
import {
  ROUND_MS,
  SpawnPlanner,
  ballDiameter,
  buildMetrics,
  emptyStats,
  hitDistanceSq,
  pickPositions,
  scoreFromStats,
} from './logic';

const TAU = Math.PI * 2;
const POP_MS = 90;
const SHRINK_MS = 160;
const FIRST_SPAWN_MS = 350;
const PARTICLES = 28;

const FILL: Record<BallKind, string> = {
  green: '#3DDC6E',
  red: '#FF4D5E',
  yellow: '#FFD93D',
  brown: '#B9774A',
};
const STROKE: Record<BallKind, string> = {
  green: '#1B8F3E',
  red: '#B3202F',
  yellow: '#C79A00',
  brown: '#6B3F1F',
};
const INK = '#263238';
const SPARK = ['#FFD93D', '#FF5FA2', '#29B6F6', '#8E6CF0', '#43D675', '#FF8A3D'] as const;

interface Ball {
  active: boolean;
  id: number;
  kind: BallKind;
  x: number;
  y: number;
  r: number;
  /** Thời gian chơi (ms) lúc bóng xuất hiện. */
  bornAt: number;
  /** performance.now() lúc khung hình đầu tiên vẽ bóng; 0 = chưa hiện. */
  onset: number;
}

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

const makeBall = (): Ball => ({
  active: false,
  id: 0,
  kind: 'green',
  x: 0,
  y: 0,
  r: 0,
  bornAt: 0,
  onset: 0,
});
const makeParticle = (): Particle => ({
  on: false,
  x: 0,
  y: 0,
  vx: 0,
  vy: 0,
  life: 0,
  max: 1,
  color: 0,
});

export function createG1(host: HTMLElement, ctx: GameContext): GameInstance {
  const params: G1Params = resolveG1Params(ctx.level, readG1Options(ctx.options));
  const roundMs = ROUND_MS / Math.max(1, ctx.timeScale);

  // Mỗi nguồn ngẫu nhiên một luồng riêng → dãy bóng không phụ thuộc kích thước màn hình / số lần thử vị trí.
  const seed = () => (ctx.rng() * 4294967296) >>> 0;
  const planner = new SpawnPlanner(mulberry32(seed()), params);
  const posRng: Rng = mulberry32(seed());
  const gapRng: Rng = mulberry32(seed());
  const uiRng: Rng = mulberry32(seed());

  const bubble = createHintBubble(host);
  const balls: Ball[] = [makeBall(), makeBall()];
  const particles: Particle[] = Array.from({ length: PARTICLES }, makeParticle);
  const stats = emptyStats();
  const rts: number[] = [];

  let barGradient: CanvasGradient | null = null;
  let diameter = 64;
  const stage = createCanvasStage(host, (w, h, cx) => {
    diameter = ballDiameter(w, h);
    barGradient = makeBarGradient(cx, w);
  });
  const c = stage.ctx;

  let running = false;
  let finished = false;
  let rafId = 0;
  let lastFrame = 0;
  let gameT = 0;
  let nextSpawnAt = FIRST_SPAWN_MS;
  let serial = 0;
  let hitsText = '0';
  let dirtyDom = false;
  let fps = 60;
  let fpsText = '60';
  let fpsSince = 0;

  if (E2E.hooks) {
    host.dataset.g1 = JSON.stringify({
      level: ctx.level,
      colors: params.colors,
      simultaneous: params.simultaneous,
      displayMs: params.displayMs,
    });
  }

  function publish(): void {
    if (!E2E.hooks) return;
    const shown = balls
      .filter((b) => b.active && b.onset > 0)
      .map((b) => ({ id: b.id, kind: b.kind, x: Math.round(b.x), y: Math.round(b.y) }));
    host.dataset.balls = JSON.stringify(shown);
    host.dataset.stats = JSON.stringify(stats);
  }

  function activeCount(): number {
    let n = 0;
    for (const b of balls) if (b.active) n++;
    return n;
  }

  function spawn(): void {
    const kinds = planner.next();
    const pts = pickPositions(
      posRng,
      { width: stage.width, height: stage.height },
      diameter,
      kinds.length,
    );
    for (let i = 0; i < kinds.length; i++) {
      const b = balls[i] as Ball;
      const p = pts[i] as { x: number; y: number };
      b.active = true;
      b.id = ++serial;
      b.kind = kinds[i] as BallKind;
      b.x = p.x;
      b.y = p.y;
      b.r = diameter / 2;
      b.bornAt = gameT;
      b.onset = 0;
    }
  }

  function scheduleNext(): void {
    nextSpawnAt = gameT + params.gapMs[0] + gapRng() * (params.gapMs[1] - params.gapMs[0]);
  }

  function resolve(b: Ball): void {
    b.active = false;
    if (activeCount() === 0) scheduleNext();
    dirtyDom = true;
  }

  function burst(x: number, y: number): void {
    let made = 0;
    for (const p of particles) {
      if (p.on) continue;
      const a = uiRng() * TAU;
      const v = 0.12 + uiRng() * 0.22;
      p.on = true;
      p.x = x;
      p.y = y;
      p.vx = Math.cos(a) * v;
      p.vy = Math.sin(a) * v - 0.05;
      p.life = p.max = 420 + uiRng() * 240;
      p.color = Math.floor(uiRng() * SPARK.length);
      if (++made >= 10) break;
    }
  }

  function wrong(): void {
    ctx.audio.bup();
    ctx.haptics.wrong(host);
    bubble.show(pick(uiRng, vi.encourage));
  }

  function onTap(t: TapEvent): void {
    if (!running || finished) return;
    let best: Ball | null = null;
    let bestD = Infinity;
    for (const b of balls) {
      // chỉ nhận chạm xảy ra SAU khi bóng đã hiện hình
      if (!b.active || b.onset === 0 || t.timeStamp < b.onset) continue;
      const d = hitDistanceSq(b.x, b.y, b.r, t.x, t.y);
      if (d >= 0 && d < bestD) {
        best = b;
        bestD = d;
      }
    }
    if (!best) {
      stats.emptyTaps += 1; // chạm chỗ trống bị tính lỗi (chống bấm bừa)
      wrong();
      dirtyDom = true;
      return;
    }
    if (best.kind === 'green') {
      stats.hits += 1;
      rts.push(t.timeStamp - best.onset);
      hitsText = String(stats.hits);
      burst(best.x, best.y);
      ctx.audio.ding();
      ctx.haptics.correct();
    } else {
      stats.falseAlarms += 1;
      wrong();
    }
    resolve(best);
  }

  const detach = attachPointerInput(host, 'first', onTap);

  function update(dt: number): void {
    gameT += dt;
    for (const b of balls) {
      if (b.active && b.onset > 0 && gameT - b.bornAt >= params.displayMs) {
        if (b.kind === 'green') stats.misses += 1;
        else stats.correctRejections += 1;
        resolve(b);
      }
    }
    if (activeCount() === 0) {
      if (gameT >= roundMs) {
        end();
        return;
      }
      if (gameT >= nextSpawnAt) spawn();
    }
    for (const p of particles) {
      if (!p.on) continue;
      p.life -= dt;
      if (p.life <= 0) {
        p.on = false;
        continue;
      }
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 0.0006 * dt;
    }
  }

  // ---- vẽ ----
  function drawBall(b: Ball): void {
    const age = gameT - b.bornAt;
    let s = 1;
    if (age < POP_MS)
      s = 0.3 + 0.9 * (age / POP_MS); // nảy ra: 0.3 → 1.2
    else if (age < POP_MS * 2) s = 1.2 - 0.2 * ((age - POP_MS) / POP_MS);
    const left = params.displayMs - age;
    if (left < SHRINK_MS) s = Math.min(s, Math.max(0, left / SHRINK_MS)); // thu nhỏ rồi biến mất
    const r = b.r;
    c.save();
    c.translate(b.x, b.y);
    c.scale(s, s);
    // bóng đổ
    c.beginPath();
    c.ellipse(0, r * 1.02, r * 0.78, r * 0.16, 0, 0, TAU);
    c.fillStyle = 'rgba(38,50,56,0.16)';
    c.fill();
    c.lineWidth = 5;
    c.lineJoin = 'round';
    c.lineCap = 'round';
    c.fillStyle = FILL[b.kind];
    c.strokeStyle = STROKE[b.kind];
    switch (b.kind) {
      case 'green': {
        c.beginPath();
        c.arc(0, 0, r, 0, TAU);
        c.fill();
        c.stroke();
        c.fillStyle = INK; // mặt cười
        c.beginPath();
        c.arc(-r * 0.32, -r * 0.2, r * 0.1, 0, TAU);
        c.arc(r * 0.32, -r * 0.2, r * 0.1, 0, TAU);
        c.fill();
        c.beginPath();
        c.arc(0, r * 0.02, r * 0.52, 0.2 * Math.PI, 0.8 * Math.PI);
        c.lineWidth = r * 0.12;
        c.strokeStyle = INK;
        c.stroke();
        break;
      }
      case 'red': {
        const h = r * 0.9;
        c.beginPath();
        c.roundRect(-h, -h, h * 2, h * 2, r * 0.3);
        c.fill();
        c.stroke();
        c.beginPath(); // ✕
        c.moveTo(-r * 0.42, -r * 0.42);
        c.lineTo(r * 0.42, r * 0.42);
        c.moveTo(r * 0.42, -r * 0.42);
        c.lineTo(-r * 0.42, r * 0.42);
        c.lineWidth = r * 0.2;
        c.strokeStyle = '#FFFFFF';
        c.stroke();
        break;
      }
      case 'yellow': {
        c.beginPath();
        c.moveTo(0, -r * 1.02);
        c.lineTo(r * 1.0, r * 0.82);
        c.lineTo(-r * 1.0, r * 0.82);
        c.closePath();
        c.fill();
        c.stroke();
        c.beginPath(); // !
        c.moveTo(0, -r * 0.3);
        c.lineTo(0, r * 0.22);
        c.lineWidth = r * 0.2;
        c.strokeStyle = INK;
        c.stroke();
        c.beginPath();
        c.arc(0, r * 0.5, r * 0.11, 0, TAU);
        c.fillStyle = INK;
        c.fill();
        break;
      }
      case 'brown': {
        c.beginPath();
        c.moveTo(0, -r * 1.06);
        c.lineTo(r * 1.06, 0);
        c.lineTo(0, r * 1.06);
        c.lineTo(-r * 1.06, 0);
        c.closePath();
        c.fill();
        c.stroke();
        c.beginPath(); // ~
        c.moveTo(-r * 0.5, r * 0.04);
        c.quadraticCurveTo(-r * 0.25, -r * 0.34, 0, 0);
        c.quadraticCurveTo(r * 0.25, r * 0.34, r * 0.5, -r * 0.04);
        c.lineWidth = r * 0.17;
        c.strokeStyle = '#FFFFFF';
        c.stroke();
        break;
      }
    }
    if (b.kind === 'green' || b.kind === 'yellow') {
      // vệt sáng
      c.beginPath();
      c.arc(-r * 0.5, -r * 0.5, r * 0.18, Math.PI, Math.PI * 1.5);
      c.lineWidth = r * 0.1;
      c.strokeStyle = 'rgba(255,255,255,0.55)';
      c.stroke();
    }
    c.restore();
  }

  function draw(now: number): void {
    c.clearRect(0, 0, stage.width, stage.height);
    let marked = false;
    for (const b of balls) {
      if (!b.active) continue;
      drawBall(b);
      if (b.onset === 0) {
        b.onset = now; // khung hình đầu tiên có bóng → mốc tính thời gian phản ứng
        marked = true;
      }
    }
    for (const p of particles) {
      if (!p.on) continue;
      const k = p.life / p.max;
      c.beginPath();
      c.arc(p.x, p.y, 3 + 6 * k, 0, TAU);
      c.fillStyle = SPARK[p.color] as string;
      c.globalAlpha = Math.min(1, k * 1.6);
      c.fill();
    }
    c.globalAlpha = 1;
    drawHud(c, stage.width, {
      countText: hitsText,
      progress: gameT / roundMs,
      gradient: barGradient,
      debugText: DEBUG ? fpsText : undefined,
    });
    if (marked || dirtyDom) {
      dirtyDom = false;
      publish();
    }
  }

  function frame(now: number): void {
    if (!running) return;
    const dt = Math.max(0, Math.min(100, now - lastFrame));
    lastFrame = now;
    if (DEBUG && dt > 0) {
      fps += (1000 / dt - fps) * 0.1;
      if (now - fpsSince > 500) {
        fpsSince = now;
        fpsText = `${Math.round(fps)} fps`;
      }
    }
    update(dt);
    if (finished) return;
    draw(performance.now());
    rafId = requestAnimationFrame(frame);
  }

  function startLoop(): void {
    running = true;
    lastFrame = performance.now();
    rafId = requestAnimationFrame(frame);
  }

  function stopLoop(): void {
    running = false;
    cancelAnimationFrame(rafId);
  }

  function end(): void {
    if (finished) return;
    finished = true;
    stopLoop();
    ctx.onFinish({
      score: scoreFromStats(stats),
      durationMs: Math.round(gameT),
      metrics: buildMetrics(stats, rts),
    });
  }

  return {
    start: startLoop,
    pause: stopLoop,
    resume() {
      if (!finished) startLoop();
    },
    finish: end,
    destroy() {
      finished = true;
      stopLoop();
      detach();
      bubble.destroy();
      stage.destroy();
      delete host.dataset.g1;
      delete host.dataset.balls;
      delete host.dataset.stats;
    },
  };
}
