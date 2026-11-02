import { test, expect } from "./consort-fixtures";

test("shows the empty state when no records exist @T50", async ({ page }) => {
  // The shared branch may hold other stories' rows; serve a genuinely empty list for this page only.
  await page.route(
    (url) => new URL(url).pathname === "/api/stock-records",
    (route) => route.fulfill({ status: 200, contentType: "application/json", body: "[]" }),
  );
  await page.goto("/");
  const empty = page.getByTestId("empty-state");
  await expect(empty).toBeVisible();
  await expect(empty).toContainText("No stock filed yet");
  await expect(page.getByTestId("empty-state-cta")).toHaveAttribute("href", "/stock/new");
  await expect(page.getByTestId("stock-table")).toHaveCount(0);
});
