import { test, expect } from '../fixtures';

test('saved theme is applied when loading a page other than the theme page', async ({ page }) => {
  await page.goto('/leaderboard');
  await page.evaluate(() => localStorage.setItem('theme', 'dark'));
  await page.reload();
  await expect(page.locator('body')).toHaveClass(/nb-theme-dark/);
});
