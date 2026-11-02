import { test, expect } from "./consort-fixtures";

test("lists records grouped by location @T48", async ({ page, request, baseURL }) => {
  const tag = crypto.randomUUID();
  const la = `A-${tag}`;
  const lb = `B-${tag}`;
  const seeds = [
    { sku: `WID-${tag}`, location: la, quantity: 12 },
    { sku: `BOLT-${tag}`, location: la, quantity: 40 },
    { sku: `WID2-${tag}`, location: lb, quantity: 3 },
  ];
  for (const s of seeds) {
    const res = await request.post(`${baseURL}/api/stock-records`, { data: { ...s, tracking_code: null } });
    expect(res.status()).toBe(201);
  }
  await page.goto("/");
  const table = page.getByTestId("stock-table");
  await expect(table).toBeVisible();
  const rows = table.getByTestId("stock-row").filter({ hasText: tag });
  await expect(rows).toHaveCount(3);
  for (const i of [0, 1, 2]) {
    await expect(rows.nth(i).getByTestId("stock-cell-sku")).toBeVisible();
    await expect(rows.nth(i).getByTestId("stock-cell-location")).toBeVisible();
    await expect(rows.nth(i).getByTestId("stock-cell-quantity")).toBeVisible();
  }
  await expect(rows.nth(0).getByTestId("stock-cell-location")).toHaveText(la);
  await expect(rows.nth(1).getByTestId("stock-cell-location")).toHaveText(la);
  await expect(rows.nth(2).getByTestId("stock-cell-location")).toHaveText(lb);
  await expect(table.getByTestId("location-group-header").filter({ hasText: la })).toHaveCount(1);
  await expect(table.getByTestId("location-group-header").filter({ hasText: lb })).toHaveCount(1);
});
