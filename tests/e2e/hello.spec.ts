import { expect, test } from '@playwright/test';

test('mở trang và thấy tiêu đề', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Nhanh Tay Tinh Mắt' })).toBeVisible();
});
