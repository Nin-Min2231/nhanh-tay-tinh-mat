// G6 – DOM. Máy trạng thái: ask → (fly | show) → câu kế. Đồng hồ chạy theo dt của rAF nên tạm dừng/tiếp tục không lệch.
// Đúng → táo rơi vào giỏ; sai/hết giờ → táo đúng phát sáng + hình minh họa 1,5 giây rồi sang câu sau (không lời chê).
import { h, render } from 'preact';
import { E2E } from '../../app/e2e';
import { applyMathResults } from '../../app/mathFacts';
import { mulberry32, pick, type Rng } from '../../app/rng';
import { vi } from '../../i18n/vi';
import { Mascot, type MascotMood } from '../../ui/components/Mascot';
import { PointerGate } from '../common/PointerInput';
import type { GameContext, GameInstance } from '../common/types';
import { APPLE_KINDS, appleDefs, appleSvg, basketSvg } from './art';
import { readG6Options, resolveG6Params, resolveG6Topics } from './config';
import { optionLabel, questionNote, questionText, solvedText } from './format';
import { illustrationHtml } from './illustrations';
import { G6Rules } from './logic';
import { illustrationFor } from './question';

type Phase = 'idle' | 'ask' | 'fly' | 'show' | 'over';

/** Thời gian xem hình minh họa khi sai (docs/02_GAMES.md: 1,5 giây). */
export const SHOW_MS = 1500;
const FLY_MS = 700;
/** Lệch dọc của từng quả táo cho tự nhiên (px, nhân theo cỡ táo). */
const DY = [0, 0.22, -0.06, 0.26, 0.04, 0.18];

function el<K extends keyof HTMLElementTagNameMap>(
  tag: K,
  className: string,
): HTMLElementTagNameMap[K] {
  const e = document.createElement(tag);
  e.className = className;
  return e;
}

