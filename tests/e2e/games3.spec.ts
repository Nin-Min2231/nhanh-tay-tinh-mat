// TASK-05: G6 Hái Táo Tính Nhẩm + G7 Tìm Quy Luật – chạy cả 3 khung hình (phone / tablet / tablet-portrait).
import { expect, test, type Page } from '@playwright/test';
import { starsForScore } from '../../src/app/scoring';
import { vi } from '../../src/i18n/vi';
import {
  E2E_URL,
  hidePage,
  lastRound,
  makeProfile,
  questionState,
  readState,
  seedProfiles,
  solveDisplayedText,
  startGame,
  tapSelector,
  waitForAsk,
  withGame,
  type QuestionHook,
} from './helpers';
import type { MathFact } from '../../src/app/types';

const DEFAULT_G2_TOPICS = ['M02', 'M05', 'M06', 'M07', 'M08'];

async function launch(
  page: Page,
  id: 'G6' | 'G7',
  level: number,
  options: Record<string, unknown> = {},
  profilePatch: Partial<ReturnType<typeof makeProfile>> = {},
) {
  const p = withGame({ ...makeProfile('Bo'), ...profilePatch }, id, {
    mode: 'fixed',
    level,
    minLevel: 1,
    maxLevel: 10,
    options,
  });
  await seedProfiles(page, [p]);
  await page.goto(E2E_URL);
  await startGame(page, id);
  return p;
}

/** Chơi hết 10 câu G6; `wrongAt` = các câu cố ý chọn sai. Trả về các câu đã gặp. */
async function playG6(page: Page, wrongAt: number[] = []): Promise<QuestionHook[]> {
  const seen: QuestionHook[] = [];
  for (let i = 0; i < 10; i++) {
    const q = await waitForAsk(page, i);
    seen.push(q);
    const n = (q.options as number[]).length;
    const idx = wrongAt.includes(i) ? (q.correct + 1) % n : q.correct;
    await tapSelector(page, `.g6-apple[data-i="${idx}"]`);
  }
  return seen;
}

async function playG7(page: Page, total = 8): Promise<QuestionHook[]> {
  const seen: QuestionHook[] = [];
  for (let i = 0; i < total; i++) {
    const q = await waitForAsk(page, i);
    seen.push(q);
    await tapSelector(page, `.g7-opt[data-i="${q.correct}"]`);
  }
  return seen;
}

async function expectInsideViewport(page: Page, selector: string, minSize: number) {
  const bad = await page.evaluate(
    ({ selector, minSize }) => {
      const vw = window.innerWidth;
      const vh = window.innerHeight;
      const out: string[] = [];
      document.querySelectorAll<HTMLElement>(selector).forEach((el, i) => {
        const r = el.getBoundingClientRect();
        if (r.width < minSize - 0.5 || r.height < minSize - 0.5)
          out.push(`#${i} nhỏ ${Math.round(r.width)}×${Math.round(r.height)}`);
        if (r.left < -1 || r.top < -1 || r.right > vw + 1 || r.bottom > vh + 1)
          out.push(`#${i} ra ngoài màn hình`);
      });
      if (document.querySelectorAll(selector).length === 0) out.push('không có phần tử');
      if (document.documentElement.scrollWidth > vw + 1) out.push('cuộn ngang');
      return out;
    },
    { selector, minSize },
  );
  expect(bad, selector).toEqual([]);
}

