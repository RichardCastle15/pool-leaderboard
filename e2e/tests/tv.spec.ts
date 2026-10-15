import { test, expect } from '../fixtures';
import { clearKillerGame, startKillerGame, KILLER_PLAYERS } from '../killer-helpers';

// The /tv page is plain ES5 for old Samsung TV browsers (Chromium 47); it polls GET /api/killer.
test.describe('TV killer page', () => {
  test('shows no game when none is in progress', async ({ page }) => {
    await clearKillerGame(page);
    await page.goto('/tv');
    await expect(page).toHaveURL(/\/tv\/$/);
    await expect(page.getByText('No game in progress')).toBeVisible();
  });

  test('shows the players of the game in progress and updates live', async ({ page, browser }) => {
    await startKillerGame(page);
    const tvContext = await browser.newContext();
    const tv = await tvContext.newPage();
    await tv.goto('/tv');
    for (const name of KILLER_PLAYERS) {
      await expect(tv.getByRole('cell', { name })).toBeVisible();
    }
    await expect(tv.getByText('◀ turn')).toBeVisible();
    await clearKillerGame(page);
    await expect(tv.getByText('No game in progress')).toBeVisible();
    await tvContext.close();
  });
});
