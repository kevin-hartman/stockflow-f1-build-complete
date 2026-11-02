import { describe, it, expect } from "vitest";
import { render, screen, waitFor, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { SkuDetail } from "../../src/components/SkuDetail";
import { fileStockRecord } from "../../src/api/stockRecords";

const uniq = (p: string) => `${p}-${crypto.randomUUID().slice(0, 8)}`;

async function seed(sku: string, location: string, quantity: number, code = "") {
  const r = await fileStockRecord({ sku, location, quantity: String(quantity), tracking_code: code });
  if (r.kind !== "created") throw new Error(`seed failed: ${r.kind}`);
}

function renderDetail(sku: string, location: string) {
  return render(
    <MemoryRouter initialEntries={[`/sku/${sku}?location=${encodeURIComponent(location)}`]}>
      <Routes>
        <Route path="/sku/:sku" element={<SkuDetail />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SkuDetail", () => {
  it("shows only the keyed record's data @T58", async () => {
    const sku = uniq("WID");
    const sib = uniq("BOLT");
    const loc = uniq("L");
    const code = uniq("TRK");
    await seed(sku, loc, 12, code);
    await seed(sib, loc, 40, uniq("SIB"));
    renderDetail(sku, loc);
    const root = await screen.findByTestId("sku-detail");
    await waitFor(() => expect(within(root).getByTestId("detail-sku")).toHaveTextContent(sku));
    expect(within(root).getByTestId("detail-location")).toHaveTextContent(loc);
    expect(within(root).getByTestId("detail-quantity")).toHaveTextContent("12");
    expect(within(root).getByTestId("detail-tracking-code")).toHaveTextContent(code);
    expect(root.textContent).not.toContain(sib);
  });

  it("shows not-tracked pill for missing tracking code @T63", async () => {
    const sku = uniq("WID");
    const loc = uniq("L");
    await seed(sku, loc, 7);
    renderDetail(sku, loc);
    const cell = await screen.findByTestId("detail-tracking-code");
    const pill = await within(cell).findByTestId("detail-not-tracked");
    expect(pill).toHaveTextContent("not tracked");
    expect(cell.textContent).not.toMatch(/null|error/i);
  });

  it("judges par level independently of tracking code @T67", async () => {
    const sku = uniq("WID");
    const loc = uniq("L");
    const code = uniq("TRK");
    await seed(sku, loc, 7, code);
    renderDetail(sku, loc);
    const par = await screen.findByTestId("detail-par-level");
    expect(await within(par).findByTestId("detail-not-tracked")).toHaveTextContent("not tracked");
    const tc = screen.getByTestId("detail-tracking-code");
    expect(tc).toHaveTextContent(code);
    expect(within(tc).queryByTestId("detail-not-tracked")).toBeNull();
  });
});
