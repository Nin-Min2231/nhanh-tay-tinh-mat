// TASK-10 – viewport cho phép phóng to bằng 2 ngón (accessibility); riêng màn chơi chặn phóng.
// Dùng cử chỉ 2 ngón thật (CDP Input.dispatchTouchEvent) trên Chromium giả lập di động → chỉ chạy ở khung `phone`.
import { expect, test, type Page } from '@playwright/test';
import { vi } from '../../src/i18n/vi';
import { E2E_URL, makeProfile, openIntro, seedProfiles, startGame } from './helpers';

const scale = (page: Page) => page.evaluate(() => window.visualViewport?.scale ?? 1);

/** Hai ngón đặt cách tâm (cx, cy) `from` px rồi dang ra/chụm vào đến `to` px. */
async function pinch(page: Page, cx: number, cy: number, from: number, to: number) {
  const cdp = await page.context().newCDPSession(page);
  const pts = (d: number) => [
    { x: cx - d, y: cy, id: 1 },
    { x: cx + d, y: cy, id: 2 },
  ];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pts(from) });
  const steps = 12;
  for (let i = 1; i <= steps; i++) {
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: pts(from + ((to - from) * i) / steps),
    });
    await page.waitForTimeout(16);
  }
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await cdp.detach();
  // chờ trình duyệt áp dụng xong (để các kiểm tra “không phóng được” không đọc scale quá sớm rồi xanh giả)
  await page.waitForTimeout(200);
}

const spreadOut = (page: Page, cx = 180, cy = 370) => pinch(page, cx, cy, 20, 120);
const pinchIn = (page: Page, cx = 180, cy = 370) => pinch(page, cx, cy, 120, 20);

test.describe('Phóng to bằng 2 ngón: cho phép ở màn thường, chặn ở màn chơi', () => {
  test.beforeEach(async ({ page }, testInfo) => {
    test.skip(
      testInfo.project.name !== 'phone',
      'cử chỉ 2 ngón thật chỉ mô phỏng được ở chế độ di động (khung phone)',
    );
    await seedProfiles(page, [makeProfile('Bo')]);
    await page.goto(E2E_URL);
    await expect(page.getByTestId('greeting')).toBeVisible();
  });

  test('meta viewport không còn chặn phóng to', async ({ page }) => {
    const content = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(content).toContain('width=device-width');
    expect(content).not.toMatch(/user-scalable|maximum-scale/);
  });

  test('Home: dang 2 ngón thì phóng to, chụm lại thì về 1×', async ({ page }) => {
    expect(await scale(page)).toBeCloseTo(1, 2);
    await spreadOut(page);
    await expect.poll(() => scale(page)).toBeGreaterThan(1.5);
    await pinchIn(page);
    await expect.poll(() => scale(page)).toBeCloseTo(1, 1);
  });

  test('đang chơi: dang 2 ngón ở thanh trên hoặc vùng chơi cũng không phóng được', async ({
    page,
  }) => {
    await startGame(page, 'G1');
    await expect(page.locator('.play')).toHaveAttribute('data-phase', 'running');
    await spreadOut(page, 180, 30); // thanh tiêu đề
    expect(await scale(page)).toBeCloseTo(1, 2);
    await spreadOut(page, 180, 420); // vùng chơi
    expect(await scale(page)).toBeCloseTo(1, 2);
    await expect(page.locator('.play')).not.toHaveAttribute('data-zoomed', '1');
  });

  test('vào game khi trang đang phóng → tạm dừng + nhắc thu nhỏ; chụm lại mới chơi tiếp được', async ({
    page,
  }) => {
    await openIntro(page, 'G1');
    await spreadOut(page); // phóng to ở màn Giới thiệu (được phép)
    await expect.poll(() => scale(page)).toBeGreaterThan(1.5);
    // bấm bằng DOM (toạ độ chuột của Playwright không chính xác khi đang phóng)
    await page.getByTestId('start-game').evaluate((el) => (el as HTMLElement).click());

    const overlay = page.getByTestId('pause-overlay');
    await expect(overlay).toBeVisible();
    await expect(page.locator('.play')).toHaveAttribute('data-phase', 'paused');
    await expect(page.locator('.play')).toHaveAttribute('data-zoomed', '1');
    await expect(page.getByTestId('zoom-hint')).toHaveText(vi.play.zoomHint);
    const resume = page.getByRole('button', { name: vi.play.resume });
    await expect(resume).toBeDisabled();

    // chưa thu nhỏ thì không chơi tiếp được; chụm lại → hết nhắc, mở nút
    await pinchIn(page);
    await expect.poll(() => scale(page)).toBeCloseTo(1, 1);
    await expect(page.getByTestId('zoom-hint')).toBeHidden();
    await expect(page.locator('.play')).not.toHaveAttribute('data-zoomed', '1');
    await expect(resume).toBeEnabled();

    await resume.click();
    await expect(page.getByTestId('countdown')).toBeVisible();
    await expect(page.locator('.play')).toHaveAttribute('data-phase', 'running', {
      timeout: 6000,
    });
    // vào lượt rồi thì lại không phóng được nữa
    await spreadOut(page, 180, 420);
    expect(await scale(page)).toBeCloseTo(1, 2);
  });

  test('thoát game khi đang bị nhắc thu nhỏ vẫn về được Home và thu nhỏ ở đó', async ({ page }) => {
    await openIntro(page, 'G1');
    await spreadOut(page);
    await page.getByTestId('start-game').evaluate((el) => (el as HTMLElement).click());
    await expect(page.getByTestId('zoom-hint')).toBeVisible();
    await page
      .getByRole('button', { name: vi.play.exit })
      .evaluate((el) => (el as HTMLElement).click());
    await expect(page.getByTestId('greeting')).toBeVisible();
    await pinchIn(page);
    await expect.poll(() => scale(page)).toBeCloseTo(1, 1);
  });
});
