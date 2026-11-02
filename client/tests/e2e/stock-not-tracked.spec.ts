import { test, expect } from "./consort-fixtures";

test("untracked record shows the not-tracked pill @T53", async ({ page, request, baseURL }) => {
  const tag = crypto.randomUUID();
  const untracked = `WID-${tag}`;
  const tracked = `BOLT-${tag}`;
  const code = `TRK-${crypto.randomUUID()}`;
  for (const d of [
    { sku: untracked, location: `A-${tag}`, quantity: 5, tracking_code: null },
    { sku: tracked, location: `A-${tag}`, quantity: 6, tracking_code: code },
  ]) {
    const res = await request.post(`${baseURL}/api/stock-records`, { data: d });
    expect(res.status()).toBe(201);
  }
  await page.goto("/");
  const rowFor = (sku: string) =>
    page.getByTestId("stock-row").filter({ has: page.getByTestId("stock-cell-sku").getByText(sku, { exact: true }) });
  const untrackedCell = rowFor(untracked).getByTestId("stock-cell-tracking-code");
  await expect(untrackedCell.getByTestId("not-tracked")).toHaveText("not tracked");
  const trackedCell = rowFor(tracked).getByTestId("stock-cell-tracking-code");
  await expect(trackedCell).toHaveText(code);
  await expect(trackedCell.getByTestId("not-tracked")).toHaveCount(0);
});
