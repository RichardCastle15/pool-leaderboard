import { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { clearKillerGame, selectAndStartKiller, startKillerGame } from '../killer-helpers';

// Issue #95: starting a killer game while another is in progress used to silently throw the first one away.
test.describe('Starting a killer game while one is in progress', () => {
  const firstPlayers = ['Alice A', 'Bob B', 'Carol C'];
  const secondPlayers = ['Bob B', 'Carol C', 'Dave D'];

  const dialog = (page: Page) => page.getByText('A killer game is already in progress');

  /** Names shown on the killer page, in whatever (shuffled) turn order the game has. */
  const playersOnKillerPage = async (page: Page) =>
    (await page.getByRole('row').getByRole('cell').allTextContents())
      .filter(text => /^[A-Z][a-z]+ [A-Z]$/.test(text.trim()))
      .map(text => text.trim())
      .sort();

  test.beforeEach(async ({ page }) => {
    await startKillerGame(page, firstPlayers);
  });

  test('warns, naming who is in the game, instead of silently replacing it', async ({ page }) => {
    await selectAndStartKiller(page, secondPlayers);

    await expect(dialog(page)).toBeVisible();
    // Listed in the game's (shuffled) turn order, so check each name rather than one exact string.
    const message = page.locator('#replace-killer-message');
    for (const name of firstPlayers) {
      await expect(message).toContainText(name);
    }
    await expect(page.getByText(/abandon it/)).toBeVisible();
    await expect(page).toHaveURL(/\/leaderboard$/);
  });

  test('cancelling keeps the original game and stays on the leaderboard', async ({ page }) => {
    await selectAndStartKiller(page, secondPlayers);
    await page.getByRole('button', { name: 'Cancel' }).click();

    await expect(dialog(page)).toBeHidden();
    await expect(page).toHaveURL(/\/leaderboard$/);
    await expect(page.locator('nb-action', { hasText: 'Start killer' })).toHaveAttribute('aria-busy', 'false');

    await page.goto('/killer');
    await expect(page.getByRole('row')).toHaveCount(firstPlayers.length);
    expect(await playersOnKillerPage(page)).toEqual(firstPlayers);
  });

  test('confirming abandons the original game and starts the new one', async ({ page }) => {
    await selectAndStartKiller(page, secondPlayers);
    await page.getByRole('button', { name: 'Abandon & start new' }).click();

    await expect(page).toHaveURL(/\/killer$/);
    await expect(page.getByRole('row')).toHaveCount(secondPlayers.length);
    expect(await playersOnKillerPage(page)).toEqual(secondPlayers);
  });

  test('abandoning to start a new game records nothing on the leaderboard', async ({ page, sql }) => {
    await selectAndStartKiller(page, secondPlayers);
    await page.getByRole('button', { name: 'Abandon & start new' }).click();
    await expect(page).toHaveURL(/\/killer$/);

    expect(await sql('SELECT COUNT(*)::int AS count FROM killer_game')).toEqual([{ count: 0 }]);
    expect(await sql('SELECT rating FROM rating ORDER BY id')).toEqual([
      { rating: 1100 }, { rating: 1050 }, { rating: 1000 }, { rating: 950 }]);
  });

  test.describe('when the game in progress has already been won', () => {
    /** Wins the current three-player game, returns the winner, and goes back to start another. */
    async function winThenStartAnother(page: Page): Promise<string> {
      await page.goto('/killer');
      await page.getByLabel('Early black').click();
      await page.getByLabel('Early black').click();
      const banner = await page.getByText(/ wins!$/).textContent();
      const winner = banner!.replace(/ wins!$/, '').trim();
      await selectAndStartKiller(page, secondPlayers);
      return winner;
    }

    test('says who won and that the result will be discarded, not that a game is in progress', async ({ page }) => {
      const winner = await winThenStartAnother(page);

      await expect(page.locator('#replace-killer-message')).toContainText(
        `${winner} won the last killer game, but the result hasn't been recorded yet.`);
      await expect(page.locator('#replace-killer-message')).toContainText('discard it');
      await expect(page.getByText('A killer game is already in progress')).toBeHidden();
    });

    test('"Go to killer" takes you to the finished game so the result can be confirmed', async ({ page }) => {
      const winner = await winThenStartAnother(page);
      await page.getByRole('button', { name: 'Go to killer' }).click();

      await expect(page).toHaveURL(/\/killer$/);
      await expect(page.getByText(`${winner} wins!`)).toBeVisible();
      expect(await playersOnKillerPage(page)).toEqual(firstPlayers);
    });

    test('abandoning discards the unrecorded result', async ({ page, sql }) => {
      await winThenStartAnother(page);
      await page.getByRole('button', { name: 'Abandon & start new' }).click();

      await expect(page).toHaveURL(/\/killer$/);
      expect(await playersOnKillerPage(page)).toEqual(secondPlayers);
      expect(await sql('SELECT COUNT(*)::int AS count FROM killer_game')).toEqual([{ count: 0 }]);
    });
  });

  test('starts straight away, without a warning, when no game is in progress', async ({ page }) => {
    await clearKillerGame(page);

    await selectAndStartKiller(page, secondPlayers);

    await expect(page).toHaveURL(/\/killer$/);
    await expect(dialog(page)).toBeHidden();
    expect(await playersOnKillerPage(page)).toEqual(secondPlayers);
  });
});
