// G4 – DOM. Máy trạng thái: lead → (on ↔ gap)… → input → between/retry/over. Nhịp chạy theo dt của rAF
// nên tạm dừng/tiếp tục không làm lệch; trong lúc phát chuỗi thì khóa chạm.
import { E2E } from '../../app/e2e';
import { mulberry32 } from '../../app/rng';
import { vi } from '../../i18n/vi';
import { createHintBubble } from '../common/HintBubble';
import { PointerGate } from '../common/PointerInput';
import type { GameContext, GameInstance } from '../common/types';
import { readG4Options, resolveG4Params } from './config';
import { G4Rules, NUDGE_MS, TOUCH_LIT_MS, gridLayout, noRepeatForLevel, noteForPad } from './logic';

type Phase = 'idle' | 'lead' | 'on' | 'gap' | 'input' | 'between' | 'retry' | 'over';

const LEAD_MS = 700;
const BETWEEN_MS = 1000;
const RETRY_MS = 1200;
const OVER_MS = 900;

const FILL = 'fill="#fff" stroke="rgba(38,50,56,0.55)" stroke-width="3" stroke-linejoin="round"';
/** Biểu tượng của ô (4 và 6 ô): ● ▲ ■ ★ ♥ ◆ – màu luôn đi kèm hình dạng. */
const ICONS = [
  `<circle cx="32" cy="32" r="17" ${FILL}/>`,
  `<path d="M32 12 L52 49 L12 49 Z" ${FILL}/>`,
  `<rect x="15" y="15" width="34" height="34" rx="6" ${FILL}/>`,
  `<path d="M32 9 L38.6 25 L56 26.3 L42.7 37.6 L46.8 54.5 L32 45.2 L17.2 54.5 L21.3 37.6 L8 26.3 L25.4 25 Z" ${FILL}/>`,
  `<path d="M32 54 C12 40 8 28 14 20 C19 13 29 14 32 22 C35 14 45 13 50 20 C56 28 52 40 32 54 Z" ${FILL}/>`,
  `<path d="M32 8 L55 32 L32 56 L9 32 Z" ${FILL}/>`,
] as const;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = className;
  return e;
}

