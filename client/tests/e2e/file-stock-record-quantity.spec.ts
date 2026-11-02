import { test, expect } from "./consort-fixtures";

for (const [tid, qty] of [
  ["T29", "-3"],
  ["T30", "2.5"],
] as const) {
  test(`quantity ${qty} shows the inline quantity error @${tid}`, async ({ page }) => {
    await page.goto("/stock/new");
    await page.getByTestId("stock-record-sku").fill(`WID-${crypto.randomUUID()}`);
    await page.getByTestId("stock-record-location").fill("A-01");
    await page.getByTestId("stock-record-quantity").fill(qty);
    await page.getByTestId("stock-record-submit").click();
    await expect(page.getByTestId("stock-record-quantity-error")).toBeVisible();
    await expect(page.getByTestId("stock-record-success")).toHaveCount(0);
  });
}
