import { test, expect } from '../fixtures';

test.describe('Match history', () => {
  // Times are stored as UTC instants and shown in the browser's own time zone. Pin the browser to London so the
  // expected values below do not depend on the machine running the tests (London is UTC+1 in summer, UTC in winter).
  test.use({ timezoneId: 'Europe/London' });

  // Dates are shown in UK format (day first, 24-hour clock), not the browser's default US format.
  test('shows a summer match one hour ahead of UTC (BST), day first in 24-hour format', async ({ page, sql }) => {
    await sql(
      `INSERT INTO "match" (winner_id, loser_id, winner_delta, loser_delta, played_at)
       VALUES (1, 4, 20, -20, '2026-07-03 13:05:00+00')`
    );

    await page.goto('/match-history');

    const newestRow = page.getByRole('listitem').filter({ hasText: 'Alice A vs. Dave D' });
    await expect(newestRow).toContainText('03/07/2026, 14:05');
    await expect(page.getByText('03/07/2026, 14:05', { exact: true })).toBeVisible();
  });

  test('shows a winter match unshifted (GMT = UTC), day first in 24-hour format', async ({ page, sql }) => {
    await sql(
      `INSERT INTO "match" (winner_id, loser_id, winner_delta, loser_delta, played_at)
       VALUES (1, 4, 20, -20, '2026-02-03 14:05:00+00')`
    );

    await page.goto('/match-history');

    const newestRow = page.getByRole('listitem').filter({ hasText: 'Alice A vs. Dave D' });
    await expect(newestRow).toContainText('03/02/2026, 14:05');
    await expect(page.getByText('03/02/2026, 14:05', { exact: true })).toBeVisible();

    // Seeded match from 5 January 2026 at 12:00 UTC (= 12:00 GMT).
    await expect(page.getByText('05/01/2026, 12:00', { exact: true })).toBeVisible();
  });
});
