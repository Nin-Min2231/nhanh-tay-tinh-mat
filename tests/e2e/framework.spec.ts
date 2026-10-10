import { expect, test } from '@playwright/test';
import { vi } from '../../src/i18n/vi';
import {
  createProfileViaUi,
  hidePage,
  hitTarget,
  host,
  makeProfile,
  openG0Intro,
  playG0ToEnd,
  readRounds,
  readState,
  seedProfiles,
  startG0,
  targetPoint,
} from './helpers';

test.describe('TC-003 – hồ sơ', () => {
  test('tạo hồ sơ → linh vật chào bằng tên; mở lại vẫn nhớ', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: vi.profiles.newTitle })).toBeVisible();

    const submit = page.getByRole('button', { name: vi.profiles.submit });
    await expect(submit).toBeDisabled(); // chưa nhập tên
    await createProfileViaUi(page, 'Bé An', 2);

    await expect(page.getByTestId('greeting')).toHaveText(vi.home.greeting('Bé An'));
    await expect(page.getByTestId('time-left')).toHaveText(vi.home.timeLeft(15));

    await page.reload(); // “tắt hẳn app, mở lại”
    await expect(page.getByTestId('greeting')).toHaveText(vi.home.greeting('Bé An'));
    const state = await readState(page);
    expect(state.profiles).toHaveLength(1);
    expect(state.profiles[0]).toMatchObject({ name: 'Bé An', grade: 2, avatarId: 'cat' });
  });

  test('Home có 7 thẻ game chia 3 nhóm; game chưa làm hiện “Sắp có”', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto('/');
    for (const id of ['G1', 'G2', 'G3', 'G4', 'G5', 'G6', 'G7']) {
      const card = page.getByTestId(`game-${id}`);
      await expect(card).toBeDisabled();
      await expect(card).toContainText(vi.common.comingSoon);
    }
    await expect(page.getByTestId('game-G0')).toBeEnabled();
    for (const g of [vi.home.groups.reflex, vi.home.groups.focus, vi.home.groups.learn]) {
      await expect(page.getByRole('heading', { name: g, exact: true })).toBeVisible();
    }
    await expect(page.getByTestId('mission-reflex')).toBeVisible();
  });
});

test.describe('Luồng chơi: Intro → Chơi → Kết quả → lưu', () => {
  test('chơi xong G0: có sao, lưu RoundRecord, cộng sao + thời gian', async ({ page }) => {
    const p = makeProfile('An');
    await seedProfiles(page, [p]);
    await page.goto('/');
    await startG0(page);
    await playG0ToEnd(page);

    await expect(page.getByTestId('result')).toBeVisible();
    await expect(page.getByTestId('starburst')).toHaveAttribute('data-stars', /[123]/);
    await expect(page.getByTestId('praise')).toBeVisible();

    const rounds = (await readRounds(page, p.id)) as {
      gameId: string;
      stars: number;
      deviceClass: string;
    }[];
    expect(rounds).toHaveLength(1);
    expect(rounds[0]).toMatchObject({ gameId: 'G0', deviceId: 'e2e-device' });
    const state = await readState(page);
    const saved = state.profiles[0]!;
    expect(saved.totalStars).toBe(rounds[0]!.stars);
    expect(Object.values(saved.days)[0]!.playMs).toBeGreaterThan(0);

    await page.getByTestId('to-home').click();
    await expect(page.getByTestId('total-stars')).toContainText(String(saved.totalStars));
  });

  test('chạm chỗ trống bị tính lỗi, không tăng điểm (quy tắc 7)', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto('/');
    await startG0(page);
    const { x, y } = await targetPoint(page);
    const box = (await host(page).boundingBox())!;
    // chạm góc đối diện với vòng tròn
    const far = {
      x: x < box.width / 2 ? box.width - 10 : 10,
      y: y < box.height / 2 ? box.height - 10 : 10,
    };
    await host(page).tap({ position: far });
    await host(page).tap({ position: far });
    await expect(host(page)).toHaveAttribute('data-misses', '2');
    await expect(host(page)).not.toHaveAttribute('data-hits', /.+/);
  });

  test('chỉ nhận chạm đầu tiên khi 2 ngón chạm cùng lúc (TC-031)', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto('/');
    await startG0(page);
    const { x, y } = await targetPoint(page);
    const box = (await host(page).boundingBox())!;
    const far = {
      x: x < box.width / 2 ? box.width - 20 : 20,
      y: y < box.height / 2 ? box.height - 20 : 20,
    };

    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { x: box.x + x, y: box.y + y, id: 1 },
        { x: box.x + far.x, y: box.y + far.y, id: 2 },
      ],
    });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await expect(host(page)).toHaveAttribute('data-hits', '1');
    await expect(host(page)).not.toHaveAttribute('data-misses', /.+/); // ngón thứ 2 bị bỏ qua
  });
});

