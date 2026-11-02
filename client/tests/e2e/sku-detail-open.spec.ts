import { test, expect } from "./consort-fixtures";

async function seed(request: any, baseURL: string | undefined, tag: string) {
  const sku = `WID-${tag}`;
  const sib = `BOLT-${tag}`;
  for (const d of [
    { sku, location: "A-01", quantity: 12, tracking_code: "A01-B7-S0042" },
    { sku: sib, location: "A-01", quantity: 40, tracking_code: `SIB-${tag}` },
  ]) {
    const res = await request.post(`${baseURL}/api/stock-records`, { data: d });
    expect(res.status()).toBe(201);
  }
  return { sku, sib };
}

test("clicking a stock row SPA-navigates to the detail @T59", async ({ page, request, baseURL }) => {
  const { sku } = await seed(request, baseURL, crypto.randomUUID());
  await page.goto("/");
  const row = page
    .getByTestId("stock-row")
    .filter({ has: page.getByTestId("stock-cell-sku").getByText(sku, { exact: true }) });
  await expect(row).toHaveCount(1);
  await page.evaluate(() => ((window as any).__noReload = true));
  await row.click();
  await expect(page).toHaveURL(new RegExp(`/sku/${sku}\\?location=A-01$`));
  await expect(page.getByTestId("sku-detail")).toBeVisible();
  expect(await page.evaluate(() => (window as any).__noReload)).toBe(true);
});

test("detail shows the clicked record's values @T60", async ({ page, request, baseURL }) => {
  const { sku } = await seed(request, baseURL, crypto.randomUUID());
  await page.goto(`/sku/${sku}?location=A-01`);
  const d = page.getByTestId("sku-detail");
  await expect(d.getByTestId("detail-sku")).toHaveText(sku);
  await expect(d.getByTestId("detail-location")).toHaveText("A-01");
  await expect(d.getByTestId("detail-quantity")).toHaveText("12");
  await expect(d.getByTestId("detail-tracking-code")).toHaveText("A01-B7-S0042");
});

test("detail contains no sibling record data @T61", async ({ page, request, baseURL }) => {
  const { sku, sib } = await seed(request, baseURL, crypto.randomUUID());
  await page.goto("/");
  const row = page
    .getByTestId("stock-row")
    .filter({ has: page.getByTestId("stock-cell-sku").getByText(sku, { exact: true }) });
  await row.click();
  const d = page.getByTestId("sku-detail");
  await expect(d.getByTestId("detail-sku")).toHaveText(sku);
  await expect(d).not.toContainText(sib);
  await expect(d.getByTestId("detail-quantity")).not.toHaveText("40");
});
