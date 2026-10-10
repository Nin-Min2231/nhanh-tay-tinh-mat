// G3 – vẽ canvas + nhận chạm. Sprite thú được vẽ sẵn 1 lần (art.ts) rồi drawImage mỗi khung hình.
// Không tạo object mới trong vòng lặp: thú, hạt đều nằm trong pool cố định.
import { DEBUG, E2E } from '../../app/e2e';
import { mulberry32, pick, type Rng } from '../../app/rng';
import { vi } from '../../i18n/vi';
import { createCanvasStage } from '../common/CanvasStage';
import { createHintBubble } from '../common/HintBubble';
import { HUD_HEIGHT, drawHud, makeBarGradient } from '../common/hud';
import { attachPointerInput, type TapEvent } from '../common/PointerInput';
import { Sparkles } from '../common/sparkles';
import type { GameContext, GameInstance } from '../common/types';
import { SPRITE_CENTER_Y, SPRITE_SCALE, renderSprite, type SpriteKind } from './art';
import { PET_KINDS, readG3Options, resolveG3Params, type PetKind } from './config';
import {
  BURST_FACTOR,
  BURST_MS,
  DECOY_SPEED_FACTOR,
  ERRATIC_MAX_MS,
  ERRATIC_MIN_MS,
  RESPAWN_MS,
  ROUND_MS,
  buildMetrics,
  petSize,
  pickTarget,
  scoreFromStats,
  setHeading,
  spawnPosition,
  speedOf,
  speedPx,
  stepMover,
  turnRandomly,
  type Bounds,
  type G3Stats,
  type Mover,
  type Target,
} from './logic';

const APPEAR_MS = 200;
const WIGGLE_MS = 380;
const FIRST_PET_BURST_AT = 4000;

interface Pet extends Mover, Target {
  kind: SpriteKind;
  decoy: boolean;
  /** 0 = đang chạy · 1 = vừa bị bắt (hú rồi biến mất) */
  state: 0 | 1;
  /** Thời gian (ms) đã ở trạng thái hiện tại. */
  stateT: number;
  appearT: number;
  turnAt: number;
  burstAt: number;
  burstEnd: number;
  wiggleT: number;
  phase: number;
}

function makePet(decoy: boolean, kind: SpriteKind): Pet {
  return {
    x: 0,
    y: 0,
    vx: 0,
    vy: 0,
    r: 24,
    active: false,
    kind,
    decoy,
    state: 0,
    stateT: 0,
    appearT: APPEAR_MS,
    turnAt: 0,
    burstAt: 0,
    burstEnd: 0,
    wiggleT: 0,
    phase: 0,
  };
}

