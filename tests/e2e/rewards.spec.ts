// TASK-06: nhiệm vụ, hộp quà, album, trang phục, hình nền, nghỉ đúng giờ – chạy cả 3 khung hình.
import { expect, test, type Page } from '@playwright/test';
import { STICKERS } from '../../src/app/rewards';
import { vi } from '../../src/i18n/vi';
import {
  E2E_URL,
  makeProfile,
  playG1,
  playG2,
  readState,
  seedProfiles,
  startGame,
  tapSelector,
  todayKey,
  waitForAsk,
} from './helpers';

const FULL_DAY_MS = 15 * 60_000;

async function playG6(page: Page) {
  for (let i = 0; i < 10; i++) {
    const q = await waitForAsk(page, i);
    await tapSelector(page, `.g6-apple[data-i="${q.correct}"]`);
  }
}

async function profileState(page: Page) {
  return (await readState(page)).profiles[0]!;
}

async function noHorizontalScroll(page: Page) {
  const over = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(over).toBeLessThanOrEqual(1);
}

test.describe('TC-021 – nhiệm vụ hôm nay → hộp quà', () => {
  test('chơi G1, G2, G6 → 3 ô nhiệm vụ được đánh dấu, nhận 1 hộp quà, mở hộp có sticker vào album', async ({
    page,
  }) => {
    const p = makeProfile('An');
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);

    for (const m of ['reflex', 'focus', 'learn']) {
      await expect(page.getByTestId(`mission-${m}`)).toHaveAttribute('data-done', '0');
    }
    await expect(page.getByTestId('gift-button')).toBeDisabled();

    // Nhóm Phản xạ (G1)
    await startGame(page, 'G1');
    await playG1(page);
    await expect(page.getByTestId('result-mission')).toContainText(
      vi.result.missionDone(vi.home.missions.reflex),
    );
    await expect(page.getByTestId('gift-earned')).toBeHidden();
    await page.getByTestId('to-home').click();
    await expect(page.getByTestId('mission-reflex')).toHaveAttribute('data-done', '1');
    await expect(page.getByTestId('mission-focus')).toHaveAttribute('data-done', '0');

    // Nhóm Tập trung (G2)
    await startGame(page, 'G2');
    await playG2(page);
    await expect(page.getByTestId('result-mission')).toContainText(vi.result.missionsProgress(2));
    await page.getByTestId('to-home').click();
    await expect(page.getByTestId('mission-focus')).toHaveAttribute('data-done', '1');

    // Nhóm Học mà chơi (G6) → đủ 3 nhóm → 1 hộp quà
    await startGame(page, 'G6');
    await playG6(page);
    await expect(page.getByTestId('result')).toBeVisible();
    await expect(page.getByTestId('result-mission')).toContainText(vi.result.missionsProgress(3));
    await expect(page.getByTestId('gift-earned')).toContainText(vi.result.giftEarned);

    const day = (await profileState(page)).days[todayKey()]!;
    expect(day.missions).toEqual({ reflex: true, focus: true, learn: true, rewarded: true });
    expect(day.boxesEarned).toBeGreaterThanOrEqual(1);

    // Mở hộp: hoạt ảnh lắc → bung → sticker
    await page.getByTestId('open-gift').click();
    await expect(page.getByTestId('gift-modal')).toBeVisible();
    await expect(page.getByTestId('gift-box')).toBeVisible();
    await page.getByTestId('gift-box').click();
    const sticker = page.getByTestId('gift-sticker');
    await expect(sticker).toBeVisible();
    await expect(sticker).toHaveAttribute('data-id', /^stk-\d\d$/);
    await expect(page.getByTestId('gift-new')).toHaveText(vi.gift.newSticker);
    const id = (await sticker.getAttribute('data-id'))!;

    const opened = await profileState(page);
    expect(opened.stickers[id]).toBe(1);
    expect(opened.boxes.openedTotal).toBe(1);

    // Đóng → sticker nằm trong Album
    await page.getByTestId('gift-album').click();
    await expect(page.getByTestId('album')).toBeVisible();
    await expect(page.getByTestId('album-count')).toHaveText(vi.album.owned(1, 40));
    await expect(page.locator(`[data-testid="sticker-cell"][data-id="${id}"]`)).toHaveAttribute(
      'data-owned',
      '1',
    );
  });

  test('chơi nhiều lượt cùng một nhóm chỉ đánh dấu 1 lần và không thêm hộp nhiệm vụ', async ({
    page,
  }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto(E2E_URL);
    await startGame(page, 'G2');
    await playG2(page);
    await page.getByTestId('play-again').click();
    await page.getByTestId('start-game').click();
    await expect(page.getByTestId('countdown')).toBeHidden({ timeout: 6000 });
    await playG2(page);
    await expect(page.getByTestId('result')).toBeVisible();
    await expect(page.getByTestId('result-mission')).toBeHidden(); // nhóm này đã xong ở lượt trước
    const p = await profileState(page);
    expect(p.boxes.pending).toBeLessThanOrEqual(1); // tối đa 1 hộp do mốc 15 sao, không có hộp nhiệm vụ
    expect(p.days[todayKey()]!.missions.rewarded).toBe(false);
  });
});

