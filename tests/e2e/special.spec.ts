// TASK-10 đợt 2: linh vật Cú Mèo (230 sao) và bộ âm thanh Nhạc Cụ Gõ (80 sao) – chọn ở Album → Đặc biệt.
import { expect, test, type Page } from '@playwright/test';
import { vi } from '../../src/i18n/vi';
import { E2E_URL, g1Snapshot, makeProfile, readState, seedProfiles, startGame } from './helpers';

declare global {
  interface Window {
    __tones: { type: string; freq: number }[];
  }
}

const profileState = async (page: Page, i = 0) => (await readState(page)).profiles[i]!;
const homeMascot = (page: Page) => page.locator('.home-hello svg.mascot');
const openSpecialTab = async (page: Page) => {
  await page.getByTestId('open-album').click();
  await page.getByTestId('tab-special').click();
  await expect(page.getByTestId('special-grid')).toBeVisible();
};

/** Ghi lại mọi nốt app thật sự phát: dạng sóng và tần số bắt đầu (Hz). */
async function recordTones(page: Page) {
  await page.addInitScript(() => {
    window.__tones = [];
    const first = new WeakMap<object, number>();
    const setAt = AudioParam.prototype.setValueAtTime;
    AudioParam.prototype.setValueAtTime = function (v: number, t: number) {
      if (!first.has(this)) first.set(this, v); // giá trị đầu tiên của từng tham số (với tần số = freq của nốt)
      return setAt.call(this, v, t);
    };
    const start = OscillatorNode.prototype.start;
    OscillatorNode.prototype.start = function (...a: [number?]) {
      window.__tones.push({ type: this.type, freq: first.get(this.frequency) ?? 0 });
      return start.apply(this, a);
    };
  });
}

