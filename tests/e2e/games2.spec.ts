import { expect, test, type Page } from '@playwright/test';
import { vi } from '../../src/i18n/vi';
import {
  chooseDifficulty,
  g3Snapshot,
  g3WaitPets,
  g4Tap,
  g4WaitInput,
  g4State,
  g5Bot,
  g5ScheduleFor,
  g5Stats,
  hidePage,
  lastRound,
  makeProfile,
  openIntro,
  pressStart,
  readState,
  seedProfiles,
  startGame,
  withGame,
} from './helpers';

const FREEZE_URL = '/?e2e=1&seed=12345&freeze=1';

async function leaveRound(page: Page) {
  await page.getByTestId('pause-button').click();
  await page.getByRole('button', { name: vi.play.exit }).click();
  await expect(page.getByTestId('greeting')).toBeVisible();
}

async function hostBox(page: Page) {
  return (await page.getByTestId('game-host').boundingBox())!;
}

// ------------------------------------------------------------------ G3

test.describe('TC-013 – G3: thú, Nhím ngủ, chỗ trống', () => {
  test('chạm thú +điểm và thú xuất hiện lại chỗ khác; chạm Nhím và chỗ trống bị tính lỗi', async ({
    page,
  }) => {
    const p = withGame(makeProfile('An'), 'G3', { level: 5 }); // 2 thú + 1 Nhím
    await seedProfiles(page, [p]);
    await page.goto(FREEZE_URL);
    await startGame(page, 'G3');

    let snap = await g3WaitPets(page, false, 2);
    expect(snap.pets.filter((x) => x.decoy)).toHaveLength(1);
    const pet = snap.pets.find((x) => !x.decoy)!;
    // chạm thú cưng
    await page.touchscreen.tap(snap.x + pet.x, snap.y + pet.y);
    await expect.poll(async () => (await g3Snapshot(page))!.stats.hits).toBe(1);
    // thú “hú”, biến mất rồi xuất hiện lại ở chỗ khác sau ~300ms
    snap = await g3WaitPets(page, false, 2);
    expect(snap.pets.filter((x) => !x.decoy && x.x === pet.x && x.y === pet.y)).toHaveLength(0);

    // chạm Nhím đang ngủ → lỗi
    const hedgehog = snap.pets.find((x) => x.decoy)!;
    await page.touchscreen.tap(snap.x + hedgehog.x, snap.y + hedgehog.y);
    await expect.poll(async () => (await g3Snapshot(page))!.stats.decoyTaps).toBe(1);
    await expect(page.locator('.hint-bubble')).toHaveText(vi.g3.decoyHint);
    // chạm chỗ trống → lỗi (góc dưới-trái luôn trống vì thú cách mép)
    await page.touchscreen.tap(snap.x + 4, snap.y + snap.h - 4);
    await expect.poll(async () => (await g3Snapshot(page))!.stats.emptyTaps).toBe(1);

    // lượt kết thúc sau 6 giây (chế độ test) → điểm theo công thức
    await expect(page.getByTestId('result')).toBeVisible({ timeout: 15_000 });
    const r = await lastRound(page, p.id);
    expect(r).toMatchObject({ gameId: 'G3', level: 5 });
    expect(r.metrics).toMatchObject({ hits: 1, decoyTaps: 1, emptyTaps: 1 });
    const accuracy = 1 / 3;
    expect(r.score).toBeCloseTo(0.6 * accuracy + 0.4 * Math.min(1, 1 / (20 + 2 * 5)), 3);
    expect(r.metrics.accuracy).toBeCloseTo(accuracy, 3);
  });

  test('cấp 1: 1 thú, không có Nhím; thú có kích thước ≥ 48px', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto(FREEZE_URL);
    await startGame(page, 'G3');
    const snap = await g3WaitPets(page, false, 1);
    expect(snap.pets).toHaveLength(1);
    expect(snap.pets[0]!.r * 2).toBeGreaterThanOrEqual(48);
    await leaveRound(page);
  });

  test('chỉ nhận chạm đầu tiên khi 2 ngón cùng lúc', async ({ page }) => {
    const p = withGame(makeProfile('An'), 'G3', { level: 5 });
    await seedProfiles(page, [p]);
    await page.goto(FREEZE_URL);
    await startGame(page, 'G3');
    const snap = await g3WaitPets(page, false, 2);
    const [a, b] = snap.pets.filter((x) => !x.decoy) as [
      (typeof snap.pets)[0],
      (typeof snap.pets)[0],
    ];
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { x: snap.x + a.x, y: snap.y + a.y, id: 1 },
        { x: snap.x + b.x, y: snap.y + b.y, id: 2 },
      ],
    });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect.poll(async () => (await g3Snapshot(page))!.stats.hits).toBe(1); // chỉ 1 con được tính
    await page.waitForTimeout(300);
    expect((await g3Snapshot(page))!.stats.hits).toBe(1);
  });
});

