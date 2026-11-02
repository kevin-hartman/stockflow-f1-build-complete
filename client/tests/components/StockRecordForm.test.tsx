import { describe, it, expect } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { StockRecordForm } from "../../src/components/StockRecordForm";

async function fill(opts: { sku?: string; location?: string; quantity?: string; code?: string }) {
  const user = userEvent.setup();
  if (opts.sku) await user.type(screen.getByTestId("stock-record-sku"), opts.sku);
  if (opts.location) await user.type(screen.getByTestId("stock-record-location"), opts.location);
  if (opts.quantity) await user.type(screen.getByTestId("stock-record-quantity"), opts.quantity);
  if (opts.code) await user.type(screen.getByTestId("stock-record-tracking-code"), opts.code);
  await user.click(screen.getByTestId("stock-record-submit"));
}

describe("StockRecordForm", () => {
  const uniq = () => `WID-${crypto.randomUUID()}`;
  it("shows Record filed after a valid submit @T5", async () => {
    const sku = uniq();
    render(<StockRecordForm />);
    await fill({ sku, location: "A-01", quantity: "12", code: "TRK-9" });
    await waitFor(() => expect(screen.getByTestId("stock-record-success")).toHaveTextContent("Record filed"));
  });

  it("renders the sku error when SKU is blank @T17", async () => {
    render(<StockRecordForm />);
    await fill({ location: "A-01", quantity: "12" });
    await waitFor(() => expect(screen.getByTestId("stock-record-sku-error")).toHaveTextContent(/sku/i));
  });

  it("renders the location error when location is blank @T18", async () => {
    const sku = uniq();
    render(<StockRecordForm />);
    await fill({ sku, quantity: "12" });
    await waitFor(() => expect(screen.getByTestId("stock-record-location-error")).toHaveTextContent(/location/i));
  });

  it("renders the quantity error when quantity is blank @T19", async () => {
    const sku = uniq();
    render(<StockRecordForm />);
    await fill({ sku, location: "A-01" });
    await waitFor(() => expect(screen.getByTestId("stock-record-quantity-error")).toHaveTextContent(/quantity/i));
  });

  it("keeps other entered values after a blank-field rejection @T20", async () => {
    const sku = uniq();
    render(<StockRecordForm />);
    await fill({ location: "A-01", quantity: "12" });
    await waitFor(() => expect(screen.getByTestId("stock-record-sku-error")).toBeInTheDocument());
    expect(screen.getByTestId("stock-record-location")).toHaveValue("A-01");
    expect(screen.getByTestId("stock-record-quantity")).toHaveValue(12);
  });

  it("renders the quantity error for quantity -3 @T27", async () => {
    const sku = uniq();
    render(<StockRecordForm />);
    await fill({ sku, location: "A-01", quantity: "-3" });
    await waitFor(() => expect(screen.getByTestId("stock-record-quantity-error")).toBeInTheDocument());
  });

  it("renders the quantity error for quantity 2.5 @T28", async () => {
    const sku = uniq();
    render(<StockRecordForm />);
    await fill({ sku, location: "A-01", quantity: "2.5" });
    await waitFor(() => expect(screen.getByTestId("stock-record-quantity-error")).toBeInTheDocument());
  });

  it("renders the duplicate message on a 409 @T34", async () => {
    const sku = uniq();
    render(<StockRecordForm />);
    await fill({ sku, location: "A-01", quantity: "5" });
    await waitFor(() => expect(screen.getByTestId("stock-record-success")).toBeInTheDocument());
    await userEvent.setup().click(screen.getByTestId("stock-record-submit"));
    await waitFor(() =>
      expect(screen.getByTestId("stock-record-duplicate-error")).toHaveTextContent(
        "A record for that SKU at that location already exists",
      ),
    );
  });

  it("keeps entered values and shows no success after a duplicate rejection @T35", async () => {
    const sku = uniq();
    render(<StockRecordForm />);
    await fill({ sku, location: "A-01", quantity: "5" });
    await waitFor(() => expect(screen.getByTestId("stock-record-success")).toBeInTheDocument());
    await userEvent.setup().click(screen.getByTestId("stock-record-submit"));
    await waitFor(() => expect(screen.getByTestId("stock-record-duplicate-error")).toBeInTheDocument());
    expect(screen.getByTestId("stock-record-sku")).toHaveValue(sku);
    expect(screen.getByTestId("stock-record-location")).toHaveValue("A-01");
    expect(screen.getByTestId("stock-record-quantity")).toHaveValue(5);
    expect(screen.queryByTestId("stock-record-success")).toBeNull();
  });
});