test.describe('TC-022 – giới hạn hộp quà mỗi ngày', () => {
  test('đã nhận 3 hộp → đạt thêm 15 sao không nhận hộp mới, báo “Mai con nhận tiếp nhé!”', async ({
    page,
  }) => {
    await seedProfiles(page, [makeProfile('An', { totalStars: 14 }, { boxesEarned: 3 })]);
    await page.goto(E2E_URL);
    await startGame(page, 'G2');
    await playG2(page);

    await expect(page.getByTestId('result')).toBeVisible();
    await expect(page.getByTestId('gift-blocked')).toHaveText(vi.result.giftBlocked);
    await expect(page.getByTestId('gift-earned')).toBeHidden();
    await expect(page.getByTestId('open-gift')).toBeHidden();

    const p = await profileState(page);
    expect(p.totalStars).toBeGreaterThanOrEqual(15); // sao vẫn được cộng
    expect(p.boxes.pending).toBe(0);
    expect(p.days[todayKey()]!.boxesEarned).toBe(3);

    await page.getByTestId('to-home').click();
    await expect(page.getByTestId('gift-button')).toBeDisabled();
    await expect(page.getByTestId('gift-info')).toHaveText(vi.home.boxLimit);
  });

  test('giới hạn do phụ huynh đặt bằng 0 → không bao giờ có hộp', async ({ page }) => {
    const p = makeProfile('An', { totalStars: 14 });
    p.limits.maxBoxesPerDay = 0;
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await startGame(page, 'G2');
    await playG2(page);
    await expect(page.getByTestId('gift-blocked')).toBeVisible();
    expect((await profileState(page)).boxes.pending).toBe(0);
  });
});

