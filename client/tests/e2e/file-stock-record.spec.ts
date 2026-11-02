import { test, expect } from "./consort-fixtures";

async function file(page: import("@playwright/test").Page, f: Record<string, string>) {
  await page.goto("/stock/new");
  await page.getByTestId("stock-record-sku").fill(f.sku);
  await page.getByTestId("stock-record-location").fill(f.location);
  await page.getByTestId("stock-record-quantity").fill(f.quantity);
  if (f.code) await page.getByTestId("stock-record-tracking-code").fill(f.code);
  await page.getByTestId("stock-record-submit").click();
}

test("files a valid record and confirms it @T6", async ({ page }) => {
  const sku = `WID-${crypto.randomUUID()}`;
  await file(page, { sku, location: "A-01", quantity: "12", code: `TRK-${crypto.randomUUID()}` });
  await expect(page.getByTestId("stock-record-success")).toContainText("Record filed");
});

test("stored record is visible via the API @T7", async ({ page, request, baseURL }) => {
  const sku = `WID-${crypto.randomUUID()}`;
  const code = `TRK-${crypto.randomUUID()}`;
  await file(page, { sku, location: "A-01", quantity: "12", code });
  await expect(page.getByTestId("stock-record-success")).toContainText("Record filed");
  const res = await request.get(`${baseURL}/api/stock-records`);
  expect(res.ok()).toBeTruthy();
  const rows = (await res.json()) as Array<{ sku: string; quantity: number; tracking_code: string | null }>;
  const mine = rows.filter((r) => r.sku === sku);
  expect(mine).toHaveLength(1);
  expect(mine[0].quantity).toBe(12);
  expect(mine[0].tracking_code).toBe(code);
});
