import { Page } from '@playwright/test';
import { test, expect } from '../fixtures';
import { KILLER_PLAYERS, startKillerGame } from '../killer-helpers';

const players = KILLER_PLAYERS;

/** Rows whose lives are all skulls. Turn order is shuffled, so tests count eliminations rather than naming players. */
const eliminatedRows = (page: Page) =>
  page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'skull skull skull', exact: true }) });

/** Every player but the last pots the black early, so the last player in turn order wins. */
async function winByEarlyBlacks(page: Page): Promise<void> {
  for (let i = 1; i < players.length; i++) {
    await page.getByLabel('Early black').click();
    await expect(eliminatedRows(page)).toHaveCount(i);
  }
  await expect(page.getByText(/ wins!$/)).toBeVisible();
}

test.describe('Killer', () => {
  test('shows a loading state rather than "No active game" until the game state arrives', async ({ page }) => {
    await startKillerGame(page);

    let release!: () => void;
    const released = new Promise<void>(resolve => release = resolve);
    await page.route('**/killerHub/negotiate*', async route => {
      await released;
      await route.continue();
    });
    await page.reload();

    await expect(page.getByText('Loading game...')).toBeVisible();
    await expect(page.getByText('No active game')).toBeHidden();

    release();
    await expect(page.getByRole('row')).toHaveCount(players.length);
    await expect(page.getByText('Loading game...')).toBeHidden();
  });

  test('disables the shot actions once someone has won, but not undo', async ({ page }) => {
    await startKillerGame(page);
    await winByEarlyBlacks(page);

    await expect(page.getByLabel('Pot')).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByLabel('Miss / Foul')).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByLabel('Early black')).toHaveAttribute('aria-disabled', 'true');
    await expect(page.getByLabel('Undo')).not.toHaveAttribute('aria-disabled', 'true');
  });

  // Issue #72: an extra early black after the win eliminated the winner too, which hung the server so undo did nothing.
  test('undo reverses the winning move even after a stray tap on early black', async ({ page }) => {
    await startKillerGame(page);
    await winByEarlyBlacks(page);

    await page.getByLabel('Early black').click();
    await page.getByLabel('Undo').click();

    await expect(page.getByText(/ wins!$/)).toBeHidden();
    await expect(eliminatedRows(page)).toHaveCount(players.length - 2);
    await expect(page.getByLabel('Early black')).toHaveAttribute('aria-disabled', 'false');
  });
});
