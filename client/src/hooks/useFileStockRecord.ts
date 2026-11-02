import { useState } from "react";
import { fileStockRecord, type FieldErrors, type StockRecordInput } from "../api/stockRecords";

export type FileState =
  | { status: "idle" }
  | { status: "submitting" }
  | { status: "success" }
  | { status: "invalid"; errors: FieldErrors }
  | { status: "duplicate"; message: string }
  | { status: "failed"; message: string };

// Holds the filing request state; the form renders it.
export function useFileStockRecord() {
  const [state, setState] = useState<FileState>({ status: "idle" });

  async function submit(input: StockRecordInput) {
    setState({ status: "submitting" });
    try {
      const result = await fileStockRecord(input);
      if (result.kind === "created") setState({ status: "success" });
      else if (result.kind === "invalid") setState({ status: "invalid", errors: result.errors });
      else setState({ status: result.kind, message: result.message });
    } catch (err: unknown) {
      setState({ status: "failed", message: err instanceof Error ? err.message : "Could not file the record" });
    }
  }

  return { state, submit };
}