test.describe('G3 – chuyển động (không đóng băng)', () => {
  test('thú chạy và luôn nằm trong khung; chơi trọn lượt có kết quả', async ({ page }) => {
    const p = withGame(makeProfile('An'), 'G3', { level: 7 }); // có đổi hướng bất ngờ
    await seedProfiles(page, [p]);
    await page.goto('/?e2e=1&seed=12345');
    await startGame(page, 'G3');
    const first = await g3WaitPets(page, false, 3);
    await page.waitForTimeout(500);
    const later = await g3Snapshot(page);
    const moved = later!.pets.some(
      (q, i) => Math.hypot(q.x - (first.pets[i]?.x ?? q.x), q.y - (first.pets[i]?.y ?? q.y)) > 5,
    );
    expect(moved).toBe(true);
    for (const q of later!.pets) {
      expect(q.x).toBeGreaterThanOrEqual(0);
      expect(q.x).toBeLessThanOrEqual(later!.w);
      expect(q.y).toBeGreaterThanOrEqual(0);
      expect(q.y).toBeLessThanOrEqual(later!.h);
    }
    await expect(page.getByTestId('result')).toBeVisible({ timeout: 15_000 });
    const r = await lastRound(page, p.id);
    expect(r.stars).toBe(1); // không chạm gì: vẫn được 1 sao nỗ lực
    expect(r.metrics.hits).toBe(0);
  });
});

// ------------------------------------------------------------------ G4

test.describe('TC-006 – G4: chuỗi ánh sáng', () => {
  test('đúng → chuỗi dài thêm 1; sai → thử lại cùng chuỗi 1 lần; sai lần 2 → kết thúc', async ({
    page,
  }) => {
    const p = makeProfile('An'); // cấp 1: 4 ô, chuỗi bắt đầu dài 2
    await seedProfiles(page, [p]);
    await page.goto('/?e2e=1&seed=12345');
    await openIntro(page, 'G4');
    await page.getByTestId('start-game').click();

    // Trong lúc phát chuỗi, chạm bị bỏ qua (không tính sai): chạm tức thời ngay khi ô đang sáng
    const duringShow = await page.evaluate(async () => {
      const find = () => document.querySelector<HTMLElement>('[data-testid="game-host"]');
      while (find()?.dataset.phase !== 'on') await new Promise((r) => requestAnimationFrame(r));
      const host = find()!;
      const pad = document.querySelector<HTMLElement>('.g4-pad[data-pad="1"]')!;
      const r = pad.getBoundingClientRect();
      pad.dispatchEvent(
        new PointerEvent('pointerdown', {
          pointerId: 77,
          isPrimary: true,
          pointerType: 'touch',
          clientX: r.left + r.width / 2,
          clientY: r.top + r.height / 2,
          bubbles: true,
        }),
      );
      return { phase: host.dataset.phase, stats: JSON.parse(host.dataset.stats ?? '{}') };
    });
    expect(duringShow.phase).toBe('on');
    expect(duringShow.stats.mistakes).toBe(0);
    let s = await g4WaitInput(page);
    expect(s.seq).toHaveLength(2);
    expect(s.stats.mistakes).toBe(0);

    // lặp đúng chuỗi → chuỗi mới dài 3
    for (const pad of s.seq) await g4Tap(page, pad);
    await expect.poll(async () => (await g4State(page)).seq.length).toBe(3);
    s = await g4WaitInput(page);
    expect(s.stats).toMatchObject({ maxSpan: 2, correctSequences: 1, mistakes: 0 });
    const seq3 = [...s.seq];

    // sai lần 1 → “Thử lại nhé!”, phát lại CÙNG chuỗi (cùng độ dài)
    await g4Tap(page, (seq3[0]! + 1) % 4);
    await expect(page.locator('.hint-bubble')).toHaveText(vi.g4.retry);
    s = await g4WaitInput(page);
    expect(s.seq).toEqual(seq3);
    expect(s.stats.mistakes).toBe(1);

    // sai lần 2 → kết thúc lượt
    await g4Tap(page, (seq3[0]! + 1) % 4);
    await expect(page.getByTestId('result')).toBeVisible({ timeout: 10_000 });
    const r = await lastRound(page, p.id);
    expect(r).toMatchObject({ gameId: 'G4', level: 1 });
    expect(r.metrics).toEqual({ maxSpan: 2, correctSequences: 1, pads: 4 });
    expect(r.score).toBeCloseTo(0.25, 10); // (2 − (2−1)) / 4
    await expect(page.getByTestId('metric-line').first()).toContainText('2');
  });

  test('cấp 4: 6 ô có màu + hình riêng; cấp 8: 9 ô Corsi cùng màu', async ({ page }) => {
    await seedProfiles(page, [withGame(makeProfile('An'), 'G4', { level: 4 })]);
    await page.goto('/?e2e=1&seed=12345');
    await startGame(page, 'G4');
    expect(await page.locator('.g4-pad').count()).toBe(6);
    expect(await page.locator('.g4-pad svg').count()).toBe(6); // mỗi ô 1 biểu tượng
    const classes = await page.locator('.g4-pad').evaluateAll((els) => els.map((e) => e.className));
    expect(new Set(classes.map((c) => c.replace(' is-lit', ''))).size).toBe(6);
    await leaveRound(page);
  });

  test('cấp 8: 9 ô kiểu Corsi, tất cả cùng màu, không biểu tượng', async ({ page }) => {
    await seedProfiles(page, [withGame(makeProfile('An'), 'G4', { level: 8 })]);
    await page.goto('/?e2e=1&seed=12345');
    await startGame(page, 'G4');
    expect(await page.locator('.g4-pad').count()).toBe(9);
    expect(await page.locator('.g4-corsi').count()).toBe(9);
    expect(await page.locator('.g4-pad svg').count()).toBe(0);
    await leaveRound(page);
  });

  test('tạm dừng giữa lúc phát chuỗi: tiếp tục vẫn phát đủ và chơi được', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto('/?e2e=1&seed=12345');
    await startGame(page, 'G4');
    await hidePage(page);
    await expect(page.getByTestId('pause-overlay')).toBeVisible();
    await page.getByRole('button', { name: vi.play.resume }).click();
    await expect(page.getByTestId('countdown')).toBeHidden({ timeout: 6000 });
    const s = await g4WaitInput(page);
    for (const pad of s.seq) await g4Tap(page, pad);
    await expect.poll(async () => (await g4State(page)).stats.correctSequences).toBe(1);
    await leaveRound(page);
  });
});

