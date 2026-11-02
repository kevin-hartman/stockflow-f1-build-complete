import { useEffect, useState } from "react";
import { listStockRecords, type StockRecord } from "../api/stockRecords";

export type StockListState =
  | { status: "loading" }
  | { status: "loaded"; records: StockRecord[] }
  | { status: "failed"; message: string };

// Fetches the stock list on mount, so SPA navigation back to Stock shows fresh rows.
export function useStockRecords(): StockListState {
  const [state, setState] = useState<StockListState>({ status: "loading" });

  useEffect(() => {
    let active = true;
    listStockRecords()
      .then((records) => active && setState({ status: "loaded", records }))
      .catch((err: unknown) =>
        active && setState({ status: "failed", message: err instanceof Error ? err.message : "Could not load stock" }),
      );
    return () => {
      active = false;
    };
  }, []);

  return state;
}