export function createG6(host: HTMLElement, ctx: GameContext): GameInstance {
  const options = readG6Options(ctx.options);
  const params = resolveG6Params(ctx.level);
  const topics = resolveG6Topics(options, ctx.profile);
  const timerOff = options.timer === 'off';
  const seed = () => (ctx.rng() * 4294967296) >>> 0;
  const rules = new G6Rules(mulberry32(seed()), params, topics, ctx.profile.mathFacts);
  const uiRng: Rng = mulberry32(seed());
  /** e2e: rút ngắn thời gian mỗi câu và các nhịp chuyển; chơi thật luôn = 1. */
  const tScale = 1 / Math.max(1, ctx.timeScale);
  const limitMs = params.secPerQ * 1000 * tScale;
  /** Nhịp phản hồi (táo rơi, hình minh họa) chỉ rút ngắn tối đa còn 40% khi chạy e2e. */
  const fbScale = Math.max(0.4, tScale);

  // ---- DOM ----
  const root = el('div', 'g6');
  root.insertAdjacentHTML('afterbegin', appleDefs());
  const top = el('div', 'g6-top');
  const mascotEl = el('div', 'g6-mascot');
  const bubble = el('div', 'g6-bubble');
  const qnum = el('span', 'g6-qnum');
  qnum.setAttribute('data-testid', 'g6-qnum');
  const qtext = el('div', 'g6-qtext');
  qtext.setAttribute('data-testid', 'g6-qtext');
  const qnote = el('div', 'g6-qnote');
  bubble.append(qnum, qtext, qnote);
  const basket = el('div', 'g6-basket');
  basket.insertAdjacentHTML('beforeend', basketSvg());
  const basketCount = el('span', 'g6-basket-count');
  basketCount.setAttribute('data-testid', 'g6-basket');
  basket.appendChild(basketCount);
  top.append(mascotEl, bubble);

  const timer = el('div', 'g6-timer');
  timer.setAttribute('role', 'progressbar');
  timer.setAttribute('aria-label', vi.g6.timerLabel);
  const timerFill = el('i', 'g6-timer-fill');
  timer.appendChild(timerFill);
  if (timerOff) timer.classList.add('is-off');

  const tree = el('div', 'g6-tree');
  tree.setAttribute('role', 'group');
  tree.setAttribute('aria-label', vi.g6.treeLabel);
  const canopy = el('div', 'g6-canopy');
  const apples = el('div', 'g6-apples');
  apples.setAttribute('data-testid', 'g6-apples');
  canopy.appendChild(apples);
  const trunk = el('div', 'g6-trunk');
  const illus = el('div', 'g6-illus');
  illus.hidden = true;
  illus.setAttribute('data-testid', 'g6-illus');
  const ground = el('div', 'g6-ground');
  ground.append(trunk, basket);
  tree.append(canopy, ground, illus);

  root.append(top, timer, tree);
  host.appendChild(root);

  // ---- Bố cục: tính cỡ táo khi vùng chơi đổi kích thước (không đọc layout mỗi khung hình) ----
  let canopyW = 0;
  let canopyH = 0;
  function layout(): void {
    const n = rules.current().options.length;
    const cols = n === 4 ? 2 : 3;
    const rows = Math.ceil(n / cols);
    const size = Math.max(
      76,
      Math.min(180, Math.floor(Math.min(canopyW / cols, canopyH / rows) * 0.9)),
    );
    apples.style.setProperty('--g6-cols', String(cols));
    apples.style.setProperty('--g6-apple', `${size}px`);
  }
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      const r = e.contentRect;
      if (e.target === host) {
        root.classList.toggle('g6-wide', r.width > r.height * 1.15);
        root.classList.toggle('g6-compact', r.height < 470);
      } else {
        canopyW = r.width * 0.84;
        canopyH = r.height * 0.8;
        layout();
      }
    }
  });
  ro.observe(host);
  ro.observe(canopy);

  // ---- Trạng thái ----
  let phase: Phase = 'idle';
  let running = false;
  let finished = false;
  let rafId = 0;
  let lastFrame = 0;
  let gameT = 0;
  let qElapsed = 0;
  let wait = 0;
  let collected = 0;
  let lowShown = false;

  if (E2E.hooks) {
    host.dataset.g6 = JSON.stringify({ level: ctx.level, ...params, topics, timerOff });
  }

  function publish(): void {
    if (!E2E.hooks) return;
    const q = rules.current();
    host.dataset.phase = phase;
    host.dataset.q = JSON.stringify({
      i: rules.index,
      key: q.key,
      topic: q.topic,
      text: questionText(q),
      options: q.options,
      correct: q.correctIndex,
      hidden: q.hidden,
      retry: q.retry,
    });
    host.dataset.stats = JSON.stringify({
      correct: rules.correctCount,
      answered: rules.answeredCount,
      timeouts: rules.timeouts,
    });
  }

  function setMascot(mood: MascotMood): void {
    render(h(Mascot, { mood, size: 88 }), mascotEl);
  }

  function setCount(n: number): void {
    basketCount.textContent = String(n);
    basket.setAttribute('aria-label', vi.g6.basketLabel(n));
  }

  function setTimer(p: number): void {
    timerFill.style.transform = `scaleX(${p})`;
    const low = p < 0.3;
    if (low !== lowShown) {
      lowShown = low;
      timer.classList.toggle('is-low', low);
    }
  }

  function showQuestion(): void {
    const q = rules.current();
    qnum.textContent = vi.g6.question(rules.index + 1, rules.total);
    qtext.textContent = questionText(q);
    qnote.textContent = questionNote(q);
    qtext.classList.toggle('is-long', qtext.textContent.length > 14);
    apples.replaceChildren();
    apples.classList.remove('is-dim');
    q.options.forEach((value, i) => {
      const label = optionLabel(q, value);
      const b = el('button', `g6-apple${params.sway ? ' is-sway' : ''}`);
      b.type = 'button';
      b.dataset.i = String(i);
      b.style.setProperty('--i', String(i));
      b.style.setProperty('--dy', String(DY[i % DY.length]));
      b.setAttribute('aria-label', label);
      if (E2E.hooks) b.dataset.correct = i === q.correctIndex ? '1' : '0';
      const body = el('span', 'g6-apple-body');
      body.insertAdjacentHTML('beforeend', appleSvg((i + rules.index) % APPLE_KINDS));
      const num = el('span', `g6-apple-num${q.core.op === 'cmp' ? ' is-sign' : ''}`);
      num.dataset.len = String(Math.min(label.length, 6));
      num.textContent = label;
      body.appendChild(num);
      b.appendChild(body);
      apples.appendChild(b);
    });
    layout();
    illus.hidden = true;
    illus.replaceChildren();
    setMascot('happy');
    qElapsed = 0;
    lowShown = false;
    timer.classList.remove('is-low');
    setTimer(1);
    phase = 'ask';
    publish();
  }

  function dropApple(target: HTMLElement): void {
    const a = target.getBoundingClientRect();
    const b = basket.getBoundingClientRect();
    target.style.setProperty(
      '--dx',
      `${Math.round(b.left + b.width / 2 - (a.left + a.width / 2))}px`,
    );
    target.style.setProperty(
      '--dy-drop',
      `${Math.round(b.top + b.height * 0.25 - (a.top + a.height / 2))}px`,
    );
    target.classList.add('is-drop');
    apples.classList.add('is-dim');
    basket.classList.remove('is-bounce');
    void basket.offsetWidth;
    basket.classList.add('is-bounce');
  }

  function showFeedback(timedOut: boolean, target: HTMLElement | null): void {
    const q = rules.current();
    apples.classList.add('is-dim');
    apples.children[q.correctIndex]?.classList.add('is-right');
    target?.classList.add('is-miss');
    qtext.textContent = solvedText(q.core);
    qnote.textContent = timedOut ? vi.g6.timeUp : vi.g6.showMe;
    setMascot('happy');
    const right = apples.children[q.correctIndex] as HTMLElement | undefined;
    const clone = right ? (right.cloneNode(true) as HTMLElement) : null;
    clone?.classList.add('g6-illus-apple');
    clone?.removeAttribute('data-correct');
    const card = el('div', 'g6-illus-card');
    const head = el('div', 'g6-illus-head');
    const eq = el('strong', 'g6-illus-eq');
    eq.textContent = solvedText(q.core);
    if (clone) head.appendChild(clone);
    head.appendChild(eq);
    const art = el('div', 'g6-illus-art');
    art.insertAdjacentHTML('beforeend', illustrationHtml(illustrationFor(q.core)));
    card.append(head, art);
    illus.replaceChildren(card);
    illus.hidden = false;
    // thẻ minh họa to hơn vùng cây (màn thấp) → thu nhỏ vừa khung; đo một lần mỗi lần hiện, không đo mỗi khung hình
    const k = Math.min(
      1,
      (illus.clientHeight - 16) / Math.max(1, card.offsetHeight),
      (illus.clientWidth - 16) / Math.max(1, card.offsetWidth),
    );
    if (k < 1) card.style.transform = `scale(${Math.max(0.4, k).toFixed(3)})`;
    phase = 'show';
    wait = SHOW_MS * fbScale;
    publish();
  }

  function answer(choice: number | null, target: HTMLElement | null): void {
    const q = rules.current();
    const out = rules.answer(choice, qElapsed);
    if (out.correct) {
      collected += 1;
      setCount(collected);
      ctx.audio.ding();
      ctx.haptics.correct();
      qtext.textContent = solvedText(q.core);
      qnote.textContent = pick(uiRng, vi.g6.correct);
      setMascot('cheer');
      if (target) dropApple(target);
      phase = 'fly';
      wait = FLY_MS * fbScale;
      publish();
      return;
    }
    if (choice !== null) {
      ctx.audio.bup(); // hết giờ thì im lặng, không có âm “chê”
      ctx.haptics.wrong(target);
    }
    showFeedback(choice === null, target);
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
      if (!timerOff) {
        setTimer(Math.max(0, 1 - qElapsed / limitMs));
        if (qElapsed >= limitMs) answer(null, null);
      }
    } else if (phase === 'fly' || phase === 'show') {
      wait -= dt;
      if (wait <= 0) advance();
    }
  }

  // ---- Nhận chạm: chỉ chạm đầu tiên; chạm ra ngoài quả táo không bị tính lỗi ----
  const gate = new PointerGate('first');
  const onDown = (e: PointerEvent) => {
    if (!running || finished || phase !== 'ask') return;
    if (!gate.down(e.pointerId, e.isPrimary)) return;
    const target = (e.target as Element | null)?.closest<HTMLElement>('.g6-apple');
    if (!target) return;
    answer(Number(target.dataset.i), target);
  };
  const onUp = (e: PointerEvent) => gate.up(e.pointerId);
  apples.addEventListener('pointerdown', onDown);
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
    const factResults = rules.factResults();
    const { newlyMastered } = applyMathResults(ctx.profile.mathFacts, factResults, 0);
    ctx.onFinish({
      score: rules.score,
      durationMs: Math.round(gameT),
      metrics: rules.metrics(newlyMastered),
      extra: { factResults },
    });
  }

  setCount(0);
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
      apples.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      ro.disconnect();
      render(null, mascotEl);
      root.remove();
      for (const k of ['g6', 'phase', 'q', 'stats']) delete host.dataset[k];
    },
  };
}