test.describe('hộp quà – mở hộp', () => {
  test('hết giờ vẫn mở được hộp; bảo đảm Hiếm sau 5 hộp; “Mở tiếp” rồi “Xong”', async ({
    page,
  }) => {
    const p = makeProfile(
      'An',
      { boxes: { pending: 2, openedTotal: 5, sinceLastRare: 5 } },
      { playMs: FULL_DAY_MS },
    );
    await seedProfiles(page, [p]);
    await page.goto(E2E_URL);
    await expect(page.getByTestId('time-left')).toHaveText(vi.home.outOfTime);
    await expect(page.getByTestId('game-G1')).toBeDisabled();
    await expect(page.getByTestId('gift-pending')).toHaveText('2');

    await page.getByTestId('gift-button').click();
    await expect(page.getByTestId('gift-count')).toHaveText(vi.gift.remaining(2));
    await page.getByTestId('gift-box').click();
    await expect(page.getByTestId('gift-sticker')).toBeVisible();
    await expect(page.getByTestId('gift-sticker')).not.toHaveAttribute('data-rarity', 'common');
    await expect(page.getByTestId('gift-rarity')).not.toHaveText(vi.rarity.common!);

    await expect(page.getByTestId('gift-next')).toContainText(vi.gift.openNext(1));
    await page.getByTestId('gift-next').click();
    await expect(page.getByTestId('gift-box')).toBeVisible();
    await expect(page.getByTestId('gift-count')).toHaveText(vi.gift.remaining(1));
    await page.getByTestId('gift-box').click();
    await expect(page.getByTestId('gift-sticker')).toBeVisible();
    await page.getByTestId('gift-done').click();
    await expect(page.getByTestId('gift-modal')).toBeHidden();

    const after = await profileState(page);
    expect(after.boxes).toMatchObject({ pending: 0, openedTotal: 7 });
    expect(Object.values(after.stickers).reduce((a, b) => a + b, 0)).toBe(2);
    await expect(page.getByTestId('gift-button')).toBeDisabled();
  });

  test('sticker trùng: +3 sao và hiện “×2”; có đủ 40 sticker thì mọi hộp đều trùng', async ({
    page,
  }) => {
    const all = Object.fromEntries(STICKERS.map((s) => [s.id, 1]));
    await seedProfiles(page, [
      makeProfile(
        'An',
        { totalStars: 20, stickers: all, boxes: { pending: 1, openedTotal: 0, sinceLastRare: 0 } },
        {},
      ),
    ]);
    await page.goto(E2E_URL);
    await page.getByTestId('gift-button').click();
    await page.getByTestId('gift-box').click();
    await expect(page.getByTestId('gift-sticker')).toHaveAttribute('data-new', '0');
    await expect(page.getByTestId('gift-dup')).toContainText('×2');
    await expect(page.getByTestId('gift-dup')).toContainText('+3 sao');
    const p = await profileState(page);
    expect(p.totalStars).toBe(23);
    expect(Object.values(p.stickers).filter((n) => n === 2)).toHaveLength(1);
  });

  test('phím Esc và nút ✕ đóng hộp quà; hộp chưa mở vẫn còn', async ({ page }) => {
    await seedProfiles(page, [
      makeProfile('An', { boxes: { pending: 1, openedTotal: 0, sinceLastRare: 0 } }),
    ]);
    await page.goto(E2E_URL);
    await page.getByTestId('gift-button').click();
    await expect(page.getByTestId('gift-modal')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByTestId('gift-modal')).toBeHidden();
    await page.getByTestId('gift-button').click();
    await page.getByTestId('gift-close').click();
    await expect(page.getByTestId('gift-modal')).toBeHidden();
    expect((await profileState(page)).boxes.pending).toBe(1);
  });

  test('sticker đã mở được lưu ngay: tải lại trang vẫn còn trong album', async ({ page }) => {
    await seedProfiles(page, [
      makeProfile('An', { boxes: { pending: 1, openedTotal: 0, sinceLastRare: 0 } }),
    ]);
    await page.goto(E2E_URL);
    await page.getByTestId('gift-button').click();
    await page.getByTestId('gift-box').click();
    const id = (await page.getByTestId('gift-sticker').getAttribute('data-id'))!;
    await page.reload();
    await page.getByTestId('open-album').click();
    await expect(page.getByTestId('album-count')).toHaveText(vi.album.owned(1, 40));
    await expect(page.locator(`[data-testid="sticker-cell"][data-id="${id}"]`)).toHaveAttribute(
      'data-owned',
      '1',
    );
  });
});