export function createG3(host: HTMLElement, ctx: GameContext): GameInstance {
  const params = resolveG3Params(ctx.level, readG3Options(ctx.options));
  const roundMs = ROUND_MS / Math.max(1, ctx.timeScale);

  const seed = () => (ctx.rng() * 4294967296) >>> 0;
  const kindRng: Rng = mulberry32(seed());
  const moveRng: Rng = mulberry32(seed());
  const spawnRng: Rng = mulberry32(seed());
  const uiRng: Rng = mulberry32(seed());

  host.classList.add('theme-meadow');
  const bubble = createHintBubble(host);
  const sparkles = new Sparkles(40);

  // Thú cần bắt (4 loại luân phiên ngẫu nhiên) + Nhím ngủ
  const pets: Pet[] = [];
  for (let i = 0; i < params.count; i++) {
    pets.push(makePet(false, PET_KINDS[Math.floor(kindRng() * PET_KINDS.length)] as PetKind));
  }
  for (let i = 0; i < params.decoys; i++) pets.push(makePet(true, 'hedgehog'));
  const order: Pet[] = [...pets]; // thứ tự vẽ (sắp theo y), sắp tại chỗ

  const stats: G3Stats = { hits: 0, emptyTaps: 0, decoyTaps: 0 };
  let hitsText = '0';

  let running = false;
  let finished = false;
  let rafId = 0;
  let lastFrame = 0;
  let gameT = 0;
  let fps = 60;
  let fpsText = '60';
  let fpsSince = 0;

  // ---- Kích thước, sprite ----
  let diameter = 48;
  let radius = 24;
  let baseSpeed = 100;
  let spriteSide = 80;
  let bounds: Bounds = { left: 0, top: HUD_HEIGHT + 6, right: 300, bottom: 500 };
  let barGradient: CanvasGradient | null = null;
  let zFont = '700 16px Nunito, system-ui, sans-serif';
  let cheerFont = '800 20px Nunito, system-ui, sans-serif';
  const sprites = new Map<string, HTMLCanvasElement>();
  const dpr = () => window.devicePixelRatio || 1;

  function buildSprites(): void {
    sprites.clear();
    const kinds = new Set<SpriteKind>(pets.map((p) => p.kind));
    for (const k of kinds) {
      sprites.set(k, renderSprite(k, false, spriteSide, dpr()));
      if (k !== 'hedgehog') sprites.set(`${k}:cheer`, renderSprite(k, true, spriteSide, dpr()));
    }
  }

  let placed = false;
  const stage = createCanvasStage(host, (w, h, cx) => {
    diameter = petSize(w, h, params.sizePct);
    radius = diameter / 2;
    spriteSide = Math.round(diameter * SPRITE_SCALE);
    baseSpeed = speedPx(w, params.speedPctW);
    // Giữ trọn hình thú (tai thỏ, gai nhím…) bên trong khung: vùng tâm thú co vào theo kích thước hình
    const mx = diameter * 0.8;
    const mt = diameter * 0.95;
    const mb = diameter * 0.72;
    bounds = {
      left: mx - radius,
      top: HUD_HEIGHT + 6 + mt - radius,
      right: w - mx + radius,
      bottom: h - mb + radius,
    };
    barGradient = makeBarGradient(cx, w);
    zFont = `800 ${Math.max(14, Math.round(radius * 0.55))}px Nunito, system-ui, sans-serif`;
    cheerFont = `800 ${Math.max(18, Math.round(radius * 0.7))}px Nunito, system-ui, sans-serif`;
    buildSprites();
    for (const p of pets) {
      p.r = radius;
      p.x = Math.min(
        Math.max(p.x, bounds.left + radius),
        Math.max(bounds.left + radius, bounds.right - radius),
      );
      p.y = Math.min(
        Math.max(p.y, bounds.top + radius),
        Math.max(bounds.top + radius, bounds.bottom - radius),
      );
      const sp = speedOf(p);
      const want = p.decoy ? baseSpeed * DECOY_SPEED_FACTOR : baseSpeed;
      if (sp > 0) {
        p.vx = (p.vx / sp) * want;
        p.vy = (p.vy / sp) * want;
      }
    }
    if (!placed) {
      placed = true;
      for (const p of pets) place(p, true);
    }
  });
  const c = stage.ctx;

  if (E2E.hooks) {
    host.dataset.g3 = JSON.stringify({ level: ctx.level, ...params });
  }

  // ---- Đặt thú ----
  function place(p: Pet, first: boolean): void {
    const others = pets.filter((o) => o !== p && o.active).map((o) => ({ x: o.x, y: o.y }));
    const pos = spawnPosition(spawnRng, bounds, radius, others, diameter * 1.5);
    p.x = pos.x;
    p.y = pos.y;
    p.r = radius;
    const speed = E2E.freeze ? 0 : p.decoy ? baseSpeed * DECOY_SPEED_FACTOR : baseSpeed;
    setHeading(p, spawnRng() * Math.PI * 2, speed);
    p.state = 0;
    p.stateT = 0;
    p.appearT = first ? APPEAR_MS : 0;
    p.active = true;
    p.phase = spawnRng() * 6.28;
    p.turnAt = gameT + ERRATIC_MIN_MS + spawnRng() * (ERRATIC_MAX_MS - ERRATIC_MIN_MS);
    p.burstAt = gameT + FIRST_PET_BURST_AT + spawnRng() * 3000;
    p.burstEnd = 0;
  }

  function publish(): void {
    if (!E2E.hooks) return;
    host.dataset.pets = JSON.stringify(
      pets
        .filter((p) => p.active)
        .map((p) => ({
          kind: p.kind,
          decoy: p.decoy,
          x: Math.round(p.x),
          y: Math.round(p.y),
          r: Math.round(p.r),
        })),
    );
    host.dataset.stats = JSON.stringify(stats);
  }

  function wrong(): void {
    ctx.audio.bup();
    ctx.haptics.wrong(host);
  }

  // ---- Nhận chạm ----
  function onTap(t: TapEvent): void {
    if (!running || finished) return;
    const i = pickTarget(pets, t.x, t.y);
    const p = i >= 0 ? (pets[i] as Pet) : null;
    if (!p) {
      stats.emptyTaps += 1; // chạm chỗ trống bị tính lỗi (chống bấm bừa)
      wrong();
      bubble.show(pick(uiRng, vi.encourage));
    } else if (p.decoy) {
      stats.decoyTaps += 1; // đánh thức Nhím
      p.wiggleT = WIGGLE_MS;
      wrong();
      bubble.show(vi.g3.decoyHint);
    } else {
      stats.hits += 1;
      hitsText = String(stats.hits);
      p.state = 1;
      p.stateT = 0;
      p.active = false;
      sparkles.burst(p.x, p.y, 12, uiRng);
      ctx.audio.ding();
      ctx.haptics.correct();
    }
    publish();
  }
  const detach = attachPointerInput(host, 'first', onTap);

  // ---- Cập nhật ----
  function update(dt: number): void {
    gameT += dt;
    for (const p of pets) {
      if (p.state === 1) {
        p.stateT += dt;
        if (p.stateT >= RESPAWN_MS) place(p, false); // xuất hiện lại chỗ khác sau 300ms
        continue;
      }
      if (p.appearT < APPEAR_MS) p.appearT += dt;
      if (p.wiggleT > 0) p.wiggleT -= dt;
      if (E2E.freeze) continue;
      if (!p.decoy && params.erratic && gameT >= p.turnAt) {
        turnRandomly(p, moveRng);
        p.turnAt = gameT + ERRATIC_MIN_MS + moveRng() * (ERRATIC_MAX_MS - ERRATIC_MIN_MS);
      }
      if (!p.decoy && params.burst) {
        if (p.burstEnd === 0 && gameT >= p.burstAt) {
          p.vx *= BURST_FACTOR;
          p.vy *= BURST_FACTOR;
          p.burstEnd = gameT + BURST_MS;
        } else if (p.burstEnd > 0 && gameT >= p.burstEnd) {
          p.vx /= BURST_FACTOR;
          p.vy /= BURST_FACTOR;
          p.burstEnd = 0;
          p.burstAt = gameT + 3000 + moveRng() * 4000;
        }
      }
      stepMover(p, dt, bounds, moveRng);
    }
    sparkles.update(dt);
    // sắp xếp theo y để con ở dưới vẽ đè lên con ở trên (insertion sort tại chỗ)
    for (let i = 1; i < order.length; i++) {
      const cur = order[i] as Pet;
      let j = i - 1;
      while (j >= 0 && (order[j] as Pet).y > cur.y) {
        order[j + 1] = order[j] as Pet;
        j--;
      }
      order[j + 1] = cur;
    }
    if (gameT >= roundMs) end();
  }

  // ---- Vẽ ----
  function drawPet(p: Pet, popScale: number, alpha: number, cheer: boolean): void {
    const key = cheer && p.kind !== 'hedgehog' ? `${p.kind}:cheer` : p.kind;
    const img = sprites.get(key);
    if (!img) return;
    const s = spriteSide;
    const appear = Math.min(1, p.appearT / APPEAR_MS);
    const grow = 0.4 + 0.6 * (1 - (1 - appear) * (1 - appear));
    const bob = p.decoy
      ? Math.sin(gameT * 0.003 + p.phase) * radius * 0.04
      : Math.sin(gameT * 0.014 + p.phase) * radius * 0.07;
    const sp = speedOf(p);
    const tilt = sp > 0 ? (p.vx / sp) * 0.1 : 0;
    const wig = p.wiggleT > 0 ? Math.sin(p.wiggleT * 0.05) * 0.18 * (p.wiggleT / WIGGLE_MS) : 0;
    // bóng đổ
    c.globalAlpha = 0.2 * alpha * appear;
    c.beginPath();
    c.ellipse(
      p.x,
      p.y + radius * 0.95,
      radius * 0.8 * popScale,
      radius * 0.2 * popScale,
      0,
      0,
      Math.PI * 2,
    );
    c.fillStyle = '#1b3a1b';
    c.fill();
    c.globalAlpha = alpha;
    c.save();
    c.translate(p.x, p.y + bob);
    c.rotate(tilt + wig);
    const k = popScale * grow;
    c.scale(k, k);
    c.drawImage(img, -s / 2, -s * SPRITE_CENTER_Y, s, s);
    c.restore();
    c.globalAlpha = 1;
  }

  function draw(): void {
    c.clearRect(0, 0, stage.width, stage.height);
    for (const p of order) {
      if (p.state === 1) {
        const k = Math.min(1, p.stateT / RESPAWN_MS);
        drawPet(p, 1 + 0.4 * k, 1 - k, true);
        // “Hú!”
        c.globalAlpha = 1 - k * k;
        c.font = cheerFont;
        c.textAlign = 'center';
        c.textBaseline = 'alphabetic';
        c.lineWidth = 5;
        c.lineJoin = 'round';
        c.strokeStyle = '#263238';
        c.fillStyle = '#FFD93D';
        const ty = p.y - radius * 1.25 - k * radius * 0.5;
        c.strokeText(vi.g3.cheer, p.x, ty);
        c.fillText(vi.g3.cheer, p.x, ty);
        c.globalAlpha = 1;
      } else {
        drawPet(p, 1, 1, false);
        if (p.decoy) {
          // “zzz” bay lên
          c.font = zFont;
          c.textAlign = 'left';
          c.textBaseline = 'alphabetic';
          c.fillStyle = '#5b3fc4';
          c.lineWidth = 3;
          c.strokeStyle = 'rgba(255,255,255,0.9)';
          for (let i = 0; i < 3; i++) {
            const t = (((gameT * 0.0007 + i * 0.33 + p.phase) % 1) + 1) % 1;
            c.globalAlpha = Math.sin(t * Math.PI);
            const zx = p.x + radius * (0.55 + 0.25 * i) + Math.sin(t * 6) * 3;
            const zy = p.y - radius * (0.7 + 0.8 * t);
            c.strokeText('z', zx, zy);
            c.fillText('z', zx, zy);
          }
          c.globalAlpha = 1;
        }
      }
    }
    sparkles.draw(c);
    drawHud(c, stage.width, {
      countText: hitsText,
      progress: gameT / roundMs,
      gradient: barGradient,
      debugText: DEBUG ? fpsText : undefined,
    });
    if (E2E.hooks) publish();
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
    draw();
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
      score: scoreFromStats(stats, ctx.level),
      durationMs: Math.round(gameT),
      metrics: buildMetrics(stats, gameT),
    });
  }

  draw(); // hiện sẵn cảnh khi đang đếm ngược

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
      host.classList.remove('theme-meadow');
      delete host.dataset.g3;
      delete host.dataset.pets;
      delete host.dataset.stats;
    },
  };
}