test.describe('Album → Đặc biệt: linh vật Cú Mèo', () => {
  test('chưa đủ 230 sao: thẻ Cú Mèo bị khóa, không chọn được; Sóc Bo luôn dùng được', async ({
    page,
  }) => {
    await seedProfiles(page, [makeProfile('An', { totalStars: 100 })]);
    await page.goto(E2E_URL);
    await openSpecialTab(page);
    await expect(page.locator('[data-id="mascot-owl"]')).toHaveAttribute('data-unlocked', '0');
    await expect(page.locator('[data-id="mascot-owl"]')).toContainText(vi.album.needStars(230));
    await expect(page.getByTestId('equip-mascot-owl')).toHaveCount(0);
    await expect(page.getByTestId('equip-mascot-default')).toHaveAttribute('aria-pressed', 'true');
  });

  test('230 sao: mở khóa KHÔNG tự đổi linh vật; bé bấm Dùng → Home hiện Cú; tải lại vẫn giữ; về Sóc Bo', async ({
    page,
  }) => {
    await seedProfiles(page, [makeProfile('An', { totalStars: 230 })]);
    await page.goto(E2E_URL);
    await expect(homeMascot(page)).toBeVisible();
    await expect(homeMascot(page)).not.toHaveClass(/mascot-owl/); // vẫn Sóc Bo
    expect((await profileState(page)).unlocked).toContain('mascot-owl');
    expect((await profileState(page)).mascotId).toBeNull();

    await openSpecialTab(page);
    const use = page.getByTestId('equip-mascot-owl');
    await expect(use).toBeVisible();
    await use.click();
    await expect(use).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByTestId('equip-mascot-default')).toHaveAttribute('aria-pressed', 'false');
    expect((await profileState(page)).mascotId).toBe('mascot-owl');

    await page.getByTestId('album-back').click();
    await expect(homeMascot(page)).toHaveClass(/mascot-owl/);
    await expect(homeMascot(page)).toHaveAttribute('aria-label', vi.app.mascotOwl);

    await page.reload();
    await expect(homeMascot(page)).toHaveClass(/mascot-owl/); // lưu bền

    await openSpecialTab(page);
    await page.getByTestId('equip-mascot-default').click();
    expect((await profileState(page)).mascotId).toBeNull();
    await page.getByTestId('album-back').click();
    await expect(homeMascot(page)).not.toHaveClass(/mascot-owl/);
  });

  test('Cú Mèo không mặc trang phục: tab Trang phục nhắc “dành cho Sóc Bo”; Sóc Bo thì không có lời nhắc', async ({
    page,
  }) => {
    await seedProfiles(page, [makeProfile('An', { totalStars: 230, mascotId: 'mascot-owl' })]);
    await page.goto(E2E_URL);
    await page.getByTestId('open-album').click();
    await page.getByTestId('tab-outfits').click();
    await expect(page.getByTestId('outfit-owl-note')).toHaveText(vi.album.outfitsForSquirrel);
    // xem trước trong tab này luôn là Sóc Bo
    await expect(page.locator('[data-testid="outfit-grid"] svg.mascot-owl')).toHaveCount(0);
    await page.getByTestId('tab-special').click();
    await page.getByTestId('equip-mascot-default').click();
    await page.getByTestId('tab-outfits').click();
    await expect(page.getByTestId('outfit-owl-note')).toHaveCount(0);
  });

  test('mỗi bé một linh vật: đổi hồ sơ thì Home đổi theo', async ({ page }) => {
    const a = makeProfile('A', { totalStars: 230, mascotId: 'mascot-owl' });
    const b = makeProfile('B', { totalStars: 230 });
    await seedProfiles(page, [a, b], a.id);
    await page.goto(E2E_URL);
    await page.getByTestId('profile-A').click();
    await expect(homeMascot(page)).toHaveClass(/mascot-owl/);
    await page.getByRole('button', { name: vi.home.switchPlayer }).click();
    await page.getByTestId('profile-B').click();
    await expect(homeMascot(page)).not.toHaveClass(/mascot-owl/);
  });

  test('dữ liệu sửa tay: chọn Cú Mèo nhưng chưa mở khóa → vẫn là Sóc Bo', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An', { totalStars: 10, mascotId: 'mascot-owl' })]);
    await page.goto(E2E_URL);
    await expect(homeMascot(page)).toBeVisible();
    await expect(homeMascot(page)).not.toHaveClass(/mascot-owl/);
  });

  test('Cú Mèo cũng dẫn dắt trong game G6 và G7 (hình trong bong bóng câu hỏi)', async ({
    page,
  }) => {
    await seedProfiles(page, [makeProfile('An', { totalStars: 230, mascotId: 'mascot-owl' })]);
    await page.goto(E2E_URL);
    await startGame(page, 'G6');
    await expect(page.locator('.g6-mascot svg.mascot-owl')).toBeVisible();
    await page.getByTestId('pause-button').click();
    await page.getByRole('button', { name: vi.play.exit }).click();
    await expect(page.getByTestId('greeting')).toBeVisible();
    // G7 ẩn linh vật ở khung hình thấp (.g7-compact) nên chỉ kiểm khi có hiện
    await startGame(page, 'G7');
    const g7 = page.locator('.g7-mascot svg');
    if (await g7.isVisible()) await expect(g7).toHaveClass(/mascot-owl/);
  });

  test('Cú Mèo hiện cả ở màn Nghỉ (không chỉ ở Home)', async ({ page }) => {
    // hết giờ chơi hôm nay → Home có nút “Đến góc nghỉ”
    await seedProfiles(page, [
      makeProfile('An', { totalStars: 230, mascotId: 'mascot-owl' }, { playMs: 15 * 60_000 }),
    ]);
    await page.goto(E2E_URL);
    await page.getByRole('button', { name: vi.home.goRest }).click();
    await expect(page.locator('svg.mascot.mascot-owl.mascot-sleep')).toBeVisible();
  });
});

