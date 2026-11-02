import { test, expect } from "./consort-fixtures";

const DUP_TEXT = "A record for that SKU at that location already exists";

async function fileOnce(page: import("@playwright/test").Page, sku: string, quantity: string) {
  await page.goto("/stock/new");
  await page.getByTestId("stock-record-sku").fill(sku);
  await page.getByTestId("stock-record-location").fill("A-01");
  await page.getByTestId("stock-record-quantity").fill(quantity);
  await page.getByTestId("stock-record-submit").click();
}

async function fileTwice(page: import("@playwright/test").Page, sku: string) {
  await fileOnce(page, sku, "12");
  await expect(page.getByTestId("stock-record-success")).toContainText("Record filed");
  await fileOnce(page, sku, "5");
}

test("duplicate filing shows the exact refusal text @T36", async ({ page }) => {
  await fileTwice(page, `WID-${crypto.randomUUID()}`);
  await expect(page.getByTestId("stock-record-duplicate-error")).toHaveText(DUP_TEXT);
});

test("duplicate refusal keeps entered values and no success @T37", async ({ page }) => {
  const sku = `WID-${crypto.randomUUID()}`;
  await fileTwice(page, sku);
  await expect(page.getByTestId("stock-record-duplicate-error")).toBeVisible();
  await expect(page.getByTestId("stock-record-sku")).toHaveValue(sku);
  await expect(page.getByTestId("stock-record-location")).toHaveValue("A-01");
  await expect(page.getByTestId("stock-record-quantity")).toHaveValue("5");
  await expect(page.getByTestId("stock-record-success")).toHaveCount(0);
});

test("duplicate refusal leaves exactly one record holding quantity 12 @T38", async ({ page, request, baseURL }) => {
  const sku = `WID-${crypto.randomUUID()}`;
  await fileTwice(page, sku);
  await expect(page.getByTestId("stock-record-duplicate-error")).toBeVisible();
  const res = await request.get(`${baseURL}/api/stock-records`);
  const rows = (await res.json()) as Array<{ sku: string; location: string; quantity: number }>;
  const mine = rows.filter((r) => r.sku === sku && r.location === "A-01");
  expect(mine).toHaveLength(1);
  expect(mine[0].quantity).toBe(12);
});
