import { test, expect } from "./consort-fixtures";

type Vals = { sku: string; location: string; quantity: string };

async function submit(page: import("@playwright/test").Page, v: Vals) {
  await page.goto("/stock/new");
  await page.getByTestId("stock-record-sku").fill(v.sku);
  await page.getByTestId("stock-record-location").fill(v.location);
  await page.getByTestId("stock-record-quantity").fill(v.quantity);
  await page.getByTestId("stock-record-submit").click();
}

test("blank SKU shows the sku error and keeps other values @T21", async ({ page }) => {
  await submit(page, { sku: "", location: "A-01", quantity: "12" });
  await expect(page.getByTestId("stock-record-sku-error")).toContainText(/sku/i);
  await expect(page.getByTestId("stock-record-location")).toHaveValue("A-01");
  await expect(page.getByTestId("stock-record-quantity")).toHaveValue("12");
});

test("blank location shows the location error and keeps other values @T22", async ({ page }) => {
  const sku = `WID-${crypto.randomUUID()}`;
  await submit(page, { sku, location: "", quantity: "12" });
  await expect(page.getByTestId("stock-record-location-error")).toContainText(/location/i);
  await expect(page.getByTestId("stock-record-sku")).toHaveValue(sku);
  await expect(page.getByTestId("stock-record-quantity")).toHaveValue("12");
});

test("blank quantity shows the quantity error and no success @T23", async ({ page }) => {
  const sku = `WID-${crypto.randomUUID()}`;
  await submit(page, { sku, location: "A-01", quantity: "" });
  await expect(page.getByTestId("stock-record-quantity-error")).toContainText(/quantity/i);
  await expect(page.getByTestId("stock-record-success")).toHaveCount(0);
});
