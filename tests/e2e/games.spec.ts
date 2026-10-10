import { expect, test, type Page } from '@playwright/test';
import { vi } from '../../src/i18n/vi';
import {
  E2E_URL,
  chooseDifficulty,
  g1Snapshot,
  g2Cells,
  g2Tap,
  lastRound,
  makeProfile,
  openIntro,
  playG1,
  playG2,
  pressStart,
  readRounds,
  readState,
  seedProfiles,
  startGame,
  withGame,
} from './helpers';

async function host(page: Page) {
  return page.getByTestId('game-host');
}

async function g1Params(
  page: Page,
): Promise<{ level: number; colors: number; simultaneous: number }> {
  return JSON.parse((await (await host(page)).getAttribute('data-g1')) ?? '{}');
}

/** Rời lượt đang chơi mà không lưu (Tạm dừng → Thoát). */
async function leaveRound(page: Page) {
  await page.getByTestId('pause-button').click();
  await page.getByRole('button', { name: vi.play.exit }).click();
  await expect(page.getByTestId('greeting')).toBeVisible();
}

test.describe('TC-004 – G1: chạm xanh / đỏ / chỗ trống', () => {
  test('bóng xanh +điểm; bóng đỏ và chỗ trống bị tính lỗi, bấm bừa làm giảm điểm', async ({
    page,
  }) => {
    const p = makeProfile('An');
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL); // seed 12345: bóng đầu tiên là bóng đỏ
    await startGame(page, 'G1');
    await playG1(page, { tapGreen: true, falseAlarms: 1, emptyTaps: 2 });

    await expect(page.getByTestId('result')).toBeVisible();
    const r = await lastRound(page, p.id);
    expect(r).toMatchObject({ gameId: 'G1', level: 1, mode: 'auto' });
    const m = r.metrics as Record<string, number>;
    expect(m.hits).toBeGreaterThanOrEqual(1);
    expect(m.falseAlarms).toBe(1); // chạm bóng đỏ = lỗi
    expect(m.emptyTaps).toBe(2); // chạm chỗ trống = lỗi
    const balls = m.hits! + m.misses! + m.falseAlarms! + m.correctRejections!;
    expect(r.score).toBeCloseTo((m.hits! + m.correctRejections!) / (balls + m.emptyTaps!), 6);
    expect(r.score).toBeLessThan(1); // bấm bừa → điểm không thể tối đa
    expect(Object.keys(m)).toEqual(
      expect.arrayContaining(['rtMeanMs', 'rtMedianMs', 'accuracy', 'hits', 'misses']),
    );
  });
});

test.describe('TC-005 – G2: bảng 3×3', () => {
  test('lần 1 hiện thời gian hoàn thành; lần 2 chạm sai 1 số → ghi 1 lỗi', async ({ page }) => {
    const p = makeProfile('An');
    await seedProfiles(page, [p]);
    await page.goto('/');
    await startGame(page, 'G2');
    await playG2(page);
    await expect(page.getByTestId('result')).toBeVisible();
    await expect(page.getByTestId('metric-line').first()).toContainText('Con tìm xong trong');
    let r = await lastRound(page, p.id);
    expect(r.metrics).toMatchObject({ errors: 0, gridSize: 3 });

    await page.getByTestId('play-again').click();
    await expect(page.getByTestId('start-game')).toBeVisible();
    await pressStart(page);
    const cells = await g2Cells(page);
    await g2Tap(page, cells, 9); // cố ý chạm sai (đang cần số 1)
    await expect(page.locator('.hint-bubble')).toBeVisible(); // lời động viên nhẹ nhàng
    await expect(await host(page)).toHaveAttribute('data-errors', '1');
    await expect(page.getByTestId('g2-target')).toHaveText('1'); // vẫn đang tìm số 1
    await playG2(page);
    await expect(page.getByTestId('result')).toBeVisible();
    r = await lastRound(page, p.id);
    expect(r.metrics).toMatchObject({ errors: 1 });
    expect(r.score).toBeLessThanOrEqual(0.95);
  });

  test('chạm lại ô đã đúng thì bỏ qua (không lỗi)', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto('/');
    await startGame(page, 'G2');
    const cells = await g2Cells(page);
    await g2Tap(page, cells, 1);
    await g2Tap(page, cells, 1);
    await g2Tap(page, cells, 1);
    await expect(page.getByTestId('g2-target')).toHaveText('2');
    await expect(await host(page)).not.toHaveAttribute('data-errors', /.+/);
  });
});