export function createG4(host: HTMLElement, ctx: GameContext): GameInstance {
  const params = resolveG4Params(ctx.level, readG4Options(ctx.options));
  const seed = () => (ctx.rng() * 4294967296) >>> 0;
  const rules = new G4Rules(
    mulberry32(seed()),
    params.pads,
    params.startLen,
    noRepeatForLevel(ctx.level),
  );
  /** e2e: phát nhanh hơn để test không phải chờ. Chơi thật luôn = 1. */
  const tScale = 1 / Math.max(1, ctx.timeScale);
  const flashMs = params.flashMs * tScale;
  const gapMs = params.gapMs * tScale;

  // ---- DOM ----
  const root = el('div', 'g4');
  const bar = el('div', 'g4-bar');
  const phaseEl = el('span', 'g4-phase');
  phaseEl.setAttribute('data-testid', 'g4-phase');
  const lenEl = el('span', 'g4-len');
  bar.append(phaseEl, lenEl);
  const grid = el('div', 'g4-grid');
  const pads: HTMLElement[] = [];
  for (let i = 0; i < params.pads; i++) {
    const pad = el('div', params.pads === 9 ? 'g4-pad g4-corsi' : `g4-pad g4-p${i}`);
    pad.dataset.pad = String(i);
    if (params.pads !== 9)
      pad.innerHTML = `<svg viewBox="0 0 64 64" aria-hidden="true">${ICONS[i]}</svg>`;
    grid.appendChild(pad);
    pads.push(pad);
  }
  root.append(bar, grid);
  host.appendChild(root);
  const bubble = createHintBubble(host);

  const ro = new ResizeObserver((entries) => {
    const r = entries[0]?.contentRect;
    if (!r) return;
    const { cols, rows } = gridLayout(params.pads, r.width, r.height);
    const gap = 12;
    const availW = r.width - 24 - gap * (cols - 1);
    const availH = r.height - 24 - 64 - gap * (rows - 1);
    const cell = Math.max(64, Math.floor(Math.min(availW / cols, availH / rows, 230)));
    grid.style.setProperty('--g4-cols', String(cols));
    grid.style.setProperty('--g4-cell', `${cell}px`);
  });
  ro.observe(host);

  // ---- Trạng thái ----
  let phase: Phase = 'idle';
  let wait = 0;
  let showIdx = 0;
  let idleMs = 0;
  const litMs = new Array<number>(params.pads).fill(0);
  let running = false;
  let finished = false;
  let rafId = 0;
  let lastFrame = 0;
  let gameT = 0;

  if (E2E.hooks) host.dataset.g4 = JSON.stringify({ level: ctx.level, ...params });

  function publish(): void {
    if (!E2E.hooks) return;
    host.dataset.phase = phase;
    host.dataset.seq = JSON.stringify(rules.sequence);
    host.dataset.stats = JSON.stringify({ ...rules.metrics(), mistakes: rules.mistakes });
  }

  function setPhase(p: Phase, text?: string): void {
    phase = p;
    if (text !== undefined) phaseEl.textContent = text;
    publish();
  }

  function renderLength(): void {
    lenEl.textContent = vi.g4.length(rules.length);
  }

  function light(pad: number, ms: number): void {
    const padEl = pads[pad];
    if (!padEl) return;
    padEl.classList.add('is-lit');
    litMs[pad] = ms;
    ctx.audio.note(noteForPad(pad, params.pads));
  }

  function startShow(): void {
    showIdx = 0;
    renderLength();
    wait = LEAD_MS * tScale;
    setPhase('lead', vi.g4.watch);
    root.dataset.mode = 'watch';
  }

  function beginInput(): void {
    idleMs = 0;
    root.dataset.mode = 'play';
    setPhase('input', vi.g4.yourTurn);
  }

  function step(dt: number): void {
    gameT += dt;
    for (let i = 0; i < litMs.length; i++) {
      if ((litMs[i] as number) > 0) {
        litMs[i] = (litMs[i] as number) - dt;
        if ((litMs[i] as number) <= 0) pads[i]?.classList.remove('is-lit');
      }
    }
    if (phase === 'idle') return;
    if (phase === 'input') {
      idleMs += dt;
      if (idleMs >= NUDGE_MS) {
        idleMs = 0;
        bubble.show(vi.g4.nudge); // nhắc nhẹ, không tính sai
      }
      return;
    }
    wait -= dt;
    while (wait <= 0 && (phase as Phase) !== 'input' && !finished) {
      switch (phase) {
        case 'lead':
          setPhase('on');
          light(rules.sequence[showIdx] as number, flashMs);
          wait += flashMs;
          break;
        case 'on':
          if (showIdx + 1 < rules.length) {
            setPhase('gap');
            wait += gapMs;
          } else {
            beginInput();
          }
          break;
        case 'gap':
          showIdx += 1;
          setPhase('on');
          light(rules.sequence[showIdx] as number, flashMs);
          wait += flashMs;
          break;
        case 'between':
        case 'retry':
          startShow();
          break;
        case 'over':
          end();
          return;
        default:
          return;
      }
    }
  }

  // ---- Nhận chạm ----
  const gate = new PointerGate('first');
  const onDown = (e: PointerEvent) => {
    if (!running || finished || phase !== 'input') return; // đang phát chuỗi: bỏ qua
    if (!gate.down(e.pointerId, e.isPrimary)) return;
    const target = (e.target as Element | null)?.closest<HTMLElement>('.g4-pad');
    if (!target) return;
    const pad = Number(target.dataset.pad);
    idleMs = 0;
    const outcome = rules.tap(pad);
    if (outcome === 'retry' || outcome === 'game-over') {
      ctx.audio.bup();
      ctx.haptics.wrong(target);
      if (outcome === 'retry') {
        bubble.show(vi.g4.retry, RETRY_MS);
        wait = RETRY_MS * tScale;
        setPhase('retry');
      } else {
        wait = OVER_MS * tScale;
        setPhase('over');
      }
      return;
    }
    light(pad, TOUCH_LIT_MS);
    ctx.haptics.correct();
    if (outcome === 'sequence-complete') {
      bubble.show(vi.g4.nice, BETWEEN_MS);
      wait = BETWEEN_MS * tScale;
      setPhase('between');
    } else if (outcome === 'max-reached') {
      bubble.show(vi.g4.nice, OVER_MS);
      wait = OVER_MS * tScale;
      setPhase('over');
    } else {
      publish();
    }
  };
  const onUp = (e: PointerEvent) => gate.up(e.pointerId);
  grid.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  // ---- Vòng lặp ----
  function frame(now: number): void {
    if (!running) return;
    const dt = Math.max(0, Math.min(100, now - lastFrame));
    lastFrame = now;
    step(dt);
    if (!finished) rafId = requestAnimationFrame(frame);
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
    ctx.onFinish({ score: rules.score, durationMs: Math.round(gameT), metrics: rules.metrics() });
  }

  renderLength();
  phaseEl.textContent = vi.g4.watch;
  publish();

  return {
    start() {
      startShow();
      startLoop();
    },
    pause: stopLoop,
    resume() {
      if (!finished) startLoop();
    },
    finish: end,
    destroy() {
      finished = true;
      stopLoop();
      grid.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      ro.disconnect();
      bubble.destroy();
      root.remove();
      delete host.dataset.g4;
      delete host.dataset.phase;
      delete host.dataset.seq;
      delete host.dataset.stats;
    },
  };
}
