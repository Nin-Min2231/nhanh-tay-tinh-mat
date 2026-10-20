import { expect, test, type Page } from '@playwright/test';
import type { Profile } from '../../src/app/types';
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
  withTrack,
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

test.describe('TC-009 – lên cấp: 2 lượt 3 sao liên tiếp, mỗi chế độ một cấp riêng', () => {
  test('lượt 3 sao thứ hai liên tiếp → “Lên cấp!”, cấp của chế độ tăng 1, lượt kế chơi ở cấp mới', async ({
    page,
  }) => {
    const p = withTrack(makeProfile('An'), 'G1', 'auto', { level: 3, stars: 3, recent: [3] });
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await startGame(page, 'G1');
    await playG1(page, { tapGreen: true });

    await expect(page.getByTestId('result')).toBeVisible();
    await expect(page.getByTestId('level-up')).toHaveText(vi.result.levelUp);
    await expect(page.getByTestId('level-up-detail')).toHaveText(
      vi.result.levelUpDetail(vi.intro.auto, 4),
    );
    await expect(page.getByTestId('confetti')).toBeVisible();
    const g1 = (await readState(page)).profiles[0]!.games.G1;
    expect(g1.tracks.auto).toEqual({ level: 4, stars: 0, recent: [] }); // đổi cấp → sao và lịch sử về 0
    expect(g1.lastChoice).toBe('auto');

    await page.getByTestId('play-again').click();
    await expect(page.getByTestId('choice-level-auto')).toContainText(vi.common.level(4));
    await pressStart(page);
    expect((await g1Params(page)).level).toBe(4); // lượt kế tiếp chơi ở cấp mới
    await leaveRound(page);
  });

  test('1 lượt 3 sao chưa đủ: chưa lên cấp, sao ở cấp này hiện trên nút chế độ', async ({
    page,
  }) => {
    const p = makeProfile('An');
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await startGame(page, 'G1');
    await playG1(page, { tapGreen: true });

    await expect(page.getByTestId('result')).toBeVisible();
    expect((await lastRound(page, p.id)).stars).toBe(3);
    await expect(page.getByTestId('level-up')).toHaveCount(0);
    const g1 = (await readState(page)).profiles[0]!.games.G1;
    expect(g1.tracks.auto).toEqual({ level: 1, stars: 3, recent: [3] });

    await page.getByTestId('play-again').click();
    await expect(page.getByTestId('choice-level-auto')).toContainText(
      `${vi.common.level(1)} · ★★★`,
    );
  });

  test('Dễ lên cấp riêng (Dễ cấp 3) trong khi Tự động / Vừa / Khó vẫn cấp 1', async ({ page }) => {
    const p = withTrack(makeProfile('An'), 'G1', 'easy', { level: 2, stars: 3, recent: [3] });
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await openIntro(page, 'G1');
    await expect(page.getByTestId('choice-level-easy')).toContainText(vi.common.level(2));
    await chooseDifficulty(page, 'easy');
    await pressStart(page);
    await playG1(page, { tapGreen: true });

    await expect(page.getByTestId('result')).toBeVisible();
    await expect(page.getByTestId('level-up')).toBeVisible();
    await expect(page.getByTestId('level-up-detail')).toHaveText(
      vi.result.levelUpDetail(vi.intro.easy, 3),
    );
    const g1 = (await readState(page)).profiles[0]!.games.G1;
    expect(g1.tracks.easy).toEqual({ level: 3, stars: 0, recent: [] });
    for (const other of ['auto', 'normal', 'hard'] as const) {
      expect(g1.tracks[other], other).toEqual({ level: 1, stars: 0, recent: [] });
    }
    expect(g1.lastChoice).toBe('easy');
    // lượt được ghi kèm cấp của chế độ bé đã thấy (Dễ cấp 2 → nội dung cấp 1) để màn Tiến bộ / CSV khớp
    expect(await lastRound(page, p.id)).toMatchObject({ mode: 'easy', level: 1, trackLevel: 2 });

    // màn Giới thiệu: mỗi nút hiện cấp riêng; mở sẵn chế độ vừa chơi
    await page.getByTestId('play-again').click();
    await expect(page.getByTestId('choice-level-easy')).toContainText(vi.common.level(3));
    for (const other of ['auto', 'normal', 'hard']) {
      await expect(page.getByTestId(`choice-level-${other}`)).toContainText(vi.common.level(1));
    }
    await expect(page.getByTestId('choice-easy')).toHaveAttribute('aria-checked', 'true');
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
    for (const c of ['easy', 'normal', 'auto', 'hard'] as const) {
      expect(g2.tracks[c], c).toEqual({ level: 1, stars: 0, recent: [] }); // Cố định: không có sổ nào thay đổi
    }
    const rounds = await readRounds(page, p.id);
    expect(rounds).toHaveLength(3);
    rounds.forEach((r) => expect(r).toMatchObject({ level: 5, mode: 'fixed' }));
  });
});

