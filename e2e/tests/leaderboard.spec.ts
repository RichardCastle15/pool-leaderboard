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

  test('the stats button on a row opens that player\'s stats without selecting the row', async ({ page }) => {
    const bobRow = page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'Bob B' }) });
    await bobRow.getByRole('button', { name: 'View stats for Bob B' }).click();

    await expect(page).toHaveURL(/\/player\/2$/);
    await expect(page.getByText('Bob B — Match History')).toBeVisible();

    // Nothing was selected on the way out: the start killer badge is still at 0 when we come back.
    await page.goBack();
    await expect(page).toHaveURL(/\/leaderboard$/);
    await expect(page.locator('nb-action', { hasText: 'Start killer' }).locator('nb-badge')).toHaveText('0');
  });

  test('the stats button still works while other players are selected', async ({ page }) => {
    await page.getByRole('cell', { name: 'Alice A' }).click();
    const killer = page.locator('nb-action', { hasText: 'Start killer' });
    await expect(killer.locator('nb-badge')).toHaveText('1');

    const carolRow = page.getByRole('row').filter({ has: page.getByRole('cell', { name: 'Carol C' }) });
    await carolRow.getByRole('button', { name: 'View stats for Carol C' }).click();
    await expect(page).toHaveURL(/\/player\/3$/);
  });

  test('every player row has a stats button', async ({ page }) => {
    for (const name of ['Alice A', 'Bob B', 'Carol C', 'Dave D'])
      await expect(page.getByRole('button', { name: `View stats for ${name}` })).toBeVisible();
  });

  test('the stats button fits on a phone-sized screen', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await expect(page.getByRole('button', { name: 'View stats for Dave D' })).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);

    await page.getByRole('button', { name: 'View stats for Dave D' }).click();
    await expect(page).toHaveURL(/\/player\/4$/);
  });

  test('the side menu no longer has a Players link', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'Match History' })).toBeAttached();
    await expect(page.getByRole('link', { name: 'Players' })).toHaveCount(0);
  });
});
