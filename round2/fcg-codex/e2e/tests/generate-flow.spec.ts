import { expect, test } from '@playwright/test';

test('generate flow updates preview image', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Fractal Card Back Generator')).toBeVisible();

  await page.getByRole('button', { name: 'Go' }).click();
  await expect(page.getByRole('img', { name: 'Generated fractal playing card back' })).toBeVisible({ timeout: 20000 });

  await page.getByRole('button', { name: 'Surprise Me' }).click();
  await expect(page.getByText(/Method=/)).toBeVisible();
});
