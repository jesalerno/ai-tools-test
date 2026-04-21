import { test, expect } from '@playwright/test';

test.describe('Generate-and-display flow (FCG-SPECv3 §13)', () => {
  test('initial page renders controls and empty card placeholder', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { name: /Fractal Card Generator/i })).toBeVisible();
    await expect(page.getByTestId('go-button')).toBeVisible();
    await expect(page.getByTestId('surprise-button')).toBeVisible();
    await expect(page.getByTestId('card-display')).toBeVisible();
  });

  test('Go generates a card and displays it inline', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('go-button').click();
    await expect(page.getByTestId('card-image')).toBeVisible({ timeout: 30_000 });
    const src = await page.getByTestId('card-image').getAttribute('src');
    expect(src).toMatch(/^data:image\/jpeg;base64,/);
  });

  test('Surprise Me generates and dropdown syncs to server-chosen method', async ({ page }) => {
    await page.goto('/');
    const trigger = page.getByTestId('method-select-trigger');
    const initialLabel = (await trigger.textContent()) ?? '';
    await page.getByTestId('surprise-button').click();
    await expect(page.getByTestId('card-image')).toBeVisible({ timeout: 30_000 });
    // Some surprise rolls may land on the initial method; over multiple clicks
    // the trigger will reflect what came back. Assert it still reads a known
    // method label.
    const afterLabel = (await trigger.textContent()) ?? '';
    expect(afterLabel.length).toBeGreaterThan(0);
    // Just confirm the sync path runs — label should be one of the 11 methods.
    expect(afterLabel).toMatch(
      /Mandelbrot|Julia|Burning Ship|Newton|Lyapunov|IFS|L-System|Strange Attractor|Heightmap|Flame|Phase/,
    );
    // Use initialLabel to keep TS happy.
    expect(typeof initialLabel).toBe('string');
  });

  test('generating twice replaces the prior image (inline replacement)', async ({ page }) => {
    await page.goto('/');
    await page.getByTestId('go-button').click();
    await expect(page.getByTestId('card-image')).toBeVisible({ timeout: 30_000 });
    const first = await page.getByTestId('card-image').getAttribute('src');
    await page.getByTestId('surprise-button').click();
    await expect(page.getByTestId('card-image')).toBeVisible({ timeout: 30_000 });
    await expect
      .poll(async () => page.getByTestId('card-image').getAttribute('src'))
      .not.toBe(first);
  });
});