// ------------------------------------------------------------------ G5

function seedWithDouble(level: number): number {
  for (let seed = 1; seed <= 400; seed++) {
    const sch = g5ScheduleFor(seed, level);
    const byTime = new Map<number, number>();
    sch.forEach((n) => byTime.set(n.hitTime, (byTime.get(n.hitTime) ?? 0) + 1));
    for (const [t, c] of byTime) if (c === 2 && t >= 2800 && t <= 5500) return seed;
  }
  throw new Error('Không có seed nào có nốt đôi trong khoảng yêu cầu');
}

test.describe('G5 – nốt nhạc rơi', () => {
  test('bot chạm đúng nhịp mọi nốt → gần như toàn Tuyệt, điểm cao', async ({ page }) => {
    const p = withGame(makeProfile('An'), 'G5', { level: 4 });
    await seedProfiles(page, [p]);
    await page.goto('/?e2e=1&seed=12345');
    await startGame(page, 'G5');
    await g5Bot(page);
    await expect(page.getByTestId('result')).toBeVisible({ timeout: 15_000 });
    const r = await lastRound(page, p.id);
    expect(r).toMatchObject({ gameId: 'G5', level: 4 });
    const m = r.metrics as Record<string, number>;
    expect((m.perfectPct ?? 0) + (m.goodPct ?? 0)).toBeGreaterThanOrEqual(95);
    expect(m.extraTaps).toBe(0);
    expect(r.score).toBeGreaterThanOrEqual(0.9);
    expect(r.stars).toBe(3);
    expect(m.maxCombo).toBeGreaterThanOrEqual(5);
    await expect(page.getByTestId('metric-line').first()).toContainText('%');
  });

  test('tạm dừng giữa lượt rồi tiếp tục: lịch nốt không bị lệch (vị trí tính theo thời gian)', async ({
    page,
  }) => {
    const p = withGame(makeProfile('An'), 'G5', { level: 4 });
    await seedProfiles(page, [p]);
    await page.goto('/?e2e=1&seed=12345');
    await startGame(page, 'G5');
    await g5Bot(page, 0, 3400); // chạm các nốt đầu
    const before = await page.getByTestId('game-host').getAttribute('data-offset');
    await hidePage(page);
    await expect(page.getByTestId('pause-overlay')).toBeVisible();
    await page.waitForTimeout(1500); // nghỉ thật lâu
    await page.getByRole('button', { name: vi.play.resume }).click();
    await expect(page.getByTestId('countdown')).toBeHidden({ timeout: 6000 });
    expect(await page.getByTestId('game-host').getAttribute('data-offset')).not.toBe(before); // mốc thời gian đã dịch
    await g5Bot(page, 3400.001); // chạm các nốt còn lại theo mốc mới
    await expect(page.getByTestId('result')).toBeVisible({ timeout: 15_000 });
    const m = (await lastRound(page, p.id)).metrics as Record<string, number>;
    expect((m.perfectPct ?? 0) + (m.goodPct ?? 0)).toBeGreaterThanOrEqual(90);
  });

  test('chạm vào làn không có nốt → extraTaps (chống bấm bừa)', async ({ page }) => {
    const p = withGame(makeProfile('An'), 'G5', { level: 4 });
    await seedProfiles(page, [p]);
    await page.goto('/?e2e=1&seed=12345');
    await startGame(page, 'G5');
    const box = await hostBox(page);
    // nốt đầu tiên chỉ tới vạch sau ~2,4 giây → lúc này mọi làn đều trống
    await page.touchscreen.tap(box.x + box.width * 0.125, box.y + box.height * 0.8);
    await expect.poll(async () => (await g5Stats(page)).extraTaps).toBe(1);
    expect((await g5Stats(page)).perfect + (await g5Stats(page)).good).toBe(0);
    await leaveRound(page);
  });

  test('TC-007: 2 ngón cùng lúc vào nốt đôi → cả 2 nốt được tính (đa điểm)', async ({ page }) => {
    const level = 9;
    const seed = seedWithDouble(level);
    const sch = g5ScheduleFor(seed, level);
    const dbl = [...new Set(sch.map((n) => n.hitTime))].find(
      (t) => sch.filter((n) => n.hitTime === t).length === 2 && t >= 2800,
    )!;
    const lanes = sch.filter((n) => n.hitTime === dbl).map((n) => n.lane) as [number, number];
    const p = withGame(makeProfile('An'), 'G5', { level });
    await seedProfiles(page, [p]);
    await page.goto(`/?e2e=1&seed=${seed}`);
    await startGame(page, 'G5');
    const box = await hostBox(page);
    // đợi đến sát thời điểm nốt đôi rồi chạm 2 ngón thật (CDP) vào 2 làn
    await page.evaluate(async (t) => {
      const host = document.querySelector<HTMLElement>('[data-testid="game-host"]')!;
      while (performance.now() - Number(host.dataset.offset) < t - 25)
        await new Promise((r) => requestAnimationFrame(r));
    }, dbl);
    const laneW = box.width / 4;
    const y = box.y + box.height * 0.8;
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: lanes.map((l, i) => ({ x: box.x + (l + 0.5) * laneW, y, id: i + 1 })),
    });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect
      .poll(async () => {
        const st = await g5Stats(page);
        return st.perfect + st.good;
      })
      .toBeGreaterThanOrEqual(2);
    expect((await g5Stats(page)).extraTaps).toBe(0);
    await leaveRound(page);
  });

  test('TC-032: 4 làn, mỗi làn ≥ 48px; tablet ngang khung tối đa 640px', async ({ page }, info) => {
    await seedProfiles(page, [withGame(makeProfile('An'), 'G5', { level: 4 })]);
    await page.goto('/?e2e=1&seed=12345');
    await startGame(page, 'G5');
    const box = await hostBox(page);
    expect(box.width / 4).toBeGreaterThanOrEqual(48);
    if (info.project.name === 'tablet') {
      expect(box.width).toBeLessThanOrEqual(641);
      const vp = page.viewportSize()!;
      expect(Math.abs(box.x + box.width / 2 - vp.width / 2)).toBeLessThan(2); // canh giữa
    }
    await leaveRound(page);
  });
});

