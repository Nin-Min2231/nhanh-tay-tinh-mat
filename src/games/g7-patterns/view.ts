// G7 – DOM + SVG. Máy trạng thái: ask → (celebrate | reveal) → câu kế. Ở cấp 1–5 sai lần 1 thì giải thích quy luật và cho chọn lại.
// Đồng hồ (nếu phụ huynh bật 30 giây) chạy theo dt của rAF nên tạm dừng/tiếp tục không lệch.
import { h, render } from 'preact';
import { E2E } from '../../app/e2e';
import { mulberry32, pick, type Rng } from '../../app/rng';
import { vi } from '../../i18n/vi';
import { Mascot, type MascotMood } from '../../ui/components/Mascot';
import { PointerGate } from '../common/PointerInput';
import type { GameContext, GameInstance } from '../common/types';
import { glyphDefs, itemHtml } from './art';
import { TIMER_SEC, readG7Options, resolveG7Params } from './config';
import type { Item } from './elements';
import { G7Rules } from './logic';
import type { Puzzle } from './puzzles';

type Phase = 'idle' | 'ask' | 'celebrate' | 'reveal' | 'over';
type PipState = 'todo' | 'full' | 'half' | 'miss';

const CELEBRATE_MS = 1000;
/** Thời gian xem đáp án + giải thích khi hết cơ hội (đủ để bé đọc, dài hơn G6). */
export const REVEAL_MS = 2800;

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = className;
  return e;
}

function askText(p: Puzzle): string {
  if (p.layout === 'odd') return vi.g7.askOdd;
  const isNum = p.cells.some((c) => c?.kind === 'num');
  if (p.layout === 'seq') {
    const last = p.hole === p.cells.length - 1;
    if (isNum) return last ? vi.g7.askNextNum : vi.g7.askMissingNum;
    return last ? vi.g7.askNext : vi.g7.askMissing;
  }
  return vi.g7.askMissing;
}

