import { test, expect } from "./consort-fixtures";

async function seedTracked(request: any, baseURL: string | undefined) {
  const sku = `WID-${crypto.randomUUID()}`;
  const res = await request.post(`${baseURL}/api/stock-records`, {
    data: { sku, location: "A-01", quantity: 12, tracking_code: "A01-B7-S0042" },
  });
  expect(res.status()).toBe(201);
  return sku;
}

test("par level shows not-tracked pill @T68", async ({ page, request, baseURL }) => {
  const sku = await seedTracked(request, baseURL);
  await page.goto(`/sku/${sku}?location=A-01`);
  await expect(page.getByTestId("detail-par-level").getByTestId("detail-not-tracked")).toHaveText("not tracked");
});

test("tracking code real while par level not tracked @T69", async ({ page, request, baseURL }) => {
  const sku = await seedTracked(request, baseURL);
  await page.goto(`/sku/${sku}?location=A-01`);
  const tc = page.getByTestId("detail-tracking-code");
  await expect(tc).toHaveText("A01-B7-S0042");
  await expect(tc.getByTestId("detail-not-tracked")).toHaveCount(0);
  await expect(page.getByTestId("detail-par-level").getByTestId("detail-not-tracked")).toHaveCount(1);
});