test.describe('TC-008 – tạm dừng', () => {
  test('ẩn app → tạm dừng; Chơi tiếp → đếm ngược → chơi tiếp được', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto('/');
    await startG0(page);
    await hitTarget(page, 1);

    await hidePage(page);
    await expect(page.getByTestId('pause-overlay')).toBeVisible();

    await page.getByRole('button', { name: vi.play.resume }).click();
    await expect(page.getByTestId('countdown')).toBeVisible();
    await expect(page.getByTestId('countdown')).toBeHidden({ timeout: 6000 });
    await hitTarget(page, 2); // chơi tiếp được, số lần chạm được giữ
  });

  test('thoát khi tạm dừng → lượt không được lưu', async ({ page }) => {
    const p = makeProfile('An');
    await seedProfiles(page, [p]);
    await page.goto('/');
    await startG0(page);
    await hitTarget(page, 1);
    await page.getByTestId('pause-button').click();
    await expect(page.getByTestId('pause-overlay')).toBeVisible();
    await page.getByRole('button', { name: vi.play.exit }).click();

    await expect(page.getByTestId('greeting')).toBeVisible();
    expect(await readRounds(page, p.id)).toHaveLength(0);
    const saved = (await readState(page)).profiles[0]!;
    expect(saved.totalStars).toBe(0);
    expect(Object.values(saved.days)[0]!.starsToday).toBe(0);
  });
});

test.describe('TC-011 – giới hạn thời gian', () => {
  test('đã chơi 13 phút → nhắc nhẹ còn 2 phút', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An', {}, { playMs: 13 * 60_000 })]);
    await page.goto('/');
    await expect(page.getByTestId('time-left')).toHaveText(vi.home.timeLeft(2));
    await startG0(page);
    await expect(page.getByTestId('play-banner')).toHaveText(vi.play.warn2min);
  });

  test('hết giờ giữa lượt → chơi nốt → màn nghỉ → thẻ game khóa', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An', {}, { playMs: 15 * 60_000 - 1500 })]);
    await page.goto('/');
    await startG0(page);
    await expect(page.getByTestId('play-banner')).toHaveText(vi.play.timeUp, { timeout: 6000 });
    await playG0ToEnd(page); // vẫn được chơi nốt lượt

    await expect(page.getByTestId('result')).toBeVisible();
    await page.getByTestId('to-rest').click();
    await expect(page.getByTestId('rest')).toBeVisible();
    await expect(page.getByTestId('rest-activity')).toBeVisible();

    await page.getByRole('button', { name: vi.common.goHome }).click();
    await expect(page.getByTestId('time-left')).toHaveText(vi.home.outOfTime);
    await expect(page.getByTestId('game-G0')).toBeDisabled();
  });
});

test.describe('TC-024 – nhiều hồ sơ', () => {
  test('đổi hồ sơ: sao và thời gian của từng bé tách riêng', async ({ page }) => {
    const a = makeProfile('A', { totalStars: 7 }, { playMs: 5 * 60_000 });
    const b = makeProfile('B');
    await seedProfiles(page, [a, b], a.id);
    await page.goto('/');
    await expect(page.getByTestId('profile-A')).toBeVisible(); // nhiều hồ sơ → hiện màn chọn người chơi

    await page.getByTestId('profile-A').click();
    await expect(page.getByTestId('total-stars')).toContainText('7');
    await expect(page.getByTestId('time-left')).toHaveText(vi.home.timeLeft(10));

    await page.getByRole('button', { name: vi.home.switchPlayer }).click();
    await page.getByTestId('profile-B').click();
    await expect(page.getByTestId('greeting')).toHaveText(vi.home.greeting('B'));
    await expect(page.getByTestId('total-stars')).toContainText('0');
    await expect(page.getByTestId('time-left')).toHaveText(vi.home.timeLeft(15));

    await page.getByRole('button', { name: vi.home.switchPlayer }).click();
    await page.getByTestId('profile-A').click();
    await expect(page.getByTestId('total-stars')).toContainText('7');
  });

  test('tối đa 5 hồ sơ', async ({ page }) => {
    const names = ['A', 'B', 'C', 'D', 'E'];
    await seedProfiles(
      page,
      names.map((n) => makeProfile(n)),
      null,
    );
    await page.goto('/');
    await expect(page.getByRole('button', { name: vi.profiles.addNew })).toHaveCount(0);
  });
});