test.describe('Album → Đặc biệt: bộ âm thanh Nhạc Cụ Gõ', () => {
  test('chưa đủ 80 sao: khóa; đủ thì chọn được, lưu bền, về âm gốc được', async ({ page }) => {
    await seedProfiles(page, [makeProfile('An', { totalStars: 60 })]);
    await page.goto(E2E_URL);
    await openSpecialTab(page);
    await expect(page.locator('[data-id="sound-percussion"]')).toHaveAttribute(
      'data-unlocked',
      '0',
    );
    await expect(page.getByTestId('equip-sound-percussion')).toHaveCount(0);
    await expect(page.getByTestId('listen-sound-percussion')).toHaveCount(0);
    await expect(page.getByTestId('equip-sound-default')).toHaveAttribute('aria-pressed', 'true');
  });

  test('80 sao: mở khóa KHÔNG tự đổi âm; bé bấm Dùng → lưu; tải lại vẫn giữ; về âm gốc', async ({
    page,
  }) => {
    await seedProfiles(page, [makeProfile('An', { totalStars: 80 })]);
    await page.goto(E2E_URL);
    expect((await profileState(page)).unlocked).toContain('sound-percussion');
    expect((await profileState(page)).soundSetId).toBeNull();
    await openSpecialTab(page);
    const use = page.getByTestId('equip-sound-percussion');
    await use.click();
    await expect(use).toHaveAttribute('aria-pressed', 'true');
    expect((await profileState(page)).soundSetId).toBe('sound-percussion');
    await page.reload(); // đang ở #/album nên vẫn ở Album sau khi tải lại
    await page.getByTestId('tab-special').click();
    await expect(page.getByTestId('equip-sound-percussion')).toHaveAttribute(
      'aria-pressed',
      'true',
    );
    await page.getByTestId('equip-sound-default').click();
    expect((await profileState(page)).soundSetId).toBeNull();
  });

  test('“Nghe thử” phát đúng bộ âm: âm gốc là 4 nốt sine, Nhạc Cụ Gõ có họa âm + triangle và không sóng gắt', async ({
    page,
  }) => {
    await recordTones(page);
    await seedProfiles(page, [makeProfile('An', { totalStars: 80 })], 'id-An', { sound: true });
    await page.goto(E2E_URL);
    await openSpecialTab(page);

    const play = async (testid: string) => {
      await page.evaluate(() => (window.__tones.length = 0));
      await page.getByTestId(testid).click();
      await expect.poll(() => page.evaluate(() => window.__tones.length)).toBeGreaterThan(0);
      return page.evaluate(() => window.__tones.map((t) => ({ ...t })));
    };

    const def = await play('listen-sound-default');
    expect(def.map((t) => Math.round(t.freq))).toEqual([523, 659, 784, 1047]); // arpeggio gốc
    expect(def.every((t) => t.type === 'sine')).toBe(true);

    const perc = await play('listen-sound-percussion');
    const freqs = perc.map((t) => Math.round(t.freq));
    expect(freqs).toContain(523); // C5 mộc cầm
    expect(freqs).toContain(2093); // tiếng triangle leng keng cuối
    expect(freqs.length).toBeGreaterThan(def.length); // có họa âm
    expect(perc.some((t) => t.type === 'triangle')).toBe(true);
    expect(perc.every((t) => ['sine', 'triangle'].includes(t.type))).toBe(true); // không buzz
  });

  test('đang chơi: chạm đúng bóng xanh phát “ding” của bộ đang dùng (đàn gõ C6 1046 Hz, âm gốc 880 Hz)', async ({
    page,
  }) => {
    await recordTones(page);
    await seedProfiles(
      page,
      [makeProfile('An', { totalStars: 80, soundSetId: 'sound-percussion' })],
      'id-An',
      { sound: true },
    );
    await page.goto(E2E_URL);
    await startGame(page, 'G1');
    await expect
      .poll(async () => (await g1Snapshot(page))?.balls.some((b) => b.kind === 'green'))
      .toBe(true);
    const snap = (await g1Snapshot(page))!;
    const green = snap.balls.find((b) => b.kind === 'green')!;
    await page.evaluate(() => (window.__tones.length = 0));
    await page.touchscreen.tap(snap.x + green.x, snap.y + green.y);
    await expect.poll(async () => (await g1Snapshot(page))!.stats.hits).toBe(1);
    const freqs = await page.evaluate(() => window.__tones.map((t) => Math.round(t.freq)));
    expect(freqs).toContain(1047);
    expect(freqs).not.toContain(880);
  });
});