// ------------------------------------------------------------------ Độ khó thích ứng trên game mới

test.describe('Độ khó thích ứng với G3/G4/G5', () => {
  test('G4 chọn “Khó” → chơi ở cấp +2 mà cấp tự động không đổi', async ({ page }) => {
    const p = withGame(makeProfile('An'), 'G4', { level: 3 });
    await seedProfiles(page, [p]);
    await page.goto('/?e2e=1&seed=12345');
    await page.getByTestId('game-G4').click();
    await chooseDifficulty(page, 'hard');
    await pressStart(page);
    const params = JSON.parse(
      (await page.getByTestId('game-host').getAttribute('data-g4')) ?? '{}',
    );
    expect(params).toMatchObject({ level: 5, pads: 6 });
    await leaveRound(page);
    expect((await readState(page)).profiles[0]!.games.G4.level).toBe(3);
  });

  test('tùy chọn phụ huynh G3 “Nhím: bật” ở cấp 1 → có 1 Nhím', async ({ page }) => {
    const p = withGame(makeProfile('An'), 'G3', { options: { decoys: 'on' } });
    await seedProfiles(page, [p]);
    await page.goto(FREEZE_URL);
    await startGame(page, 'G3');
    const snap = await g3WaitPets(page, true, 1);
    expect(snap.pets.filter((x) => x.decoy)).toHaveLength(1);
    await leaveRound(page);
  });
});