test.describe('G2 – các chế độ hiển thị', () => {
  test('số xoay: số có chữ số 6/9 được gạch chân; không xoay thì không', async ({ page }) => {
    await seedProfiles(page, [
      withGame(makeProfile('An'), 'G2', { level: 8, minLevel: 1, maxLevel: 10 }),
    ]);
    await page.goto('/');
    await startGame(page, 'G2');
    expect(await page.locator('.g2-cell').count()).toBe(25);
    expect(await page.locator('.g2-num.is-underlined').count()).toBe(4); // 6, 9, 16, 19
    await expect(page.getByTestId('g2-target')).toHaveText('1');
  });

  test('cấp 9: thứ tự ngược từ 25; cấp 3: không gạch chân', async ({ page }) => {
    await seedProfiles(page, [withGame(makeProfile('An'), 'G2', { level: 9 })]);
    await page.goto('/');
    await startGame(page, 'G2');
    await expect(page.getByTestId('g2-target')).toHaveText('25');
    const cells = await g2Cells(page);
    await g2Tap(page, cells, 25);
    await expect(page.getByTestId('g2-target')).toHaveText('24');
    expect(await page.locator('.g2-num.is-underlined').count()).toBe(0);
  });

  test('cấp 1: gợi ý nhấp nháy khi bé đứng yên', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto('/');
    await startGame(page, 'G2');
    await expect(page.locator('.g2-cell.is-hint')).toHaveCount(1, { timeout: 8000 }); // sau 4 giây
    await g2Tap(page, await g2Cells(page), 1);
    await expect(page.locator('.g2-cell.is-hint')).toHaveCount(0);
  });
});

test.describe('TC-009 – lên cấp', () => {
  test('2 lượt ≥ 85% rồi lượt thứ 3 cũng tốt → “Lên cấp!”, cấp tăng 1', async ({ page }) => {
    const p = withGame(makeProfile('An'), 'G1', { level: 3, recentScores: [0.9, 0.9] });
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await startGame(page, 'G1');
    await playG1(page, { tapGreen: true });

    await expect(page.getByTestId('result')).toBeVisible();
    await expect(page.getByTestId('level-up')).toHaveText(vi.result.levelUp);
    await expect(page.getByTestId('confetti')).toBeVisible();
    const g1 = (await readState(page)).profiles[0]!.games.G1;
    expect(g1.level).toBe(4);
    expect(g1.recentScores).toEqual([]);

    await page.getByTestId('play-again').click();
    await pressStart(page);
    expect((await g1Params(page)).level).toBe(4); // lượt kế tiếp chơi ở cấp mới
    await leaveRound(page);
  });
});

test.describe('TC-014 – G1: số màu bóng = 4 (tùy chọn phụ huynh)', () => {
  test('đặt Số màu bóng = 4 → lượt chơi dùng 4 màu', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto(`${E2E_URL}&debug=1`);
    await openIntro(page, 'G1');
    await expect(page.getByTestId('debug-panel')).toBeVisible();
    await page.getByLabel(vi.debug.colors).selectOption('4');
    await pressStart(page);
    expect((await g1Params(page)).colors).toBe(4);
    expect((await readState(page)).profiles[0]!.games.G1.options).toMatchObject({ colors: 4 });
    await leaveRound(page);
  });

  test('không có ?debug=1 thì không hiện bảng gỡ lỗi', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto(E2E_URL);
    await openIntro(page, 'G1');
    await expect(page.getByTestId('debug-panel')).toHaveCount(0);
  });
});

test.describe('TC-015 – G2 chế độ Cố định', () => {
  test('chơi 3 lượt thật tốt → cấp vẫn là 5', async ({ page }) => {
    const p = withGame(makeProfile('An'), 'G2', { mode: 'fixed', level: 5 });
    await seedProfiles(page, [p]);
    await page.goto('/');
    await startGame(page, 'G2');
    for (let i = 1; i <= 3; i++) {
      await playG2(page);
      await expect(page.getByTestId('result')).toBeVisible();
      await expect(page.getByTestId('level-up')).toHaveCount(0);
      if (i < 3) {
        await page.getByTestId('play-again').click();
        await pressStart(page);
      }
    }
    const g2 = (await readState(page)).profiles[0]!.games.G2;
    expect(g2.level).toBe(5);
    expect(g2.recentScores).toEqual([]);
    const rounds = await readRounds(page, p.id);
    expect(rounds).toHaveLength(3);
    rounds.forEach((r) => expect(r).toMatchObject({ level: 5, mode: 'fixed' }));
  });
});

