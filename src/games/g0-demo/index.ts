// G0 demo (tạm): canvas + rAF + PointerInput, đo thời gian phản ứng bằng event.timeStamp (quy tắc 5).
import { attachPointerInput } from '../common/PointerInput';
import { createCanvasStage } from '../common/CanvasStage';
import type { GameContext, GameInstance, GameModule, RoundResult } from '../common/types';
import { G0_TARGET_HITS, isHit, nextTarget, scoreFromTaps, type Target } from './logic';

export const g0Module: GameModule = {
  id: 'G0',
  create(host: HTMLElement, ctx: GameContext): GameInstance {
    let target: Target | null = null;
    const stage = createCanvasStage(host, (w, h) => {
      // Đổi kích thước vùng chơi: kéo vòng tròn vào lại trong khung
      if (!target) return;
      const margin = target.r + 12;
      target = {
        ...target,
        x: Math.min(Math.max(target.x, margin), Math.max(margin, w - margin)),
        y: Math.min(Math.max(target.y, margin), Math.max(margin, h - margin)),
      };
      host.dataset.target = `${Math.round(target.x)},${Math.round(target.y)}`;
    });
    const c = stage.ctx;

    let running = false;
    let finished = false;
    let rafId = 0;
    let hits = 0;
    let misses = 0;
    let rtSum = 0;
    let onsetTime = 0;
    let needsOnset = false;
    let runStartedAt = 0;
    let runMs = 0;

    function spawn(): void {
      target = nextTarget(ctx.rng, stage.width, stage.height, target);
      needsOnset = true; // onsetTime = lúc khung hình đầu tiên có vòng tròn được vẽ
      host.dataset.target = `${Math.round(target.x)},${Math.round(target.y)}`;
    }

    function draw(): void {
      const w = stage.width;
      const h = stage.height;
      c.clearRect(0, 0, w, h);
      if (!target) return;
      const pulse = 1 + 0.06 * Math.sin(performance.now() / 180);
      c.beginPath();
      c.arc(target.x, target.y, target.r * pulse, 0, Math.PI * 2);
      c.fillStyle = '#66BB6A';
      c.fill();
      c.lineWidth = 5;
      c.strokeStyle = '#2E7D32';
      c.stroke();
      // mặt cười: màu luôn kèm hình
      c.beginPath();
      c.arc(target.x, target.y + 2, target.r * 0.5, 0.15 * Math.PI, 0.85 * Math.PI);
      c.lineWidth = 4;
      c.stroke();
      c.fillStyle = '#263238';
      c.beginPath();
      c.arc(target.x - target.r * 0.3, target.y - target.r * 0.25, 4, 0, Math.PI * 2);
      c.arc(target.x + target.r * 0.3, target.y - target.r * 0.25, 4, 0, Math.PI * 2);
      c.fill();
    }

    function frame(): void {
      if (!running) return;
      draw();
      if (needsOnset) {
        onsetTime = performance.now();
        needsOnset = false;
      }
      rafId = requestAnimationFrame(frame);
    }

    function result(): RoundResult {
      return {
        score: scoreFromTaps(hits, misses),
        durationMs: runMs,
        metrics: { hits, misses, avgRtMs: hits > 0 ? Math.round(rtSum / hits) : 0 },
      };
    }

    function end(): void {
      if (finished) return;
      finished = true;
      stopLoop();
      ctx.onFinish(result());
    }

    function startLoop(): void {
      running = true;
      runStartedAt = performance.now();
      rafId = requestAnimationFrame(frame);
    }

    function stopLoop(): void {
      if (running) runMs += performance.now() - runStartedAt;
      running = false;
      cancelAnimationFrame(rafId);
    }

    const detach = attachPointerInput(host, 'first', (tap) => {
      if (!running || !target) return;
      if (isHit(target, tap.x, tap.y)) {
        hits += 1;
        if (!needsOnset) rtSum += tap.timeStamp - onsetTime;
        host.dataset.hits = String(hits);
        ctx.audio.ding();
        ctx.haptics.correct();
        if (hits >= G0_TARGET_HITS) end();
        else spawn();
      } else {
        misses += 1; // chạm chỗ trống bị tính lỗi (quy tắc 7)
        host.dataset.misses = String(misses);
        ctx.audio.bup();
        ctx.haptics.wrong(host);
      }
    });

    return {
      start() {
        spawn();
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
        detach();
        stage.destroy();
        delete host.dataset.target;
        delete host.dataset.hits;
        delete host.dataset.misses;
      },
    };
  },
};