test.describe('TC-033 – nút Quay lại của Android', () => {
  test('đang chơi → tạm dừng; Home → nhắc “Bấm lần nữa để thoát”', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto('/');
    await startG0(page);

    await page.goBack(); // vuốt Quay lại khi đang chơi
    await expect(page.getByTestId('pause-overlay')).toBeVisible();
    expect(page.url()).toContain('#/play/G0'); // chưa thoát game

    await page.getByRole('button', { name: vi.play.resume }).click();
    await expect(page.getByTestId('countdown')).toBeHidden({ timeout: 6000 });
    await hitTarget(page, 1); // chơi tiếp được

    await page.goBack();
    await page.getByRole('button', { name: vi.play.exit }).click();
    await expect(page.getByTestId('greeting')).toBeVisible();

    await page.goBack(); // ở Home vuốt Quay lại 1 lần
    await expect(page.getByTestId('toast')).toHaveText(vi.toast.exitHint);
    await expect(page.getByTestId('greeting')).toBeVisible(); // app chưa thoát
  });

  test('màn khác → về màn trước', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto('/');
    await openG0Intro(page);
    await page.goBack();
    await expect(page.getByTestId('greeting')).toBeVisible();

    await page.getByRole('button', { name: vi.home.album }).click();
    await expect(page.getByTestId('wip')).toBeVisible();
    await page.goBack();
    await expect(page.getByTestId('greeting')).toBeVisible();
    await expect(page.getByTestId('toast')).toHaveCount(0);
  });
});

test.describe('NF11 – cửa sổ nhỏ (mô phỏng TC-034)', () => {
  test('thu nhỏ cửa sổ khi đang chơi → tạm dừng + “Mở toàn màn hình để chơi”', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    const full = page.viewportSize()!;
    await page.goto('/');
    await startG0(page);

    await page.setViewportSize({ width: 280, height: 500 });
    await expect(page.getByTestId('too-small')).toBeVisible();
    await expect(page.getByTestId('too-small')).toContainText(vi.viewport.tooSmall);

    await page.setViewportSize(full);
    await expect(page.getByTestId('too-small')).toHaveCount(0);
    await expect(page.getByTestId('pause-overlay')).toBeVisible(); // vẫn đang tạm dừng
    await page.getByRole('button', { name: vi.play.resume }).click();
    await expect(page.getByTestId('countdown')).toBeHidden({ timeout: 6000 });
    await hitTarget(page, 1);
  });
});

test.describe('Lưu trữ lỗi & vùng chạm', () => {
  test('localStorage không ghi được → vẫn chạy bằng bộ nhớ tạm + banner cảnh báo', async ({
    page,
  }) => {
    await page.addInitScript(() => {
      Storage.prototype.setItem = () => {
        throw new Error('QuotaExceededError');
      };
    });
    await page.goto('/');
    await createProfileViaUi(page, 'An');
    await expect(page.getByTestId('greeting')).toHaveText(vi.home.greeting('An'));
    await expect(page.getByTestId('storage-banner')).toHaveText(vi.banner.storage);
  });

  test('nút chính ≥ 64px, vùng chạm khác ≥ 48px (NF04)', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto('/');
    for (const name of [vi.home.album, vi.home.switchPlayer, vi.home.parent]) {
      const b = (await page.getByRole('button', { name }).boundingBox())!;
      expect(b.width).toBeGreaterThanOrEqual(48);
      expect(b.height).toBeGreaterThanOrEqual(48);
    }
    const card = (await page.getByTestId('game-G0').boundingBox())!;
    expect(card.height).toBeGreaterThanOrEqual(64);
    await openG0Intro(page);
    const start = (await page.getByTestId('start-game').boundingBox())!;
    expect(start.height).toBeGreaterThanOrEqual(64);
    for (const radio of await page.getByRole('radio').all()) {
      expect((await radio.boundingBox())!.height).toBeGreaterThanOrEqual(48);
    }
  });

  test('không gửi request ra ngoài domain (NF05)', async ({ page, baseURL }) => {
    const external: string[] = [];
    page.on('request', (r) => {
      if (
        !r.url().startsWith(baseURL!) &&
        !r.url().startsWith('data:') &&
        !r.url().startsWith('blob:')
      ) {
        external.push(r.url());
      }
    });
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto('/');
    await startG0(page);
    await playG0ToEnd(page);
    await expect(page.getByTestId('result')).toBeVisible();
    expect(external).toEqual([]);
  });
});