test.describe('G6 Hái Táo Tính Nhẩm', () => {
  test('TC-018: Lớp 2 mặc định – 10 câu đúng chủ đề, mỗi câu đúng 1 đáp án; sai → hình minh họa và hỏi lại sau 2–4 câu', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const p = await launch(page, 'G6', 5, { timer: 'off' });
    const seen: QuestionHook[] = [];
    for (let i = 0; i < 10; i++) {
      const q = await waitForAsk(page, i);
      seen.push(q);
      const options = q.options as number[];
      // 10 câu thuộc chủ đề đã bật, 4 táo, không trùng, đúng 1 đáp án đúng
      expect(DEFAULT_G2_TOPICS).toContain(q.topic);
      expect(options).toHaveLength(4);
      expect(new Set(options).size).toBe(4);
      const expected = solveDisplayedText(q.text as string);
      expect(expected, q.text).not.toBeNull();
      expect(options.filter((o) => o === expected)).toHaveLength(1);
      expect(options[q.correct]).toBe(expected);
      const labels = await page
        .locator('.g6-apple')
        .evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
      expect(labels).toHaveLength(4);
      if (i === 0) {
        // cố ý trả lời sai câu đầu
        await tapSelector(page, `.g6-apple[data-i="${(q.correct + 1) % 4}"]`);
        const info = await page.evaluate(() => {
          const illus = document.querySelector<HTMLElement>('[data-testid="g6-illus"]');
          return {
            visible: !!illus && !illus.hidden,
            hasArt: !!illus?.querySelector('svg, .g6-col, .g6-ill-cmp'),
            eq: illus?.querySelector('.g6-illus-eq')?.textContent ?? '',
            rightGlow: !!document.querySelector('.g6-apple.is-right'),
          };
        });
        expect(info.visible).toBe(true);
        expect(info.hasArt).toBe(true);
        expect(info.eq).toContain(String(expected));
        expect(info.rightGlow).toBe(true);
      } else {
        await tapSelector(page, `.g6-apple[data-i="${q.correct}"]`);
      }
    }
    // câu sai được hỏi lại sau 2–4 câu (cùng phép tính)
    const first = seen[0] as QuestionHook;
    const again = seen.findIndex((q, i) => i > 0 && q.key === first.key);
    expect(again).toBeGreaterThanOrEqual(2);
    expect(again).toBeLessThanOrEqual(4);
    expect(seen[again]?.retry).toBe(true);

    await expect(page.getByTestId('result')).toBeVisible();
    const rec = await lastRound(page, p.id);
    expect(rec.gameId).toBe('G6');
    expect(rec.score).toBeCloseTo(0.9, 5);
    expect(rec.metrics).toMatchObject({ accuracy: 0.9, timeouts: 0, correct: 9 });
    // sổ lỗi: phép tính sai được ghi lại (sai rồi đúng khi hỏi lại → streak 1)
    const state = await readState(page);
    const fact = state.profiles[0]?.math.facts[first.key as string] as MathFact;
    expect(fact).toMatchObject({
      seen: 2,
      correct: 1,
      streak: 1,
      mastered: false,
      lastSeenRound: 1,
    });
    expect(Object.keys(state.profiles[0]?.math.facts ?? {})).toHaveLength(1);
  });

  test('TC-019: không chạm gì đến hết giờ → tính chưa đúng, hiện đáp án, sang câu mới, không có lời chê', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await launch(page, 'G6', 1, {});
    await waitForAsk(page, 0);
    // không chạm gì: hết 15 giây (e2e: 1,5 giây) → phase show
    await expect
      .poll(async () => (await questionState(page)).stats.timeouts, {
        timeout: 10_000,
        intervals: [20, 50],
      })
      .toBe(1);
    const info = await page.evaluate(() => ({
      illus: !document.querySelector<HTMLElement>('[data-testid="g6-illus"]')?.hidden,
      note: document.querySelector('.g6-qnote')?.textContent ?? '',
      right: !!document.querySelector('.g6-apple.is-right'),
      basket: document.querySelector('[data-testid="g6-basket"]')?.textContent,
    }));
    expect(info).toMatchObject({ illus: true, right: true, basket: '0', note: vi.g6.timeUp });
    expect(info.note).not.toMatch(/sai|dở|kém|lỗi/i);
    const next = await waitForAsk(page, 1);
    expect(next.i).toBe(1);
    const s = await questionState(page);
    expect(s.stats).toMatchObject({ correct: 0, answered: 1, timeouts: 1 });
  });

  test('chế độ không giới hạn thời gian: đứng yên vẫn không bị hết giờ', async ({ page }) => {
    await launch(page, 'G6', 1, { timer: 'off' });
    await waitForAsk(page, 0);
    await page.waitForTimeout(3000); // lâu hơn nhiều so với 1,5 giây của câu có giờ
    const s = await questionState(page);
    expect(s.q.i).toBe(0);
    expect(s.stats.timeouts).toBe(0);
    await expect(page.locator('.g6-timer.is-off')).toBeAttached();
  });

  test('tạm dừng thì đồng hồ câu dừng; chơi tiếp đúng câu cũ', async ({ page }) => {
    test.setTimeout(60_000);
    await launch(page, 'G6', 1, {});
    await waitForAsk(page, 0);
    await hidePage(page);
    await expect(page.getByRole('button', { name: vi.play.resume })).toBeVisible();
    await page.waitForTimeout(3500); // quá 1,5 giây nếu đồng hồ vẫn chạy
    expect((await questionState(page)).stats.timeouts).toBe(0);
    await page.getByRole('button', { name: vi.play.resume }).click();
    await expect(page.getByTestId('countdown')).toBeHidden({ timeout: 6000 });
    const q = await waitForAsk(page, 0);
    await tapSelector(page, `.g6-apple[data-i="${q.correct}"]`);
    await waitForAsk(page, 1);
    expect((await questionState(page)).stats).toMatchObject({ correct: 1, timeouts: 0 });
  });

  test('chạm ra ngoài quả táo không bị tính', async ({ page }) => {
    await launch(page, 'G6', 2, { timer: 'off' });
    await waitForAsk(page, 0);
    const box = await page.getByTestId('game-host').boundingBox();
    await page.touchscreen.tap(box!.x + 3, box!.y + box!.height - 3); // góc dưới, chỗ trống
    expect((await questionState(page)).stats.answered).toBe(0);
  });

  test('đúng → táo vào giỏ, đếm tăng; câu mới có táo mới', async ({ page }) => {
    await launch(page, 'G6', 4, { timer: 'off' });
    const q0 = await waitForAsk(page, 0);
    await tapSelector(page, `.g6-apple[data-i="${q0.correct}"]`);
    await expect(page.getByTestId('g6-basket')).toHaveText('1');
    const q1 = await waitForAsk(page, 1);
    expect(q1.key).not.toBe(q0.key);
    await expect(page.locator('.g6-apple')).toHaveCount((q1.options as number[]).length);
    await expect(page.locator('.g6-apple.is-drop, .g6-apple.is-right')).toHaveCount(0);
  });

  test('sổ lỗi: phép tính từng sai được hỏi lại đầu lượt sau; đủ 3 lần đúng → đã thuộc (F19)', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const due: MathFact = { seen: 3, correct: 2, streak: 2, lastSeenRound: 1, mastered: false };
    const p = await launch(
      page,
      'G6',
      5,
      { timer: 'off' },
      {
        math: { topics: ['M05'], facts: { '8+7': due, '15-9': { ...due, streak: 0, correct: 1 } } },
      },
    );
    const seen = await playG6(page);
    // tối đa 2 câu đầu là phép tính từng sai (ưu tiên streak thấp: 15-9 trước, rồi 8+7)
    expect(seen.slice(0, 2).map((q) => q.key)).toEqual(['15-9', '8+7']);
    expect(seen.slice(0, 2).every((q) => q.retry)).toBe(true);
    expect(seen.slice(2).every((q) => !q.retry)).toBe(true);
    await expect(page.getByTestId('result')).toBeVisible();
    const state = await readState(page);
    const facts = state.profiles[0]?.math.facts as Record<string, MathFact>;
    expect(facts['8+7']).toMatchObject({ streak: 3, mastered: true });
    expect(facts['15-9']).toMatchObject({ streak: 1, mastered: false });
    const rec = await lastRound(page, p.id);
    expect(rec.metrics.masteredCount).toBe(1);
    const lines = vi.games.G6.lines?.({ correct: 10, avgTimeMs: 0, masteredCount: 1 }) ?? [];
    await expect(page.getByTestId('metric-line').last()).toHaveText(lines.at(-1) as string);
  });

  test('cấp 10: 6 quả táo, có dạng tìm số thiếu, táo đung đưa mà vùng chạm cố định ≥ 72px', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    await launch(page, 'G6', 10, { timer: 'off', topics: ['M06', 'M05'] });
    const q0 = await waitForAsk(page, 0);
    expect(q0.options).toHaveLength(6);
    await expect(page.locator('.g6-apple.is-sway')).toHaveCount(6);
    await expectInsideViewport(page, '.g6-apple', 72);
    // kích thước nút không đổi khi đung đưa
    const w1 = await page.locator('.g6-apple').first().boundingBox();
    await page.waitForTimeout(700);
    const w2 = await page.locator('.g6-apple').first().boundingBox();
    expect([w1!.width, w1!.height]).toEqual([w2!.width, w2!.height]);
    const seen: QuestionHook[] = [q0];
    await tapSelector(page, `.g6-apple[data-i="${q0.correct}"]`);
    for (let i = 1; i < 10; i++) {
      const q = await waitForAsk(page, i);
      seen.push(q);
      await tapSelector(page, `.g6-apple[data-i="${q.correct}"]`);
    }
    // dạng tìm số thiếu (? + 8 = 15) xuất hiện; mỗi câu vẫn đúng 1 đáp án đúng
    expect(seen.filter((q) => q.hidden !== 'r').length).toBeGreaterThan(0);
    for (const q of seen) expect(new Set(q.options).size).toBe(6);
  });

  test('M03 so sánh: luôn 3 quả >, <, = (kể cả cấp có 6 táo)', async ({ page }) => {
    test.setTimeout(60_000);
    await launch(page, 'G6', 9, { timer: 'off', topics: ['M03'] });
    for (let i = 0; i < 2; i++) {
      const q = await waitForAsk(page, i);
      expect(q.options).toHaveLength(3);
      const labels = await page
        .locator('.g6-apple')
        .evaluateAll((els) => els.map((e) => e.getAttribute('aria-label')));
      expect([...labels].sort()).toEqual(['<', '=', '>']);
      await tapSelector(page, `.g6-apple[data-i="${q.correct}"]`);
    }
  });

  test('bố cục: không tràn màn hình, hình minh họa nằm trong màn hình', async ({ page }) => {
    await launch(page, 'G6', 9, { timer: 'off', topics: ['M09'] });
    const q = await waitForAsk(page, 0);
    await expectInsideViewport(page, '.g6-apple', 72);
    await tapSelector(page, `.g6-apple[data-i="${(q.correct + 1) % 6}"]`);
    await expectInsideViewport(page, '.g6-illus-card', 100);
  });
});

