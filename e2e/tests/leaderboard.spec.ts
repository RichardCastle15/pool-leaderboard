import { Page } from '@playwright/test';
import { test, expect } from '../fixtures';

/** Holds requests to `url` until the returned function is called, so the in-flight state can be asserted. */
async function holdRequests(page: Page, url: string | RegExp): Promise<() => void> {
  let release!: () => void;
  const released = new Promise<void>(resolve => release = resolve);
  await page.route(url, async route => {
    await released;
    await route.continue();
  });
  return release;
}

test.describe('Leaderboard', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('shows the seeded players ranked by rating', async ({ page }) => {
    await expect(page).toHaveURL(/\/leaderboard$/);

    const rows = page.getByRole('row').filter({ has: page.getByRole('cell') });
    await expect(rows).toHaveCount(4);
    await expect(rows.nth(0).getByRole('cell')).toHaveText(['Alice A', '1100', '1']);
    await expect(rows.nth(1).getByRole('cell')).toHaveText(['Bob B', '1050', '2']);
    await expect(rows.nth(2).getByRole('cell')).toHaveText(['Carol C', '1000', '3']);
    await expect(rows.nth(3).getByRole('cell')).toHaveText(['Dave D', '950', '4']);
  });

  test('adding someone puts them on the board at 1000 points', async ({ page, sql }) => {
    await page.getByText('Add someone').click();
    await page.getByRole('textbox', { name: 'Name (e.g. Richard C)' }).fill('Erin E');
    await page.getByRole('button', { name: 'Add' }).click();

    const erinRow = page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'Erin E' }) });
    await expect(erinRow.getByRole('cell')).toHaveText(['Erin E', '1000', '3']);
    await expect(page.getByRole('row').filter({ has: page.getByRole('cell') })).toHaveCount(5);

    expect(await sql('SELECT rating FROM rating WHERE name = $1', ['Erin E'])).toEqual([{ rating: 1000 }]);
  });

  // Issue #84: the swing should be visible without opening the record result dialog.
  test('shows each player\'s points swing on the record result button once two are selected', async ({ page }) => {
    const recordResult = page.locator('nb-action', { hasText: 'Record result' });

    await page.getByRole('cell', { name: 'Alice A' }).click();
    await expect(recordResult).toHaveText('Record result');

    await page.getByRole('cell', { name: 'Bob B' }).click();
    await expect(recordResult).toContainText('Alice A ±43');
    await expect(recordResult).toContainText('Bob B ±57');

    await page.getByRole('cell', { name: 'Carol C' }).click();
    await expect(recordResult).toHaveText('Record result');
  });

  // Issue #94: a killer game needs at least three players; two should be a head-to-head.
  test('keeps start killer disabled until a third player is selected', async ({ page }) => {
    const startKiller = page.getByLabel('Start killer');
    const hint = page.getByText('Select at least 3 players for killer (2 players: record a head-to-head)');

    await page.getByRole('cell', { name: 'Alice A' }).click();
    await page.getByRole('cell', { name: 'Bob B' }).click();
    await expect(startKiller).toHaveAttribute('aria-disabled', 'true');

    // The disabled action still shows why it is unavailable on hover.
    await startKiller.hover();
    await expect(hint).toBeVisible();

    await page.getByRole('cell', { name: 'Carol C' }).click();
    await expect(startKiller).toHaveAttribute('aria-disabled', 'false');
    await expect(hint).toBeHidden();
  });

  test('shows the minimum player hint on the icon-only killer action in compact mode', async ({ page }) => {
    await page.setViewportSize({ width: 400, height: 800 });
    await page.reload();
    const startKiller = page.getByLabel('Start killer');

    await page.getByRole('cell', { name: 'Alice A' }).click();
    await startKiller.hover();
    await expect(page.getByText('Select at least 3 players for killer (2 players: record a head-to-head)')).toBeVisible();
  });

  // Issue #83: show that a result is being recorded and block other changes until it's done.
  test('shows a loading state and blocks other actions while a result is being recorded', async ({ page, sql }) => {
    const release = await holdRequests(page, '**/api/match');
    const recordResult = page.locator('nb-action', { hasText: 'Record result' });
    const startKiller = page.locator('nb-action', { hasText: 'Start killer' });
    const addSomeone = page.locator('nb-action', { hasText: 'Add someone' });

    await page.getByRole('cell', { name: 'Alice A' }).click();
    await page.getByRole('cell', { name: 'Bob B' }).click();
    await recordResult.click();
    await page.getByRole('button', { name: /Alice A wins/ }).click();

    await expect(recordResult).toHaveAttribute('aria-busy', 'true');
    for (const action of [recordResult, startKiller, addSomeone]) {
      await expect(action).toHaveAttribute('aria-disabled', 'true');
    }
    // Clicking again while busy doesn't open another dialog.
    await recordResult.click();
    await expect(page.getByRole('button', { name: /Alice A wins/ })).toBeHidden();

    release();

    await expect(recordResult).toHaveAttribute('aria-busy', 'false');
    await expect(recordResult).toHaveAttribute('aria-disabled', 'false');
    const aliceRow = page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'Alice A' }) });
    await expect(aliceRow.getByRole('cell')).toHaveText(['Alice A', '1143', '1']);
    expect(await sql('SELECT COUNT(*)::int AS count FROM "match"')).toEqual([{ count: 4 }]);
  });

  // The killer page is lazy-loaded, which can take seconds on a slow connection after the game is created.
  test('keeps the start killer spinner until the killer page has loaded', async ({ page }) => {
    const startKiller = page.locator('nb-action', { hasText: 'Start killer' });
    await page.getByRole('cell', { name: 'Alice A' }).click();
    await page.getByRole('cell', { name: 'Bob B' }).click();
    await page.getByRole('cell', { name: 'Carol C' }).click();

    // The leaderboard is fully loaded by now, so this only holds the killer route's lazy chunks.
    const release = await holdRequests(page, /\/chunk-[^/]+\.js$/);
    const gameCreated = page.waitForResponse(response => response.url().endsWith('/api/killer') && response.ok());
    await startKiller.click();
    await gameCreated;

    await expect(page).toHaveURL(/\/leaderboard$/);
    await expect(startKiller).toHaveAttribute('aria-busy', 'true');

    release();
    await expect(page).toHaveURL(/\/killer$/);
  });
});
