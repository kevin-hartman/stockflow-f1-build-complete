import { test, expect } from "./consort-fixtures";

async function seedUntracked(request: any, baseURL: string | undefined) {
  const sku = `WID-${crypto.randomUUID()}`;
  const res = await request.post(`${baseURL}/api/stock-records`, {
    data: { sku, location: "A-01", quantity: 9, tracking_code: null },
  });
  expect(res.status()).toBe(201);
  return sku;
}

test("untracked record shows not-tracked pill in tracking code @T64", async ({ page, request, baseURL }) => {
  const sku = await seedUntracked(request, baseURL);
  await page.goto(`/sku/${sku}?location=A-01`);
  const cell = page.getByTestId("detail-tracking-code");
  await expect(cell.getByTestId("detail-not-tracked")).toHaveText("not tracked");
  await expect(cell).not.toHaveText("");
  await expect(cell).not.toContainText(/null|error/i);
});

test("other detail fields still render @T65", async ({ page, request, baseURL }) => {
  const sku = await seedUntracked(request, baseURL);
  await page.goto(`/sku/${sku}?location=A-01`);
  await expect(page.getByTestId("detail-sku")).toHaveText(sku);
  await expect(page.getByTestId("detail-location")).toHaveText("A-01");
  await expect(page.getByTestId("detail-quantity")).toHaveText("9");
});
