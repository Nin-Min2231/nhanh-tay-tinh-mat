// G5 – canvas, 4 làn, nhận chạm ĐA ĐIỂM (theo pointerId). Vị trí nốt tính theo THỜI GIAN (không theo khung hình):
// gameT = performance.now() − offset; tạm dừng thì dịch offset nên lịch nốt không bị lệch.
import { DEBUG, E2E } from '../../app/e2e';
import { mulberry32, type Rng } from '../../app/rng';
import { vi } from '../../i18n/vi';
import { createCanvasStage } from '../common/CanvasStage';
import { HUD_HEIGHT, drawHud, makeBarGradient } from '../common/hud';
import { attachPointerInput, type TapEvent } from '../common/PointerInput';
import { Sparkles } from '../common/sparkles';
import type { GameContext, GameInstance } from '../common/types';
import { LANE_COLORS, renderGem } from './art';
import { readG5Options, resolveG5Params } from './config';
import {
  ComboTracker,
  GOOD,
  HIT_LINE,
  LANES,
  MISS,
  PENDING,
  PERFECT,
  ROUND_MS,
  buildMetrics,
  fallProgress,
  firstHitTime,
  generateSchedule,
  laneFromX,
  matchTap,
  scoreFromCounts,
  type G5Counts,
} from './logic';

const TAU = Math.PI * 2;
const POPUPS = 10;
const FLASH_MS = 260;
const POP_MS = 600;
const FADE_MS = 350;
const MAX_WIDTH = 640;

interface Popup {
  on: boolean;
  lane: number;
  good: boolean;
  t: number;
}

