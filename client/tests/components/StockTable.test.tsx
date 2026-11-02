import { describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import { StockTable } from "../../src/components/StockTable";
import { fileStockRecord } from "../../src/api/stockRecords";

const uniq = (p: string) => `${p}-${crypto.randomUUID().slice(0, 8)}`;

async function seed(sku: string, location: string, quantity: number, code = "") {
  const r = await fileStockRecord({ sku, location, quantity: String(quantity), tracking_code: code });
  if (r.kind !== "created") throw new Error(`seed failed: ${r.kind}`);
  return r.record;
}

const rowsFor = (rows: HTMLElement[], skus: string[]) =>
  rows.filter((r) => skus.includes(within(r).getByTestId("stock-cell-sku").textContent ?? ""));

function renderTable() {
  return render(
    <MemoryRouter>
      <StockTable />
    </MemoryRouter>,
  );
}

describe("StockTable", () => {
  it("renders one stock-row per record inside the stock-table @T46", async () => {
    const skus = [uniq("WID"), uniq("BOLT"), uniq("WID")];
    const loc = uniq("L");
    for (const s of skus) await seed(s, loc, 5);
    renderTable();
    const table = await screen.findByTestId("stock-table");
    await waitFor(() => expect(rowsFor(within(table).getAllByTestId("stock-row"), skus)).toHaveLength(3));
  });

  it("shows sku/location/quantity cells with same-location rows adjacent @T47", async () => {
    const [s1, s2, s3] = [uniq("BOLT"), uniq("WID"), uniq("WID")];
    const [l1, l2] = [uniq("A"), uniq("B")];
    await seed(s1, l1, 40);
    await seed(s2, l1, 12);
    await seed(s3, l2, 3);
    renderTable();
    await screen.findByTestId("stock-table");
    await waitFor(() => expect(rowsFor(screen.getAllByTestId("stock-row"), [s1, s2, s3])).toHaveLength(3));
    const mine = rowsFor(screen.getAllByTestId("stock-row"), [s1, s2, s3]);
    const read = (r: HTMLElement) => [
      within(r).getByTestId("stock-cell-location").textContent,
      within(r).getByTestId("stock-cell-quantity").textContent,
    ];
    const bySku = new Map(mine.map((r) => [within(r).getByTestId("stock-cell-sku").textContent, read(r)]));
    expect(bySku.get(s1)).toEqual([l1, "40"]);
    expect(bySku.get(s2)).toEqual([l1, "12"]);
    expect(bySku.get(s3)).toEqual([l2, "3"]);
    const all = screen.getAllByTestId("stock-row");
    const idx = (s: string) => all.indexOf(mine.find((r) => within(r).getByTestId("stock-cell-sku").textContent === s)!);
    expect(Math.abs(idx(s1) - idx(s2))).toBe(1);
  });

  it("shows the empty state with a CTA to /stock/new only when there are no records @T49", async () => {
    renderTable();
    await waitFor(() =>
      expect(screen.queryByTestId("empty-state") ?? screen.queryByTestId("stock-table")).not.toBeNull(),
    );
    if (screen.queryByTestId("empty-state")) {
      expect(screen.queryByTestId("stock-table")).toBeNull();
      expect(screen.getByTestId("empty-state-cta")).toHaveAttribute("href", "/stock/new");
    } else {
      expect(screen.queryByTestId("empty-state")).toBeNull();
    }
  });

  it("renders the not-tracked pill for a record with no tracking code @T51", async () => {
    const sku = uniq("WID");
    await seed(sku, uniq("L"), 12);
    renderTable();
    await screen.findByTestId("stock-table");
    await waitFor(() => expect(rowsFor(screen.getAllByTestId("stock-row"), [sku])).toHaveLength(1));
    const [row] = rowsFor(screen.getAllByTestId("stock-row"), [sku]);
    const cell = within(row).getByTestId("stock-cell-tracking-code");
    expect(within(cell).getByTestId("not-tracked")).toHaveTextContent("not tracked");
    expect(cell.textContent).not.toMatch(/null/i);
  });

  it("renders the tracking code without the pill when present @T52", async () => {
    const sku = uniq("WID");
    const code = uniq("TRK");
    await seed(sku, uniq("L"), 12, code);
    renderTable();
    await screen.findByTestId("stock-table");
    await waitFor(() => expect(rowsFor(screen.getAllByTestId("stock-row"), [sku])).toHaveLength(1));
    const [row] = rowsFor(screen.getAllByTestId("stock-row"), [sku]);
    expect(within(row).getByTestId("stock-cell-tracking-code")).toHaveTextContent(code);
    expect(within(row).queryByTestId("not-tracked")).toBeNull();
  });
});
