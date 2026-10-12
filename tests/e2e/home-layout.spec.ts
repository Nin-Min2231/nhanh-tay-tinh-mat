// TASK-10 – Home trên tablet ngang: 3 nhóm game cạnh nhau, nửa trên chia 2 cột, gần như không phải cuộn.
// Điện thoại và tablet dọc phải giữ bố cục xếp dọc như cũ.
import { expect, test, type Page } from '@playwright/test';
import { E2E_URL, makeProfile, seedProfiles } from './helpers';

interface Box {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Hộp (toạ độ trang, tính cả phần đã cuộn) của mọi phần tử khớp bộ chọn. */
async function boxes(page: Page, selector: string): Promise<Box[]> {
  return page.$$eval(selector, (els) =>
    els.map((e) => {
      const r = e.getBoundingClientRect();
      return { x: r.x + scrollX, y: r.y + scrollY, w: r.width, h: r.height };
    }),
  );
}

const pageSize = (page: Page) =>
  page.evaluate(() => ({
    innerW: window.innerWidth,
    innerH: window.innerHeight,
    scrollW: document.scrollingElement!.scrollWidth,
    scrollH: document.scrollingElement!.scrollHeight,
  }));

test.describe('Home – bố cục theo khung hình', () => {
  test.beforeEach(async ({ page }) => {
    await seedProfiles(page, [makeProfile('Bo')]); // hồ sơ mới: banner “Thử thách tuần” đang hiện (trường hợp cao nhất)
    await page.goto(E2E_URL);
    await expect(page.getByTestId('game-G1')).toBeVisible();
  });

  test('tablet ngang: cả 7 thẻ trên một hàng, 3 nhóm cạnh nhau, Home gần như vừa một màn', async ({
    page,
  }, info) => {
    test.skip(info.project.name !== 'tablet', 'chỉ áp dụng cho tablet ngang');
    const cards = await boxes(page, '.game-card');
    expect(cards).toHaveLength(7);
    for (const c of cards) expect(Math.abs(c.y - cards[0]!.y)).toBeLessThan(2);

    const groups = await boxes(page, '.group');
    expect(groups).toHaveLength(3);
    expect(new Set(groups.map((g) => Math.round(g.y))).size).toBe(1);
    // nhóm có nhiều thẻ hơn thì rộng hơn (3 : 2 : 2)
    expect(groups[0]!.w).toBeGreaterThan(groups[1]!.w);
    expect(Math.abs(groups[1]!.w - groups[2]!.w)).toBeLessThan(4);

    // nửa trên: lời chào + giờ bên trái, nhiệm vụ + hộp quà bên phải
    const hello = (await boxes(page, '.home-hello'))[0]!;
    const missions = (await boxes(page, '.home-missions'))[0]!;
    expect(missions.x).toBeGreaterThan(hello.x + hello.w - 2);

    const s = await pageSize(page);
    expect(s.scrollW).toBeLessThanOrEqual(s.innerW);
    expect(s.scrollH).toBeLessThanOrEqual(s.innerH + 8);
  });

  test('tablet 1200×760 (hẹp nhất còn xếp 3 cột): chữ và chip cấp độ không tràn thẻ', async ({
    page,
  }, info) => {
    test.skip(info.project.name !== 'tablet', 'chỉ áp dụng cho tablet ngang');
    await page.setViewportSize({ width: 1200, height: 760 });
    await expect.poll(async () => (await boxes(page, '.group')).length).toBe(3);
    const groups = await boxes(page, '.group');
    expect(new Set(groups.map((g) => Math.round(g.y))).size).toBe(1);
    const overflowing = await page.$$eval(
      '.game-card',
      (cards) =>
        cards.filter((c) => {
          const cr = c.getBoundingClientRect();
          return [...c.querySelectorAll<HTMLElement>('.game-meta, .game-name')].some((m) => {
            const r = m.getBoundingClientRect();
            return (
              r.left < cr.left - 1 || r.right > cr.right + 1 || m.scrollWidth > m.clientWidth + 1
            );
          });
        }).length,
    );
    expect(overflowing).toBe(0);
    const s = await pageSize(page);
    expect(s.scrollW).toBeLessThanOrEqual(s.innerW);
  });

  test('điện thoại / tablet dọc: các nhóm vẫn xếp dọc như cũ, không tràn ngang', async ({
    page,
  }, info) => {
    test.skip(info.project.name === 'tablet', 'tablet ngang có bố cục riêng');
    const groups = await boxes(page, '.group');
    expect(groups).toHaveLength(3);
    for (let i = 1; i < groups.length; i++) {
      expect(groups[i]!.y).toBeGreaterThanOrEqual(groups[i - 1]!.y + groups[i - 1]!.h - 1);
    }
    // hello → thời gian → nhiệm vụ vẫn theo thứ tự từ trên xuống
    const hello = (await boxes(page, '.home-hello'))[0]!;
    const time = (await boxes(page, '.home-time'))[0]!;
    const missions = (await boxes(page, '.home-missions'))[0]!;
    expect(time.y).toBeGreaterThan(hello.y);
    expect(missions.y).toBeGreaterThan(time.y);
    const s = await pageSize(page);
    expect(s.scrollW).toBeLessThanOrEqual(s.innerW);
  });
});