test.describe('TC-030 – nghỉ đúng giờ', () => {
  async function playUntilOutOfTime(page: Page, stars = 3) {
    await seedProfiles(page, [
      makeProfile('An', { totalStars: stars }, { playMs: FULL_DAY_MS - 1500 }),
    ]);
    await page.goto(E2E_URL);
    await startGame(page, 'G2');
    await expect(page.getByTestId('play-banner')).toHaveText(vi.play.timeUp, { timeout: 6000 });
    await playG2(page);
    await expect(page.getByTestId('result')).toBeVisible();
    await page.getByTestId('to-rest').click();
    await expect(page.getByTestId('rest')).toBeVisible();
  }

  test('vừa hết giờ, bấm “Con nghỉ đây” → +2 sao “Nghỉ đúng giờ”, màn nghỉ gợi ý vận động; chỉ 1 lần/ngày', async ({
    page,
  }) => {
    await playUntilOutOfTime(page);
    await expect(page.getByTestId('rest-activity')).toBeVisible();
    const before = (await profileState(page)).totalStars;
    await expect(page.getByTestId('rest-now')).toHaveText(vi.rest.restNow);

    await page.getByTestId('rest-now').click();
    await expect(page.getByTestId('rest-reward')).toHaveText(vi.rest.restReward(2));
    await expect(page.getByTestId('rest-now')).toBeHidden();
    const after = await profileState(page);
    expect(after.totalStars).toBe(before + 2);
    expect(after.days[todayKey()]!.restOnTimeRewarded).toBe(true);

    // Về nhà rồi quay lại góc nghỉ: không nhận lần 2
    await page.getByRole('button', { name: vi.common.goHome }).click();
    await page.getByRole('button', { name: vi.home.goRest }).click();
    await expect(page.getByTestId('rest')).toBeVisible();
    await expect(page.getByTestId('rest-now')).toBeHidden();
    await expect(page.getByTestId('rest-reward')).toHaveText(vi.rest.restDone);
    expect((await profileState(page)).totalStars).toBe(before + 2);
  });

  test('không bấm trong 30 giây (rút còn 3 giây khi e2e) → nút biến mất, không bị trừ gì, không lời chê', async ({
    page,
  }) => {
    await playUntilOutOfTime(page);
    const before = (await profileState(page)).totalStars;
    await expect(page.getByTestId('rest-now')).toBeVisible();
    await expect(page.getByTestId('rest-now')).toBeHidden({ timeout: 8000 });
    await expect(page.getByTestId('rest-reward')).toBeHidden();
    await expect(page.getByTestId('rest-activity')).toBeVisible();
    const after = await profileState(page);
    expect(after.totalStars).toBe(before);
    expect(after.days[todayKey()]!.restOnTimeRewarded).toBe(false);
  });

  test('vào góc nghỉ từ Home (không phải vừa hết giờ) thì không có nút nhận sao', async ({
    page,
  }) => {
    await seedProfiles(page, [makeProfile('An', {}, { playMs: FULL_DAY_MS })]);
    await page.goto(E2E_URL);
    await page.getByRole('button', { name: vi.home.goRest }).click();
    await expect(page.getByTestId('rest')).toBeVisible();
    await expect(page.getByTestId('rest-now')).toBeHidden();
  });

  test('+2 sao vượt mốc 15 → có hộp quà ngay ở màn nghỉ; mở được khi đã hết giờ', async ({
    page,
  }) => {
    await playUntilOutOfTime(page, 12); // 12 + (1–3 sao của lượt) + 2 luôn ≥ 15
    await page.getByTestId('rest-now').click();
    await expect(page.getByTestId('rest-reward')).toBeVisible();
    const after = await profileState(page);
    expect(after.totalStars).toBeGreaterThanOrEqual(15);
    expect(after.boxes.pending).toBe(1);
    await expect(page.getByTestId('rest-open-gift')).toBeVisible();
    await page.getByTestId('rest-open-gift').click();
    await page.getByTestId('gift-box').click();
    await expect(page.getByTestId('gift-sticker')).toBeVisible();
    await page.getByTestId('gift-done').click();
    expect((await profileState(page)).boxes.pending).toBe(0);
  });
});