export function createG7(host: HTMLElement, ctx: GameContext): GameInstance {
  const options = readG7Options(ctx.options);
  const params = resolveG7Params(ctx.level);
  const seed = () => (ctx.rng() * 4294967296) >>> 0;
  const rules = new G7Rules(mulberry32(seed()), params, ctx.level, options.groups);
  const uiRng: Rng = mulberry32(seed());
  const timerOn = options.timer === 'sec30';
  /** e2e: rút ngắn đồng hồ và các nhịp chuyển; chơi thật luôn = 1. */
  const tScale = 1 / Math.max(1, ctx.timeScale);
  const limitMs = TIMER_SEC * 1000 * tScale;
  /** Nhịp phản hồi (khen, xem đáp án) chỉ rút ngắn tối đa còn 40% khi chạy e2e. */
  const fbScale = Math.max(0.4, tScale);

  // ---- DOM ----
  const root = el('div', 'g7');
  root.insertAdjacentHTML('afterbegin', glyphDefs());
  const bar = el('div', 'g7-bar');
  const pips = el('div', 'g7-pips');
  pips.setAttribute('aria-hidden', 'true');
  const pipEls: HTMLElement[] = [];
  for (let i = 0; i < rules.total; i++) {
    const p = el('span', 'g7-pip');
    pips.appendChild(p);
    pipEls.push(p);
  }
  const qnum = el('span', 'g7-qnum');
  qnum.setAttribute('data-testid', 'g7-qnum');
  bar.append(pips, qnum);

  const top = el('div', 'g7-top');
  const mascotEl = el('div', 'g7-mascot');
  const bubble = el('div', 'g7-bubble');
  const ask = el('div', 'g7-ask');
  ask.setAttribute('data-testid', 'g7-ask');
  const note = el('div', 'g7-note');
  note.setAttribute('data-testid', 'g7-note');
  bubble.append(ask, note);
  top.append(mascotEl, bubble);

  const timer = el('div', 'g7-timer');
  timer.setAttribute('role', 'progressbar');
  timer.setAttribute('aria-label', vi.g7.timerLabel);
  const timerFill = el('i', 'g7-timer-fill');
  timer.appendChild(timerFill);

  const stage = el('div', 'g7-stage');
  stage.setAttribute('data-testid', 'g7-stage');
  const choices = el('div', 'g7-options');
  choices.setAttribute('data-testid', 'g7-options');

  root.append(bar, top);
  if (timerOn) root.appendChild(timer);
  root.append(stage, choices);
  host.appendChild(root);

  // ---- Bố cục: tính cỡ ô khi vùng chơi đổi kích thước (không đọc layout mỗi khung hình) ----
  let hostW = 0;
  let hostH = 0;
  function layout(): void {
    const p = rules.current();
    const W = Math.max(200, hostW - 24);
    const wide = hostW > hostH * 1.15;
    const compact = hostH < 470;
    // ma trận nằm ngang: ô bên trái, thẻ đáp án xếp 2×2 bên phải
    const side = wide && (p.layout === 'matrix2' || p.layout === 'matrix3');
    root.classList.toggle('g7-wide', wide);
    root.classList.toggle('g7-compact', compact);
    root.classList.toggle('g7-side', side);
    const GAP = 10;
    // chiều cao phần đầu (thanh tiến độ + bóng nói + đồng hồ) đo thật, khung bóng nói có chiều cao cố định nên không nhảy
    const chrome =
      bar.offsetHeight + top.offsetHeight + (timerOn ? timer.offsetHeight + 8 : 0) + 16 + 20;
    const avail = Math.max(150, hostH - chrome);
    // ---- thẻ đáp án ----
    const n = p.options.length;
    const optMax = p.layout === 'odd' ? 190 : 150;
    let optCols = n;
    let opt = Math.floor((W - GAP * (n - 1)) / n);
    if (side) {
      optCols = 2;
      opt = Math.min(Math.floor((W * 0.34 - GAP) / 2), Math.floor((avail - GAP) / 2));
    } else if (p.layout === 'odd' || opt < 76) {
      optCols = 2;
      opt = Math.floor((W - GAP) / 2);
    }
    const optRows = Math.ceil(n / optCols);
    // thẻ đáp án chiếm tối đa ~38% chiều cao còn lại (không nhỏ hơn 64px)
    if (!side) opt = Math.min(opt, Math.floor((avail * 0.38 - GAP * (optRows - 1)) / optRows));
    opt = Math.max(64, Math.min(optMax, opt));
    // ---- phần còn lại cho ô dãy/ma trận ----
    const stageH = side ? avail : Math.max(96, avail - optRows * opt - (optRows - 1) * GAP - 8);
    const stageW = side ? W * 0.62 : W;
    let cell = 88;
    if (p.layout === 'seq') {
      const cnt = p.cells.length;
      const oneRow = Math.floor((stageW - 6 * (cnt - 1)) / cnt);
      const perRow = oneRow >= 52 ? cnt : Math.ceil(cnt / 2);
      const rows = perRow === cnt ? 1 : 2;
      cell = Math.floor((stageW - 6 * (perRow - 1)) / perRow);
      cell = Math.min(cell, wide ? 124 : 132, Math.floor((stageH - 20 * rows) / rows));
    } else if (p.layout === 'matrix2') {
      cell = Math.min(150, Math.floor((stageW - 44 - 8) / 2), Math.floor((stageH - 38 - 12) / 2));
    } else if (p.layout === 'matrix3') {
      cell = Math.min(150, Math.floor((stageW - 16 - 8) / 3), Math.floor((stageH - 16 - 12) / 3));
    }
    root.style.setProperty('--g7-cell', `${Math.max(36, cell)}px`);
    root.style.setProperty('--g7-opt', `${opt}px`);
    root.style.setProperty('--g7-opt-cols', String(optCols));
  }
  const ro = new ResizeObserver((entries) => {
    const r = entries[0]?.contentRect;
    if (!r) return;
    hostW = r.width;
    hostH = r.height;
    layout();
  });
  ro.observe(host);

  // ---- Trạng thái ----
  let phase: Phase = 'idle';
  let running = false;
  let finished = false;
  let rafId = 0;
  let lastFrame = 0;
  let gameT = 0;
  let qElapsed = 0;
  let wait = 0;
  let lowShown = false;
  const pipState: PipState[] = new Array<PipState>(rules.total).fill('todo');

  if (E2E.hooks) {
    host.dataset.g7 = JSON.stringify({
      level: ctx.level,
      ...params,
      timerOn,
      groups: options.groups,
    });
  }

  function publish(): void {
    if (!E2E.hooks) return;
    const p = rules.current();
    host.dataset.phase = phase;
    host.dataset.q = JSON.stringify({
      i: rules.index,
      type: p.type,
      typeLevel: p.typeLevel,
      layout: p.layout,
      hole: p.hole,
      cells: p.cells.length,
      correct: p.correctIndex,
      retryable: rules.canRetry,
      wrong: [...rules.wrong],
    });
    host.dataset.stats = JSON.stringify({ points: rules.points, ...rules.metrics() });
  }

  function setMascot(mood: MascotMood): void {
    render(h(Mascot, { mood, size: 72 }), mascotEl);
  }

  function setTimer(p: number): void {
    timerFill.style.transform = `scaleX(${p})`;
    const low = p < 0.3;
    if (low !== lowShown) {
      lowShown = low;
      timer.classList.toggle('is-low', low);
    }
  }

  function renderPips(): void {
    pipEls.forEach((p, i) => {
      p.dataset.state =
        pipState[i] === 'todo' && i === rules.index && !rules.done ? 'now' : pipState[i];
      p.textContent =
        pipState[i] === 'full'
          ? '✓'
          : pipState[i] === 'half'
            ? '½'
            : pipState[i] === 'miss'
              ? '•'
              : '';
    });
  }

  const cellHtml = (it: Item | null, cls: string): string =>
    it
      ? `<div class="g7-cell ${cls}">${itemHtml(it)}</div>`
      : `<div class="g7-cell g7-hole ${cls}" aria-label="${vi.g7.hole}"><span>?</span></div>`;

  function renderStage(p: Puzzle): void {
    stage.className = `g7-stage g7-${p.layout}`;
    if (p.layout === 'odd') {
      stage.innerHTML = '';
      return;
    }
    const cells = p.cells.map((c, i) => cellHtml(c, i === p.hole ? 'is-hole' : '')).join('');
    if (p.layout === 'matrix2') {
      stage.innerHTML = `<div class="g7-grid g7-m2">${cells}<i class="g7-arrow g7-arrow-a">→</i><i class="g7-arrow g7-arrow-b">→</i></div>`;
    } else if (p.layout === 'matrix3') {
      stage.innerHTML = `<div class="g7-grid g7-m3">${cells}</div>`;
    } else {
      stage.innerHTML = `<div class="g7-seq">${cells}</div>`;
    }
  }

  function renderOptions(p: Puzzle): void {
    choices.replaceChildren();
    choices.className = `g7-options${p.layout === 'odd' ? ' is-odd' : ''}`;
    p.options.forEach((it, i) => {
      const b = el('button', 'g7-opt');
      b.type = 'button';
      b.dataset.i = String(i);
      if (E2E.hooks) b.dataset.correct = i === p.correctIndex ? '1' : '0';
      b.innerHTML = itemHtml(it);
      if (it.kind === 'num') b.setAttribute('aria-label', String(it.n));
      choices.appendChild(b);
    });
  }

  function showQuestion(): void {
    const p = rules.current();
    qnum.textContent = vi.g7.progress(rules.index + 1, rules.total);
    ask.textContent = askText(p);
    note.textContent = '';
    renderStage(p);
    renderOptions(p);
    layout();
    setMascot('happy');
    qElapsed = 0;
    lowShown = false;
    timer.classList.remove('is-low');
    setTimer(1);
    renderPips();
    phase = 'ask';
    publish();
  }

  // ---- Giải thích quy luật (tô sáng phần lặp / mũi tên bước / hàng / hình khác loại) ----
  function explain(p: Puzzle): void {
    const ex = p.explain;
    stage.classList.add('is-explain');
    switch (ex.kind) {
      case 'unit': {
        const cells = stage.querySelectorAll<HTMLElement>('.g7-cell');
        cells.forEach((c, i) => c.classList.add(Math.floor(i / ex.len) % 2 === 0 ? 'u-a' : 'u-b'));
        note.textContent = vi.g7.explainUnit;
        break;
      }
      case 'steps': {
        const cells = stage.querySelectorAll<HTMLElement>('.g7-cell');
        ex.labels.forEach((label, i) => {
          const c = cells[i + 1];
          if (c) {
            c.dataset.step = label;
            c.classList.add('has-step');
          }
        });
        note.textContent = vi.g7.explainSteps;
        break;
      }
      case 'analogy':
        note.textContent = vi.g7.explainAnalogy;
        break;
      case 'row': {
        const cells = stage.querySelectorAll<HTMLElement>('.g7-cell');
        cells.forEach((c, i) => c.classList.toggle('is-row', Math.floor(i / 3) === ex.row));
        note.textContent = vi.g7.explainRow;
        break;
      }
      case 'odd': {
        choices.querySelectorAll<HTMLElement>('.g7-opt').forEach((b, i) => {
          if (i !== ex.oddIndex) b.classList.add('is-same');
        });
        note.textContent = vi.g7.explainOdd[ex.attr] ?? '';
        break;
      }
    }
  }

  function fillHole(p: Puzzle): void {
    const hole = stage.querySelector<HTMLElement>('.g7-hole');
    if (!hole) return;
    hole.classList.remove('g7-hole');
    hole.classList.add('is-filled');
    hole.innerHTML = itemHtml(p.options[p.correctIndex] as Item);
  }

  function markOption(i: number, cls: string): void {
    const b = choices.children[i] as HTMLButtonElement | undefined;
    if (!b) return;
    b.classList.add(cls);
    if (cls === 'is-wrong') b.disabled = true;
  }

  function reveal(timedOut: boolean): void {
    const p = rules.current();
    markOption(p.correctIndex, 'is-correct');
    fillHole(p);
    explain(p);
    ask.textContent = vi.g7.showAnswer;
    if (timedOut) note.textContent = `${vi.g7.timeUp} ${note.textContent}`.trim();
    setMascot('happy');
    phase = 'reveal';
    wait = REVEAL_MS * fbScale;
  }

  function answer(choice: number | null): void {
    const p = rules.current();
    const res = rules.answer(choice, qElapsed);
    switch (res.kind) {
      case 'correct': {
        pipState[rules.index] = res.points === 1 ? 'full' : 'half';
        markOption(p.correctIndex, 'is-correct');
        fillHole(p);
        ctx.audio.ding();
        ctx.haptics.correct();
        ask.textContent = pick(uiRng, vi.g7.correct);
        note.textContent = '';
        setMascot('cheer');
        phase = 'celebrate';
        wait = CELEBRATE_MS * fbScale;
        break;
      }
      case 'retry': {
        const i = choice as number;
        markOption(i, 'is-wrong');
        ctx.audio.bup();
        ctx.haptics.wrong(choices.children[i] as HTMLElement);
        explain(p);
        ask.textContent = vi.g7.retry;
        setMascot('happy');
        break;
      }
      case 'wrong': {
        const i = choice as number;
        pipState[rules.index] = 'miss';
        markOption(i, 'is-wrong');
        ctx.audio.bup();
        ctx.haptics.wrong(choices.children[i] as HTMLElement);
        reveal(false);
        break;
      }
      case 'timeout':
        pipState[rules.index] = 'miss';
        reveal(true);
        break;
      case 'ignored':
        return;
    }
    renderPips();
    publish();
  }

  function advance(): void {
    if (finished) return;
    if (rules.next()) showQuestion();
    else end();
  }

  function step(dt: number): void {
    gameT += dt;
    if (phase === 'ask') {
      qElapsed += dt;
      if (timerOn) {
        setTimer(Math.max(0, 1 - qElapsed / limitMs));
        if (qElapsed >= limitMs) answer(null);
      }
    } else if (phase === 'celebrate' || phase === 'reveal') {
      wait -= dt;
      if (wait <= 0) advance();
    }
  }

  // ---- Nhận chạm: chỉ chạm đầu tiên; chạm ra ngoài thẻ đáp án không bị tính lỗi ----
  const gate = new PointerGate('first');
  const onDown = (e: PointerEvent) => {
    if (!running || finished || phase !== 'ask') return;
    if (!gate.down(e.pointerId, e.isPrimary)) return;
    const target = (e.target as Element | null)?.closest<HTMLElement>('.g7-opt');
    if (!target || (target as HTMLButtonElement).disabled) return;
    answer(Number(target.dataset.i));
  };
  const onUp = (e: PointerEvent) => gate.up(e.pointerId);
  choices.addEventListener('pointerdown', onDown);
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
    phase = 'over';
    stopLoop();
    ctx.onFinish({
      score: rules.score,
      durationMs: Math.round(gameT),
      metrics: rules.metrics(),
    });
  }

  showQuestion();
  phase = 'idle'; // chờ start() (đếm ngược xong)

  return {
    start() {
      phase = 'ask';
      publish();
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
      choices.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      ro.disconnect();
      render(null, mascotEl);
      root.remove();
      for (const k of ['g7', 'phase', 'q', 'stats']) delete host.dataset[k];
    },
  };
}
