import { useEffect, useState } from "react";
import { getStockRecord, type StockRecordDetail } from "../api/stockRecords";

export type StockRecordState =
  | { status: "loading" }
  | { status: "loaded"; record: StockRecordDetail }
  | { status: "missing" }
  | { status: "failed"; message: string };

// Fetches one stock record by its (sku, location) key whenever the key changes.
export function useStockRecord(sku: string, location: string): StockRecordState {
  const [state, setState] = useState<StockRecordState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    setState({ status: "loading" });
    getStockRecord(sku, location)
      .then((record) => active && setState(record ? { status: "loaded", record } : { status: "missing" }))
      .catch((err: unknown) =>
        active && setState({ status: "failed", message: err instanceof Error ? err.message : "Could not load the record" }),
      );
    return () => {
      active = false;
    };
  }, [sku, location]);

  return state;
}