export function createG5(host: HTMLElement, ctx: GameContext): GameInstance {
  const params = resolveG5Params(ctx.level, readG5Options(ctx.options));
  const seed = () => (ctx.rng() * 4294967296) >>> 0;
  const noteRng: Rng = mulberry32(seed());
  const uiRng: Rng = mulberry32(seed());

  // Lượt kéo dài ROUND_MS (rút ngắn khi e2e), tối thiểu đủ vài nốt sau khi nốt đầu rơi tới vạch
  const duration = Math.max(ROUND_MS / Math.max(1, ctx.timeScale), firstHitTime(params) + 3000);
  const notes = generateSchedule(noteRng, params, duration);
  const n = notes.length;
  const state = new Uint8Array(n);
  const resolvedAt = new Float64Array(n);

  host.classList.add('theme-night');
  host.style.maxWidth = `${MAX_WIDTH}px`; // tablet ngang: khung làn tối đa 640px, canh giữa
  const sparkles = new Sparkles(48);
  const popups: Popup[] = Array.from({ length: POPUPS }, () => ({
    on: false,
    lane: 0,
    good: false,
    t: 0,
  }));
  const flash = new Float64Array(LANES);
  const flashSoft = new Uint8Array(LANES);
  const combo = new ComboTracker();
  const counts: G5Counts = { perfect: 0, good: 0, miss: 0, extraTaps: 0 };

  let hitY = 400;
  let spawnY = HUD_HEIGHT;
  let laneW = 90;
  let gemD = 64;
  let barGradient: CanvasGradient | null = null;
  let beamGradients: CanvasGradient[] = [];
  let gems: HTMLCanvasElement[] = [];
  let gemsGrey: HTMLCanvasElement[] = [];
  let comboFont = '800 40px Nunito, system-ui, sans-serif';
  let popFont = '800 24px Nunito, system-ui, sans-serif';
  let gemSide = 90;
  let comboLabelN = -1;
  let comboLabel = '';

  // Nền các làn (gradient phủ cả khung) chỉ đổi khi đổi kích thước → vẽ MỘT LẦN vào canvas riêng nằm dưới canvas chính,
  // không tô lại mỗi khung hình. Đo (CPU chậm ×4, tablet dọc): tô 4 làn mỗi khung làm G5 chỉ còn ~29 fps, bỏ đi thì ~57 fps.
  const underlay = document.createElement('canvas');
  underlay.className = 'game-canvas g5-underlay';
  underlay.setAttribute('aria-hidden', 'true');
  host.appendChild(underlay);

  function drawUnderlay(w: number, h: number): void {
    const dpr = window.devicePixelRatio || 1;
    underlay.width = Math.max(1, Math.round(w * dpr));
    underlay.height = Math.max(1, Math.round(h * dpr));
    const u = underlay.getContext('2d');
    if (!u) return;
    u.setTransform(dpr, 0, 0, dpr, 0, 0);
    for (let l = 0; l < LANES; l++) {
      const p = LANE_COLORS[l] as { base: string };
      const g = u.createLinearGradient(0, HUD_HEIGHT, 0, h);
      g.addColorStop(0, `${p.base}00`);
      g.addColorStop(1, `${p.base}55`);
      u.fillStyle = g;
      u.fillRect(l * laneW, HUD_HEIGHT, laneW, h - HUD_HEIGHT);
      if (l > 0) {
        u.fillStyle = 'rgba(255,255,255,0.14)';
        u.fillRect(l * laneW - 1, HUD_HEIGHT, 2, h - HUD_HEIGHT);
      }
    }
  }

  const stage = createCanvasStage(host, (w, h, cx) => {
    laneW = w / LANES;
    gemD = Math.max(44, Math.min(laneW * 0.74, 96));
    gemSide = gemD * 1.45;
    spawnY = HUD_HEIGHT + 2;
    hitY = Math.round(h * HIT_LINE);
    barGradient = makeBarGradient(cx, w);
    drawUnderlay(w, h);
    beamGradients = LANE_COLORS.map((p) => {
      const g = cx.createLinearGradient(0, HUD_HEIGHT, 0, hitY + 20);
      g.addColorStop(0, `${p.base}00`);
      g.addColorStop(1, p.light);
      return g;
    });
    const dpr = window.devicePixelRatio || 1;
    gems = LANE_COLORS.map((p) => renderGem(p, gemD, dpr));
    gemsGrey = LANE_COLORS.map((p) => renderGem(p, gemD, dpr, true));
    comboFont = `800 ${Math.round(Math.min(56, laneW * 0.6))}px Nunito, system-ui, sans-serif`;
    popFont = `800 ${Math.round(Math.min(30, Math.max(18, laneW * 0.26)))}px Nunito, system-ui, sans-serif`;
  });
  const c = stage.ctx;

  // ---- Đồng hồ theo thời gian thực ----
  let running = false;
  let finished = false;
  let rafId = 0;
  let offset = 0; // gameT = performance.now() − offset
  let pausedAt = 0;
  let started = false;
  let base = 0; // chỉ số nốt chưa xử lý đầu tiên
  let visFrom = 0; // chỉ số nốt đầu tiên còn cần vẽ (kể cả đang mờ dần)
  let hitsText = '0';
  let fps = 60;
  let fpsText = '60';
  let fpsSince = 0;
  let lastFrame = 0;

  if (E2E.hooks) {
    host.dataset.g5 = JSON.stringify({ level: ctx.level, ...params, notes: n });
    host.dataset.schedule = JSON.stringify(notes.map((x) => [x.hitTime, x.lane]));
  }

  function publish(): void {
    if (!E2E.hooks) return;
    host.dataset.offset = String(offset);
    host.dataset.stats = JSON.stringify({ ...counts, combo: combo.combo, maxCombo: combo.max });
  }

  const now = () => performance.now() - offset;

  function pickPopup(): Popup | null {
    for (const p of popups) if (!p.on) return p;
    return null;
  }

  // ---- Nhận chạm (đa điểm) ----
  function onTap(t: TapEvent): void {
    if (!running || finished) return;
    const lane = laneFromX(t.x, stage.width, LANES);
    const T = t.timeStamp - offset;
    const m = matchTap(notes, state, base, lane, T, params.perfectMs, params.goodMs);
    flash[lane] = FLASH_MS;
    flashSoft[lane] = 0;
    if (m.judgement === 'perfect' || m.judgement === 'good') {
      const good = m.judgement === 'good';
      state[m.index] = good ? GOOD : PERFECT;
      resolvedAt[m.index] = T;
      if (good) counts.good += 1;
      else counts.perfect += 1;
      combo.hit();
      hitsText = String(counts.perfect + counts.good);
      ctx.audio.note((notes[m.index] as { pitch: number }).pitch);
      ctx.haptics.correct();
      sparkles.burst(lane * laneW + laneW / 2, hitY, good ? 6 : 10, uiRng);
      const pop = pickPopup();
      if (pop) {
        pop.on = true;
        pop.lane = lane;
        pop.good = good;
        pop.t = 0;
      }
    } else if (m.judgement === 'near') {
      flashSoft[lane] = 1; // lệch hơn “Tốt”: không điểm, không phạt – chỉ sáng nhẹ
    } else {
      counts.extraTaps += 1; // chạm làn không có nốt → chống bấm bừa
      flashSoft[lane] = 1;
      ctx.audio.bup();
      ctx.haptics.wrong(host);
    }
    publish();
  }
  const detach = attachPointerInput(host, 'multi', onTap);

  // ---- Cập nhật ----
  function update(T: number, dt: number): void {
    // nốt đã qua vạch quá cửa sổ “Tốt” → Trượt (nhẹ nhàng, chỉ mất combo)
    let changed = false;
    for (let i = base; i < n; i++) {
      const note = notes[i] as { hitTime: number };
      if (note.hitTime + params.goodMs >= T) break;
      if (state[i] === PENDING) {
        state[i] = MISS;
        resolvedAt[i] = T;
        counts.miss += 1;
        combo.miss();
        changed = true;
      }
    }
    while (base < n && state[base] !== PENDING) base++;
    while (
      visFrom < n &&
      (notes[visFrom] as { hitTime: number }).hitTime + params.goodMs + FADE_MS < T
    )
      visFrom++;
    for (let l = 0; l < LANES; l++)
      if ((flash[l] as number) > 0) flash[l] = (flash[l] as number) - dt;
    for (const p of popups) {
      if (!p.on) continue;
      p.t += dt;
      if (p.t >= POP_MS) p.on = false;
    }
    sparkles.update(dt);
    if (changed) publish();
    const last = n > 0 ? (notes[n - 1] as { hitTime: number }).hitTime : 0;
    if ((base >= n && T >= last) || T > duration + 4000) end();
  }

  // ---- Vẽ ----
  function drawNotes(T: number): void {
    const travel = hitY - spawnY;
    for (let i = visFrom; i < n; i++) {
      const note = notes[i] as { hitTime: number; lane: number };
      const prog = fallProgress(note.hitTime, T, params.fallMs);
      if (prog < 0) break; // các nốt sau chưa xuất hiện
      const st = state[i] as number;
      if (st === PERFECT || st === GOOD) continue; // đã chạm: biến mất (có hạt + chữ “Tuyệt!”)
      let alpha = 1;
      let sprite = gems[note.lane] as HTMLCanvasElement;
      if (st === MISS) {
        const since = T - (resolvedAt[i] as number);
        if (since > FADE_MS) continue;
        alpha = 0.55 * (1 - since / FADE_MS);
        sprite = gemsGrey[note.lane] as HTMLCanvasElement;
      }
      const y = spawnY + travel * prog;
      if (y - gemSide > stage.height) continue;
      // phóng nhẹ khi sắp tới vạch để bé dễ canh nhịp
      const near = Math.max(0, 1 - Math.abs(prog - 1) * 6);
      const s = 1 + near * 0.12;
      const side = gemSide * s;
      c.globalAlpha = alpha;
      c.drawImage(sprite, note.lane * laneW + laneW / 2 - side / 2, y - side / 2, side, side);
    }
    c.globalAlpha = 1;
  }

  function draw(T: number): void {
    const w = stage.width;
    const h = stage.height;
    c.clearRect(0, 0, w, h);
    // tia sáng làn khi chạm (nền làn nằm ở canvas dưới, xem drawUnderlay)
    for (let l = 0; l < LANES; l++) {
      const f = (flash[l] as number) > 0 ? (flash[l] as number) / FLASH_MS : 0;
      if (f > 0) {
        c.globalAlpha = (flashSoft[l] ? 0.25 : 0.7) * f;
        c.fillStyle = beamGradients[l] as CanvasGradient;
        c.fillRect(l * laneW + 3, HUD_HEIGHT, laneW - 6, hitY + 20 - HUD_HEIGHT);
        c.globalAlpha = 1;
      }
    }
    // vạch đích + vòng đích từng làn
    c.fillStyle = 'rgba(255,255,255,0.35)';
    c.fillRect(0, hitY - 2, w, 4);
    c.lineWidth = 5;
    for (let l = 0; l < LANES; l++) {
      const p = LANE_COLORS[l] as { base: string };
      const cx = l * laneW + laneW / 2;
      const f = (flash[l] as number) > 0 ? (flash[l] as number) / FLASH_MS : 0;
      c.beginPath();
      c.arc(cx, hitY, gemD / 2 + f * 6, 0, TAU);
      c.strokeStyle = p.base;
      c.globalAlpha = 0.95;
      c.stroke();
      c.beginPath();
      c.arc(cx, hitY, gemD / 2 - 5, 0, TAU);
      c.strokeStyle = 'rgba(255,255,255,0.35)';
      c.lineWidth = 2;
      c.stroke();
      c.lineWidth = 5;
      c.globalAlpha = 1;
    }
    drawNotes(T);
    sparkles.draw(c);
    // chữ “Tuyệt!” / “Tốt!”
    c.font = popFont;
    c.textAlign = 'center';
    c.textBaseline = 'alphabetic';
    c.lineWidth = 5;
    c.lineJoin = 'round';
    for (const p of popups) {
      if (!p.on) continue;
      const k = p.t / POP_MS;
      const x = p.lane * laneW + laneW / 2;
      const y = hitY - gemD * 0.8 - k * gemD * 0.7;
      c.globalAlpha = 1 - k * k;
      c.strokeStyle = '#263238';
      c.fillStyle = p.good ? '#9BE8FF' : '#FFE066';
      const text = p.good ? vi.g5.good : vi.g5.perfect;
      c.strokeText(text, x, y);
      c.fillText(text, x, y);
    }
    c.globalAlpha = 1;
    // combo
    if (combo.combo >= 3) {
      c.font = comboFont;
      c.fillStyle = '#FFFFFF';
      c.strokeStyle = 'rgba(70,20,140,0.85)';
      c.lineWidth = 6;
      if (combo.combo !== comboLabelN) {
        comboLabelN = combo.combo; // chuỗi chỉ tạo lại khi combo đổi (không tạo mới mỗi khung hình)
        comboLabel = vi.g5.combo(comboLabelN);
      }
      c.strokeText(comboLabel, w / 2, HUD_HEIGHT + 56);
      c.fillText(comboLabel, w / 2, HUD_HEIGHT + 56);
    }
    drawHud(c, w, {
      countText: hitsText,
      progress: T / duration,
      gradient: barGradient,
      dark: true,
      debugText: DEBUG ? fpsText : undefined,
    });
  }

  function frame(t: number): void {
    if (!running) return;
    const dt = Math.max(0, Math.min(100, t - lastFrame));
    lastFrame = t;
    if (DEBUG && dt > 0) {
      fps += (1000 / dt - fps) * 0.1;
      if (t - fpsSince > 500) {
        fpsSince = t;
        fpsText = `${Math.round(fps)} fps`;
      }
    }
    const T = now();
    update(T, dt);
    if (finished) return;
    draw(T);
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
    // nốt chưa kịp xử lý (kết thúc sớm) tính là Trượt
    const unresolved = n - counts.perfect - counts.good - counts.miss;
    const final: G5Counts = { ...counts, miss: counts.miss + unresolved };
    ctx.onFinish({
      score: scoreFromCounts(final, n),
      durationMs: Math.round(now()),
      metrics: buildMetrics(final, combo.max, n),
    });
  }

  draw(0); // hiện sẵn làn + vạch đích khi đang đếm ngược

  return {
    start() {
      started = true;
      offset = performance.now();
      publish();
      startLoop();
    },
    pause() {
      if (!started) return;
      pausedAt = performance.now();
      stopLoop();
    },
    resume() {
      if (finished || !started) return;
      offset += performance.now() - pausedAt; // dịch mốc thời gian: lịch nốt giữ nguyên sau khi tạm dừng
      publish();
      startLoop();
    },
    finish: end,
    destroy() {
      finished = true;
      stopLoop();
      detach();
      stage.destroy();
      underlay.remove();
      host.classList.remove('theme-night');
      host.style.maxWidth = '';
      delete host.dataset.g5;
      delete host.dataset.schedule;
      delete host.dataset.offset;
      delete host.dataset.stats;
    },
  };
}
