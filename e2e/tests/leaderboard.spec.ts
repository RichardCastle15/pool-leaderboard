import { test, expect } from '../fixtures';

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
});