test.describe('mở khóa theo mốc sao', () => {
  test('qua 10 sao → báo ở màn Kết quả, khung Cầu Vồng quanh avatar', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An', { totalStars: 9 })]);
    await page.goto(E2E_URL);
    await expect(page.locator('.home-player .avatar-framed')).toHaveCount(0);
    await startGame(page, 'G2');
    await playG2(page);
    await expect(page.getByTestId('result-unlock')).toHaveText(
      vi.result.unlocked(vi.unlocks['frame-rainbow']!),
    );
    await expect(page.getByTestId('result-unlock-hint')).toHaveCount(0); // khung avatar tự áp dụng, không cần nhắc
    expect((await profileState(page)).unlocked).toContain('frame-rainbow');
    await page.getByTestId('to-home').click();
    await expect(page.locator('.home-player .avatar-framed')).toHaveCount(1);
  });

  test('qua 80 sao → báo mở khóa Nhạc Cụ Gõ kèm lời nhắc vào Album; không tự đổi âm', async ({
    page,
  }) => {
    await seedProfiles(page, [makeProfile('An', { totalStars: 78 })]);
    await page.goto(E2E_URL);
    await startGame(page, 'G2');
    await playG2(page);
    await expect(page.getByTestId('result-unlock')).toHaveText(
      vi.result.unlocked(vi.unlocks['sound-percussion']!),
    );
    await expect(page.getByTestId('result-unlock-hint')).toHaveText(vi.album.useHint);
    const p = await profileState(page);
    expect(p.unlocked).toContain('sound-percussion');
    expect(p.soundSetId).toBeNull(); // bé tự bấm “Dùng” ở Album
  });

  test('hồ sơ có sẵn nhiều sao được mở khóa phần thưởng đã đủ sao khi mở app', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An', { totalStars: 130 })]);
    await page.goto(E2E_URL);
    await expect(page.getByTestId('home-scene')).toBeVisible(); // hình nền Rừng Kẹo tự đặt (50 sao)
    const s = await profileState(page);
    expect(s.totalStars).toBe(130);
    expect(s.unlocked).toEqual([
      'frame-rainbow',
      'outfit-pilot',
      'bg-candy',
      'sound-percussion',
      'outfit-hero',
    ]);
    expect(s.outfitId).toBe('outfit-pilot'); // ô trống thì tự mặc món đầu tiên
    expect(s.backgroundId).toBe('bg-candy');
  });
});

