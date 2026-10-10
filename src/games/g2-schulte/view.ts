// G2 – DOM/CSS grid. Chỉ nhận chạm đầu tiên; chạm lại ô đã đúng thì bỏ qua (không lỗi).
import { E2E } from '../../app/e2e';
import { mulberry32, pick, type Rng } from '../../app/rng';
import { vi } from '../../i18n/vi';
import { createHintBubble } from '../common/HintBubble';
import { PointerGate } from '../common/PointerInput';
import type { GameContext, GameInstance } from '../common/types';
import { readG2Options, resolveG2Params } from './config';
import {
  CYCLE_MS,
  generateBoard,
  needsUnderline,
  partialScore,
  randomColors,
  scoreFromRound,
  targetSequence,
} from './logic';

const TICK_MS = 200;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = className;
  return e;
}

export function createG2(host: HTMLElement, ctx: GameContext): GameInstance {
  const params = resolveG2Params(ctx.level, readG2Options(ctx.options));
  const total = params.grid * params.grid;
  const seed = () => (ctx.rng() * 4294967296) >>> 0;
  const boardRng: Rng = mulberry32(seed());
  const uiRng: Rng = mulberry32(seed());
  const board = generateBoard(boardRng, params);
  const sequence = targetSequence(params);

  // ---- DOM ----
  const root = el('div', 'g2');
  const bar = el('div', 'g2-bar');
  const label = el('span', 'g2-label');
  label.textContent = vi.g2.findNumber;
  const targetEl = el('strong', 'g2-target');
  targetEl.setAttribute('data-testid', 'g2-target');
  const progressEl = el('span', 'g2-progress');
  bar.append(label, targetEl, progressEl);

  const grid = el('div', 'g2-grid');
  grid.style.setProperty('--g2-n', String(params.grid));
  const cellByNumber = new Map<number, HTMLElement>();
  const cellEls: HTMLElement[] = [];
  board.numbers.forEach((n, i) => {
    const cell = el(
      'div',
      `g2-cell ${params.colorMode === 'mono' ? 'g2-mono' : `g2-c${board.colors[i]}`}`,
    );
    cell.dataset.n = String(n);
    const num = el('span', needsUnderline(n, params.rotate) ? 'g2-num is-underlined' : 'g2-num');
    num.textContent = String(n);
    num.style.setProperty('--rot', `${board.rotations[i]}deg`);
    cell.appendChild(num);
    grid.appendChild(cell);
    cellByNumber.set(n, cell);
    cellEls.push(cell);
  });
  root.append(bar, grid);
  host.appendChild(root);
  const bubble = createHintBubble(host);

  if (E2E.hooks) host.dataset.g2 = JSON.stringify({ level: ctx.level, ...params });

  // ---- Bố cục: tính cỡ lưới khi vùng chơi đổi kích thước (không đọc layout mỗi khung hình) ----
  const ro = new ResizeObserver((entries) => {
    const r = entries[0]?.contentRect;
    if (!r) return;
    const wide = r.width > r.height * 1.25; // điện thoại/tablet xoay ngang: thanh tìm số nằm bên trái
    root.classList.toggle('g2-row', wide);
    const side = wide ? 190 : 0;
    const top = wide ? 0 : 64;
    const size = Math.min(680, Math.min(r.width - side, r.height - top) - 16);
    root.style.setProperty('--g2-size', `${Math.max(180, Math.floor(size))}px`);
  });
  ro.observe(host);

  // ---- Trạng thái ----
  let running = false;
  let finished = false;
  let lastTick = 0;
  let elapsedMs = 0;
  let sinceProgressMs = 0;
  let sinceCycleMs = 0;
  let idx = 0; // vị trí trong `sequence` của số cần tìm tiếp theo
  let errors = 0;
  let hintShown = false;
  let timer = 0;

  function currentTarget(): number {
    return sequence[Math.min(idx, total - 1)] as number;
  }

  function renderProgress(): void {
    targetEl.textContent = String(currentTarget());
    progressEl.textContent = vi.g2.progress(idx, total);
  }
  renderProgress();

  function flush(): void {
    if (!running) return;
    const now = performance.now();
    const dt = now - lastTick;
    lastTick = now;
    elapsedMs += dt;
    sinceProgressMs += dt;
    sinceCycleMs += dt;
  }

  function showHint(on: boolean): void {
    cellByNumber.get(currentTarget())?.classList.toggle('is-hint', on);
    hintShown = on;
  }

  function recolor(): void {
    const colors = randomColors(uiRng, total);
    cellEls.forEach((cell, i) => {
      cell.className = cell.className.replace(/g2-c\d/, `g2-c${colors[i]}`);
    });
  }

  function tick(): void {
    if (!running || finished) return;
    flush();
    if (
      params.hintAfterSec !== null &&
      !hintShown &&
      sinceProgressMs >= params.hintAfterSec * 1000
    ) {
      showHint(true);
    }
    if (params.colorMode === 'cycle' && sinceCycleMs >= CYCLE_MS) {
      sinceCycleMs = 0;
      recolor();
    }
  }

  function end(forced: boolean): void {
    if (finished) return;
    flush();
    finished = true;
    stop();
    const timeSec = elapsedMs / 1000;
    let score = scoreFromRound(params.targetSec, timeSec, errors);
    if (forced) score = partialScore(score, idx, total);
    ctx.onFinish({
      score,
      durationMs: Math.round(elapsedMs),
      metrics: { timeSec: Math.round(timeSec * 100) / 100, errors, gridSize: params.grid },
      extra: { found: idx, total, forced },
    });
  }

  function handleCell(cell: HTMLElement): void {
    if (cell.classList.contains('is-done')) return; // chạm lại ô đã đúng: bỏ qua
    flush();
    const n = Number(cell.dataset.n);
    if (n === currentTarget()) {
      cell.classList.add('is-done');
      cell.classList.remove('is-hint');
      idx += 1;
      sinceProgressMs = 0;
      hintShown = false;
      ctx.audio.ding();
      ctx.haptics.correct();
      if (idx >= total) {
        progressEl.textContent = vi.g2.progress(total, total);
        end(false);
        return;
      }
      renderProgress();
    } else {
      errors += 1;
      if (E2E.hooks) host.dataset.errors = String(errors);
      ctx.audio.bup();
      ctx.haptics.wrong(cell);
      bubble.show(pick(uiRng, vi.encourage));
    }
  }

  const gate = new PointerGate('first');
  const onDown = (e: PointerEvent) => {
    if (!running || finished) return;
    if (!gate.down(e.pointerId, e.isPrimary)) return; // chỉ chạm đầu tiên
    const cell = (e.target as Element | null)?.closest<HTMLElement>('.g2-cell');
    if (cell) handleCell(cell);
  };
  const onUp = (e: PointerEvent) => gate.up(e.pointerId);
  grid.addEventListener('pointerdown', onDown);
  window.addEventListener('pointerup', onUp);
  window.addEventListener('pointercancel', onUp);

  function begin(): void {
    running = true;
    lastTick = performance.now();
    timer = window.setInterval(tick, TICK_MS);
  }

  function stop(): void {
    flush();
    running = false;
    window.clearInterval(timer);
  }

  return {
    start: begin,
    pause: stop,
    resume() {
      if (!finished) begin();
    },
    finish: () => end(true),
    destroy() {
      finished = true;
      stop();
      grid.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      ro.disconnect();
      bubble.destroy();
      root.remove();
      delete host.dataset.g2;
      delete host.dataset.errors;
    },
  };
}