test.describe('TC-016 – bé chọn Dễ / Tự động', () => {
  test('Dễ → chơi ở cấp 3 và cấp tự động vẫn là 5; chọn lại Tự động → cấp 5', async ({ page }) => {
    const p = withGame(makeProfile('An'), 'G1', { level: 5, recentScores: [0.7] });
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await openIntro(page, 'G1');
    await chooseDifficulty(page, 'easy');
    await pressStart(page);
    expect((await g1Params(page)).level).toBe(3);
    await playG1(page, { tapGreen: true });

    await expect(page.getByTestId('result')).toBeVisible();
    const r = await lastRound(page, p.id);
    expect(r).toMatchObject({ level: 3, mode: 'easy' });
    const g1 = (await readState(page)).profiles[0]!.games.G1;
    expect(g1.level).toBe(5); // lượt “Dễ” không làm đổi cấp tự động
    expect(g1.recentScores).toEqual([0.7]); // và không tính vào adaptive

    await page.getByTestId('play-again').click();
    await chooseDifficulty(page, 'auto');
    await pressStart(page);
    expect((await g1Params(page)).level).toBe(5);
    await leaveRound(page);
  });

  test('chế độ Cố định: Dễ/Khó của bé không có tác dụng', async ({ page }) => {
    const p = withGame(makeProfile('An'), 'G1', { mode: 'fixed', level: 5 });
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await openIntro(page, 'G1');
    await chooseDifficulty(page, 'hard');
    await pressStart(page);
    expect((await g1Params(page)).level).toBe(5);
    await leaveRound(page);
  });
});

test.describe('TC-017 – giảm cấp nhẹ nhàng', () => {
  test('2 lượt liên tiếp < 50% → giảm 1 cấp, không có thông báo tiêu cực', async ({ page }) => {
    const p = withGame(makeProfile('An'), 'G1', { level: 5, recentScores: [0.3] });
    await seedProfiles(page, [p]);
    await page.goto('/?e2e=1&seed=2'); // seed 2: toàn bóng xanh → không chạm gì thì điểm 0
    await startGame(page, 'G1');
    await playG1(page, { tapGreen: false });

    await expect(page.getByTestId('result')).toBeVisible();
    const r = await lastRound(page, p.id);
    expect(r.score).toBeLessThan(0.5);
    expect(r.stars).toBe(1); // vẫn được 1 sao nỗ lực
    await expect(page.getByTestId('praise')).toHaveText(vi.result.praise[1]!);
    await expect(page.getByTestId('level-up')).toHaveCount(0);
    const g1 = (await readState(page)).profiles[0]!.games.G1;
    expect(g1.level).toBe(4);
    expect((await readState(page)).profiles[0]!.totalStars).toBe(1); // sao không bị trừ
  });
});

test.describe('TC-031 – chỉ nhận chạm đầu tiên', () => {
  test('G1: 2 ngón cùng lúc (bóng + chỗ trống) → chỉ ngón đầu được tính', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto(E2E_URL);
    await startGame(page, 'G1');
    let snap = await g1Snapshot(page);
    for (let i = 0; i < 100 && (!snap || snap.balls.length === 0); i++) {
      await page.waitForTimeout(20);
      snap = await g1Snapshot(page);
    }
    const s = snap!;
    const ball = s.balls[0]!;
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { x: s.x + ball.x, y: s.y + ball.y, id: 1 },
        { x: s.x + 5, y: s.y + s.h - 5, id: 2 }, // chỗ trống
      ],
    });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect
      .poll(async () => {
        const st = (await g1Snapshot(page))!.stats;
        return (st.hits ?? 0) + (st.falseAlarms ?? 0);
      })
      .toBe(1);
    expect((await g1Snapshot(page))!.stats.emptyTaps).toBe(0);
  });

  test('G2: 2 ngón cùng lúc → chỉ ô đầu tiên được tính', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto('/');
    await startGame(page, 'G2');
    const cells = await g2Cells(page);
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { x: cells['1']!.x, y: cells['1']!.y, id: 1 },
        { x: cells['5']!.x, y: cells['5']!.y, id: 2 }, // sai nhưng phải bị bỏ qua
      ],
    });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(page.getByTestId('g2-target')).toHaveText('2');
    await expect(await host(page)).not.toHaveAttribute('data-errors', /.+/);
  });
});