test.describe('Album', () => {
  const owned = { 'stk-01': 2, 'stk-11': 1, 'stk-40': 1 };

  test('40 ô sticker (ô chưa có là bóng mờ), “×2”, phóng to sticker', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An', { totalStars: 20, stickers: owned })]);
    await page.goto(E2E_URL);
    await page.getByTestId('open-album').click();
    await expect(page.getByTestId('album')).toBeVisible();
    await expect(page.getByTestId('album-count')).toHaveText(vi.album.owned(3, 40));
    await expect(page.getByTestId('sticker-cell')).toHaveCount(40);
    await expect(page.locator('[data-testid="sticker-cell"][data-owned="1"]')).toHaveCount(3);
    await expect(
      page.locator('[data-testid="sticker-cell"][data-owned="0"] .is-locked'),
    ).toHaveCount(37);
    await expect(
      page.locator('[data-testid="sticker-cell"][data-id="stk-01"] [data-testid="sticker-count"]'),
    ).toHaveText('×2');

    await page.locator('[data-testid="sticker-cell"][data-id="stk-40"] button').click();
    await expect(page.getByTestId('sticker-zoom')).toBeVisible();
    await expect(page.getByTestId('sticker-zoom')).toContainText(vi.stickers['stk-40']!);
    await expect(page.getByTestId('sticker-zoom')).toContainText(vi.rarity.legendary!);
    await page.getByTestId('sticker-zoom').getByRole('button', { name: vi.album.close }).click();
    await expect(page.getByTestId('sticker-zoom')).toBeHidden();
    await noHorizontalScroll(page);
  });

  test('chưa có sticker nào: hiện lời gợi ý; Quay lại về Home', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An')]);
    await page.goto(E2E_URL);
    await page.getByTestId('open-album').click();
    await expect(page.getByTestId('album-count')).toHaveText(vi.album.owned(0, 40));
    await expect(page.getByText(vi.album.emptyHint)).toBeVisible();
    await expect(page.getByTestId('album-goal')).toContainText(vi.unlocks['frame-rainbow']!);
    await page.getByTestId('album-back').click();
    await expect(page.getByTestId('greeting')).toBeVisible();
  });

  test('trang phục: mở khóa theo sao, mặc lên linh vật, khóa thì không mặc được', async ({
    page,
  }) => {
    await seedProfiles(page, [makeProfile('An', { totalStars: 60 })]);
    await page.goto(E2E_URL);
    await page.getByTestId('open-album').click();
    await page.getByTestId('tab-outfits').click();
    await expect(page.getByTestId('tab-outfits')).toHaveAttribute('aria-selected', 'true');
    const pilot = page.getByTestId('equip-outfit-pilot');
    await expect(pilot).toBeVisible(); // 25 sao đã đủ
    await expect(page.locator('[data-id="outfit-hero"]')).toHaveAttribute('data-unlocked', '0'); // cần 120 sao
    await expect(page.getByTestId('equip-outfit-hero')).toHaveCount(0);
    await expect(page.locator('[data-id="outfit-hero"]')).toContainText(vi.album.needStars(120));

    await pilot.click();
    await expect(pilot).toHaveAttribute('aria-pressed', 'true');
    expect((await profileState(page)).outfitId).toBe('outfit-pilot');
    await page.getByTestId('outfit-none').click();
    expect((await profileState(page)).outfitId).toBeNull();
    await noHorizontalScroll(page);
  });

  test('hình nền: đặt Rừng Kẹo → hiện ở Home; Đáy Biển còn khóa; bỏ nền', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An', { totalStars: 60 })]);
    await page.goto(E2E_URL);
    await page.getByTestId('open-album').click();
    await page.getByTestId('tab-backgrounds').click();
    await expect(page.locator('[data-id="bg-sea"]')).toHaveAttribute('data-unlocked', '0');
    await expect(page.getByTestId('equip-bg-sea')).toHaveCount(0);
    await page.getByTestId('background-none').click();
    expect((await profileState(page)).backgroundId).toBeNull();
    await page.getByTestId('equip-bg-candy').click();
    expect((await profileState(page)).backgroundId).toBe('bg-candy');
    await page.getByTestId('album-back').click();
    await expect(page.getByTestId('home-scene')).toBeVisible();
    await noHorizontalScroll(page);
  });

  test('tab Đặc biệt: khung Cầu Vồng mở, Huy hiệu Vàng còn khóa; 300 sao thì Home hiện huy hiệu', async ({
    page,
  }) => {
    await seedProfiles(page, [makeProfile('An', { totalStars: 20 })]);
    await page.goto(E2E_URL);
    await expect(page.getByTestId('home-badge')).toHaveCount(0);
    await page.getByTestId('open-album').click();
    await page.getByTestId('tab-special').click();
    // 6 thẻ: Âm thanh gốc + Nhạc Cụ Gõ, Sóc Bo + Cú Mèo, Khung Cầu Vồng + Huy hiệu Vàng
    await expect(page.getByTestId('reward-card')).toHaveCount(6);
    await expect(page.locator('[data-id="frame-rainbow"]')).toHaveAttribute('data-unlocked', '1');
    await expect(page.locator('[data-id="badge-gold"]')).toHaveAttribute('data-unlocked', '0');
  });

  test('300 sao: mở hết phần thưởng, Home có huy hiệu vàng', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An', { totalStars: 300 })]);
    await page.goto(E2E_URL);
    await expect(page.getByTestId('home-badge')).toBeVisible();
    await page.getByTestId('open-album').click();
    await expect(page.getByTestId('album-goal')).toHaveText(vi.album.allUnlocked);
    await page.getByTestId('tab-special').click();
    await expect(page.locator('[data-unlocked="1"]')).toHaveCount(4);
  });
});

test.describe('hồ sơ riêng', () => {
  test('hộp quà và album của bé này không lẫn sang bé kia', async ({ page }) => {
    const a = makeProfile('A', { boxes: { pending: 2, openedTotal: 0, sinceLastRare: 0 } });
    const b = makeProfile('B', { stickers: { 'stk-05': 1 } });
    await seedProfiles(page, [a, b], a.id);
    await page.goto(E2E_URL);
    await page.getByTestId('profile-A').click();
    await expect(page.getByTestId('gift-pending')).toHaveText('2');
    await page.getByTestId('open-album').click();
    await expect(page.getByTestId('album-count')).toHaveText(vi.album.owned(0, 40));
    await page.getByTestId('album-back').click();
    await page.getByRole('button', { name: vi.home.switchPlayer }).click();
    await page.getByTestId('profile-B').click();
    await expect(page.getByTestId('gift-pending')).toHaveCount(0);
    await page.getByTestId('open-album').click();
    await expect(page.getByTestId('album-count')).toHaveText(vi.album.owned(1, 40));
  });
});