test.describe('G7 Tìm Quy Luật', () => {
  test('TC-020: cấp 1–5 sai → tô sáng quy luật rồi thử lại; đúng lần 2 được ½ điểm câu đó', async ({
    page,
  }) => {
    test.setTimeout(120_000);
    const p = await launch(page, 'G7', 3, {});
    const q0 = await waitForAsk(page, 0);
    expect(q0.retryable).toBe(true);
    const wrongIdx = (q0.correct + 1) % 3;
    await tapSelector(page, `.g7-opt[data-i="${wrongIdx}"]`);
    // vẫn ở câu 0, thẻ sai bị làm mờ, hiện gợi ý tô sáng phần lặp lại
    await expect.poll(async () => (await questionState(page)).q.wrong).toEqual([wrongIdx]);
    const s1 = await questionState(page);
    expect(s1.phase).toBe('ask');
    expect(s1.q.i).toBe(0);
    await expect(page.locator(`.g7-opt[data-i="${wrongIdx}"]`)).toBeDisabled();
    expect(await page.locator('.g7-cell.u-a').count()).toBeGreaterThan(0);
    await expect(page.getByTestId('g7-note')).toHaveText(vi.g7.explainUnit);
    // chọn lại đúng
    await tapSelector(page, `.g7-opt[data-i="${q0.correct}"]`);
    await expect.poll(async () => (await questionState(page)).stats.points).toBe(0.5);
    // 7 câu còn lại đúng ngay lần đầu
    for (let i = 1; i < 8; i++) {
      const q = await waitForAsk(page, i);
      await tapSelector(page, `.g7-opt[data-i="${q.correct}"]`);
    }
    await expect(page.getByTestId('result')).toBeVisible();
    const rec = await lastRound(page, p.id);
    expect(rec.score).toBeCloseTo(7.5 / 8, 6);
    expect(rec.stars).toBe(starsForScore(7.5 / 8));
    expect(rec.metrics).toMatchObject({ firstTry: 7, correct: 8, accuracy: 0.875, timeouts: 0 });
  });

  test('cấp 6+: sai → hiện đáp án + giải thích rồi sang câu sau (không thử lại, 0 điểm)', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await launch(page, 'G7', 6, {});
    const q0 = await waitForAsk(page, 0);
    expect(q0.retryable).toBe(false);
    await tapSelector(page, `.g7-opt[data-i="${(q0.correct + 1) % 4}"]`);
    await expect.poll(async () => (await questionState(page)).phase).toBe('reveal');
    await expect(page.locator('.g7-opt.is-correct')).toHaveCount(1);
    await expect(page.getByTestId('g7-ask')).toHaveText(vi.g7.showAnswer);
    expect((await questionState(page)).stats.points).toBe(0);
    await waitForAsk(page, 1);
  });

  test('phụ huynh bật 30 giây: hết giờ → hiện đáp án, 0 điểm, không thử lại', async ({ page }) => {
    test.setTimeout(60_000);
    await launch(page, 'G7', 1, { timer: 'sec30' });
    await waitForAsk(page, 0);
    await expect(page.locator('.g7-timer')).toBeVisible();
    await expect
      .poll(async () => (await questionState(page)).stats.timeouts, {
        timeout: 12_000,
        intervals: [50, 100],
      })
      .toBe(1);
    expect((await questionState(page)).phase).toBe('reveal');
    await expect(page.locator('.g7-opt.is-correct')).toHaveCount(1);
    expect((await questionState(page)).stats.points).toBe(0);
  });

  test('mặc định không có đồng hồ: đứng yên lâu vẫn không bị tính', async ({ page }) => {
    await launch(page, 'G7', 1, {});
    await waitForAsk(page, 0);
    await expect(page.locator('.g7-timer')).toHaveCount(0);
    await page.waitForTimeout(3500);
    const s = await questionState(page);
    expect(s.q.i).toBe(0);
    expect(s.stats.timeouts).toBe(0);
  });

  test('chơi hết lượt cấp 9 (tìm hình khác loại): 3 sao, metrics đầy đủ', async ({ page }) => {
    test.setTimeout(120_000);
    const p = await launch(page, 'G7', 9, { groups: ['shapes'] });
    const q0 = await waitForAsk(page, 0);
    expect(q0.layout).toBe('odd');
    await expect(page.locator('.g7-opt')).toHaveCount(4);
    await expect(page.locator('.g7-stage')).toBeHidden();
    await expectInsideViewport(page, '.g7-opt', 64);
    await tapSelector(page, `.g7-opt[data-i="${q0.correct}"]`);
    for (let i = 1; i < 8; i++) {
      const q = await waitForAsk(page, i);
      await tapSelector(page, `.g7-opt[data-i="${q.correct}"]`);
    }
    await expect(page.getByTestId('result')).toBeVisible();
    const rec = await lastRound(page, p.id);
    expect(rec).toMatchObject({ gameId: 'G7', score: 1, stars: 3 });
    expect(rec.metrics).toMatchObject({
      accuracy: 1,
      highestTypeCorrect: 9,
      correct: 8,
      timeouts: 0,
    });
    await expect(page.getByTestId('metric-line').first()).toHaveText(
      vi.games.G7.lines?.({ correct: 8 })[0] as string,
    );
  });

  test('tùy chọn phụ huynh: nhóm “Số” chỉ ra dãy số', async ({ page }) => {
    test.setTimeout(60_000);
    await launch(page, 'G7', 4, { groups: ['numbers'] });
    const q = await waitForAsk(page, 0);
    expect(q.type).toBe('num-step');
    expect(await page.locator('.g7-stage .g7-num').count()).toBeGreaterThanOrEqual(4);
    await tapSelector(page, `.g7-opt[data-i="${q.correct}"]`);
    await waitForAsk(page, 1);
  });

  test('tùy chọn phụ huynh: nhóm “Ma trận” (cấp thấp vẫn ra ma trận gần nhất)', async ({
    page,
  }) => {
    test.setTimeout(60_000);
    await launch(page, 'G7', 3, { groups: ['matrix'] });
    const q = await waitForAsk(page, 0);
    expect(q.type).toBe('matrix2');
    expect(q.cells).toBe(4);
    await expect(page.locator('.g7-m2')).toBeVisible();
  });

  test('chỉ nhận chạm ở thẻ đáp án; chạm vào dãy/ô trống không bị tính', async ({ page }) => {
    await launch(page, 'G7', 2, {});
    await waitForAsk(page, 0);
    await tapSelector(page, '.g7-cell', 0);
    await tapSelector(page, '.g7-hole');
    const s = await questionState(page);
    expect(s.q.i).toBe(0);
    expect(s.q.wrong).toEqual([]);
    expect(s.stats.correct).toBe(0);
  });

  for (const level of [2, 5, 8, 10]) {
    test(`bố cục cấp ${level}: ô và thẻ đáp án nằm trong màn hình, thẻ ≥ 64px`, async ({
      page,
    }) => {
      test.setTimeout(60_000);
      await launch(page, 'G7', level, {});
      const q = await waitForAsk(page, 0);
      await expectInsideViewport(page, '.g7-opt', 64);
      await expectInsideViewport(page, '.g7-cell', 40);
      // chơi đủ 8 câu không lỗi (mọi dạng của cấp)
      await tapSelector(page, `.g7-opt[data-i="${q.correct}"]`);
      for (let i = 1; i < 8; i++) {
        const next = await waitForAsk(page, i);
        await tapSelector(page, `.g7-opt[data-i="${next.correct}"]`);
      }
      await expect(page.getByTestId('result')).toBeVisible();
    });
  }

  test('chơi hết lượt G7 cấp 1: không có lỗi console', async ({ page }) => {
    test.setTimeout(120_000);
    const errors: string[] = [];
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('pageerror', (e) => errors.push(String(e)));
    await launch(page, 'G7', 1, {});
    await playG7(page);
    await expect(page.getByTestId('result')).toBeVisible();
    expect(errors).toEqual([]);
  });
});