test.describe('TC-016 – bé chọn Dễ / Vừa / Tự động / Khó: mỗi chế độ một sổ cấp riêng', () => {
  test('Dễ nhẹ hơn 2 cấp so với cấp của CHÍNH sổ Dễ; sổ Tự động không bị đụng tới', async ({
    page,
  }) => {
    const p = withTrack(
      withTrack(makeProfile('An'), 'G1', 'auto', { level: 5, stars: 1, recent: [1] }),
      'G1',
      'easy',
      { level: 4 },
      'auto',
    );
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await openIntro(page, 'G1');
    // mỗi nút hiện cấp riêng của chế độ đó
    await expect(page.getByTestId('choice-level-auto')).toContainText(vi.common.level(5));
    await expect(page.getByTestId('choice-level-easy')).toContainText(vi.common.level(4));
    await expect(page.getByTestId('choice-level-normal')).toContainText(vi.common.level(1));
    await expect(page.getByTestId('choice-level-hard')).toContainText(vi.common.level(1));
    await expect(page.getByTestId('choice-auto')).toHaveAttribute(
      'aria-label',
      vi.intro.modeLevel(vi.intro.auto, 5, 1),
    );

    await chooseDifficulty(page, 'easy');
    await pressStart(page);
    expect((await g1Params(page)).level).toBe(2); // Dễ cấp 4 → nội dung cấp 4 − 2
    await playG1(page, { tapGreen: true });

    await expect(page.getByTestId('result')).toBeVisible();
    expect(await lastRound(page, p.id)).toMatchObject({ level: 2, trackLevel: 4, mode: 'easy' });
    const g1 = (await readState(page)).profiles[0]!.games.G1;
    expect(g1.tracks.easy).toEqual({ level: 4, stars: 3, recent: [3] }); // lượt Dễ ghi vào sổ Dễ
    expect(g1.tracks.auto).toEqual({ level: 5, stars: 1, recent: [1] }); // sổ Tự động nguyên vẹn
    expect(g1.lastChoice).toBe('easy');

    await page.getByTestId('play-again').click();
    await chooseDifficulty(page, 'auto');
    await pressStart(page);
    expect((await g1Params(page)).level).toBe(5);
    await leaveRound(page);
  });

  test('Khó nặng hơn 2 cấp so với cấp của sổ Khó (kẹp ở 10)', async ({ page }) => {
    const p = withTrack(makeProfile('An'), 'G1', 'hard', { level: 4 });
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await openIntro(page, 'G1');
    await chooseDifficulty(page, 'hard');
    await pressStart(page);
    expect((await g1Params(page)).level).toBe(6);
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

test.describe('TC-017 – xuống cấp nhẹ nhàng: 3 lượt liên tiếp chỉ 1 sao, nhắc ở lượt thứ 3', () => {
  test('lượt thứ 3 chỉ 1 sao → xuống 1 cấp kèm lời động viên; không trừ sao, không tiếng buồn', async ({
    page,
  }) => {
    const p = withTrack(makeProfile('An'), 'G1', 'auto', { level: 5, stars: 1, recent: [1, 1] });
    await seedProfiles(page, [p]);
    await page.goto('/?e2e=1&seed=2'); // seed 2: toàn bóng xanh → không chạm gì thì điểm 0
    await openIntro(page, 'G1');
    // lượt thứ 3: màn Giới thiệu nhắc bé nhẹ nhàng (trước khi chơi)
    await expect(page.getByTestId('drop-warning')).toHaveText(vi.intro.dropWarning);
    await pressStart(page);
    await playG1(page, { tapGreen: false });

    await expect(page.getByTestId('result')).toBeVisible();
    const r = await lastRound(page, p.id);
    expect(r.score).toBeLessThan(0.5);
    expect(r.stars).toBe(1); // vẫn được 1 sao nỗ lực
    await expect(page.getByTestId('praise')).toHaveText(vi.result.praise[1]!);
    await expect(page.getByTestId('level-up')).toHaveCount(0);
    await expect(page.getByTestId('level-down')).toHaveText(vi.result.levelDown(vi.intro.auto, 4));
    const st = (await readState(page)).profiles[0]!;
    expect(st.games.G1.tracks.auto).toEqual({ level: 4, stars: 0, recent: [] });
    expect(st.totalStars).toBe(1); // sao không bị trừ

    // sau khi xuống cấp: hết nhắc, nút hiện cấp mới
    await page.getByTestId('play-again').click();
    await expect(page.getByTestId('drop-warning')).toHaveCount(0);
    await expect(page.getByTestId('choice-level-auto')).toContainText(vi.common.level(4));
  });

  test('chỉ nhắc ở chế độ đang có 2 lượt liên tiếp chỉ 1 sao (đổi chế độ thì hết nhắc)', async ({
    page,
  }) => {
    const p = withTrack(makeProfile('An'), 'G1', 'auto', { level: 3, stars: 1, recent: [1, 1] });
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await openIntro(page, 'G1');
    await expect(page.getByTestId('drop-warning')).toBeVisible();
    await chooseDifficulty(page, 'easy');
    await expect(page.getByTestId('drop-warning')).toHaveCount(0);
    await chooseDifficulty(page, 'auto');
    await expect(page.getByTestId('drop-warning')).toBeVisible();
  });

  test('chưa đủ 2 lượt chỉ 1 sao, hoặc đang cấp thấp nhất, hoặc chế độ Cố định → không nhắc', async ({
    page,
  }) => {
    const base = makeProfile('An');
    const one = withTrack(base, 'G1', 'auto', { level: 3, stars: 1, recent: [1] });
    const lowest = withTrack(base, 'G2', 'auto', { level: 1, stars: 1, recent: [1, 1] });
    const fixed = withGame(
      withTrack(base, 'G3', 'auto', { level: 3, stars: 1, recent: [1, 1] }),
      'G3',
      { mode: 'fixed', level: 3 },
    );
    const merged: Profile = {
      ...base,
      games: { ...base.games, G1: one.games.G1, G2: lowest.games.G2, G3: fixed.games.G3 },
    };
    await seedProfiles(page, [merged]);
    await page.goto(E2E_URL);
    for (const id of ['G1', 'G2', 'G3'] as const) {
      await openIntro(page, id);
      await expect(page.getByTestId('drop-warning'), id).toHaveCount(0);
      await page.getByRole('button', { name: vi.common.back }).click();
      await expect(page.getByTestId('greeting')).toBeVisible();
    }
  });
});

test.describe('Thẻ game ở Home hiện cấp và sao của chế độ bé chơi gần nhất', () => {
  test('mặc định “Cấp 1 · ☆☆☆”; chơi Dễ rồi thì hiện “Dễ” + cấp và sao ở cấp đó', async ({
    page,
  }) => {
    const p = withTrack(makeProfile('An'), 'G1', 'easy', { level: 3, stars: 2 }, 'easy');
    await seedProfiles(page, [p]);
    await page.goto('/');
    const card = page.getByTestId('game-G1');
    await expect(card).toContainText(vi.intro.easy);
    await expect(card).toContainText(`${vi.common.level(3)} · ★★☆`);
    // game khác chưa chơi: chip không có tên chế độ
    const g2 = page.getByTestId('game-G2');
    await expect(g2).toContainText(`${vi.common.level(1)} · ☆☆☆`);
    await expect(g2.locator('.game-meta-mode')).toHaveCount(0);
  });

  test('phụ huynh đặt Cố định: hiện “Cấp 5 · Cố định”', async ({ page }) => {
    await seedProfiles(page, [withGame(makeProfile('An'), 'G1', { mode: 'fixed', level: 5 })]);
    await page.goto('/');
    await expect(page.getByTestId('game-G1')).toContainText(vi.home.fixedLevel(5));
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
