import { expect, test } from "@playwright/test";

test("generate card and display image", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Go" }).click();
  await expect(page.getByAltText("Generated fractal card back")).toBeVisible({ timeout: 20000 });
});
