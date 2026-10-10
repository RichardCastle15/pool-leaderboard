import { test, expect } from '../fixtures';

test.describe('Match history', () => {
  // Dates are shown in UK format (day first, 24-hour clock), not the browser's default US format.
  test('shows the date and time of each match day first in 24-hour format', async ({ page, sql }) => {
    await sql(
      `INSERT INTO "match" (winner_id, loser_id, winner_delta, loser_delta, played_at)
       VALUES (1, 4, 20, -20, '2026-02-03 14:05:00')`
    );

    await page.goto('/match-history');

    const newestRow = page.getByRole('listitem').filter({ hasText: 'Alice A vs. Dave D' });
    await expect(newestRow).toContainText('03/02/2026, 14:05');
    await expect(page.getByText('03/02/2026, 14:05', { exact: true })).toBeVisible();

    // Seeded match from 5 January 2026 at 12:00.
    await expect(page.getByText('05/01/2026, 12:00', { exact: true })).toBeVisible();
  });
});
