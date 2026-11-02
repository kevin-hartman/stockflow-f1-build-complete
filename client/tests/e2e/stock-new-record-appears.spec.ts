import { test, expect } from "./consort-fixtures";

test("a newly filed record appears on Stock without a reload @T55", async ({ page }) => {
  const sku = `WID-${crypto.randomUUID()}`;
  await page.goto("/");
  await page.evaluate(() => {
    (window as unknown as { __spaMarker: boolean }).__spaMarker = true;
  });
  await page.getByRole("link", { name: "File record" }).click();
  await page.getByTestId("stock-record-sku").fill(sku);
  await page.getByTestId("stock-record-location").fill("C-03");
  await page.getByTestId("stock-record-quantity").fill("8");
  await page.getByTestId("stock-record-submit").click();
  await expect(page.getByTestId("stock-record-success")).toBeVisible();
  await page.getByRole("link", { name: "Stock", exact: true }).click();
  const row = page
    .getByTestId("stock-table")
    .getByTestId("stock-row")
    .filter({ has: page.getByTestId("stock-cell-sku").getByText(sku, { exact: true }) });
  await expect(row).toHaveCount(1);
  await expect(row.getByTestId("stock-cell-quantity")).toHaveText("8");
  // In-page SPA navigation only: the marker set before navigating survives iff no full reload happened.
  expect(await page.evaluate(() => (window as unknown as { __spaMarker?: boolean }).__spaMarker)).toBe(true);
});
