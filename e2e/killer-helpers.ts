import { Page } from '@playwright/test';
import { expect } from './fixtures';

/** Seeded players (see seed.sql). Always pass 3+ so the game is valid whatever the minimum player count is. */
export const KILLER_PLAYERS = ['Alice A', 'Bob B', 'Carol C', 'Dave D'];

/** Selects `names` on the leaderboard and presses Start killer. Does not wait for the outcome. */
export async function selectAndStartKiller(page: Page, names: string[]): Promise<void> {
  await page.goto('/');
  for (const name of names) {
    await page.getByRole('cell', { name }).click();
  }
  await page.getByText('Start killer').click();
}

/**
 * Ends up on /killer with a fresh game of `names`, whether or not another game was already in progress
 * (the in-memory game outlives the per-test DB reset, so there may be one left over from an earlier test).
 */
export async function startKillerGame(page: Page, names: string[] = KILLER_PLAYERS): Promise<void> {
  await selectAndStartKiller(page, names);
  const replaceButton = page.getByRole('button', { name: 'Abandon & start new' });
  // Either the game starts and the killer page shows its rows, or the replace prompt appears.
  await expect(replaceButton.or(page.getByLabel('Early black'))).toBeVisible();
  if (await replaceButton.isVisible()) {
    await replaceButton.click();
  }
  await expect(page).toHaveURL(/\/killer$/);
  await expect(page.getByRole('row')).toHaveCount(names.length);
}

/** Leaves no killer game in progress, abandoning whatever an earlier test left behind. */
export async function clearKillerGame(page: Page): Promise<void> {
  await page.goto('/killer');
  const abandon = page.getByLabel('Abandon');
  const noGame = page.getByText('No active game.');
  await expect(abandon.or(noGame)).toBeVisible();
  if (await abandon.isVisible()) {
    await abandon.click();
    await page.getByRole('button', { name: 'Abandon', exact: true }).click();
    // Abandoning sends everyone back to the leaderboard.
    await expect(page).toHaveURL(/\/leaderboard$/);
    await page.goto('/killer');
  }
  await expect(noGame).toBeVisible();
}
